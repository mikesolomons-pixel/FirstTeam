"use client";

import { Suspense, useMemo } from "react";
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
  const onlineUsers = useAppStore((s) => s.onlineUsers);

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
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-steel-800 via-steel-900 to-steel-950 px-8 py-8 text-white">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
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
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-warm-900">
            Latest Activity
          </h2>
          {recentActivity.length === 0 ? (
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 pattern-grid opacity-40" />
              <CardContent className="relative text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-steel-100 to-warm-100 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-steel-400" />
                </div>
                <p className="font-semibold text-warm-800 mb-1">No activity yet</p>
                <p className="text-warm-500 text-sm max-w-sm mx-auto">
                  Be the first to raise a challenge or share a story!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <Card key={item.id} hover>
                  <CardContent className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {item.author ? (
                        <Avatar
                          name={item.author.full_name}
                          src={item.author.avatar_url}
                          size="sm"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-warm-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-warm-900">
                          {item.author?.full_name ?? "Unknown"}
                        </span>
                        {item.author?.plant_name && (
                          <Badge variant="outline" className="text-[10px]">
                            {item.author.plant_name}
                          </Badge>
                        )}
                        <span className="text-warm-400 text-xs flex items-center gap-1">
                          {activityIcon(item.type)}
                          {item.action}
                        </span>
                      </div>
                      <Link
                        href={item.link}
                        className="text-sm text-steel-600 hover:text-steel-800 hover:underline font-medium mt-0.5 block truncate"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs text-warm-400 mt-1">
                        {timeAgo(item.created_at)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Who's Here Sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-warm-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-warm-400" />
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
