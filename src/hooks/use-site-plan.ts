"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SitePlanGoal, SitePlanUpdate, GoalStatus, UpdateType } from "@/types";

export function useSitePlan(plantFilter?: string) {
  const [goals, setGoals] = useState<SitePlanGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("site_plan_goals")
        .select("*, author:profiles(*)")
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false });

      if (plantFilter && plantFilter !== "all") {
        query = query.eq("plant_name", plantFilter);
      }

      const { data } = await query;
      if (data) setGoals(data as SitePlanGoal[]);
    } catch {
      // table may not exist
    } finally {
      setLoading(false);
    }
  }, [supabase, plantFilter]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = async (goal: {
    plant_name: string;
    title: string;
    category: string;
    target_value: string;
    current_value: string;
    status: GoalStatus;
    priority: number;
    author_id: string;
  }) => {
    const { data, error } = await supabase
      .from("site_plan_goals")
      .insert(goal)
      .select("*, author:profiles(*)")
      .single();
    if (!error && data) {
      setGoals((prev) => [data as SitePlanGoal, ...prev]);
    }
    return { data, error };
  };

  const updateGoal = async (
    goalId: string,
    updates: Partial<Pick<SitePlanGoal, "title" | "category" | "target_value" | "current_value" | "status" | "priority">>
  ) => {
    const { error } = await supabase
      .from("site_plan_goals")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", goalId);
    if (!error) await fetchGoals();
    return { error };
  };

  const deleteGoal = async (goalId: string) => {
    await supabase.from("site_plan_goals").delete().eq("id", goalId);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const fetchUpdates = async (goalId: string) => {
    const { data } = await supabase
      .from("site_plan_updates")
      .select("*, author:profiles(*)")
      .eq("goal_id", goalId)
      .order("created_at", { ascending: false });
    return (data ?? []) as SitePlanUpdate[];
  };

  const addUpdate = async (update: {
    goal_id: string;
    author_id: string;
    body: string;
    update_type: UpdateType;
  }) => {
    const { data } = await supabase
      .from("site_plan_updates")
      .insert(update)
      .select("*, author:profiles(*)")
      .single();
    return data as SitePlanUpdate | null;
  };

  return {
    goals,
    loading,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    fetchUpdates,
    addUpdate,
  };
}
