"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Lightbulb,
  MessageSquare,
  Sparkles,
  LayoutGrid,
  List,
  Plus,
  CornerDownRight,
  Send,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useBrainstorm } from "@/hooks/use-brainstorm";
import { useComments } from "@/hooks/use-comments";
import { useAppStore } from "@/stores/app-store";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toast";
import { StickyNote } from "@/components/brainstorm/sticky-note";
import { IdeaForm } from "@/components/brainstorm/idea-form";
import { cn, timeAgo, formatDateTime, STICKY_COLORS } from "@/lib/utils";
import type { BrainstormSession, Comment } from "@/types";

export default function BrainstormDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const { user } = useAuth();
  const {
    sessions,
    ideas,
    loading: brainstormLoading,
    fetchIdeas,
    createIdea,
    updateIdea,
    voteIdea,
    unvoteIdea,
  } = useBrainstorm();
  const {
    comments,
    loading: commentsLoading,
    fetchComments,
    createComment,
  } = useComments();
  const openAIPanel = useAppStore((s) => s.openAIPanel);

  // View toggle: "board" | "threads"
  const [view, setView] = useState<"board" | "threads">("board");

  // Idea form modal
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);

  // Drag state
  const [dragId, setDragId] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [startPosX, setStartPosX] = useState(0);
  const [startPosY, setStartPosY] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);

  // Comment state
  const [newComment, setNewComment] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const session: BrainstormSession | undefined = useMemo(
    () => sessions.find((s) => s.id === sessionId),
    [sessions, sessionId]
  );

  useEffect(() => {
    if (sessionId) {
      fetchIdeas(sessionId);
      fetchComments("brainstorm", sessionId);
    }
  }, [sessionId, fetchIdeas, fetchComments]);

  // ---- Drag Handlers ----
  const handleDragStart = useCallback(
    (e: React.MouseEvent, ideaId: string) => {
      e.preventDefault();
      const idea = ideas.find((i) => i.id === ideaId);
      if (!idea) return;

      setDragId(ideaId);
      setStartX(e.clientX);
      setStartY(e.clientY);
      setStartPosX(idea.position_x);
      setStartPosY(idea.position_y);
    },
    [ideas]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragId || !boardRef.current) return;

      const board = boardRef.current;
      const rect = board.getBoundingClientRect();
      const boardWidth = rect.width;
      const boardHeight = rect.height;

      // Convert pixel delta to percentage
      const deltaXPercent = ((e.clientX - startX) / boardWidth) * 100;
      const deltaYPercent = ((e.clientY - startY) / boardHeight) * 100;

      let newX = startPosX + deltaXPercent;
      let newY = startPosY + deltaYPercent;

      // Clamp to 0-90 range
      newX = Math.max(0, Math.min(90, newX));
      newY = Math.max(0, Math.min(90, newY));

      // Optimistically update local position during drag
      // We do this by directly updating the idea in state via updateIdea style
      // But we don't save to server until mouse up
      const el = board.querySelector(
        `[data-idea-id="${dragId}"]`
      ) as HTMLElement | null;
      if (el) {
        el.style.left = `${newX}%`;
        el.style.top = `${newY}%`;
      }
    },
    [dragId, startX, startY, startPosX, startPosY]
  );

  const handleMouseUp = useCallback(
    async (e: MouseEvent) => {
      if (!dragId || !boardRef.current) return;

      const board = boardRef.current;
      const rect = board.getBoundingClientRect();
      const boardWidth = rect.width;
      const boardHeight = rect.height;

      const deltaXPercent = ((e.clientX - startX) / boardWidth) * 100;
      const deltaYPercent = ((e.clientY - startY) / boardHeight) * 100;

      let newX = startPosX + deltaXPercent;
      let newY = startPosY + deltaYPercent;

      newX = Math.max(0, Math.min(90, newX));
      newY = Math.max(0, Math.min(90, newY));

      // Only save if position actually changed
      if (
        Math.abs(newX - startPosX) > 0.5 ||
        Math.abs(newY - startPosY) > 0.5
      ) {
        await updateIdea(dragId, {
          position_x: Math.round(newX * 10) / 10,
          position_y: Math.round(newY * 10) / 10,
        });
      }

      setDragId(null);
    },
    [dragId, startX, startY, startPosX, startPosY, updateIdea]
  );

  useEffect(() => {
    if (dragId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragId, handleMouseMove, handleMouseUp]);

  // ---- Vote Handler ----
  const handleVote = useCallback(
    async (ideaId: string) => {
      if (!user) return;
      const idea = ideas.find((i) => i.id === ideaId);
      if (!idea) return;

      if (idea.voted_by_me) {
        await unvoteIdea(ideaId, user.id);
      } else {
        await voteIdea(ideaId, user.id);
      }
    },
    [user, ideas, voteIdea, unvoteIdea]
  );

  // ---- Add Idea Handler ----
  const handleAddIdea = useCallback(
    async (content: string, color: string) => {
      if (!user) return;
      const posX = 10 + Math.random() * 60;
      const posY = 10 + Math.random() * 60;

      const { error } = await createIdea({
        session_id: sessionId,
        author_id: user.id,
        content,
        color,
        position_x: Math.round(posX * 10) / 10,
        position_y: Math.round(posY * 10) / 10,
        votes: 0,
      });

      if (error) {
        toast("error", "Failed to add idea.");
      } else {
        toast("success", "Idea added!");
        setIdeaModalOpen(false);
      }
    },
    [user, sessionId, createIdea]
  );

  // ---- Comment Handlers ----
  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;
    setSubmitting(true);
    await createComment({
      parent_type: "brainstorm",
      parent_id: sessionId,
      body: newComment.trim(),
      reply_to_id: replyToId,
      author_id: user.id,
    });
    setNewComment("");
    setReplyToId(null);
    setSubmitting(false);
  };

  const handleAskAI = () => {
    if (!session) return;
    openAIPanel({
      type: "brainstorm",
      id: sessionId,
      title: session.title,
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

  // ---- Loading ----
  if (brainstormLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-4">
        <Link
          href="/brainstorm"
          className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Brainstorm
        </Link>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-warm-800">
            Session not found
          </h2>
          <p className="text-warm-500 mt-2">
            This brainstorm session may have been removed or you may not have
            access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/brainstorm"
        className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Brainstorm
      </Link>

      {/* Session Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            className={cn(
              session.status === "active"
                ? "bg-forge-100 text-forge-700"
                : "bg-warm-100 text-warm-600"
            )}
          >
            {session.status === "active" ? "Active" : "Closed"}
          </Badge>
        </div>

        <h1 className="text-2xl font-bold text-warm-900">{session.title}</h1>
        <p className="text-sm text-warm-600 leading-relaxed">
          {session.description}
        </p>

        {/* Author Info */}
        {session.author && (
          <div className="flex items-center gap-2">
            <Avatar
              name={session.author.full_name}
              src={session.author.avatar_url}
              size="sm"
            />
            <div>
              <span className="text-sm font-medium text-warm-900">
                {session.author.full_name}
              </span>
              <span className="text-xs text-warm-400 ml-2">
                {formatDateTime(session.created_at)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar: View Toggle + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-warm-100 rounded-lg w-fit">
          <button
            onClick={() => setView("board")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer",
              view === "board"
                ? "bg-white text-warm-900 shadow-sm"
                : "text-warm-500 hover:text-warm-700"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Board
          </button>
          <button
            onClick={() => setView("threads")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer",
              view === "threads"
                ? "bg-white text-warm-900 shadow-sm"
                : "text-warm-500 hover:text-warm-700"
            )}
          >
            <List className="w-3.5 h-3.5" />
            Threads
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAskAI}
          >
            <Sparkles className="w-4 h-4" />
            Ask AI
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => setIdeaModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Idea
          </Button>
        </div>
      </div>

      {/* ======================== Board View ======================== */}
      {view === "board" && (
        <div
          ref={boardRef}
          className="relative min-h-[600px] rounded-xl bg-warm-100 overflow-hidden"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          {ideas.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <EmptyState
                icon={Lightbulb}
                title="No ideas yet"
                description="Be the first to drop an idea on the board."
                action={
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => setIdeaModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Add Idea
                  </Button>
                }
              />
            </div>
          ) : (
            ideas.map((idea) => (
              <div key={idea.id} data-idea-id={idea.id}>
                <StickyNote
                  idea={idea}
                  onVote={handleVote}
                  onDragStart={handleDragStart}
                  isDragging={dragId === idea.id}
                  votedByMe={idea.voted_by_me ?? false}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* ======================== Threads View ======================== */}
      {view === "threads" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-warm-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-warm-400" />
            Discussion
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
      )}

      {/* Add Idea Modal */}
      <Modal
        open={ideaModalOpen}
        onClose={() => setIdeaModalOpen(false)}
        title="Add an Idea"
        size="sm"
      >
        <IdeaForm
          onSubmit={handleAddIdea}
          onCancel={() => setIdeaModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
