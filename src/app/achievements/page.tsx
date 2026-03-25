"use client";

import { Suspense, useState, useEffect } from "react";
import { Award, Trophy, Users, Zap, Heart, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useBadges, useLeaderboard } from "@/hooks/use-badges";
import { getBadgeDef, ALL_BADGES } from "@/lib/badges";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BadgeIcon } from "@/components/badges/badge-icon";
import { BadgeShowcase } from "@/components/badges/badge-showcase";
import { BadgeRow } from "@/components/badges/badge-row";
import { AwardBadgeModal } from "@/components/badges/award-badge-modal";
import { cn, timeAgo } from "@/lib/utils";
import type { Profile } from "@/types";

function AchievementsContent() {
  const { user, loading: authLoading } = useAuth();
  const { badges: myBadges, loading: badgesLoading, awardPeerBadge, fetchBadges } = useBadges(
    user?.id
  );
  const { entries, recentAwards, loading: leaderboardLoading } =
    useLeaderboard();
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [awardTarget, setAwardTarget] = useState<Profile | null>(null);
  const [search, setSearch] = useState("");

  // Fetch all profiles so we can recognize anyone, not just badge holders
  useEffect(() => {
    async function loadProfiles() {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");
      if (data) setAllProfiles(data as Profile[]);
    }
    loadProfiles();
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
      </div>
    );
  }

  const uniqueEarned = new Set(myBadges.map((b) => b.badge_key)).size;

  return (
    <div className="animate-fade-in-up">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-steel-800 via-steel-900 to-steel-950 px-8 py-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-ember-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-forge-400/10 rounded-full blur-3xl translate-y-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-ember-400" />
            <span className="text-sm text-steel-300 font-medium">
              Achievements
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Badges & Recognition
          </h1>
          <p className="text-steel-300 mt-2 max-w-lg">
            Earn badges through your contributions. Recognize peers who make a difference.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-8 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ember-400 to-ember-600" />
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="w-12 h-12 rounded-xl bg-ember-100 flex items-center justify-center">
              <Award className="w-6 h-6 text-ember-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-warm-900">
                {uniqueEarned}
              </p>
              <p className="text-xs text-warm-500 font-medium">
                of {ALL_BADGES.length} Badges Earned
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-forge-400 to-forge-600" />
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="w-12 h-12 rounded-xl bg-forge-100 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-forge-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-warm-900">
                {entries.length > 0 ? entries[0].full_name.split(" ")[0] : "—"}
              </p>
              <p className="text-xs text-warm-500 font-medium">
                Top Contributor
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-steel-400 to-steel-600" />
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="w-12 h-12 rounded-xl bg-steel-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-steel-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-warm-900">
                {recentAwards.length}
              </p>
              <p className="text-xs text-warm-500 font-medium">
                Peer Recognitions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Badges */}
      <div className="px-8 pt-8">
        <h2 className="text-lg font-semibold text-warm-900 mb-4">
          My Badges
        </h2>
        {badgesLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-3 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
          </div>
        ) : (
          <BadgeShowcase badges={myBadges} />
        )}
      </div>

      {/* Main content: Leaderboard + Recent Recognition */}
      <div className="px-8 pt-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-warm-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-ember-500" />
            Leaderboard
          </h2>
          <Card>
            {leaderboardLoading ? (
              <CardContent className="text-center py-8">
                <div className="w-6 h-6 border-3 border-steel-200 border-t-steel-600 rounded-full animate-spin mx-auto" />
              </CardContent>
            ) : entries.length === 0 ? (
              <CardContent className="text-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-warm-100 flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-7 h-7 text-warm-400" />
                </div>
                <p className="text-warm-500 text-sm">
                  No badges earned yet — be the first!
                </p>
              </CardContent>
            ) : (
              <div className="divide-y divide-warm-100">
                {entries.map((entry, i) => (
                  <div
                    key={entry.user_id}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-warm-50/50 transition-colors"
                  >
                    {/* Rank */}
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0",
                        i === 0 &&
                          "bg-gradient-to-br from-amber-400 to-amber-500 text-white",
                        i === 1 &&
                          "bg-gradient-to-br from-warm-300 to-warm-400 text-white",
                        i === 2 &&
                          "bg-gradient-to-br from-amber-600 to-amber-700 text-white",
                        i > 2 && "bg-warm-100 text-warm-500"
                      )}
                    >
                      {i + 1}
                    </div>

                    {/* User */}
                    <Avatar
                      name={entry.full_name}
                      src={entry.avatar_url}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-warm-900 truncate">
                        {entry.full_name}
                      </p>
                      <p className="text-xs text-warm-500">
                        {entry.plant_name}
                      </p>
                    </div>

                    {/* Badge icons */}
                    <div className="flex items-center gap-0.5">
                      {entry.badge_keys.slice(0, 4).map((k) => (
                        <BadgeIcon key={k} badgeKey={k} size="sm" />
                      ))}
                      {entry.badge_keys.length > 4 && (
                        <span className="text-[10px] text-warm-400 ml-0.5">
                          +{entry.badge_keys.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Count */}
                    <Badge className="bg-ember-100 text-ember-700">
                      {entry.badge_count}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Recognition */}
        <div>
          <h2 className="text-lg font-semibold text-warm-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-forge-500" />
            Recent Recognition
          </h2>
          <Card>
            <CardContent className="space-y-3">
              {recentAwards.length === 0 ? (
                <p className="text-warm-500 text-sm text-center py-4">
                  No peer recognition yet
                </p>
              ) : (
                recentAwards.slice(0, 10).map((award) => {
                  const def = getBadgeDef(award.badge_key);
                  return (
                    <div
                      key={award.id}
                      className="flex items-start gap-3"
                    >
                      <BadgeIcon
                        badgeKey={award.badge_key}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-warm-700">
                          <span className="font-medium">
                            {(award.awarder as unknown as { full_name: string })?.full_name ?? "Someone"}
                          </span>{" "}
                          awarded{" "}
                          <span className="font-medium text-ember-600">
                            {def?.name}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {award.recipient?.full_name ?? "Unknown"}
                          </span>
                        </p>
                        {award.note && (
                          <p className="text-[10px] text-warm-500 mt-0.5 italic">
                            &ldquo;{award.note}&rdquo;
                          </p>
                        )}
                        <p className="text-[10px] text-warm-400 mt-0.5">
                          {timeAgo(award.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recognize a Teammate */}
      <div className="px-8 pt-2 pb-8">
        <h2 className="text-lg font-semibold text-warm-900 mb-1 flex items-center gap-2">
          <Heart className="w-5 h-5 text-ember-500" />
          Recognize a Teammate
        </h2>
        <p className="text-sm text-warm-500 mb-4">
          Select someone to award a peer recognition badge. They&apos;ll see it on their profile and the leaderboard.
        </p>

        {/* Search */}
        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
          <input
            type="text"
            placeholder="Search teammates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-warm-300 bg-white text-sm text-warm-900 focus:border-steel-400 focus:outline-none focus:ring-2 focus:ring-steel-400/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {allProfiles
            .filter((p) => p.id !== user?.id)
            .filter(
              (p) =>
                !search.trim() ||
                p.full_name.toLowerCase().includes(search.toLowerCase()) ||
                p.plant_name.toLowerCase().includes(search.toLowerCase())
            )
            .map((profile) => {
              const entry = entries.find((e) => e.user_id === profile.id);
              return (
                <button
                  key={profile.id}
                  onClick={() => setAwardTarget(profile)}
                  className="flex items-center gap-3 p-4 rounded-xl border border-warm-200 bg-white hover:border-ember-300 hover:shadow-md hover:shadow-ember-100/50 transition-all cursor-pointer text-left group"
                >
                  <Avatar
                    name={profile.full_name}
                    src={profile.avatar_url}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-900 truncate group-hover:text-ember-700">
                      {profile.full_name}
                    </p>
                    <p className="text-xs text-warm-500 truncate">
                      {profile.plant_name}
                    </p>
                    {entry && (
                      <div className="flex items-center gap-1 mt-1">
                        {entry.badge_keys.slice(0, 3).map((k) => (
                          <BadgeIcon key={k} badgeKey={k} size="sm" />
                        ))}
                        {entry.badge_keys.length > 3 && (
                          <span className="text-[10px] text-warm-400">
                            +{entry.badge_keys.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Award className="w-5 h-5 text-warm-300 group-hover:text-ember-500 transition-colors flex-shrink-0" />
                </button>
              );
            })}
        </div>
      </div>

      {/* Award Badge Modal */}
      {awardTarget && (
        <AwardBadgeModal
          open={!!awardTarget}
          onClose={() => setAwardTarget(null)}
          targetUser={awardTarget}
          onAward={async (badgeKey, note) => {
            const result = await awardPeerBadge(
              awardTarget.id,
              badgeKey,
              note
            );
            if (!result.error) {
              await fetchBadges(user?.id);
            }
            return result;
          }}
        />
      )}
    </div>
  );
}

export default function AchievementsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
        </div>
      }
    >
      <AchievementsContent />
    </Suspense>
  );
}
