"use client";

import Link from "next/link";
import { MessageSquare, Building2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  truncate,
  timeAgo,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from "@/lib/utils";
import type { Story } from "@/types";

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Card hover>
      <CardContent className="space-y-3">
        {/* Category Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            className={
              CATEGORY_COLORS[story.category] ?? "bg-warm-100 text-warm-700"
            }
          >
            {CATEGORY_LABELS[story.category] ?? story.category}
          </Badge>
        </div>

        {/* Title */}
        <Link
          href={`/stories/${story.id}`}
          className="block text-lg font-semibold text-warm-900 hover:text-steel-600 transition-colors leading-snug"
        >
          {story.title}
        </Link>

        {/* Body Preview */}
        <p className="text-sm text-warm-600 leading-relaxed">
          {truncate(story.body, 200)}
        </p>

        {/* Plant Attribution */}
        <div className="flex items-center gap-1.5 text-xs text-warm-500">
          <Building2 className="w-3.5 h-3.5 text-warm-400" />
          <span>From: {story.plant_name}</span>
        </div>

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {story.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-full bg-steel-50 text-steel-600 border border-steel-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {story.author ? (
            <>
              <Avatar
                name={story.author.full_name}
                src={story.author.avatar_url}
                size="sm"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-warm-800 truncate">
                  {story.author.full_name}
                </p>
                <p className="text-[10px] text-warm-500 truncate">
                  {story.author.plant_name}
                </p>
              </div>
            </>
          ) : (
            <span className="text-xs text-warm-400">Unknown author</span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-warm-400">
            {timeAgo(story.created_at)}
          </span>
          {typeof story.comment_count === "number" && (
            <span className="flex items-center gap-1 text-xs text-warm-400">
              <MessageSquare className="w-3.5 h-3.5" />
              {story.comment_count}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
