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
  Shield,
  Award,
  MessageCircle,
  BarChart3,
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
  { label: "Practice", href: "/practice", icon: MessageCircle },
  { label: "Benchmarking", href: "/benchmarking", icon: BarChart3 },
  { label: "Achievements", href: "/achievements", icon: Award },
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
          "fixed top-0 left-0 z-50 h-full w-64 flex flex-col transition-transform duration-200 ease-in-out",
          "bg-gradient-to-b from-steel-900 via-steel-900 to-steel-950",
          "md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button on mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-3 right-3 p-1 text-steel-400 hover:text-steel-200 md:hidden cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo / Title */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-ember-500/20 flex items-center justify-center">
              <Factory className="w-5 h-5 text-ember-400" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">First Team</span>
          </div>
          <p className="mt-2 text-xs text-steel-400 italic">
            One team. Every plant. No walls.
          </p>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-steel-700/50" />

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-4 space-y-1 overflow-y-auto">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                  active
                    ? "bg-white/10 text-white font-semibold shadow-sm shadow-black/10 border-l-3 border-ember-500"
                    : "text-steel-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5", active ? "text-ember-400" : "text-steel-500")} />
                {label}
              </Link>
            );
          })}

          {/* Admin link — only visible to admins */}
          {user?.is_admin && (
            <>
              <div className="my-2 border-t border-steel-700/50" />
              <Link
                href="/admin"
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                  isActive("/admin")
                    ? "bg-white/10 text-white font-semibold shadow-sm shadow-black/10 border-l-3 border-ember-500"
                    : "text-steel-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <Shield className={cn("w-5 h-5", isActive("/admin") ? "text-ember-400" : "text-steel-500")} />
                Admin
              </Link>
            </>
          )}
        </nav>

        {/* Who's Here — Presence */}
        {onlineUsers.length > 0 && (
          <div className="px-4 py-3 border-t border-steel-700/50">
            <p className="text-[10px] font-semibold text-steel-500 uppercase tracking-widest mb-2">
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
                    <p className="text-sm font-medium text-steel-100 truncate">
                      {u.full_name}
                    </p>
                    <p className="text-xs text-steel-500 truncate">
                      {u.plant_name}
                    </p>
                  </div>
                </div>
              ))}
              {extraCount > 0 && (
                <p className="text-xs text-steel-500 pl-10">
                  +{extraCount} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* User profile */}
        {user && (
          <div className="px-4 py-3 border-t border-steel-700/50">
            <div className="flex items-center gap-3">
              <Avatar name={user.full_name} src={user.avatar_url} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-steel-100 truncate">
                  {user.full_name}
                </p>
                <p className="text-xs text-steel-500 truncate">
                  {user.plant_name}
                </p>
              </div>
              <button
                onClick={signOut}
                className="p-1.5 text-steel-500 hover:text-red-400 transition-colors cursor-pointer"
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
