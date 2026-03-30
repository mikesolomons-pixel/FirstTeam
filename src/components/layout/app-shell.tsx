"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ToastContainer } from "@/components/ui/toast";
import { AIAssistantPanel } from "@/components/ai/ai-panel";
import { TutorialTipCard } from "@/components/tutorial/tutorial-walkthrough";
import { TUTORIAL_TIPS, TIP_MAP } from "@/lib/tutorial-steps";
import { useAuth } from "@/hooks/use-auth";

const TUTORIAL_KEY = "first-team-tutorial-step";
const TUTORIAL_DONE_KEY = "first-team-tutorial-done";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [tourActive, setTourActive] = useState(false);
  const [seenPages, setSeenPages] = useState<Set<string>>(new Set());
  const isAuthPage = pathname.startsWith("/auth");
  const isTutorialPage = pathname === "/tutorial";

  // Check if tour should be active
  useEffect(() => {
    if (user && !isAuthPage && !isTutorialPage) {
      const done = localStorage.getItem(TUTORIAL_DONE_KEY);
      if (!done) {
        setTourActive(true);
        const saved = localStorage.getItem(TUTORIAL_KEY);
        if (saved) {
          try {
            setSeenPages(new Set(JSON.parse(saved)));
          } catch { /* ignore */ }
        }
      }
    }
  }, [user, isAuthPage, isTutorialPage]);

  // Current tip for this page
  const currentTip = useMemo(() => {
    if (!tourActive) return null;
    const tip = TIP_MAP[pathname];
    if (!tip) return null;
    if (seenPages.has(pathname)) return null;
    return tip;
  }, [tourActive, pathname, seenPages]);

  const stepNumber = useMemo(() => {
    const idx = TUTORIAL_TIPS.findIndex((t) => t.page === pathname);
    return idx >= 0 ? idx + 1 : 1;
  }, [pathname]);

  const dismissCurrentTip = () => {
    const updated = new Set(seenPages);
    updated.add(pathname);
    setSeenPages(updated);
    localStorage.setItem(TUTORIAL_KEY, JSON.stringify([...updated]));
  };

  const endTour = () => {
    setTourActive(false);
    localStorage.setItem(TUTORIAL_DONE_KEY, "true");
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
      <main className="md:pl-64 pb-20 md:pb-0 min-h-screen bg-warm-50">
        {currentTip && (
          <TutorialTipCard
            tip={currentTip}
            stepNumber={stepNumber}
            totalSteps={TUTORIAL_TIPS.length}
            onDismiss={dismissCurrentTip}
            onSkipAll={endTour}
          />
        )}
        {children}
      </main>
      <MobileNav />
      <ToastContainer />
      <AIAssistantPanel />
    </>
  );
}
