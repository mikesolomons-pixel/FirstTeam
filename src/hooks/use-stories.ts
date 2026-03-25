"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Story } from "@/types";

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("stories")
        .select("*, author:profiles(*)")
        .order("created_at", { ascending: false });
      if (data) setStories(data as Story[]);
    } catch {
      // table may not exist yet
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const createStory = async (story: Partial<Story>) => {
    const { data, error } = await supabase
      .from("stories")
      .insert(story)
      .select("*, author:profiles(*)")
      .single();
    if (data) setStories((prev) => [data as Story, ...prev]);
    return { data, error };
  };

  const updateStory = async (id: string, updates: Partial<Story>) => {
    const { error } = await supabase
      .from("stories")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) {
      setStories((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
    }
    return { error };
  };

  return { stories, loading, fetchStories, createStory, updateStory };
}
