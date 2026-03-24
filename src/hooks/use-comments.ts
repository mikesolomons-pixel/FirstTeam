"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Comment } from "@/types";

export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchComments = useCallback(
    async (parentType: string, parentId: string) => {
      setLoading(true);
      const { data } = await supabase
        .from("comments")
        .select("*, author:profiles(*)")
        .eq("parent_type", parentType)
        .eq("parent_id", parentId)
        .order("created_at", { ascending: true });
      if (data) setComments(data as Comment[]);
      setLoading(false);
      return data as Comment[] | null;
    },
    [supabase]
  );

  const createComment = async (comment: {
    parent_type: string;
    parent_id: string;
    body: string;
    reply_to_id?: string | null;
    author_id: string;
  }) => {
    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select("*, author:profiles(*)")
      .single();
    if (data) setComments((prev) => [...prev, data as Comment]);
    return { data, error };
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", id);
    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
    return { error };
  };

  return { comments, loading, fetchComments, createComment, deleteComment };
}
