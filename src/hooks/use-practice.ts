"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PracticeSession, PracticeMessage, PracticeRole } from "@/types";

export function usePractice(userId?: string) {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchSessions = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await supabase
        .from("practice_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (data) setSessions(data as PracticeSession[]);
    } catch {
      // table may not exist
    } finally {
      setLoading(false);
    }
  }, [supabase, userId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const createSession = async (
    role: PracticeRole,
    scenarioTitle: string,
    scenarioPrompt: string
  ) => {
    if (!userId) return null;
    const { data, error } = await supabase
      .from("practice_sessions")
      .insert({
        user_id: userId,
        role,
        scenario_title: scenarioTitle,
        scenario_prompt: scenarioPrompt,
        status: "active",
      })
      .select()
      .single();

    if (error) return null;
    setSessions((prev) => [data as PracticeSession, ...prev]);
    return data as PracticeSession;
  };

  const getSession = async (sessionId: string) => {
    const { data: session } = await supabase
      .from("practice_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    const { data: messages } = await supabase
      .from("practice_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    return {
      session: session as PracticeSession | null,
      messages: (messages ?? []) as PracticeMessage[],
    };
  };

  const addMessage = async (
    sessionId: string,
    role: "user" | "assistant",
    content: string
  ) => {
    const { data } = await supabase
      .from("practice_messages")
      .insert({ session_id: sessionId, role, content })
      .select()
      .single();
    return data as PracticeMessage | null;
  };

  const completeSession = async (sessionId: string, feedback: string) => {
    await supabase
      .from("practice_sessions")
      .update({
        status: "completed",
        feedback,
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, status: "completed" as const, feedback, completed_at: new Date().toISOString() }
          : s
      )
    );
  };

  const deleteSession = async (sessionId: string) => {
    await supabase.from("practice_sessions").delete().eq("id", sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  return {
    sessions,
    loading,
    fetchSessions,
    createSession,
    getSession,
    addMessage,
    completeSession,
    deleteSession,
  };
}
