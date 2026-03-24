"use client";

import { useState, useMemo } from "react";
import { BookOpen, Plus, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useStories } from "@/hooks/use-stories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { StoryCard } from "@/components/stories/story-card";
import type { StoryCategory } from "@/types";

export default function StoriesPage() {
  const { user } = useAuth();
  const { stories, loading, createStory } = useStories();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState<StoryCategory>("best_practice");
  const [newTags, setNewTags] = useState("");
  const [formError, setFormError] = useState("");

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<"all" | StoryCategory>(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStories = useMemo(() => {
    let result = [...stories];

    if (categoryFilter !== "all") {
      result = result.filter((s) => s.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.body.toLowerCase().includes(q) ||
          s.plant_name.toLowerCase().includes(q) ||
          s.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [stories, categoryFilter, searchQuery]);

  const handleCreate = async () => {
    if (!user) return;
    if (!newTitle.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!newBody.trim()) {
      setFormError("Body is required.");
      return;
    }

    setCreating(true);
    setFormError("");

    const tags = newTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const { error } = await createStory({
      author_id: user.id,
      title: newTitle.trim(),
      body: newBody.trim(),
      category: newCategory,
      tags,
      plant_name: user.plant_name,
    });

    setCreating(false);

    if (error) {
      setFormError("Failed to create story. Please try again.");
      return;
    }

    setNewTitle("");
    setNewBody("");
    setNewCategory("best_practice");
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
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-forge-500" />
            <span className="text-sm font-medium text-forge-600">Stories</span>
          </div>
          <h1 className="text-3xl font-bold text-warm-900">
            Wins, lessons &amp; best practices
          </h1>
          <p className="text-warm-500 mt-1">
            Share what works &mdash; from every plant, for every plant.
          </p>
        </div>
        <Button
          variant="accent"
          onClick={() => setModalOpen(true)}
          className="self-start glow-ember"
        >
          <Plus className="w-4 h-4" />
          Share a Story
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          options={[
            { value: "all", label: "All Categories" },
            { value: "best_practice", label: "Best Practice" },
            { value: "win", label: "Win" },
            { value: "lesson_learned", label: "Lesson Learned" },
            { value: "case_study", label: "Case Study" },
          ]}
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value as "all" | StoryCategory)
          }
          className="sm:w-48"
        />
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
          <Input
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Stories Feed */}
      {filteredStories.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No stories found"
          description={
            stories.length === 0
              ? "No stories yet. Be the first to share a win, lesson, or best practice from your plant."
              : "No stories match your current filters. Try adjusting or clearing them."
          }
          action={
            stories.length === 0 ? (
              <Button variant="accent" onClick={() => setModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Share a Story
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4 max-w-3xl">
          {filteredStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}

      {/* Create Story Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setFormError("");
        }}
        title="Share a Story"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            id="story-title"
            placeholder="Give your story a clear, descriptive title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Textarea
            label="Story"
            id="story-body"
            placeholder="Share the context, what happened, what you learned, and what others can take away..."
            rows={8}
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
          />
          <Select
            label="Category"
            id="story-category"
            options={[
              { value: "best_practice", label: "Best Practice" },
              { value: "win", label: "Win" },
              { value: "lesson_learned", label: "Lesson Learned" },
              { value: "case_study", label: "Case Study" },
            ]}
            value={newCategory}
            onChange={(e) =>
              setNewCategory(e.target.value as StoryCategory)
            }
          />
          <Input
            label="Tags"
            id="story-tags"
            placeholder="safety, efficiency, quality (comma-separated)"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
          />

          {/* Plant name auto-filled display */}
          {user && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-warm-700">
                Plant
              </label>
              <p className="text-sm text-warm-500 bg-warm-50 rounded-lg px-3 py-2 border border-warm-200">
                {user.plant_name}
              </p>
            </div>
          )}

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
              {creating ? "Sharing..." : "Share Story"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
