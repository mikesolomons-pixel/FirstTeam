"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BrainstormSession, Idea } from "@/types";

export function useBrainstorm() {
  const [sessions, setSessions] = useState<BrainstormSession[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("brainstorm_sessions")
      .select("*, author:profiles(*)")
      .order("created_at", { ascending: false });
    if (data) setSessions(data as BrainstormSession[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const createSession = async (session: Partial<BrainstormSession>) => {
    const { data, error } = await supabase
      .from("brainstorm_sessions")
      .insert(session)
      .select("*, author:profiles(*)")
      .single();
    if (data) setSessions((prev) => [data as BrainstormSession, ...prev]);
    return { data, error };
  };

  const fetchIdeas = useCallback(async (sessionId: string) => {
    const { data } = await supabase
      .from("ideas")
      .select("*, author:profiles(*)")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });
    if (data) setIdeas(data as Idea[]);
    return data as Idea[] | null;
  }, [supabase]);

  const createIdea = async (idea: Partial<Idea>) => {
    const { data, error } = await supabase
      .from("ideas")
      .insert(idea)
      .select("*, author:profiles(*)")
      .single();
    if (data) setIdeas((prev) => [data as Idea, ...prev]);
    return { data, error };
  };

  const updateIdea = async (id: string, updates: Partial<Idea>) => {
    const { error } = await supabase
      .from("ideas")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) {
      setIdeas((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
      );
    }
    return { error };
  };

  const voteIdea = async (ideaId: string, userId: string) => {
    const { error: voteError } = await supabase
      .from("idea_votes")
      .insert({ idea_id: ideaId, user_id: userId });
    if (voteError) return { error: voteError };

    const { error } = await supabase.rpc("increment_idea_votes", {
      idea_id: ideaId,
    });
    if (!error) {
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === ideaId ? { ...i, votes: (i.votes ?? 0) + 1 } : i
        )
      );
    }
    return { error };
  };

  const unvoteIdea = async (ideaId: string, userId: string) => {
    const { error: deleteError } = await supabase
      .from("idea_votes")
      .delete()
      .eq("idea_id", ideaId)
      .eq("user_id", userId);
    if (deleteError) return { error: deleteError };

    const { error } = await supabase.rpc("decrement_idea_votes", {
      idea_id: ideaId,
    });
    if (!error) {
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === ideaId ? { ...i, votes: Math.max(0, (i.votes ?? 0) - 1) } : i
        )
      );
    }
    return { error };
  };

  return {
    sessions,
    ideas,
    loading,
    fetchSessions,
    createSession,
    fetchIdeas,
    createIdea,
    updateIdea,
    voteIdea,
    unvoteIdea,
  };
}
