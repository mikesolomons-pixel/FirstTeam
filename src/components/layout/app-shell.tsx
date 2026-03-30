"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ToastContainer } from "@/components/ui/toast";
import { AIAssistantPanel } from "@/components/ai/ai-panel";
import { TutorialWalkthrough } from "@/components/tutorial/tutorial-walkthrough";
import { useAuth } from "@/hooks/use-auth";

const TUTORIAL_SEEN_KEY = "first-team-tutorial-seen";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const isAuthPage = pathname.startsWith("/auth");
  const isTutorialPage = pathname === "/tutorial";

  // Show tutorial on first login
  useEffect(() => {
    if (user && !isAuthPage && !isTutorialPage) {
      const seen = localStorage.getItem(TUTORIAL_SEEN_KEY);
      if (!seen) {
        setShowTutorial(true);
      }
    }
  }, [user, isAuthPage, isTutorialPage]);

  const dismissTutorial = () => {
    localStorage.setItem(TUTORIAL_SEEN_KEY, "true");
    setShowTutorial(false);
  };

  if (isAuthPage) {
    return (
      <>
        {children}
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <TopBar />
      <main className="md:pl-64 pb-20 md:pb-0 min-h-screen bg-warm-50">{children}</main>
      <MobileNav />
      <ToastContainer />
      <AIAssistantPanel />
      {showTutorial && (
        <TutorialWalkthrough
          onComplete={dismissTutorial}
          onSkip={dismissTutorial}
        />
      )}
    </>
  );
}
