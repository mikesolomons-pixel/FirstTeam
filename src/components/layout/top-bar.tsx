"use client";

import { Menu, Sparkles } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

export function TopBar() {
  const { toggleSidebar, openAIPanel } = useAppStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white border-b border-warm-200 md:hidden">
      <button
        onClick={toggleSidebar}
        className="p-2 -ml-2 text-warm-600 hover:text-warm-800 cursor-pointer"
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <span className="text-base font-bold text-warm-900">First Team</span>

      <button
        onClick={() => openAIPanel({ type: "general", id: "", title: "AI Assistant" })}
        className="p-2 -mr-2 text-steel-500 hover:text-steel-700 cursor-pointer"
        aria-label="AI Assistant"
      >
        <Sparkles className="w-5 h-5" />
      </button>
    </header>
  );
}
