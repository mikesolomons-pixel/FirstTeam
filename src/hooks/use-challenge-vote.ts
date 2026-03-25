"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChallengeVoteSession, ChallengeVote, Challenge } from "@/types";

interface VoteTally {
  challenge_id: string;
  title: string;
  status: string;
  total_points: number;
  voter_count: number;
}

export function useChallengeVote() {
  const [activeSession, setActiveSession] =
    useState<ChallengeVoteSession | null>(null);
  const [myVotes, setMyVotes] = useState<Record<string, number>>({});
  const [tallies, setTallies] = useState<VoteTally[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const supabase = createClient();

  const fetchActiveSession = useCallback(async () => {
    try {
      setLoading(true);

      // Get active vote session
      const { data: session } = await supabase
        .from("challenge_vote_sessions")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setActiveSession(session as ChallengeVoteSession | null);

      if (!session) {
        setLoading(false);
        return;
      }

      // Fetch open challenges to vote on
      const { data: challengeData } = await supabase
        .from("challenges")
        .select("*, author:profiles(*)")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (challengeData) setChallenges(challengeData as Challenge[]);

      // Fetch current user's votes for this session
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: votes } = await supabase
          .from("challenge_votes")
          .select("*")
          .eq("session_id", session.id)
          .eq("user_id", user.id);

        if (votes && votes.length > 0) {
          const voteMap: Record<string, number> = {};
          for (const v of votes as ChallengeVote[]) {
            voteMap[v.challenge_id] = v.points;
          }
          setMyVotes(voteMap);
          setHasVoted(true);
        }
      }

      // Fetch tallies
      await fetchTallies(session.id);
    } catch {
      // tables may not exist yet
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchTallies = async (sessionId: string) => {
    const { data: allVotes } = await supabase
      .from("challenge_votes")
      .select("challenge_id, points")
      .eq("session_id", sessionId);

    const { data: allChallenges } = await supabase
      .from("challenges")
      .select("id, title, status")
      .eq("status", "open");

    if (!allChallenges) return;

    const tallyMap: Record<
      string,
      { total_points: number; voters: Set<string> }
    > = {};

    // Init from challenges
    for (const c of allChallenges) {
      tallyMap[c.id] = { total_points: 0, voters: new Set() };
    }

    // Aggregate votes
    if (allVotes) {
      // We need user_id too for voter count
      const { data: votesWithUser } = await supabase
        .from("challenge_votes")
        .select("challenge_id, points, user_id")
        .eq("session_id", sessionId);

      if (votesWithUser) {
        for (const v of votesWithUser) {
          if (tallyMap[v.challenge_id]) {
            tallyMap[v.challenge_id].total_points += v.points;
            tallyMap[v.challenge_id].voters.add(v.user_id);
          }
        }
      }
    }

    const results: VoteTally[] = allChallenges.map((c) => ({
      challenge_id: c.id,
      title: c.title,
      status: c.status,
      total_points: tallyMap[c.id]?.total_points ?? 0,
      voter_count: tallyMap[c.id]?.voters.size ?? 0,
    }));

    results.sort((a, b) => b.total_points - a.total_points);
    setTallies(results);
  };

  useEffect(() => {
    fetchActiveSession();
  }, [fetchActiveSession]);

  const submitVotes = async (votes: Record<string, number>) => {
    if (!activeSession) return;
    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Delete existing votes for this session
      await supabase
        .from("challenge_votes")
        .delete()
        .eq("session_id", activeSession.id)
        .eq("user_id", user.id);

      // Insert new votes
      const rows = Object.entries(votes)
        .filter(([, points]) => points > 0)
        .map(([challenge_id, points]) => ({
          session_id: activeSession.id,
          user_id: user.id,
          challenge_id,
          points,
        }));

      if (rows.length > 0) {
        await supabase.from("challenge_votes").insert(rows);
      }

      setMyVotes(votes);
      setHasVoted(true);
      await fetchTallies(activeSession.id);
    } finally {
      setSubmitting(false);
    }
  };

  // Admin functions
  const startVoteSession = async (title: string, description: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Close any existing active sessions
    await supabase
      .from("challenge_vote_sessions")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("status", "active");

    const { data, error } = await supabase
      .from("challenge_vote_sessions")
      .insert({
        created_by: user.id,
        title,
        description,
        status: "active",
      })
      .select()
      .single();

    if (data) {
      setActiveSession(data as ChallengeVoteSession);
      // Refresh challenges
      const { data: challengeData } = await supabase
        .from("challenges")
        .select("*, author:profiles(*)")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      if (challengeData) setChallenges(challengeData as Challenge[]);
    }

    return { data, error };
  };

  const closeVoteSession = async () => {
    if (!activeSession) return;

    const { error } = await supabase
      .from("challenge_vote_sessions")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", activeSession.id);

    if (!error) {
      setActiveSession(null);
      setMyVotes({});
      setHasVoted(false);
    }

    return { error };
  };

  const totalPointsBudget = 10;
  const pointsUsed = Object.values(myVotes).reduce((a, b) => a + b, 0);
  const pointsRemaining = totalPointsBudget - pointsUsed;

  return {
    activeSession,
    challenges,
    myVotes,
    tallies,
    loading,
    submitting,
    hasVoted,
    totalPointsBudget,
    pointsUsed,
    pointsRemaining,
    submitVotes,
    startVoteSession,
    closeVoteSession,
    refresh: fetchActiveSession,
  };
}
