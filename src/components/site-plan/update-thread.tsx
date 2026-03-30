"use client";

import { useState } from "react";
import { TrendingUp, AlertTriangle, Lightbulb, Send, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, timeAgo } from "@/lib/utils";
import type { SitePlanUpdate, UpdateType } from "@/types";

const TYPE_CONFIG = {
  progress: {
    icon: TrendingUp,
    label: "Progress",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
  },
  learning: {
    icon: Lightbulb,
    label: "Learning",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  blocker: {
    icon: AlertTriangle,
    label: "Blocker",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
  },
};

interface UpdateThreadProps {
  updates: SitePlanUpdate[];
  onAdd: (body: string, type: UpdateType) => Promise<void>;
}

export function UpdateThread({ updates, onAdd }: UpdateThreadProps) {
  const [body, setBody] = useState("");
  const [type, setType] = useState<UpdateType>("progress");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true);
    await onAdd(body.trim(), type);
    setBody("");
    setShowForm(false);
    setSubmitting(false);
  };

  return (
    <div className="space-y-3">
      {updates.length === 0 && !showForm && (
        <p className="text-sm text-warm-400 text-center py-2">
          No updates yet — be the first to share progress or a learning.
        </p>
      )}

      {updates.map((update) => {
        const config = TYPE_CONFIG[update.update_type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.progress;
        const Icon = config.icon;
        return (
          <div
            key={update.id}
            className={cn("p-3 rounded-lg border", config.bg, config.border)}
          >
            <div className="flex items-start gap-2">
              {update.author && (
                <Avatar
                  name={update.author.full_name}
                  src={update.author.avatar_url}
                  size="sm"
                  className="flex-shrink-0 mt-0.5"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-warm-900">
                    {update.author?.full_name ?? "Unknown"}
                  </span>
                  <Badge className={cn("text-[9px]", config.badge)}>
                    <Icon className="w-2.5 h-2.5 mr-0.5" />
                    {config.label}
                  </Badge>
                  <span className="text-[10px] text-warm-400">
                    {timeAgo(update.created_at)}
                  </span>
                </div>
                <p className="text-sm text-warm-700 mt-1 leading-relaxed">
                  {update.body}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {!showForm ? (
        <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
          <MessageCircle className="w-4 h-4" />
          Add Update
        </Button>
      ) : (
        <div className="p-4 rounded-lg border border-warm-200 bg-white space-y-3">
          <div className="flex gap-1 p-1 bg-warm-100 rounded-lg w-fit">
            {(["progress", "learning", "blocker"] as const).map((t) => {
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
              type === "progress"
                ? "What progress has been made?"
                : type === "learning"
                ? "What have you learned?"
                : "What's blocking progress?"
            }
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setBody(""); }}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={submitting || !body.trim()}>
              <Send className="w-3.5 h-3.5" />
              {submitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
