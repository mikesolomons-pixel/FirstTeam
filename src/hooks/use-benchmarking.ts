"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BenchmarkEntry, BenchmarkComment, BenchmarkCommentType } from "@/types";

export function useBenchmarking(period: string) {
  const [entries, setEntries] = useState<BenchmarkEntry[]>([]);
  const [comments, setComments] = useState<BenchmarkComment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("benchmark_entries")
        .select("*, author:profiles(*)")
        .eq("period", period)
        .order("plant_name");
      if (data) setEntries(data as BenchmarkEntry[]);
    } catch {
      // table may not exist
    } finally {
      setLoading(false);
    }
  }, [supabase, period]);

  const fetchComments = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("benchmark_comments")
        .select("*, author:profiles(*)")
        .eq("period", period)
        .order("created_at", { ascending: false });
      if (data) setComments(data as BenchmarkComment[]);
    } catch {
      // table may not exist
    }
  }, [supabase, period]);

  useEffect(() => {
    fetchEntries();
    fetchComments();
  }, [fetchEntries, fetchComments]);

  const upsertEntry = async (entry: {
    plant_name: string;
    metric_key: string;
    period: string;
    value: number;
    target?: number | null;
    author_id: string;
  }) => {
    // Check if exists
    const { data: existing } = await supabase
      .from("benchmark_entries")
      .select("id")
      .eq("plant_name", entry.plant_name)
      .eq("metric_key", entry.metric_key)
      .eq("period", entry.period)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("benchmark_entries")
        .update({
          value: entry.value,
          target: entry.target ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("benchmark_entries").insert(entry);
    }

    await fetchEntries();
  };

  const addComment = async (comment: {
    plant_name: string;
    metric_key: string;
    period: string;
    author_id: string;
    body: string;
    comment_type: BenchmarkCommentType;
  }) => {
    const { data } = await supabase
      .from("benchmark_comments")
      .insert(comment)
      .select("*, author:profiles(*)")
      .single();
    if (data) {
      setComments((prev) => [data as BenchmarkComment, ...prev]);
    }
  };

  const getEntriesForMetric = (metricKey: string) =>
    entries.filter((e) => e.metric_key === metricKey);

  const getCommentsForMetric = (metricKey: string) =>
    comments.filter((c) => c.metric_key === metricKey);

  return {
    entries,
    comments,
    loading,
    fetchEntries,
    fetchComments,
    upsertEntry,
    addComment,
    getEntriesForMetric,
    getCommentsForMetric,
  };
}
