"use client";

import { BadgeIcon } from "./badge-icon";
import { cn } from "@/lib/utils";
import type { UserBadge } from "@/types";

interface BadgeRowProps {
  badges: UserBadge[];
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function BadgeRow({
  badges,
  max = 3,
  size = "sm",
  className,
}: BadgeRowProps) {
  if (badges.length === 0) return null;

  // Deduplicate by badge_key (show unique badge types)
  const uniqueKeys = new Set<string>();
  const unique = badges.filter((b) => {
    if (uniqueKeys.has(b.badge_key)) return false;
    uniqueKeys.add(b.badge_key);
    return true;
  });

  const shown = unique.slice(0, max);
  const overflow = unique.length - max;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {shown.map((b) => (
        <BadgeIcon key={b.badge_key} badgeKey={b.badge_key} size={size} />
      ))}
      {overflow > 0 && (
        <span className="text-[10px] font-medium text-warm-400 ml-0.5">
          +{overflow}
        </span>
      )}
    </div>
  );
}
