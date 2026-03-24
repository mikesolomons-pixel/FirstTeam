"use client";

import { ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Idea } from "@/types";

interface StickyNoteProps {
  idea: Idea;
  onVote: (ideaId: string) => void;
  onDragStart: (e: React.MouseEvent, ideaId: string) => void;
  isDragging: boolean;
  votedByMe: boolean;
}

export function StickyNote({
  idea,
  onVote,
  onDragStart,
  isDragging,
  votedByMe,
}: StickyNoteProps) {
  return (
    <div
      className={cn(
        "absolute w-44 select-none transition-shadow",
        isDragging ? "z-50" : "z-10"
      )}
      style={{
        left: `${idea.position_x}%`,
        top: `${idea.position_y}%`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={(e) => {
        // Don't start drag from vote button
        if ((e.target as HTMLElement).closest("[data-vote-btn]")) return;
        onDragStart(e, idea.id);
      }}
    >
      {/* Cluster Label */}
      {idea.cluster_label && (
        <Badge className="mb-1 bg-steel-100 text-steel-700 text-[10px] truncate max-w-full">
          {idea.cluster_label}
        </Badge>
      )}

      {/* Sticky Note Card */}
      <div
        className={cn(
          "rounded-lg p-3 sticky-shadow",
          isDragging && "shadow-xl scale-105"
        )}
        style={{ backgroundColor: idea.color || "#FEF3C7" }}
      >
        {/* Content */}
        <p className="text-sm text-warm-900 leading-snug line-clamp-3 break-words min-h-[3rem]">
          {idea.content}
        </p>

        {/* Bottom Row */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5">
          <span className="text-[11px] text-warm-600 truncate max-w-[65%]">
            {idea.author?.full_name ?? "Unknown"}
          </span>
          <button
            data-vote-btn
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onVote(idea.id);
            }}
            className={cn(
              "inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md transition-colors cursor-pointer",
              votedByMe
                ? "text-steel-700 bg-steel-200/60"
                : "text-warm-500 hover:text-steel-600 hover:bg-white/50"
            )}
          >
            <ThumbsUp className="w-3 h-3" />
            <span className="font-medium">{idea.votes ?? 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
