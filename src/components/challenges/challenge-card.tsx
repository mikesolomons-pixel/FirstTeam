"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { truncate, timeAgo, PRIORITY_COLORS, STATUS_COLORS } from "@/lib/utils";
import type { Challenge } from "@/types";

interface ChallengeCardProps {
  challenge: Challenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const statusLabel = challenge.status.replace("_", " ");

  return (
    <Card hover className="flex flex-col h-full">
      <CardContent className="flex-1 space-y-3">
        {/* Badges Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            className={PRIORITY_COLORS[challenge.priority] ?? "bg-warm-100 text-warm-700"}
          >
            {challenge.priority}
          </Badge>
          <Badge
            className={STATUS_COLORS[challenge.status] ?? "bg-warm-100 text-warm-700"}
          >
            {statusLabel}
          </Badge>
        </div>

        {/* Title */}
        <Link
          href={`/challenges/${challenge.id}`}
          className="block text-base font-semibold text-warm-900 hover:text-steel-600 transition-colors leading-snug"
        >
          {challenge.title}
        </Link>

        {/* Description */}
        <p className="text-sm text-warm-600 leading-relaxed">
          {truncate(challenge.description, 150)}
        </p>

        {/* Tags */}
        {challenge.tags && challenge.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {challenge.tags.map((tag) => (
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
          {challenge.author ? (
            <>
              <Avatar
                name={challenge.author.full_name}
                src={challenge.author.avatar_url}
                size="sm"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-warm-800 truncate">
                  {challenge.author.full_name}
                </p>
                <p className="text-[10px] text-warm-500 truncate">
                  {challenge.author.plant_name}
                </p>
              </div>
            </>
          ) : (
            <span className="text-xs text-warm-400">Unknown author</span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-warm-400">
            {timeAgo(challenge.created_at)}
          </span>
          {typeof challenge.comment_count === "number" && (
            <span className="flex items-center gap-1 text-xs text-warm-400">
              <MessageSquare className="w-3.5 h-3.5" />
              {challenge.comment_count}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
