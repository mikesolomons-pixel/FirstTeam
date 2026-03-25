"use client";

import { BadgeIcon } from "./badge-icon";
import { ACTIVITY_BADGES, PEER_BADGES } from "@/lib/badges";
import type { UserBadge } from "@/types";

interface BadgeShowcaseProps {
  badges: UserBadge[];
}

export function BadgeShowcase({ badges }: BadgeShowcaseProps) {
  const earnedKeys = new Set(badges.map((b) => b.badge_key));

  // Count peer badges by key (can have multiple from different people)
  const peerCounts: Record<string, number> = {};
  for (const b of badges) {
    if (b.awarded_by) {
      peerCounts[b.badge_key] = (peerCounts[b.badge_key] || 0) + 1;
    }
  }

  return (
    <div className="space-y-6">
      {/* Activity Badges */}
      <div>
        <h3 className="text-sm font-semibold text-warm-500 uppercase tracking-wider mb-3">
          Activity Badges
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ACTIVITY_BADGES.map((def) => {
            const earned = earnedKeys.has(def.key);
            return (
              <div
                key={def.key}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  earned
                    ? "border-warm-200 bg-white"
                    : "border-warm-100 bg-warm-50/50"
                }`}
              >
                <BadgeIcon
                  badgeKey={def.key}
                  size="lg"
                  locked={!earned}
                />
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      earned ? "text-warm-900" : "text-warm-400"
                    }`}
                  >
                    {def.name}
                  </p>
                  <p className="text-[10px] text-warm-400 leading-tight">
                    {def.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Peer Recognition Badges */}
      <div>
        <h3 className="text-sm font-semibold text-warm-500 uppercase tracking-wider mb-3">
          Peer Recognition
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PEER_BADGES.map((def) => {
            const count = peerCounts[def.key] || 0;
            const earned = count > 0;
            return (
              <div
                key={def.key}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border text-center transition-all ${
                  earned
                    ? "border-warm-200 bg-white"
                    : "border-warm-100 bg-warm-50/50"
                }`}
              >
                <BadgeIcon
                  badgeKey={def.key}
                  size="lg"
                  locked={!earned}
                />
                <div>
                  <p
                    className={`text-sm font-medium ${
                      earned ? "text-warm-900" : "text-warm-400"
                    }`}
                  >
                    {def.name}
                  </p>
                  {earned && (
                    <p className="text-[10px] text-ember-500 font-medium mt-0.5">
                      ×{count} received
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
