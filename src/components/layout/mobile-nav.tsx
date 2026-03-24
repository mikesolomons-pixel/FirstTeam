"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  BookOpen,
  Newspaper,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Floor", href: "/", icon: LayoutDashboard },
  { label: "Challenges", href: "/challenges", icon: Target },
  { label: "Stories", href: "/stories", icon: BookOpen },
  { label: "News", href: "/news", icon: Newspaper },
  { label: "Brainstorm", href: "/brainstorm", icon: Lightbulb },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-warm-200 md:hidden">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 text-xs transition-colors",
                active
                  ? "text-ember-500 font-semibold"
                  : "text-warm-400 hover:text-warm-600"
              )}
            >
              <Icon className={cn("w-5 h-5", active ? "text-ember-500" : "text-warm-400")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
