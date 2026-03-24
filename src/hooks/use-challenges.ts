"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Challenge } from "@/types";

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("challenges")
      .select("*, author:profiles(*)")
      .order("created_at", { ascending: false });
    if (data) setChallenges(data as Challenge[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const createChallenge = async (challenge: Partial<Challenge>) => {
    const { data, error } = await supabase
      .from("challenges")
      .insert(challenge)
      .select("*, author:profiles(*)")
      .single();
    if (data) setChallenges((prev) => [data as Challenge, ...prev]);
    return { data, error };
  };

  const updateChallenge = async (id: string, updates: Partial<Challenge>) => {
    const { error } = await supabase
      .from("challenges")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) {
      setChallenges((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    }
    return { error };
  };

  return { challenges, loading, fetchChallenges, createChallenge, updateChallenge };
}
