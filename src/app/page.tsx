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

  const isLoading =
    authLoading || challengesLoading || storiesLoading || newsLoading;

  if (isLoading) {
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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-warm-900">The Floor</h1>
        <p className="text-warm-500 mt-1">
          What&apos;s happening across the team
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/challenges">
          <Card
            hover
            className="group cursor-pointer hover:border-ember-300 transition-all"
          >
            <CardContent className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warm-100 group-hover:bg-ember-100 flex items-center justify-center transition-colors">
                <Target className="w-5 h-5 text-warm-500 group-hover:text-ember-600 transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-warm-900 text-sm">
                  Raise a Challenge
                </p>
                <p className="text-xs text-warm-500">
                  Flag a problem to tackle together
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/stories">
          <Card
            hover
            className="group cursor-pointer hover:border-ember-300 transition-all"
          >
            <CardContent className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warm-100 group-hover:bg-ember-100 flex items-center justify-center transition-colors">
                <Trophy className="w-5 h-5 text-warm-500 group-hover:text-ember-600 transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-warm-900 text-sm">
                  Share a Win
                </p>
                <p className="text-xs text-warm-500">
                  Celebrate a success story
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/brainstorm">
          <Card
            hover
            className="group cursor-pointer hover:border-ember-300 transition-all"
          >
            <CardContent className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warm-100 group-hover:bg-ember-100 flex items-center justify-center transition-colors">
                <Lightbulb className="w-5 h-5 text-warm-500 group-hover:text-ember-600 transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-warm-900 text-sm">
                  Drop an Idea
                </p>
                <p className="text-xs text-warm-500">
                  Start or join a brainstorm
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-steel-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-steel-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warm-900">
                {openChallengesCount}
              </p>
              <p className="text-xs text-warm-500">Open Challenges</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-forge-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-forge-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warm-900">
                {storiesThisMonth}
              </p>
              <p className="text-xs text-warm-500">Stories This Month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-ember-100 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-ember-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warm-900">
                {activeBrainstorms}
              </p>
              <p className="text-xs text-warm-500">Active Brainstorms</p>
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
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-warm-500 text-sm">
                  No activity yet. Be the first to raise a challenge or share a
                  story!
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
