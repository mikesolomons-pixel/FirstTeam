"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Reaction } from "@/types";

export type ReactionCount = {
  emoji: string;
  count: number;
};

export function useReactions() {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchReactions = useCallback(
    async (targetType: string, targetId: string) => {
      setLoading(true);
      const { data } = await supabase
        .from("reactions")
        .select("*")
        .eq("target_type", targetType)
        .eq("target_id", targetId);
      if (data) setReactions(data as Reaction[]);
      setLoading(false);
      return data as Reaction[] | null;
    },
    [supabase]
  );

  const toggleReaction = async (
    targetType: string,
    targetId: string,
    emoji: string,
    userId: string
  ) => {
    const existing = reactions.find(
      (r) =>
        r.target_type === targetType &&
        r.target_id === targetId &&
        r.emoji === emoji &&
        r.user_id === userId
    );

    if (existing) {
      const { error } = await supabase
        .from("reactions")
        .delete()
        .eq("id", existing.id);
      if (!error) {
        setReactions((prev) => prev.filter((r) => r.id !== existing.id));
      }
      return { added: false, error };
    } else {
      const { data, error } = await supabase
        .from("reactions")
        .insert({
          target_type: targetType,
          target_id: targetId,
          emoji,
          user_id: userId,
        })
        .select()
        .single();
      if (data) setReactions((prev) => [...prev, data as Reaction]);
      return { added: true, error };
    }
  };

  const getReactionCounts = useCallback((): ReactionCount[] => {
    const counts: Record<string, number> = {};
    for (const r of reactions) {
      counts[r.emoji] = (counts[r.emoji] || 0) + 1;
    }
    return Object.entries(counts).map(([emoji, count]) => ({ emoji, count }));
  }, [reactions]);

  return { reactions, loading, fetchReactions, toggleReaction, getReactionCounts };
}
