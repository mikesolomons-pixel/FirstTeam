"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { NewsItem } from "@/types";

export function useNews() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchNews = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("news_items")
      .select("*, author:profiles(*)")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (data) setNewsItems(data as NewsItem[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const createNewsItem = async (item: Partial<NewsItem>) => {
    const { data, error } = await supabase
      .from("news_items")
      .insert(item)
      .select("*, author:profiles(*)")
      .single();
    if (data) setNewsItems((prev) => [data as NewsItem, ...prev]);
    return { data, error };
  };

  const updateNewsItem = async (id: string, updates: Partial<NewsItem>) => {
    const { error } = await supabase
      .from("news_items")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) {
      setNewsItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
      );
    }
    return { error };
  };

  return { newsItems, loading, fetchNews, createNewsItem, updateNewsItem };
}
