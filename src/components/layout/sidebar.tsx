"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Factory,
  LayoutDashboard,
  Target,
  BookOpen,
  Newspaper,
  Lightbulb,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { useAuth } from "@/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";

const NAV_LINKS = [
  { label: "The Floor", href: "/", icon: LayoutDashboard },
  { label: "Challenges", href: "/challenges", icon: Target },
  { label: "Stories", href: "/stories", icon: BookOpen },
  { label: "News", href: "/news", icon: Newspaper },
  { label: "Brainstorm", href: "/brainstorm", icon: Lightbulb },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { onlineUsers, sidebarOpen, setSidebarOpen } = useAppStore();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const visibleUsers = onlineUsers.slice(0, 5);
  const extraCount = onlineUsers.length - visibleUsers.length;

  return (
    <>
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-warm-200 flex flex-col transition-transform duration-200 ease-in-out",
          "md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button on mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-3 right-3 p-1 text-warm-400 hover:text-warm-600 md:hidden cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo / Title */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <Factory className="w-7 h-7 text-steel-600" />
            <span className="text-xl font-bold text-warm-900">First Team</span>
          </div>
          <p className="mt-1.5 text-xs text-warm-500">
            One team. Every plant. No walls.
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-steel-50 text-steel-700 font-semibold border-l-3 border-ember-500"
                    : "text-warm-600 hover:bg-warm-50 hover:text-warm-800"
                )}
              >
                <Icon className={cn("w-5 h-5", active ? "text-steel-600" : "text-warm-400")} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Who's Here — Presence */}
        {onlineUsers.length > 0 && (
          <div className="px-4 py-3 border-t border-warm-200">
            <p className="text-xs font-semibold text-warm-500 uppercase tracking-wider mb-2">
              Who&apos;s Here
            </p>
            <div className="space-y-2">
              {visibleUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-2.5">
                  <Avatar
                    name={u.full_name}
                    src={u.avatar_url}
                    size="sm"
                    showPresence
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-warm-800 truncate">
                      {u.full_name}
                    </p>
                    <p className="text-xs text-warm-400 truncate">
                      {u.plant_name}
                    </p>
                  </div>
                </div>
              ))}
              {extraCount > 0 && (
                <p className="text-xs text-warm-400 pl-10">
                  +{extraCount} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* User profile */}
        {user && (
          <div className="px-4 py-3 border-t border-warm-200">
            <div className="flex items-center gap-3">
              <Avatar name={user.full_name} src={user.avatar_url} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-warm-800 truncate">
                  {user.full_name}
                </p>
                <p className="text-xs text-warm-500 truncate">
                  {user.plant_name}
                </p>
              </div>
              <button
                onClick={signOut}
                className="p-1.5 text-warm-400 hover:text-red-500 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
