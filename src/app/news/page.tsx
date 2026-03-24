"use client";

import { useState, useMemo } from "react";
import {
  Newspaper,
  Plus,
  ExternalLink,
  Pin,
  FileText,
  Megaphone,
  FolderOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNews } from "@/hooks/use-news";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { truncate, timeAgo } from "@/lib/utils";
import type { NewsType, NewsItem } from "@/types";

const TYPE_BADGE_COLORS: Record<NewsType, string> = {
  article: "bg-steel-100 text-steel-800",
  announcement: "bg-ember-100 text-ember-800",
  resource: "bg-forge-100 text-forge-800",
};

const TYPE_LABELS: Record<NewsType, string> = {
  article: "Article",
  announcement: "Announcement",
  resource: "Resource",
};

const TYPE_ICONS: Record<NewsType, typeof FileText> = {
  article: FileText,
  announcement: Megaphone,
  resource: FolderOpen,
};

export default function NewsPage() {
  const { user } = useAuth();
  const { newsItems, loading, createNewsItem } = useNews();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newType, setNewType] = useState<NewsType>("article");
  const [formError, setFormError] = useState("");

  // Filter state
  const [typeFilter, setTypeFilter] = useState<"all" | NewsType>("all");

  // Split into pinned and unpinned
  const { pinnedItems, regularItems } = useMemo(() => {
    let filtered = [...newsItems];
    if (typeFilter !== "all") {
      filtered = filtered.filter((n) => n.type === typeFilter);
    }
    return {
      pinnedItems: filtered.filter((n) => n.pinned),
      regularItems: filtered.filter((n) => !n.pinned),
    };
  }, [newsItems, typeFilter]);

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

    const { error } = await createNewsItem({
      author_id: user.id,
      title: newTitle.trim(),
      url: newUrl.trim() || null,
      body: newBody.trim(),
      type: newType,
      pinned: false,
    });

    setCreating(false);

    if (error) {
      setFormError("Failed to share item. Please try again.");
      return;
    }

    setNewTitle("");
    setNewUrl("");
    setNewBody("");
    setNewType("article");
    setModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
      </div>
    );
  }

  const renderNewsCard = (item: NewsItem, isPinned: boolean = false) => {
    const TypeIcon = TYPE_ICONS[item.type] ?? FileText;
    return (
      <Card
        key={item.id}
        hover
        className={isPinned ? "bg-ember-50/50 border-ember-200" : ""}
      >
        <CardContent className="space-y-3">
          {/* Type Badge + Pinned indicator */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              className={
                TYPE_BADGE_COLORS[item.type] ?? "bg-warm-100 text-warm-700"
              }
            >
              <TypeIcon className="w-3 h-3 mr-1" />
              {TYPE_LABELS[item.type] ?? item.type}
            </Badge>
            {isPinned && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ember-600">
                <Pin className="w-3 h-3" />
                Pinned
              </span>
            )}
          </div>

          {/* Title */}
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-lg font-semibold text-warm-900 hover:text-steel-600 transition-colors leading-snug"
            >
              {item.title}
              <ExternalLink className="w-4 h-4 flex-shrink-0 text-warm-400" />
            </a>
          ) : (
            <h3 className="text-lg font-semibold text-warm-900 leading-snug">
              {item.title}
            </h3>
          )}

          {/* Body */}
          <p className="text-sm text-warm-600 leading-relaxed">
            {truncate(item.body, 200)}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {item.author ? (
              <>
                <Avatar
                  name={item.author.full_name}
                  src={item.author.avatar_url}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-warm-800 truncate">
                    {item.author.full_name}
                  </p>
                  <p className="text-[10px] text-warm-500 truncate">
                    {item.author.plant_name}
                  </p>
                </div>
              </>
            ) : (
              <span className="text-xs text-warm-400">Unknown author</span>
            )}
          </div>

          <span className="text-xs text-warm-400 flex-shrink-0">
            {timeAgo(item.created_at)}
          </span>
        </CardFooter>
      </Card>
    );
  };

  const totalItems = pinnedItems.length + regularItems.length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Newspaper className="w-5 h-5 text-ember-500" />
            <span className="text-sm font-medium text-ember-600">News &amp; Intel</span>
          </div>
          <h1 className="text-3xl font-bold text-warm-900">
            Stay sharp, stay connected
          </h1>
          <p className="text-warm-500 mt-1">
            Articles, announcements, and resources worth sharing across the team.
          </p>
        </div>
        <Button
          variant="accent"
          onClick={() => setModalOpen(true)}
          className="self-start glow-ember"
        >
          <Plus className="w-4 h-4" />
          Share Something
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          options={[
            { value: "all", label: "All Types" },
            { value: "article", label: "Articles" },
            { value: "announcement", label: "Announcements" },
            { value: "resource", label: "Resources" },
          ]}
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as "all" | NewsType)
          }
          className="sm:w-48"
        />
      </div>

      {/* Content */}
      {totalItems === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No news found"
          description={
            newsItems.length === 0
              ? "Nothing shared yet. Be the first to post an article, announcement, or useful resource."
              : "No items match the current filter. Try a different type."
          }
          action={
            newsItems.length === 0 ? (
              <Button variant="accent" onClick={() => setModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Share Something
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-6 max-w-3xl">
          {/* Pinned Announcements */}
          {pinnedItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-ember-700 uppercase tracking-wider flex items-center gap-1.5">
                <Pin className="w-4 h-4" />
                Pinned
              </h2>
              <div className="space-y-3">
                {pinnedItems.map((item) => renderNewsCard(item, true))}
              </div>
            </div>
          )}

          {/* Regular Feed */}
          {regularItems.length > 0 && (
            <div className="space-y-3">
              {pinnedItems.length > 0 && (
                <h2 className="text-sm font-semibold text-warm-500 uppercase tracking-wider">
                  Latest
                </h2>
              )}
              <div className="space-y-3">
                {regularItems.map((item) => renderNewsCard(item, false))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create News Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setFormError("");
        }}
        title="Share Something"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            id="news-title"
            placeholder="What are you sharing?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Input
            label="URL (optional)"
            id="news-url"
            placeholder="https://..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <Textarea
            label="Body"
            id="news-body"
            placeholder="Add context, a summary, or why this matters..."
            rows={5}
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
          />
          <Select
            label="Type"
            id="news-type"
            options={[
              { value: "article", label: "Article" },
              { value: "announcement", label: "Announcement" },
              { value: "resource", label: "Resource" },
            ]}
            value={newType}
            onChange={(e) => setNewType(e.target.value as NewsType)}
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
              {creating ? "Sharing..." : "Share"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
