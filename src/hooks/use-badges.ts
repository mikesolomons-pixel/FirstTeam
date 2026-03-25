"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getEarnedActivityBadgeKeys } from "@/lib/badge-criteria";
import type { UserBadge, Profile } from "@/types";

export function useBadges(userId?: string) {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchBadges = useCallback(
    async (uid?: string) => {
      const id = uid || userId;
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data } = await supabase
          .from("user_badges")
          .select("*, awarder:profiles!awarded_by(*)")
          .eq("user_id", id)
          .order("created_at", { ascending: false });
        if (data) setBadges(data as UserBadge[]);
      } catch {
        // table may not exist yet
      } finally {
        setLoading(false);
      }
    },
    [supabase, userId]
  );

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const awardPeerBadge = async (
    targetUserId: string,
    badgeKey: string,
    note?: string
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase.from("user_badges").insert({
      user_id: targetUserId,
      badge_key: badgeKey,
      awarded_by: user.id,
      note: note || null,
    });

    if (!error) {
      await fetchBadges();
    }
    return { error };
  };

  const checkAndGrantActivityBadges = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Get what they've earned based on activity
      const earnedKeys = await getEarnedActivityBadgeKeys(supabase, user.id);

      // Get what they already have
      const { data: existing } = await supabase
        .from("user_badges")
        .select("badge_key")
        .eq("user_id", user.id)
        .is("awarded_by", null);

      const existingKeys = new Set(
        (existing ?? []).map((b) => b.badge_key)
      );

      // Grant new badges
      const newBadges = earnedKeys.filter((k) => !existingKeys.has(k));
      if (newBadges.length > 0) {
        const rows = newBadges.map((badge_key) => ({
          user_id: user.id,
          badge_key,
          awarded_by: null,
          note: null,
        }));
        await supabase.from("user_badges").insert(rows);
        await fetchBadges(user.id);
      }

      return newBadges;
    } catch {
      return [];
    }
  };

  return {
    badges,
    loading,
    fetchBadges,
    awardPeerBadge,
    checkAndGrantActivityBadges,
  };
}

/** Fetch all badges for the leaderboard */
export function useLeaderboard() {
  const [entries, setEntries] = useState<
    {
      user_id: string;
      full_name: string;
      avatar_url: string | null;
      plant_name: string;
      badge_count: number;
      badge_keys: string[];
    }[]
  >([]);
  const [recentAwards, setRecentAwards] = useState<
    (UserBadge & { recipient?: Profile })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetch() {
      try {
        // Get all badges with user info
        const { data: allBadges } = await supabase
          .from("user_badges")
          .select("*, awarder:profiles!awarded_by(*)")
          .order("created_at", { ascending: false });

        // Get all profiles
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*");

        if (!allBadges || !profiles) return;

        const profileMap = new Map(
          profiles.map((p) => [p.id, p as Profile])
        );

        // Build leaderboard
        const userBadges: Record<
          string,
          { count: number; keys: string[] }
        > = {};
        for (const b of allBadges) {
          if (!userBadges[b.user_id]) {
            userBadges[b.user_id] = { count: 0, keys: [] };
          }
          userBadges[b.user_id].count++;
          if (
            !userBadges[b.user_id].keys.includes(b.badge_key)
          ) {
            userBadges[b.user_id].keys.push(b.badge_key);
          }
        }

        const leaderboard = Object.entries(userBadges)
          .map(([uid, data]) => {
            const p = profileMap.get(uid);
            return {
              user_id: uid,
              full_name: p?.full_name ?? "Unknown",
              avatar_url: p?.avatar_url ?? null,
              plant_name: p?.plant_name ?? "",
              badge_count: data.count,
              badge_keys: data.keys,
            };
          })
          .sort((a, b) => b.badge_count - a.badge_count);

        setEntries(leaderboard);

        // Recent peer awards (last 20)
        const peerAwards = allBadges
          .filter((b) => b.awarded_by)
          .slice(0, 20)
          .map((b) => ({
            ...b,
            recipient: profileMap.get(b.user_id),
          }));
        setRecentAwards(
          peerAwards as (UserBadge & { recipient?: Profile })[]
        );
      } catch {
        // tables may not exist
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [supabase]);

  return { entries, recentAwards, loading };
}
