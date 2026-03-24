"use client";

import { Menu, Sparkles } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

export function TopBar() {
  const { toggleSidebar, openAIPanel } = useAppStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-steel-900 border-b border-steel-700/50 md:hidden">
      <button
        onClick={toggleSidebar}
        className="p-2 -ml-2 text-steel-300 hover:text-white cursor-pointer"
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <span className="text-base font-bold text-white">First Team</span>

      <button
        onClick={() => openAIPanel({ type: "general", id: "", title: "AI Assistant" })}
        className="p-2 -mr-2 text-ember-400 hover:text-ember-300 cursor-pointer"
        aria-label="AI Assistant"
      >
        <Sparkles className="w-5 h-5" />
      </button>
    </header>
  );
}
