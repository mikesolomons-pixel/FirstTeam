"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, MessageCircle, Send } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, timeAgo } from "@/lib/utils";
import type { BenchmarkComment, BenchmarkCommentType } from "@/types";

interface CommentaryThreadProps {
  comments: BenchmarkComment[];
  onAdd: (body: string, type: BenchmarkCommentType) => Promise<void>;
}

const TYPE_CONFIG = {
  uplift: {
    icon: TrendingUp,
    label: "Uplift",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
  },
  downlift: {
    icon: TrendingDown,
    label: "Downlift",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
  },
  general: {
    icon: MessageCircle,
    label: "General",
    bg: "bg-warm-50",
    border: "border-warm-200",
    text: "text-warm-700",
    badge: "bg-warm-100 text-warm-600",
  },
};

export function CommentaryThread({ comments, onAdd }: CommentaryThreadProps) {
  const [body, setBody] = useState("");
  const [type, setType] = useState<BenchmarkCommentType>("general");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const uplifts = comments.filter((c) => c.comment_type === "uplift");
  const downlifts = comments.filter((c) => c.comment_type === "downlift");
  const general = comments.filter((c) => c.comment_type === "general");

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true);
    await onAdd(body.trim(), type);
    setBody("");
    setShowForm(false);
    setSubmitting(false);
  };

  const renderComment = (comment: BenchmarkComment) => {
    const config = TYPE_CONFIG[comment.comment_type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.general;
    return (
      <div
        key={comment.id}
        className={cn("p-3 rounded-lg border", config.bg, config.border)}
      >
        <div className="flex items-start gap-2">
          {comment.author && (
            <Avatar
              name={comment.author.full_name}
              src={comment.author.avatar_url}
              size="sm"
              className="flex-shrink-0 mt-0.5"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-warm-900">
                {comment.author?.full_name ?? "Unknown"}
              </span>
              <Badge className={cn("text-[9px]", config.badge)}>
                {comment.plant_name}
              </Badge>
              <span className="text-[10px] text-warm-400">
                {timeAgo(comment.created_at)}
              </span>
            </div>
            <p className="text-sm text-warm-700 mt-1 leading-relaxed">
              {comment.body}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Two-column layout: uplifts vs downlifts */}
      {(uplifts.length > 0 || downlifts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Uplifts */}
          <div>
            <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              What&apos;s working ({uplifts.length})
            </h4>
            <div className="space-y-2">
              {uplifts.map(renderComment)}
              {uplifts.length === 0 && (
                <p className="text-xs text-warm-400 italic">No uplift factors shared yet</p>
              )}
            </div>
          </div>

          {/* Downlifts */}
          <div>
            <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              What&apos;s hurting ({downlifts.length})
            </h4>
            <div className="space-y-2">
              {downlifts.map(renderComment)}
              {downlifts.length === 0 && (
                <p className="text-xs text-warm-400 italic">No downlift factors shared yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* General comments */}
      {general.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-warm-500 uppercase tracking-wider mb-2">
            General Commentary
          </h4>
          <div className="space-y-2">{general.map(renderComment)}</div>
        </div>
      )}

      {/* Add commentary */}
      {!showForm ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowForm(true)}
        >
          <MessageCircle className="w-4 h-4" />
          Add Commentary
        </Button>
      ) : (
        <div className="p-4 rounded-lg border border-warm-200 bg-white space-y-3">
          <div className="flex gap-1 p-1 bg-warm-100 rounded-lg w-fit">
            {(["uplift", "downlift", "general"] as const).map((t) => {
              const config = TYPE_CONFIG[t];
              const Icon = config.icon;
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                    type === t
                      ? "bg-white text-warm-900 shadow-sm"
                      : "text-warm-500 hover:text-warm-700"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {config.label}
                </button>
              );
            })}
          </div>
          <Textarea
            placeholder={
              type === "uplift"
                ? "What's driving good performance?"
                : type === "downlift"
                ? "What's hurting performance?"
                : "Share your insight..."
            }
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setBody("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || !body.trim()}
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
