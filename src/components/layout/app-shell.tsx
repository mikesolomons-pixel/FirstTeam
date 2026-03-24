"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ToastContainer } from "@/components/ui/toast";
import { AIAssistantPanel } from "@/components/ai/ai-panel";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

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
      <main className="md:pl-64 pb-20 md:pb-0 min-h-screen">{children}</main>
      <MobileNav />
      <ToastContainer />
      <AIAssistantPanel />
    </>
  );
}
