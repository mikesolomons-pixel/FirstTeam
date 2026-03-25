"use client";

import { useState, useMemo } from "react";
import {
  Vote,
  ChevronUp,
  ChevronDown,
  Check,
  Trophy,
  Target,
  Flame,
} from "lucide-react";
import { useChallengeVote } from "@/hooks/use-challenge-vote";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function VoteWidget() {
  const {
    activeSession,
    challenges,
    myVotes,
    tallies,
    loading,
    submitting,
    hasVoted,
    totalPointsBudget,
    pointsUsed,
    pointsRemaining,
    submitVotes,
  } = useChallengeVote();

  const [localVotes, setLocalVotes] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  // Initialize local votes from myVotes when loaded
  const votes = hasVoted && !Object.keys(localVotes).length ? myVotes : localVotes;

  const localPointsUsed = Object.values(votes).reduce((a, b) => a + b, 0);
  const localPointsRemaining = totalPointsBudget - localPointsUsed;

  const maxPoints = useMemo(() => {
    if (tallies.length === 0) return 0;
    return Math.max(...tallies.map((t) => t.total_points), 1);
  }, [tallies]);

  if (loading || !activeSession) return null;

  const addPoint = (challengeId: string) => {
    if (localPointsRemaining <= 0) return;
    setLocalVotes((prev) => ({
      ...prev,
      [challengeId]: (prev[challengeId] || votes[challengeId] || 0) + 1,
    }));
  };

  const removePoint = (challengeId: string) => {
    const current = localVotes[challengeId] ?? votes[challengeId] ?? 0;
    if (current <= 0) return;
    setLocalVotes((prev) => ({
      ...prev,
      [challengeId]: current - 1,
    }));
  };

  const handleSubmit = async () => {
    await submitVotes(votes);
    setShowResults(true);
  };

  const isEditing = Object.keys(localVotes).length > 0;
  const hasChanges = isEditing || !hasVoted;

  return (
    <Card className="relative overflow-hidden border-2 border-ember-200 bg-gradient-to-br from-ember-50/50 to-white">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-ember-400 via-ember-500 to-forge-500" />

      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ember-500 to-forge-600 flex items-center justify-center shadow-lg shadow-ember-500/20">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-warm-900 text-lg">
                {activeSession.title}
              </h3>
              <p className="text-xs text-warm-500">
                {activeSession.description}
              </p>
            </div>
          </div>
          <Badge className="bg-ember-100 text-ember-700 border-ember-200 animate-pulse">
            Live
          </Badge>
        </div>

        {/* Points Budget */}
        <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-white border border-warm-200">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-ember-500" />
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
                  i < (hasChanges ? localPointsUsed || Object.values(votes).reduce((a, b) => a + b, 0) : pointsUsed)
                    ? "bg-ember-500 scale-110"
                    : "bg-warm-200"
                )}
              />
            ))}
            <span className="text-sm font-bold text-warm-900 ml-2">
              {hasChanges
                ? localPointsRemaining
                : pointsRemaining}{" "}
              left
            </span>
          </div>
        </div>

        {/* Tabs: Vote / Results */}
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
            <Target className="w-3.5 h-3.5 inline mr-1.5" />
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

        {!showResults ? (
          /* VOTE VIEW */
          <div className="space-y-2">
            {challenges.length === 0 ? (
              <p className="text-warm-500 text-sm text-center py-4">
                No open challenges to vote on yet.
              </p>
            ) : (
              <>
                {challenges.map((c) => {
                  const pts =
                    localVotes[c.id] ?? votes[c.id] ?? 0;
                  return (
                    <div
                      key={c.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all",
                        pts > 0
                          ? "border-ember-300 bg-ember-50/50"
                          : "border-warm-200 bg-white hover:border-warm-300"
                      )}
                    >
                      {/* Vote controls */}
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          onClick={() => addPoint(c.id)}
                          disabled={localPointsRemaining <= 0 && !(localVotes[c.id] ?? votes[c.id])}
                          className="p-0.5 rounded hover:bg-ember-100 text-warm-400 hover:text-ember-600 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <span
                          className={cn(
                            "text-sm font-bold min-w-[1.5rem] text-center",
                            pts > 0 ? "text-ember-600" : "text-warm-400"
                          )}
                        >
                          {pts}
                        </span>
                        <button
                          onClick={() => removePoint(c.id)}
                          disabled={pts <= 0}
                          className="p-0.5 rounded hover:bg-warm-100 text-warm-400 hover:text-warm-600 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Challenge info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-warm-900 truncate">
                          {c.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              c.priority === "critical" &&
                                "border-red-300 text-red-600",
                              c.priority === "high" &&
                                "border-ember-300 text-ember-600"
                            )}
                          >
                            {c.priority}
                          </Badge>
                          {c.author?.plant_name && (
                            <span className="text-[10px] text-warm-400">
                              {c.author.plant_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Button
                  onClick={handleSubmit}
                  disabled={
                    submitting ||
                    Object.values(votes).reduce((a, b) => a + b, 0) === 0
                  }
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
          /* RESULTS VIEW */
          <div className="space-y-2">
            {tallies.length === 0 ? (
              <p className="text-warm-500 text-sm text-center py-4">
                No votes yet — be the first!
              </p>
            ) : (
              tallies.map((t, i) => (
                <div
                  key={t.challenge_id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white border border-warm-200"
                >
                  {/* Rank badge */}
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0",
                      i === 0 &&
                        t.total_points > 0 &&
                        "bg-gradient-to-br from-amber-400 to-amber-500 text-white",
                      i === 1 &&
                        t.total_points > 0 &&
                        "bg-gradient-to-br from-warm-300 to-warm-400 text-white",
                      i === 2 &&
                        t.total_points > 0 &&
                        "bg-gradient-to-br from-amber-600 to-amber-700 text-white",
                      (i > 2 || t.total_points === 0) &&
                        "bg-warm-100 text-warm-500"
                    )}
                  >
                    {i + 1}
                  </div>

                  {/* Challenge name and bar */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-900 truncate">
                      {t.title}
                    </p>
                    <div className="mt-1 h-1.5 bg-warm-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-ember-400 to-ember-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            maxPoints > 0
                              ? (t.total_points / maxPoints) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-warm-900">
                      {t.total_points}
                    </p>
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
