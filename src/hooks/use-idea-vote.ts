"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { IdeaVoteSession, IdeaVote, ChallengeIdea, IdeaVoteTally } from "@/types";

export function useIdeaVote(challengeId?: string) {
  const [activeSession, setActiveSession] = useState<IdeaVoteSession | null>(null);
  const [allSessions, setAllSessions] = useState<IdeaVoteSession[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, number>>({});
  const [tallies, setTallies] = useState<IdeaVoteTally[]>([]);
  const [ideas, setIdeas] = useState<ChallengeIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const supabase = createClient();

  const fetchTalliesForSession = useCallback(
    async (sessionId: string): Promise<IdeaVoteTally[]> => {
      const { data: votes } = await supabase
        .from("idea_votes")
        .select("idea_id, points, user_id")
        .eq("session_id", sessionId);

      const { data: allIdeas } = await supabase
        .from("challenge_ideas")
        .select("id, title")
        .eq("challenge_id", challengeId ?? "");

      if (!allIdeas) return [];

      const ideaMap = new Map(allIdeas.map((i) => [i.id, i]));
      const tallyMap: Record<string, { total_points: number; voters: Set<string> }> = {};

      if (votes) {
        for (const v of votes) {
          if (!tallyMap[v.idea_id]) {
            tallyMap[v.idea_id] = { total_points: 0, voters: new Set() };
          }
          tallyMap[v.idea_id].total_points += v.points;
          tallyMap[v.idea_id].voters.add(v.user_id);
        }
      }

      return Object.entries(tallyMap)
        .map(([iid, data]) => ({
          idea_id: iid,
          title: ideaMap.get(iid)?.title ?? "Unknown",
          total_points: data.total_points,
          voter_count: data.voters.size,
        }))
        .sort((a, b) => b.total_points - a.total_points);
    },
    [supabase, challengeId]
  );

  const fetchActiveSession = useCallback(async () => {
    if (!challengeId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      const { data: session } = await supabase
        .from("idea_vote_sessions")
        .select("*")
        .eq("challenge_id", challengeId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setActiveSession(session as IdeaVoteSession | null);

      if (session) {
        // Fetch ideas for this challenge
        const { data: ideaData } = await supabase
          .from("challenge_ideas")
          .select("*, author:profiles(*)")
          .eq("challenge_id", challengeId)
          .order("created_at", { ascending: false });

        if (ideaData) setIdeas(ideaData as ChallengeIdea[]);

        // Fetch current user's votes
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: votes } = await supabase
            .from("idea_votes")
            .select("*")
            .eq("session_id", session.id)
            .eq("user_id", user.id);

          if (votes && votes.length > 0) {
            const voteMap: Record<string, number> = {};
            for (const v of votes as IdeaVote[]) {
              voteMap[v.idea_id] = v.points;
            }
            setMyVotes(voteMap);
            setHasVoted(true);
          }
        }

        const t = await fetchTalliesForSession(session.id);
        setTallies(t);
      }
    } catch {
      // tables may not exist
    } finally {
      setLoading(false);
    }
  }, [supabase, challengeId, fetchTalliesForSession]);

  const fetchAllSessions = useCallback(async () => {
    if (!challengeId) return;
    try {
      const { data } = await supabase
        .from("idea_vote_sessions")
        .select("*")
        .eq("challenge_id", challengeId)
        .order("created_at", { ascending: false });
      if (data) setAllSessions(data as IdeaVoteSession[]);
    } catch {
      // table may not exist
    }
  }, [supabase, challengeId]);

  useEffect(() => {
    fetchActiveSession();
    fetchAllSessions();
  }, [fetchActiveSession, fetchAllSessions]);

  const submitVotes = async (votes: Record<string, number>) => {
    if (!activeSession) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase
        .from("idea_votes")
        .delete()
        .eq("session_id", activeSession.id)
        .eq("user_id", user.id);

      const rows = Object.entries(votes)
        .filter(([, points]) => points > 0)
        .map(([idea_id, points]) => ({
          session_id: activeSession.id,
          user_id: user.id,
          idea_id,
          points,
        }));

      if (rows.length > 0) {
        await supabase.from("idea_votes").insert(rows);
      }

      setMyVotes(votes);
      setHasVoted(true);
      const t = await fetchTalliesForSession(activeSession.id);
      setTallies(t);
    } finally {
      setSubmitting(false);
    }
  };

  const startVoteSession = async (title: string) => {
    if (!challengeId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Close any active session for this challenge
    await supabase
      .from("idea_vote_sessions")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("challenge_id", challengeId)
      .eq("status", "active");

    const { data } = await supabase
      .from("idea_vote_sessions")
      .insert({ challenge_id: challengeId, created_by: user.id, title, status: "active" })
      .select()
      .single();

    if (data) {
      setActiveSession(data as IdeaVoteSession);
      await fetchAllSessions();
    }
  };

  const closeVoteSession = async () => {
    if (!activeSession) return;
    await supabase
      .from("idea_vote_sessions")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", activeSession.id);

    setActiveSession(null);
    setMyVotes({});
    setHasVoted(false);
    await fetchAllSessions();
    await fetchActiveSession();
  };

  const toggleChallengeVisibility = async (sessionId: string, show: boolean) => {
    if (show) {
      await supabase
        .from("idea_vote_sessions")
        .update({ show_on_challenge: false })
        .eq("challenge_id", challengeId ?? "")
        .eq("show_on_challenge", true);
    }
    await supabase
      .from("idea_vote_sessions")
      .update({ show_on_challenge: show })
      .eq("id", sessionId);
    await fetchAllSessions();
  };

  const getTalliesForSession = async (sessionId: string) => {
    return fetchTalliesForSession(sessionId);
  };

  const totalPointsBudget = 10;
  const pointsUsed = Object.values(myVotes).reduce((a, b) => a + b, 0);
  const pointsRemaining = totalPointsBudget - pointsUsed;

  return {
    activeSession,
    allSessions,
    ideas,
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
    toggleChallengeVisibility,
    getTalliesForSession,
    refresh: fetchActiveSession,
  };
}
