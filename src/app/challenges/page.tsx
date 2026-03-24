"use client";

import { useState, useMemo } from "react";
import { Target, Plus, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useChallenges } from "@/hooks/use-challenges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import type { ChallengeStatus, ChallengePriority } from "@/types";

export default function ChallengesPage() {
  const { user } = useAuth();
  const { challenges, loading, createChallenge } = useChallenges();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<ChallengePriority>("medium");
  const [newTags, setNewTags] = useState("");
  const [formError, setFormError] = useState("");

  // Filter state
  const [statusFilter, setStatusFilter] = useState<"all" | ChallengeStatus>(
    "all"
  );
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | ChallengePriority
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChallenges = useMemo(() => {
    let result = [...challenges];

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      result = result.filter((c) => c.priority === priorityFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [challenges, statusFilter, priorityFilter, searchQuery]);

  const handleCreate = async () => {
    if (!user) return;
    if (!newTitle.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!newDescription.trim()) {
      setFormError("Description is required.");
      return;
    }

    setCreating(true);
    setFormError("");

    const tags = newTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const { error } = await createChallenge({
      author_id: user.id,
      title: newTitle.trim(),
      description: newDescription.trim(),
      priority: newPriority,
      status: "open",
      tags,
    });

    setCreating(false);

    if (error) {
      setFormError("Failed to create challenge. Please try again.");
      return;
    }

    setNewTitle("");
    setNewDescription("");
    setNewPriority("medium");
    setNewTags("");
    setModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-warm-900">Challenges</h1>
          <p className="text-warm-500 mt-1">
            Tackle problems together &mdash; no plant is an island
          </p>
        </div>
        <Button
          variant="accent"
          onClick={() => setModalOpen(true)}
          className="self-start"
        >
          <Plus className="w-4 h-4" />
          Raise a Challenge
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          options={[
            { value: "all", label: "All Statuses" },
            { value: "open", label: "Open" },
            { value: "in_progress", label: "In Progress" },
            { value: "resolved", label: "Resolved" },
          ]}
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value as "all" | ChallengeStatus
            )
          }
          className="sm:w-44"
        />
        <Select
          options={[
            { value: "all", label: "All Priorities" },
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "critical", label: "Critical" },
          ]}
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(
              e.target.value as "all" | ChallengePriority
            )
          }
          className="sm:w-44"
        />
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
          <Input
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Challenge Grid */}
      {filteredChallenges.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No challenges found"
          description={
            challenges.length === 0
              ? "No challenges yet. Be the first to raise one and get the team rallying around a problem."
              : "No challenges match your current filters. Try adjusting or clearing them."
          }
          action={
            challenges.length === 0 ? (
              <Button variant="accent" onClick={() => setModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Raise a Challenge
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}

      {/* Create Challenge Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setFormError("");
        }}
        title="Raise a Challenge"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            id="challenge-title"
            placeholder="What's the challenge?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Textarea
            label="Description"
            id="challenge-description"
            placeholder="Describe the problem, context, and what you've tried so far..."
            rows={5}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <Select
            label="Priority"
            id="challenge-priority"
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "critical", label: "Critical" },
            ]}
            value={newPriority}
            onChange={(e) =>
              setNewPriority(e.target.value as ChallengePriority)
            }
          />
          <Input
            label="Tags"
            id="challenge-tags"
            placeholder="safety, logistics, quality (comma-separated)"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
          />

          {formError && (
            <p className="text-sm text-red-600">{formError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setFormError("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? "Creating..." : "Raise Challenge"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
