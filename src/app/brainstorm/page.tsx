"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Lightbulb, Plus, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useBrainstorm } from "@/hooks/use-brainstorm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toast";
import { cn, timeAgo, truncate } from "@/lib/utils";
import type { BrainstormStatus } from "@/types";

export default function BrainstormPage() {
  const { user } = useAuth();
  const { sessions, loading, createSession } = useBrainstorm();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<"active" | "closed">(
    "active"
  );

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [formError, setFormError] = useState("");

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => s.status === statusFilter);
  }, [sessions, statusFilter]);

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

    const { error } = await createSession({
      author_id: user.id,
      title: newTitle.trim(),
      description: newDescription.trim(),
      status: "active" as BrainstormStatus,
    });

    setCreating(false);

    if (error) {
      setFormError("Failed to create session. Please try again.");
      return;
    }

    toast("success", "Brainstorm session created!");
    setNewTitle("");
    setNewDescription("");
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
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="w-5 h-5 text-ember-500" />
            <span className="text-sm font-medium text-ember-600">Brainstorm</span>
          </div>
          <h1 className="text-3xl font-bold text-warm-900">Think out loud, together</h1>
          <p className="text-warm-500 mt-1">
            Drop ideas, build on each other, find the signal in the noise.
          </p>
        </div>
        <Button
          variant="accent"
          onClick={() => setModalOpen(true)}
          className="self-start glow-ember"
        >
          <Plus className="w-4 h-4" />
          Start a Session
        </Button>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center gap-1 p-1 bg-warm-100 rounded-lg w-fit">
        <button
          onClick={() => setStatusFilter("active")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer",
            statusFilter === "active"
              ? "bg-white text-warm-900 shadow-sm"
              : "text-warm-500 hover:text-warm-700"
          )}
        >
          Active
        </button>
        <button
          onClick={() => setStatusFilter("closed")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer",
            statusFilter === "closed"
              ? "bg-white text-warm-900 shadow-sm"
              : "text-warm-500 hover:text-warm-700"
          )}
        >
          Closed
        </button>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <EmptyState
          icon={Zap}
          title={
            statusFilter === "active"
              ? "No active sessions"
              : "No closed sessions"
          }
          description={
            sessions.length === 0
              ? "No brainstorm sessions yet. Start one and get the ideas flowing."
              : `No ${statusFilter} sessions right now. ${statusFilter === "active" ? "Start a new one!" : "Check the active tab."}`
          }
          action={
            sessions.length === 0 ? (
              <Button variant="accent" onClick={() => setModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Start a Session
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSessions.map((session) => (
            <Link
              key={session.id}
              href={`/brainstorm/${session.id}`}
              className="block group"
            >
              <Card hover className="h-full flex flex-col">
                <CardContent className="flex-1 space-y-3">
                  {/* Status Badge */}
                  <Badge
                    className={cn(
                      session.status === "active"
                        ? "bg-forge-100 text-forge-700"
                        : "bg-warm-100 text-warm-600"
                    )}
                  >
                    {session.status === "active" ? "Active" : "Closed"}
                  </Badge>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-warm-900 group-hover:text-steel-600 transition-colors">
                    {session.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-warm-500 leading-relaxed">
                    {truncate(session.description, 140)}
                  </p>
                </CardContent>

                <CardFooter className="flex items-center justify-between">
                  {/* Author */}
                  <div className="flex items-center gap-2">
                    {session.author && (
                      <>
                        <Avatar
                          name={session.author.full_name}
                          src={session.author.avatar_url}
                          size="sm"
                        />
                        <span className="text-xs text-warm-600 truncate max-w-[120px]">
                          {session.author.full_name}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-warm-400">
                    <span className="inline-flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5" />
                      {session.idea_count ?? 0}
                    </span>
                    <span>{timeAgo(session.created_at)}</span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create Session Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setFormError("");
        }}
        title="Start a Brainstorm Session"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            id="session-title"
            placeholder="What are we brainstorming about?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Textarea
            label="Description"
            id="session-description"
            placeholder="Set the context. What problem are we solving? What's in scope?"
            rows={4}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
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
              {creating ? "Creating..." : "Start Session"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
