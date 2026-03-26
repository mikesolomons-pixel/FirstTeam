"use client";

import { MessageSquare, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, timeAgo } from "@/lib/utils";
import type { ChallengeIdea } from "@/types";

interface IdeaCardProps {
  idea: ChallengeIdea;
  expanded?: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
  isAuthor?: boolean;
  children?: React.ReactNode;
}

export function IdeaCard({
  idea,
  expanded,
  onToggle,
  onDelete,
  isAuthor,
  children,
}: IdeaCardProps) {
  return (
    <div>
      <Card
        className={cn(
          "transition-all",
          expanded && "border-steel-300 shadow-sm",
          onToggle && "cursor-pointer"
        )}
      >
        <CardContent
          className="flex items-start gap-3"
          onClick={onToggle}
        >
          {/* Expand indicator */}
          <button className="mt-1 p-0.5 text-warm-400 flex-shrink-0">
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Author */}
          {idea.author && (
            <Avatar
              name={idea.author.full_name}
              src={idea.author.avatar_url}
              size="sm"
              className="flex-shrink-0 mt-0.5"
            />
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-warm-900">
                {idea.title}
              </span>
              {idea.author?.plant_name && (
                <Badge variant="outline" className="text-[10px]">
                  {idea.author.plant_name}
                </Badge>
              )}
            </div>
            {!expanded && idea.body && (
              <p className="text-xs text-warm-500 mt-0.5 line-clamp-2">
                {idea.body}
              </p>
            )}
            {expanded && idea.body && (
              <p className="text-sm text-warm-700 mt-1 whitespace-pre-wrap leading-relaxed">
                {idea.body}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[10px] text-warm-400">
                {idea.author?.full_name} · {timeAgo(idea.created_at)}
              </span>
              {(idea.comment_count ?? 0) > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-warm-400">
                  <MessageSquare className="w-3 h-3" />
                  {idea.comment_count}
                </span>
              )}
            </div>
          </div>

          {/* Delete (author only) */}
          {isAuthor && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 text-warm-300 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </CardContent>
      </Card>

      {/* Expanded content (comments thread) */}
      {expanded && children && (
        <div className="ml-8 mt-2 space-y-2">{children}</div>
      )}
    </div>
  );
}
