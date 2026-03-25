"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores/app-store";
import type { Profile } from "@/types";

export function useAuth() {
  const {
    user,
    setUser,
    authLoading: loading,
    setAuthLoading,
    authInitialized,
    setAuthInitialized,
  } = useAppStore();
  const supabase = createClient();

  useEffect(() => {
    // Only initialize auth once across all components
    if (authInitialized) return;
    setAuthInitialized(true);

    async function getUser() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single();
          if (profile) setUser(profile as Profile);
        }
      } catch {
        // auth check failed
      } finally {
        setAuthLoading(false);
      }
    }
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (profile) setUser(profile as Profile);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, setUser, setAuthLoading, authInitialized, setAuthInitialized]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/auth/login";
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    if (!error) {
      setUser({ ...user, ...updates });
    }
    return { error };
  };

  return { user, loading, signOut, updateProfile };
}
