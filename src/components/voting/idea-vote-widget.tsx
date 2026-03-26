"use client";

import { useState, useMemo } from "react";
import {
  Vote,
  ChevronUp,
  ChevronDown,
  Check,
  Trophy,
  Lightbulb,
  Flame,
} from "lucide-react";
import { useIdeaVote } from "@/hooks/use-idea-vote";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, timeAgo } from "@/lib/utils";
import type { IdeaVoteSession, IdeaVoteTally } from "@/types";

interface IdeaVoteWidgetProps {
  challengeId: string;
  readOnlySession?: IdeaVoteSession;
  readOnlyTallies?: IdeaVoteTally[];
}

export function IdeaVoteWidget({
  challengeId,
  readOnlySession,
  readOnlyTallies,
}: IdeaVoteWidgetProps) {
  const {
    activeSession,
    ideas,
    myVotes,
    tallies,
    loading,
    submitting,
    hasVoted,
    totalPointsBudget,
    submitVotes,
  } = useIdeaVote(challengeId);

  const [localVotes, setLocalVotes] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const votes = hasVoted && !Object.keys(localVotes).length ? myVotes : localVotes;
  const localPointsUsed = Object.values(votes).reduce((a, b) => a + b, 0);
  const localPointsRemaining = totalPointsBudget - localPointsUsed;

  const isReadOnly = !!readOnlySession;
  const displaySession = readOnlySession || activeSession;
  const displayTallies = readOnlyTallies || tallies;

  const maxPoints = useMemo(() => {
    if (displayTallies.length === 0) return 0;
    return Math.max(...displayTallies.map((t) => t.total_points), 1);
  }, [displayTallies]);

  if (loading || !displaySession) return null;

  const addPoint = (ideaId: string) => {
    if (localPointsRemaining <= 0) return;
    setLocalVotes((prev) => ({
      ...prev,
      [ideaId]: (prev[ideaId] || votes[ideaId] || 0) + 1,
    }));
  };

  const removePoint = (ideaId: string) => {
    const current = localVotes[ideaId] ?? votes[ideaId] ?? 0;
    if (current <= 0) return;
    setLocalVotes((prev) => ({ ...prev, [ideaId]: current - 1 }));
  };

  const handleSubmit = async () => {
    await submitVotes(votes);
    setShowResults(true);
  };

  const isEditing = Object.keys(localVotes).length > 0;
  const hasChanges = isEditing || !hasVoted;

  return (
    <Card className="relative overflow-hidden border-2 border-forge-200 bg-gradient-to-br from-forge-50/50 to-white">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-forge-400 via-forge-500 to-ember-500" />

      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forge-500 to-forge-700 flex items-center justify-center shadow-lg shadow-forge-500/20">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-warm-900 text-lg">
                {displaySession.title}
              </h3>
              <p className="text-xs text-warm-500">
                {isReadOnly && displaySession.closed_at
                  ? `Closed ${timeAgo(displaySession.closed_at)}`
                  : "Rate the ideas — which ones should we pursue?"}
              </p>
            </div>
          </div>
          <Badge
            className={
              isReadOnly
                ? "bg-warm-100 text-warm-600 border-warm-200"
                : "bg-forge-100 text-forge-700 border-forge-200 animate-pulse"
            }
          >
            {isReadOnly ? "Final Results" : "Live"}
          </Badge>
        </div>

        {/* Points Budget */}
        {!isReadOnly && (
          <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-white border border-warm-200">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-forge-500" />
              <span className="text-sm font-medium text-warm-700">
                Your points budget
              </span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPointsBudget }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-200",
                    i < (hasChanges ? Object.values(votes).reduce((a, b) => a + b, 0) : localPointsUsed)
                      ? "bg-forge-500 scale-110"
                      : "bg-warm-200"
                  )}
                />
              ))}
              <span className="text-sm font-bold text-warm-900 ml-2">
                {localPointsRemaining} left
              </span>
            </div>
          </div>
        )}

        {/* Tabs */}
        {!isReadOnly && (
          <div className="flex gap-1 mb-4 p-1 bg-warm-100 rounded-lg">
            <button
              onClick={() => setShowResults(false)}
              className={cn(
                "flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer",
                !showResults
                  ? "bg-white text-warm-900 shadow-sm"
                  : "text-warm-500 hover:text-warm-700"
              )}
            >
              <Vote className="w-3.5 h-3.5 inline mr-1.5" />
              Vote
            </button>
            <button
              onClick={() => setShowResults(true)}
              className={cn(
                "flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer",
                showResults
                  ? "bg-white text-warm-900 shadow-sm"
                  : "text-warm-500 hover:text-warm-700"
              )}
            >
              <Trophy className="w-3.5 h-3.5 inline mr-1.5" />
              Results
            </button>
          </div>
        )}

        {!isReadOnly && !showResults ? (
          <div className="space-y-2">
            {ideas.length === 0 ? (
              <p className="text-warm-500 text-sm text-center py-4">
                No ideas submitted yet.
              </p>
            ) : (
              <>
                {ideas.map((idea) => {
                  const pts = localVotes[idea.id] ?? votes[idea.id] ?? 0;
                  return (
                    <div
                      key={idea.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all",
                        pts > 0
                          ? "border-forge-300 bg-forge-50/50"
                          : "border-warm-200 bg-white hover:border-warm-300"
                      )}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          onClick={() => addPoint(idea.id)}
                          disabled={localPointsRemaining <= 0}
                          className="p-0.5 rounded hover:bg-forge-100 text-warm-400 hover:text-forge-600 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <span
                          className={cn(
                            "text-sm font-bold min-w-[1.5rem] text-center",
                            pts > 0 ? "text-forge-600" : "text-warm-400"
                          )}
                        >
                          {pts}
                        </span>
                        <button
                          onClick={() => removePoint(idea.id)}
                          disabled={pts <= 0}
                          className="p-0.5 rounded hover:bg-warm-100 text-warm-400 hover:text-warm-600 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-warm-900 truncate">
                          {idea.title}
                        </p>
                        <p className="text-[10px] text-warm-400 mt-0.5">
                          {idea.author?.full_name}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || Object.values(votes).reduce((a, b) => a + b, 0) === 0}
                  className="w-full mt-3"
                >
                  {submitting ? (
                    "Submitting..."
                  ) : hasVoted && !isEditing ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" /> Vote Recorded
                    </>
                  ) : (
                    <>
                      <Vote className="w-4 h-4 mr-1.5" />{" "}
                      {hasVoted ? "Update Vote" : "Submit Vote"}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {displayTallies.length === 0 ? (
              <p className="text-warm-500 text-sm text-center py-4">
                No votes yet — be the first!
              </p>
            ) : (
              displayTallies.map((t, i) => (
                <div
                  key={t.idea_id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white border border-warm-200"
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0",
                      i === 0 && t.total_points > 0
                        ? "bg-gradient-to-br from-amber-400 to-amber-500 text-white"
                        : i === 1 && t.total_points > 0
                        ? "bg-gradient-to-br from-warm-300 to-warm-400 text-white"
                        : "bg-warm-100 text-warm-500"
                    )}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-900 truncate">
                      {t.title}
                    </p>
                    <div className="mt-1 h-1.5 bg-warm-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-forge-400 to-forge-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${maxPoints > 0 ? (t.total_points / maxPoints) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-warm-900">{t.total_points}</p>
                    <p className="text-[10px] text-warm-500">
                      {t.voter_count} {t.voter_count === 1 ? "voter" : "voters"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
