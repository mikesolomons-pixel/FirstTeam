"use client";

import { Suspense, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Target,
  Trophy,
  Lightbulb,
  BookOpen,
  MessageSquare,
  Newspaper,
  Users,
  ArrowRight,
  Zap,
  Award,
  TrendingUp,
  Flame,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePresence } from "@/hooks/use-presence";
import { useChallenges } from "@/hooks/use-challenges";
import { useStories } from "@/hooks/use-stories";
import { useNews } from "@/hooks/use-news";
import { useBrainstorm } from "@/hooks/use-brainstorm";
import { useAppStore } from "@/stores/app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { VoteWidget } from "@/components/voting/vote-widget";
import { useChallengeVote } from "@/hooks/use-challenge-vote";
import { useBadges } from "@/hooks/use-badges";
import { BadgeRow } from "@/components/badges/badge-row";
import { cn, timeAgo } from "@/lib/utils";
import type { Profile } from "@/types";

interface ActivityItem {
  id: string;
  type: "challenge" | "story" | "news";
  title: string;
  link: string;
  author: Profile | undefined;
  created_at: string;
  action: string;
}

function DashboardContent() {
  const { user, loading: authLoading } = useAuth();
  usePresence("dashboard");
  const { challenges, loading: challengesLoading } = useChallenges();
  const { stories, loading: storiesLoading } = useStories();
  const { newsItems, loading: newsLoading } = useNews();
  const { sessions } = useBrainstorm();
  const { badges: myBadges, checkAndGrantActivityBadges } = useBadges(user?.id);
  const { activeSession, floorSession, floorTallies } = useChallengeVote();
  const onlineUsers = useAppStore((s) => s.onlineUsers);

  // Auto-earn activity badges on dashboard load
  useEffect(() => {
    if (user && !authLoading) {
      checkAndGrantActivityBadges();
    }
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const openChallengesCount = challenges.filter(
    (c) => c.status === "open"
  ).length;

  const storiesThisMonth = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return stories.filter(
      (s) => new Date(s.created_at) >= startOfMonth
    ).length;
  }, [stories]);

  const activeBrainstorms = sessions.filter(
    (s) => s.status === "active"
  ).length;

  const recentActivity = useMemo(() => {
    const items: ActivityItem[] = [];

    for (const c of challenges) {
      items.push({
        id: `challenge-${c.id}`,
        type: "challenge",
        title: c.title,
        link: `/challenges/${c.id}`,
        author: c.author,
        created_at: c.created_at,
        action: "raised a challenge",
      });
    }

    for (const s of stories) {
      items.push({
        id: `story-${s.id}`,
        type: "story",
        title: s.title,
        link: `/stories/${s.id}`,
        author: s.author,
        created_at: s.created_at,
        action: "shared a story",
      });
    }

    for (const n of newsItems) {
      items.push({
        id: `news-${n.id}`,
        type: "news",
        title: n.title,
        link: `/news/${n.id}`,
        author: n.author,
        created_at: n.created_at,
        action: "posted news",
      });
    }

    items.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return items.slice(0, 10);
  }, [challenges, stories, newsItems]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
      </div>
    );
  }

  const activityIcon = (type: string) => {
    switch (type) {
      case "challenge":
        return <Target className="w-4 h-4 text-steel-500" />;
      case "story":
        return <Trophy className="w-4 h-4 text-forge-500" />;
      case "news":
        return <Newspaper className="w-4 h-4 text-ember-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-warm-400" />;
    }
  };

  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="animate-fade-in-up">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-steel-800 via-steel-900 to-steel-950 px-8 py-8 text-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-ember-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-steel-400/10 rounded-full blur-3xl translate-y-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-ember-400" />
            <span className="text-sm text-steel-300 font-medium">The Floor</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-steel-300 mt-2 max-w-lg">
            Here&apos;s what&apos;s happening across the team today. Jump in, raise a challenge, or celebrate a win.
          </p>
        </div>
      </div>

      {/* Mission Banner */}
      <div className="mx-8 mt-6 rounded-xl bg-gradient-to-r from-ember-500/10 via-forge-500/10 to-steel-500/10 border border-warm-200 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-ember-600 mb-1">Our Mission</p>
        <h2 className="text-lg font-bold text-warm-900 leading-snug">
          Zero harm. 90%+ OEE across every plant. Best-in-class delivery. One team driving world-class manufacturing — together.
        </h2>
        <div className="flex flex-wrap gap-3 mt-3">
          {[
            { label: "Zero Recordable Injuries", color: "bg-emerald-100 text-emerald-700" },
            { label: "90% OEE", color: "bg-steel-100 text-steel-700" },
            { label: "97% On-Time Delivery", color: "bg-forge-100 text-forge-700" },
            { label: "<5% Forecast Variance", color: "bg-ember-100 text-ember-700" },
            { label: "98% First Pass Yield", color: "bg-steel-100 text-steel-700" },
          ].map((t) => (
            <span key={t.label} className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${t.color}`}>
              {t.label}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-8 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <Link href="/challenges">
          <Card
            hover
            className="group cursor-pointer border-transparent bg-gradient-to-br from-white to-steel-50 hover:shadow-lg hover:shadow-steel-200/50 transition-all duration-200"
          >
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-steel-500 to-steel-700 flex items-center justify-center shadow-lg shadow-steel-500/20 group-hover:scale-105 transition-transform duration-200">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-warm-900">
                  Raise a Challenge
                </p>
                <p className="text-xs text-warm-500">
                  Flag a problem to tackle together
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-warm-300 ml-auto group-hover:text-steel-500 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/stories">
          <Card
            hover
            className="group cursor-pointer border-transparent bg-gradient-to-br from-white to-forge-50 hover:shadow-lg hover:shadow-forge-200/50 transition-all duration-200"
          >
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forge-500 to-forge-700 flex items-center justify-center shadow-lg shadow-forge-500/20 group-hover:scale-105 transition-transform duration-200">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-warm-900">
                  Share a Win
                </p>
                <p className="text-xs text-warm-500">
                  Celebrate a success story
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-warm-300 ml-auto group-hover:text-forge-500 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/brainstorm">
          <Card
            hover
            className="group cursor-pointer border-transparent bg-gradient-to-br from-white to-ember-50 hover:shadow-lg hover:shadow-ember-200/50 transition-all duration-200"
          >
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ember-500 to-ember-700 flex items-center justify-center shadow-lg shadow-ember-500/20 group-hover:scale-105 transition-transform duration-200">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-warm-900">
                  Drop an Idea
                </p>
                <p className="text-xs text-warm-500">
                  Start or join a brainstorm
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-warm-300 ml-auto group-hover:text-ember-500 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="px-8 pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-steel-400 to-steel-600" />
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="w-12 h-12 rounded-xl bg-steel-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-steel-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-warm-900">
                {openChallengesCount}
              </p>
              <p className="text-xs text-warm-500 font-medium">Open Challenges</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-forge-400 to-forge-600" />
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="w-12 h-12 rounded-xl bg-forge-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-forge-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-warm-900">
                {storiesThisMonth}
              </p>
              <p className="text-xs text-warm-500 font-medium">Stories This Month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ember-400 to-ember-600" />
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="w-12 h-12 rounded-xl bg-ember-100 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-ember-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-warm-900">
                {activeBrainstorms}
              </p>
              <p className="text-xs text-warm-500 font-medium">Active Brainstorms</p>
            </div>
          </CardContent>
        </Card>

        <Link href="/achievements">
          <Card className="relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
            <CardContent className="flex items-center gap-4 pt-5">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-warm-900">
                  {new Set(myBadges.map((b) => b.badge_key)).size}
                </p>
                <p className="text-xs text-warm-500 font-medium">Badges Earned</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Vote Widget — active vote OR floor-visible closed results */}
      <div className="px-8 pt-6">
        {activeSession ? (
          <VoteWidget />
        ) : floorSession ? (
          <VoteWidget readOnlySession={floorSession} readOnlyTallies={floorTallies} />
        ) : null}
      </div>

      {/* Most Active Section */}
      <div className="px-8 pt-6">
        <h2 className="text-lg font-semibold text-warm-900 flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-ember-500" />
          Most Active
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Top Challenges */}
          {challenges
            .filter((c) => c.status === "open")
            .sort((a, b) => (b.comment_count ?? 0) - (a.comment_count ?? 0))
            .slice(0, 2)
            .map((c) => (
              <Link key={c.id} href={`/challenges`}>
                <Card hover className="group cursor-pointer h-full border-l-4 border-l-steel-500">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Target className="w-3.5 h-3.5 text-steel-500" />
                      <span className="text-[10px] font-medium text-steel-500 uppercase tracking-wide">Challenge</span>
                    </div>
                    <p className="text-sm font-medium text-warm-900 line-clamp-2 group-hover:text-steel-600 transition-colors">
                      {c.title}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      {c.author && (
                        <span className="text-[10px] text-warm-500">{c.author.full_name}</span>
                      )}
                      {(c.comment_count ?? 0) > 0 && (
                        <span className="text-[10px] text-warm-400 flex items-center gap-0.5">
                          <MessageSquare className="w-3 h-3" />
                          {c.comment_count}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

          {/* Top Stories */}
          {stories
            .sort((a, b) => (b.comment_count ?? 0) - (a.comment_count ?? 0))
            .slice(0, 2)
            .map((s) => (
              <Link key={s.id} href={`/stories`}>
                <Card hover className="group cursor-pointer h-full border-l-4 border-l-forge-500">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-forge-500" />
                      <span className="text-[10px] font-medium text-forge-500 uppercase tracking-wide">Story</span>
                    </div>
                    <p className="text-sm font-medium text-warm-900 line-clamp-2 group-hover:text-forge-600 transition-colors">
                      {s.title}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      {s.author && (
                        <span className="text-[10px] text-warm-500">{s.author.full_name}</span>
                      )}
                      {(s.comment_count ?? 0) > 0 && (
                        <span className="text-[10px] text-warm-400 flex items-center gap-0.5">
                          <MessageSquare className="w-3 h-3" />
                          {s.comment_count}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

          {/* Top News */}
          {newsItems
            .slice(0, 2)
            .map((n) => (
              <Link key={n.id} href={n.url || "/news"} target={n.url ? "_blank" : undefined}>
                <Card hover className="group cursor-pointer h-full border-l-4 border-l-ember-500">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Newspaper className="w-3.5 h-3.5 text-ember-500" />
                      <span className="text-[10px] font-medium text-ember-500 uppercase tracking-wide">News</span>
                    </div>
                    <p className="text-sm font-medium text-warm-900 line-clamp-2 group-hover:text-ember-600 transition-colors">
                      {n.title}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      {n.author && (
                        <span className="text-[10px] text-warm-500">{n.author.full_name}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-8 pt-6 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Activity Feed — Compact */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-warm-500 uppercase tracking-wider">
            Latest Activity
          </h2>
          {recentActivity.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Zap className="w-8 h-8 text-warm-200 mx-auto mb-2" />
                <p className="text-warm-500 text-sm">No activity yet</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <div className="divide-y divide-warm-100">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-warm-50/50 transition-colors">
                    <div className="flex-shrink-0">
                      {activityIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-warm-700 truncate">
                          {item.author?.full_name ?? "Unknown"}
                        </span>
                        <span className="text-[10px] text-warm-400">
                          {item.action}
                        </span>
                      </div>
                      <Link
                        href={item.link}
                        className="text-xs text-steel-600 hover:text-steel-800 hover:underline truncate block"
                      >
                        {item.title}
                      </Link>
                    </div>
                    <span className="text-[10px] text-warm-400 flex-shrink-0 whitespace-nowrap">
                      {timeAgo(item.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Who's Here Sidebar */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-warm-500 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4" />
            Who&apos;s Here
          </h2>
          <Card>
            <CardContent className="space-y-3">
              {onlineUsers.length === 0 ? (
                <p className="text-warm-500 text-sm text-center py-4">
                  No one else online right now
                </p>
              ) : (
                onlineUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <Avatar
                      name={u.full_name}
                      src={u.avatar_url}
                      size="sm"
                      showPresence
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-warm-900 truncate">
                        {u.full_name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-warm-500">
                          {u.plant_name}
                        </span>
                        {u.current_page && (
                          <>
                            <span className="text-warm-300 text-xs">
                              &middot;
                            </span>
                            <span className="text-xs text-warm-400">
                              {u.current_page}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
