"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChallengeIdea } from "@/types";

export function useChallengeIdeas(challengeId?: string) {
  const [ideas, setIdeas] = useState<ChallengeIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchIdeas = useCallback(async () => {
    if (!challengeId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await supabase
        .from("challenge_ideas")
        .select("*, author:profiles(*)")
        .eq("challenge_id", challengeId)
        .order("created_at", { ascending: false });

      if (data) {
        // Get comment counts per idea
        const ideaIds = data.map((d) => d.id);
        const { data: commentCounts } = await supabase
          .from("comments")
          .select("parent_id")
          .eq("parent_type", "idea")
          .in("parent_id", ideaIds.length > 0 ? ideaIds : ["none"]);

        const countMap: Record<string, number> = {};
        if (commentCounts) {
          for (const c of commentCounts) {
            countMap[c.parent_id] = (countMap[c.parent_id] || 0) + 1;
          }
        }

        setIdeas(
          data.map((d) => ({
            ...d,
            comment_count: countMap[d.id] || 0,
          })) as ChallengeIdea[]
        );
      }
    } catch {
      // table may not exist
    } finally {
      setLoading(false);
    }
  }, [supabase, challengeId]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const createIdea = async (idea: {
    challenge_id: string;
    author_id: string;
    title: string;
    body: string;
  }) => {
    const { data, error } = await supabase
      .from("challenge_ideas")
      .insert(idea)
      .select("*, author:profiles(*)")
      .single();

    if (data && !error) {
      setIdeas((prev) => [{ ...data, comment_count: 0 } as ChallengeIdea, ...prev]);
    }
    return { data, error };
  };

  const deleteIdea = async (id: string) => {
    await supabase.from("challenge_ideas").delete().eq("id", id);
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  return { ideas, loading, fetchIdeas, createIdea, deleteIdea };
}
