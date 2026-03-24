"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Building2,
  CornerDownRight,
  Send,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useStories } from "@/hooks/use-stories";
import { useComments } from "@/hooks/use-comments";
import { useReactions } from "@/hooks/use-reactions";
import { useAppStore } from "@/stores/app-store";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  cn,
  timeAgo,
  formatDateTime,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  REACTION_EMOJI_MAP,
  REACTION_LABELS,
} from "@/lib/utils";
import type { Story, Comment } from "@/types";

export default function StoryDetailPage() {
  const params = useParams();
  const storyId = params.id as string;

  const { user } = useAuth();
  const { stories, loading: storiesLoading } = useStories();
  const {
    comments,
    loading: commentsLoading,
    fetchComments,
    createComment,
  } = useComments();
  const {
    reactions,
    loading: reactionsLoading,
    fetchReactions,
    toggleReaction,
    getReactionCounts,
  } = useReactions();
  const openAIPanel = useAppStore((s) => s.openAIPanel);

  const [newComment, setNewComment] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const story: Story | undefined = useMemo(
    () => stories.find((s) => s.id === storyId),
    [stories, storyId]
  );

  useEffect(() => {
    if (storyId) {
      fetchComments("story", storyId);
      fetchReactions("story", storyId);
    }
  }, [storyId, fetchComments, fetchReactions]);

  const reactionCounts = getReactionCounts();

  const handleToggleReaction = async (emoji: string) => {
    if (!user) return;
    await toggleReaction("story", storyId, emoji, user.id);
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;
    setSubmitting(true);
    await createComment({
      parent_type: "story",
      parent_id: storyId,
      body: newComment.trim(),
      reply_to_id: replyToId,
      author_id: user.id,
    });
    setNewComment("");
    setReplyToId(null);
    setSubmitting(false);
  };

  const handleAskAI = () => {
    if (!story) return;
    openAIPanel({
      type: "story",
      id: storyId,
      title: story.title,
    });
  };

  // Organize comments into threads
  const topLevelComments = useMemo(
    () => comments.filter((c) => !c.reply_to_id),
    [comments]
  );

  const repliesMap = useMemo(() => {
    const map: Record<string, Comment[]> = {};
    for (const c of comments) {
      if (c.reply_to_id) {
        if (!map[c.reply_to_id]) map[c.reply_to_id] = [];
        map[c.reply_to_id].push(c);
      }
    }
    return map;
  }, [comments]);

  if (storiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="space-y-4">
        <Link
          href="/stories"
          className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stories
        </Link>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-warm-800">
            Story not found
          </h2>
          <p className="text-warm-500 mt-2">
            This story may have been removed or you may not have access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/stories"
        className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Stories
      </Link>

      {/* Story Header */}
      <div className="space-y-4">
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
        <h1 className="text-2xl font-bold text-warm-900">{story.title}</h1>

        {/* Author Info */}
        <div className="flex items-center gap-3">
          {story.author && (
            <>
              <Avatar
                name={story.author.full_name}
                src={story.author.avatar_url}
                size="md"
              />
              <div>
                <p className="text-sm font-medium text-warm-900">
                  {story.author.full_name}
                </p>
                <p className="text-xs text-warm-500">
                  {story.author.plant_name} &middot;{" "}
                  {formatDateTime(story.created_at)}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Plant Attribution Badge */}
        <div className="flex items-center gap-1.5">
          <Badge className="bg-forge-50 text-forge-700 border border-forge-200">
            <Building2 className="w-3 h-3 mr-1" />
            From {story.plant_name}
          </Badge>
        </div>
      </div>

      {/* Full Body */}
      <Card>
        <CardContent>
          <p className="text-sm text-warm-700 leading-relaxed whitespace-pre-wrap">
            {story.body}
          </p>
        </CardContent>

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <CardFooter>
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
          </CardFooter>
        )}
      </Card>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="sm" onClick={handleAskAI}>
          <Sparkles className="w-4 h-4" />
          Ask AI to Summarize
        </Button>
      </div>

      {/* Reactions */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(REACTION_EMOJI_MAP).map(([key, emoji]) => {
          const count =
            reactionCounts.find((r) => r.emoji === key)?.count ?? 0;
          const myReaction = reactions.find(
            (r) => r.emoji === key && r.user_id === user?.id
          );
          return (
            <button
              key={key}
              onClick={() => handleToggleReaction(key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all cursor-pointer",
                myReaction
                  ? "border-steel-300 bg-steel-50 text-steel-700"
                  : "border-warm-200 bg-white text-warm-600 hover:border-warm-300 hover:bg-warm-50"
              )}
              title={REACTION_LABELS[key]}
            >
              <span>{emoji}</span>
              {count > 0 && (
                <span className="text-xs font-medium">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Comments Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-warm-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-warm-400" />
          Comments
          {comments.length > 0 && (
            <span className="text-sm font-normal text-warm-400">
              ({comments.length})
            </span>
          )}
        </h2>

        {/* Comments List */}
        {commentsLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-3 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
          </div>
        ) : topLevelComments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-warm-500 text-sm">
                No comments yet. Start the conversation.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {topLevelComments.map((comment) => (
              <div key={comment.id}>
                {/* Top-level comment */}
                <Card>
                  <CardContent className="flex items-start gap-3">
                    {comment.author ? (
                      <Avatar
                        name={comment.author.full_name}
                        src={comment.author.avatar_url}
                        size="sm"
                        className="flex-shrink-0 mt-0.5"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-warm-200 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-warm-900">
                          {comment.author?.full_name ?? "Unknown"}
                        </span>
                        {comment.author?.plant_name && (
                          <Badge variant="outline" className="text-[10px]">
                            {comment.author.plant_name}
                          </Badge>
                        )}
                        <span className="text-xs text-warm-400">
                          {timeAgo(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-warm-700 mt-1 whitespace-pre-wrap">
                        {comment.body}
                      </p>
                      <button
                        className="text-xs text-steel-500 hover:text-steel-700 mt-2 flex items-center gap-1 cursor-pointer"
                        onClick={() =>
                          setReplyToId(
                            replyToId === comment.id ? null : comment.id
                          )
                        }
                      >
                        <CornerDownRight className="w-3 h-3" />
                        Reply
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Replies */}
                {repliesMap[comment.id] &&
                  repliesMap[comment.id].length > 0 && (
                    <div className="ml-8 mt-2 space-y-2">
                      {repliesMap[comment.id].map((reply) => (
                        <Card
                          key={reply.id}
                          className="bg-warm-50/50 border-warm-100"
                        >
                          <CardContent className="flex items-start gap-3 py-3">
                            {reply.author ? (
                              <Avatar
                                name={reply.author.full_name}
                                src={reply.author.avatar_url}
                                size="sm"
                                className="flex-shrink-0 mt-0.5"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-warm-200 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-warm-900">
                                  {reply.author?.full_name ?? "Unknown"}
                                </span>
                                {reply.author?.plant_name && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px]"
                                  >
                                    {reply.author.plant_name}
                                  </Badge>
                                )}
                                <span className="text-xs text-warm-400">
                                  {timeAgo(reply.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-warm-700 mt-1 whitespace-pre-wrap">
                                {reply.body}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                {/* Reply input (inline) */}
                {replyToId === comment.id && (
                  <div className="ml-8 mt-2">
                    <Card className="border-steel-200">
                      <CardContent className="space-y-3 py-3">
                        <p className="text-xs text-warm-500">
                          Replying to{" "}
                          <span className="font-medium text-warm-700">
                            {comment.author?.full_name ?? "Unknown"}
                          </span>
                        </p>
                        <Textarea
                          placeholder="Write your reply..."
                          rows={2}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReplyToId(null);
                              setNewComment("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSubmitComment}
                            disabled={submitting || !newComment.trim()}
                          >
                            {submitting ? "Sending..." : "Reply"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* New Top-Level Comment */}
        {!replyToId && (
          <Card className="border-warm-200">
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Add a comment..."
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={submitting || !newComment.trim()}
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? "Sending..." : "Comment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
