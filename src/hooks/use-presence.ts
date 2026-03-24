"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores/app-store";
import type { PresenceUser } from "@/types";

export function usePresence(currentPage?: string) {
  const { user, setOnlineUsers } = useAppStore();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel("online-users", {
      config: { presence: { key: user.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: PresenceUser[] = [];
        for (const key of Object.keys(state)) {
          const presences = state[key] as unknown as PresenceUser[];
          if (presences[0]) users.push(presences[0]);
        }
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            id: user.id,
            full_name: user.full_name,
            plant_name: user.plant_name,
            avatar_url: user.avatar_url,
            current_page: currentPage,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentPage, supabase, setOnlineUsers]);
}
