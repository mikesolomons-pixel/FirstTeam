"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  Sparkles,
  ChevronDown,
  CornerDownRight,
  Send,
  Lightbulb,
  Trophy,
  Plus,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useChallenges } from "@/hooks/use-challenges";
import { useComments } from "@/hooks/use-comments";
import { useReactions } from "@/hooks/use-reactions";
import { useChallengeIdeas } from "@/hooks/use-challenge-ideas";
import { useIdeaVote } from "@/hooks/use-idea-vote";
import { useAppStore } from "@/stores/app-store";
import { IdeaCard } from "@/components/challenges/idea-card";
import { IdeaVoteWidget } from "@/components/voting/idea-vote-widget";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  cn,
  timeAgo,
  formatDateTime,
  PRIORITY_COLORS,
  STATUS_COLORS,
  REACTION_EMOJI_MAP,
  REACTION_LABELS,
} from "@/lib/utils";
import type { Challenge, ChallengeStatus, Comment } from "@/types";

type Tab = "ideas" | "discussion" | "results";

export default function ChallengeDetailPage() {
  const params = useParams();
  const challengeId = params.id as string;

  const { user } = useAuth();
  const { challenges, loading: challengesLoading, updateChallenge } =
    useChallenges();
  const {
    comments: challengeComments,
    loading: commentsLoading,
    fetchComments: fetchChallengeComments,
    createComment: createChallengeComment,
  } = useComments();
  const {
    reactions,
    loading: reactionsLoading,
    fetchReactions,
    toggleReaction,
    getReactionCounts,
  } = useReactions();
  const { ideas, loading: ideasLoading, createIdea, deleteIdea } =
    useChallengeIdeas(challengeId);
  const { activeSession: ideaVoteSession, allSessions: ideaVoteSessions } =
    useIdeaVote(challengeId);
  const openAIPanel = useAppStore((s) => s.openAIPanel);

  // Separate comment hook for idea discussions
  const {
    comments: ideaComments,
    fetchComments: fetchIdeaComments,
    createComment: createIdeaComment,
  } = useComments();

  const [activeTab, setActiveTab] = useState<Tab>("ideas");
  const [newComment, setNewComment] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);

  // Idea form
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaBody, setIdeaBody] = useState("");
  const [ideaSubmitting, setIdeaSubmitting] = useState(false);

  // New comment for idea discussions
  const [ideaComment, setIdeaComment] = useState("");
  const [ideaReplyToId, setIdeaReplyToId] = useState<string | null>(null);

  const challenge: Challenge | undefined = useMemo(
    () => challenges.find((c) => c.id === challengeId),
    [challenges, challengeId]
  );

  useEffect(() => {
    if (challengeId) {
      fetchChallengeComments("challenge", challengeId);
      fetchReactions("challenge", challengeId);
    }
  }, [challengeId, fetchChallengeComments, fetchReactions]);

  // Fetch comments when expanding an idea
  useEffect(() => {
    if (expandedIdeaId) {
      fetchIdeaComments("idea", expandedIdeaId);
    }
  }, [expandedIdeaId, fetchIdeaComments]);

  const reactionCounts = getReactionCounts();

  const handleToggleReaction = async (emoji: string) => {
    if (!user) return;
    await toggleReaction("challenge", challengeId, emoji, user.id);
  };

  const handleStatusChange = async (newStatus: ChallengeStatus) => {
    setStatusDropdownOpen(false);
    await updateChallenge(challengeId, { status: newStatus });
  };

  const handleSubmitChallengeComment = async () => {
    if (!user || !newComment.trim()) return;
    setSubmitting(true);
    await createChallengeComment({
      parent_type: "challenge",
      parent_id: challengeId,
      body: newComment.trim(),
      reply_to_id: replyToId,
      author_id: user.id,
    });
    setNewComment("");
    setReplyToId(null);
    setSubmitting(false);
  };

  const handleSubmitIdeaComment = async () => {
    if (!user || !ideaComment.trim() || !expandedIdeaId) return;
    setSubmitting(true);
    await createIdeaComment({
      parent_type: "idea",
      parent_id: expandedIdeaId,
      body: ideaComment.trim(),
      reply_to_id: ideaReplyToId,
      author_id: user.id,
    });
    setIdeaComment("");
    setIdeaReplyToId(null);
    setSubmitting(false);
  };

  const handleSubmitIdea = async () => {
    if (!user || !ideaTitle.trim()) return;
    setIdeaSubmitting(true);
    await createIdea({
      challenge_id: challengeId,
      author_id: user.id,
      title: ideaTitle.trim(),
      body: ideaBody.trim(),
    });
    setIdeaTitle("");
    setIdeaBody("");
    setShowIdeaForm(false);
    setIdeaSubmitting(false);
  };

  const handleAskAI = () => {
    if (!challenge) return;
    openAIPanel({ type: "challenge", id: challengeId, title: challenge.title });
  };

  // Thread challenge comments
  const topLevelComments = useMemo(
    () => challengeComments.filter((c) => !c.reply_to_id),
    [challengeComments]
  );
  const repliesMap = useMemo(() => {
    const map: Record<string, Comment[]> = {};
    for (const c of challengeComments) {
      if (c.reply_to_id) {
        if (!map[c.reply_to_id]) map[c.reply_to_id] = [];
        map[c.reply_to_id].push(c);
      }
    }
    return map;
  }, [challengeComments]);

  // Thread idea comments
  const ideaTopLevel = useMemo(
    () => ideaComments.filter((c) => !c.reply_to_id),
    [ideaComments]
  );
  const ideaRepliesMap = useMemo(() => {
    const map: Record<string, Comment[]> = {};
    for (const c of ideaComments) {
      if (c.reply_to_id) {
        if (!map[c.reply_to_id]) map[c.reply_to_id] = [];
        map[c.reply_to_id].push(c);
      }
    }
    return map;
  }, [ideaComments]);

  const hasClosedIdeaVote = ideaVoteSessions.some((s) => s.status === "closed");

  if (challengesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="p-6 md:p-8 space-y-4">
        <Link href="/challenges" className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Challenges
        </Link>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-warm-800">Challenge not found</h2>
        </div>
      </div>
    );
  }

  const isAuthor = user?.id === challenge.author_id;
  const statusLabel = challenge.status.replace("_", " ");

  const renderCommentThread = (
    comment: Comment,
    replies: Record<string, Comment[]>,
    onReply: (id: string) => void,
    activeReplyId: string | null
  ) => (
    <div key={comment.id}>
      <Card>
        <CardContent className="flex items-start gap-3">
          {comment.author ? (
            <Avatar name={comment.author.full_name} src={comment.author.avatar_url} size="sm" className="flex-shrink-0 mt-0.5" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-warm-200 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-warm-900">{comment.author?.full_name ?? "Unknown"}</span>
              {comment.author?.plant_name && <Badge variant="outline" className="text-[10px]">{comment.author.plant_name}</Badge>}
              <span className="text-xs text-warm-400">{timeAgo(comment.created_at)}</span>
            </div>
            <p className="text-sm text-warm-700 mt-1 whitespace-pre-wrap">{comment.body}</p>
            <button
              className="text-xs text-steel-500 hover:text-steel-700 mt-2 flex items-center gap-1 cursor-pointer"
              onClick={() => onReply(activeReplyId === comment.id ? "" : comment.id)}
            >
              <CornerDownRight className="w-3 h-3" /> Reply
            </button>
          </div>
        </CardContent>
      </Card>
      {replies[comment.id]?.map((reply) => (
        <div key={reply.id} className="ml-8 mt-2">
          <Card className="bg-warm-50/50 border-warm-100">
            <CardContent className="flex items-start gap-3 py-3">
              {reply.author ? (
                <Avatar name={reply.author.full_name} src={reply.author.avatar_url} size="sm" className="flex-shrink-0 mt-0.5" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-warm-200 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-warm-900">{reply.author?.full_name ?? "Unknown"}</span>
                  {reply.author?.plant_name && <Badge variant="outline" className="text-[10px]">{reply.author.plant_name}</Badge>}
                  <span className="text-xs text-warm-400">{timeAgo(reply.created_at)}</span>
                </div>
                <p className="text-sm text-warm-700 mt-1 whitespace-pre-wrap">{reply.body}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto animate-fade-in-up">
      {/* Back Link */}
      <Link href="/challenges" className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Challenges
      </Link>

      {/* Challenge Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-3 flex-wrap">
          <Badge className={PRIORITY_COLORS[challenge.priority] ?? "bg-warm-100 text-warm-700"}>{challenge.priority}</Badge>
          <Badge className={STATUS_COLORS[challenge.status] ?? "bg-warm-100 text-warm-700"}>{statusLabel}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-warm-900">{challenge.title}</h1>
        <div className="flex items-center gap-3">
          {challenge.author && (
            <>
              <Avatar name={challenge.author.full_name} src={challenge.author.avatar_url} size="md" />
              <div>
                <p className="text-sm font-medium text-warm-900">{challenge.author.full_name}</p>
                <p className="text-xs text-warm-500">{challenge.author.plant_name} &middot; {formatDateTime(challenge.created_at)}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardContent>
          <p className="text-sm text-warm-700 leading-relaxed whitespace-pre-wrap">{challenge.description}</p>
        </CardContent>
        {challenge.tags?.length > 0 && (
          <CardFooter>
            <div className="flex flex-wrap gap-1.5">
              {challenge.tags.map((tag) => (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-steel-50 text-steel-600 border border-steel-200">{tag}</span>
              ))}
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {isAuthor && (
          <div className="relative">
            <Button variant="secondary" size="sm" onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}>
              Change Status <ChevronDown className="w-3.5 h-3.5" />
            </Button>
            {statusDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(false)} />
                <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-warm-200 py-1 w-40">
                  {([
                    { value: "open", label: "Open" },
                    { value: "in_progress", label: "In Progress" },
                    { value: "resolved", label: "Resolved" },
                  ] as const).map((opt) => (
                    <button key={opt.value} className={cn("w-full text-left px-3 py-2 text-sm hover:bg-warm-50 transition-colors cursor-pointer", challenge.status === opt.value ? "font-medium text-steel-600 bg-steel-50" : "text-warm-700")} onClick={() => handleStatusChange(opt.value)}>{opt.label}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        <Button variant="secondary" size="sm" onClick={handleAskAI}>
          <Sparkles className="w-4 h-4" /> Ask AI
        </Button>
      </div>

      {/* Reactions */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(REACTION_EMOJI_MAP).map(([key, emoji]) => {
          const count = reactionCounts.find((r) => r.emoji === key)?.count ?? 0;
          const myReaction = reactions.find((r) => r.emoji === key && r.user_id === user?.id);
          return (
            <button key={key} onClick={() => handleToggleReaction(key)} className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all cursor-pointer", myReaction ? "border-steel-300 bg-steel-50 text-steel-700" : "border-warm-200 bg-white text-warm-600 hover:border-warm-300 hover:bg-warm-50")} title={REACTION_LABELS[key]}>
              <span>{emoji}</span>
              {count > 0 && <span className="text-xs font-medium">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Resolution Summary */}
      {challenge.status === "resolved" && challenge.resolution_summary && (
        <Card className="border-forge-200 bg-forge-50/50">
          <CardContent>
            <h3 className="text-sm font-semibold text-forge-800 mb-2">Resolution Summary</h3>
            <p className="text-sm text-forge-700 leading-relaxed whitespace-pre-wrap">{challenge.resolution_summary}</p>
          </CardContent>
        </Card>
      )}

      {/* === MESSAGE BOARD TABS === */}
      <div className="flex gap-1 p-1 bg-warm-100 rounded-lg">
        <button
          onClick={() => setActiveTab("ideas")}
          className={cn("flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer", activeTab === "ideas" ? "bg-white text-warm-900 shadow-sm" : "text-warm-500 hover:text-warm-700")}
        >
          <Lightbulb className="w-4 h-4" />
          Ideas
          {ideas.length > 0 && <span className="text-xs text-warm-400">({ideas.length})</span>}
        </button>
        <button
          onClick={() => setActiveTab("discussion")}
          className={cn("flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer", activeTab === "discussion" ? "bg-white text-warm-900 shadow-sm" : "text-warm-500 hover:text-warm-700")}
        >
          <MessageSquare className="w-4 h-4" />
          Discussion
          {challengeComments.length > 0 && <span className="text-xs text-warm-400">({challengeComments.length})</span>}
        </button>
        {hasClosedIdeaVote && (
          <button
            onClick={() => setActiveTab("results")}
            className={cn("flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer", activeTab === "results" ? "bg-white text-warm-900 shadow-sm" : "text-warm-500 hover:text-warm-700")}
          >
            <Trophy className="w-4 h-4" />
            Results
          </button>
        )}
      </div>

      {/* IDEAS TAB */}
      {activeTab === "ideas" && (
        <div className="space-y-4">
          {/* Active idea vote */}
          {ideaVoteSession && <IdeaVoteWidget challengeId={challengeId} />}

          {/* Submit idea button */}
          {!showIdeaForm ? (
            <Button onClick={() => setShowIdeaForm(true)} variant="secondary">
              <Plus className="w-4 h-4" /> Submit an Idea
            </Button>
          ) : (
            <Card className="border-steel-200">
              <CardContent className="space-y-3">
                <h3 className="text-sm font-semibold text-warm-700">Submit an Idea</h3>
                <Input
                  label="Title"
                  placeholder="What's your idea?"
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Describe your idea in detail..."
                  rows={3}
                  value={ideaBody}
                  onChange={(e) => setIdeaBody(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setShowIdeaForm(false); setIdeaTitle(""); setIdeaBody(""); }}>Cancel</Button>
                  <Button size="sm" onClick={handleSubmitIdea} disabled={ideaSubmitting || !ideaTitle.trim()}>
                    {ideaSubmitting ? "Submitting..." : "Submit Idea"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ideas List */}
          {ideasLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-3 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
            </div>
          ) : ideas.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Lightbulb className="w-8 h-8 text-warm-200 mx-auto mb-2" />
                <p className="text-warm-500 text-sm">No ideas yet. Be the first to submit one.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {ideas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  expanded={expandedIdeaId === idea.id}
                  onToggle={() => setExpandedIdeaId(expandedIdeaId === idea.id ? null : idea.id)}
                  onDelete={user?.id === idea.author_id ? () => deleteIdea(idea.id) : undefined}
                  isAuthor={user?.id === idea.author_id}
                >
                  {/* Idea discussion thread */}
                  <div className="space-y-2">
                    {ideaTopLevel.map((comment) =>
                      renderCommentThread(comment, ideaRepliesMap, (id) => setIdeaReplyToId(id || null), ideaReplyToId)
                    )}

                    {/* Reply input for idea thread */}
                    {ideaReplyToId && (
                      <Card className="border-steel-200">
                        <CardContent className="space-y-3 py-3">
                          <Textarea placeholder="Write your reply..." rows={2} value={ideaComment} onChange={(e) => setIdeaComment(e.target.value)} />
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setIdeaReplyToId(null); setIdeaComment(""); }}>Cancel</Button>
                            <Button size="sm" onClick={handleSubmitIdeaComment} disabled={submitting || !ideaComment.trim()}>
                              {submitting ? "Sending..." : "Reply"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* New top-level comment on idea */}
                    {!ideaReplyToId && (
                      <Card className="border-warm-200">
                        <CardContent className="space-y-3 py-3">
                          <Textarea placeholder="Add to this discussion..." rows={2} value={ideaComment} onChange={(e) => setIdeaComment(e.target.value)} />
                          <div className="flex justify-end">
                            <Button size="sm" onClick={handleSubmitIdeaComment} disabled={submitting || !ideaComment.trim()}>
                              <Send className="w-3.5 h-3.5" /> Comment
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </IdeaCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DISCUSSION TAB */}
      {activeTab === "discussion" && (
        <div className="space-y-4">
          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-3 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
            </div>
          ) : topLevelComments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-warm-200 mx-auto mb-2" />
                <p className="text-warm-500 text-sm">No discussion yet. Start the conversation.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {topLevelComments.map((comment) => (
                <div key={comment.id}>
                  {renderCommentThread(comment, repliesMap, (id) => setReplyToId(id || null), replyToId)}
                  {replyToId === comment.id && (
                    <div className="ml-8 mt-2">
                      <Card className="border-steel-200">
                        <CardContent className="space-y-3 py-3">
                          <p className="text-xs text-warm-500">
                            Replying to <span className="font-medium text-warm-700">{comment.author?.full_name ?? "Unknown"}</span>
                          </p>
                          <Textarea placeholder="Write your reply..." rows={2} value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setReplyToId(null); setNewComment(""); }}>Cancel</Button>
                            <Button size="sm" onClick={handleSubmitChallengeComment} disabled={submitting || !newComment.trim()}>
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

          {/* New top-level comment */}
          {!replyToId && (
            <Card className="border-warm-200">
              <CardContent className="space-y-3">
                <Textarea placeholder="Add a comment..." rows={3} value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleSubmitChallengeComment} disabled={submitting || !newComment.trim()}>
                    <Send className="w-3.5 h-3.5" /> Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* RESULTS TAB */}
      {activeTab === "results" && (
        <div className="space-y-4">
          {ideaVoteSessions
            .filter((s) => s.status === "closed")
            .map((session) => (
              <IdeaVoteWidget
                key={session.id}
                challengeId={challengeId}
                readOnlySession={session}
              />
            ))}
        </div>
      )}
    </div>
  );
}
