"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChallengeVoteSession, ChallengeVote, Challenge } from "@/types";

export interface VoteTally {
  challenge_id: string;
  title: string;
  status: string;
  total_points: number;
  voter_count: number;
}

export function useChallengeVote() {
  const [activeSession, setActiveSession] =
    useState<ChallengeVoteSession | null>(null);
  const [floorSession, setFloorSession] =
    useState<ChallengeVoteSession | null>(null);
  const [floorTallies, setFloorTallies] = useState<VoteTally[]>([]);
  const [allSessions, setAllSessions] = useState<ChallengeVoteSession[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, number>>({});
  const [tallies, setTallies] = useState<VoteTally[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const supabase = createClient();

  const fetchTalliesForSession = useCallback(
    async (sessionId: string): Promise<VoteTally[]> => {
      const { data: votesWithUser } = await supabase
        .from("challenge_votes")
        .select("challenge_id, points, user_id")
        .eq("session_id", sessionId);

      const { data: allChallenges } = await supabase
        .from("challenges")
        .select("id, title, status");

      if (!allChallenges) return [];

      const challengeMap = new Map(
        allChallenges.map((c) => [c.id, c])
      );

      const tallyMap: Record<
        string,
        { total_points: number; voters: Set<string> }
      > = {};

      if (votesWithUser) {
        for (const v of votesWithUser) {
          if (!tallyMap[v.challenge_id]) {
            tallyMap[v.challenge_id] = {
              total_points: 0,
              voters: new Set(),
            };
          }
          tallyMap[v.challenge_id].total_points += v.points;
          tallyMap[v.challenge_id].voters.add(v.user_id);
        }
      }

      const results: VoteTally[] = Object.entries(tallyMap)
        .map(([cid, data]) => ({
          challenge_id: cid,
          title: challengeMap.get(cid)?.title ?? "Unknown",
          status: challengeMap.get(cid)?.status ?? "open",
          total_points: data.total_points,
          voter_count: data.voters.size,
        }))
        .sort((a, b) => b.total_points - a.total_points);

      return results;
    },
    [supabase]
  );

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

      if (session) {
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

        // Fetch tallies for active session
        const activeTallies = await fetchTalliesForSession(session.id);
        setTallies(activeTallies);
      }

      // If no active session, check for a closed session to show on floor
      if (!session) {
        const { data: floorData } = await supabase
          .from("challenge_vote_sessions")
          .select("*")
          .eq("status", "closed")
          .eq("show_on_floor", true)
          .order("closed_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (floorData) {
          setFloorSession(floorData as ChallengeVoteSession);
          const ft = await fetchTalliesForSession(floorData.id);
          setFloorTallies(ft);
        } else {
          setFloorSession(null);
          setFloorTallies([]);
        }
      } else {
        setFloorSession(null);
        setFloorTallies([]);
      }
    } catch {
      // tables may not exist yet
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchTalliesForSession]);

  // Fetch all sessions (for admin history)
  const fetchAllSessions = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("challenge_vote_sessions")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setAllSessions(data as ChallengeVoteSession[]);
    } catch {
      // table may not exist
    }
  }, [supabase]);

  useEffect(() => {
    fetchActiveSession();
    fetchAllSessions();
  }, [fetchActiveSession, fetchAllSessions]);

  const submitVotes = async (votes: Record<string, number>) => {
    if (!activeSession) return;
    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase
        .from("challenge_votes")
        .delete()
        .eq("session_id", activeSession.id)
        .eq("user_id", user.id);

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
      const updatedTallies = await fetchTalliesForSession(activeSession.id);
      setTallies(updatedTallies);
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
      const { data: challengeData } = await supabase
        .from("challenges")
        .select("*, author:profiles(*)")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      if (challengeData) setChallenges(challengeData as Challenge[]);
      await fetchAllSessions();
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
      await fetchAllSessions();
      await fetchActiveSession();
    }

    return { error };
  };

  const toggleFloorVisibility = async (
    sessionId: string,
    showOnFloor: boolean
  ) => {
    // If enabling, disable all others first
    if (showOnFloor) {
      await supabase
        .from("challenge_vote_sessions")
        .update({ show_on_floor: false })
        .eq("show_on_floor", true);
    }

    const { error } = await supabase
      .from("challenge_vote_sessions")
      .update({ show_on_floor: showOnFloor })
      .eq("id", sessionId);

    if (!error) {
      await fetchAllSessions();
      await fetchActiveSession();
    }

    return { error };
  };

  const getTalliesForSession = async (sessionId: string) => {
    return fetchTalliesForSession(sessionId);
  };

  const totalPointsBudget = 10;
  const pointsUsed = Object.values(myVotes).reduce((a, b) => a + b, 0);
  const pointsRemaining = totalPointsBudget - pointsUsed;

  return {
    activeSession,
    floorSession,
    floorTallies,
    allSessions,
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
    toggleFloorVisibility,
    getTalliesForSession,
    refresh: fetchActiveSession,
  };
}
