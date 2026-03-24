import { create } from "zustand";
import type { Profile, PresenceUser } from "@/types";

interface AppState {
  // Auth
  user: Profile | null;
  setUser: (user: Profile | null) => void;

  // Presence
  onlineUsers: PresenceUser[];
  setOnlineUsers: (users: PresenceUser[]) => void;

  // UI
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // AI Panel
  aiPanelOpen: boolean;
  aiPanelContext: { type: string; id: string; title: string } | null;
  openAIPanel: (context: { type: string; id: string; title: string }) => void;
  closeAIPanel: () => void;

  // Notifications
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  onlineUsers: [],
  setOnlineUsers: (users) => set({ onlineUsers: users }),

  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  aiPanelOpen: false,
  aiPanelContext: null,
  openAIPanel: (context) => set({ aiPanelOpen: true, aiPanelContext: context }),
  closeAIPanel: () => set({ aiPanelOpen: false, aiPanelContext: null }),

  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
