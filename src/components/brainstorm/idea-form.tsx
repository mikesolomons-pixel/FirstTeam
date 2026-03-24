"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { STICKY_COLORS } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface IdeaFormProps {
  onSubmit: (content: string, color: string) => void;
  onCancel: () => void;
}

export function IdeaForm({ onSubmit, onCancel }: IdeaFormProps) {
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState(STICKY_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    await onSubmit(content.trim(), selectedColor);
    setSubmitting(false);
    setContent("");
    setSelectedColor(STICKY_COLORS[0]);
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="What's your idea?"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        autoFocus
      />

      {/* Color Picker */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-warm-600">Sticky Color</p>
        <div className="flex items-center gap-2">
          {STICKY_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={cn(
                "w-7 h-7 rounded-full border-2 transition-all cursor-pointer hover:scale-110",
                selectedColor === color
                  ? "border-steel-500 ring-2 ring-steel-300 scale-110"
                  : "border-warm-300"
              )}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="accent"
          size="sm"
          onClick={handleSubmit}
          disabled={submitting || !content.trim()}
        >
          {submitting ? "Adding..." : "Add Idea"}
        </Button>
      </div>
    </div>
  );
}
