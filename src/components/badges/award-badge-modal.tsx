"use client";

import { useState } from "react";
import { BadgeIcon } from "./badge-icon";
import { PEER_BADGES } from "@/lib/badges";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

interface AwardBadgeModalProps {
  open: boolean;
  onClose: () => void;
  targetUser: Profile;
  onAward: (badgeKey: string, note?: string) => Promise<{ error?: unknown }>;
}

export function AwardBadgeModal({
  open,
  onClose,
  targetUser,
  onAward,
}: AwardBadgeModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setSaving(true);
    const result = await onAward(selected, note.trim() || undefined);
    setSaving(false);
    if (!result.error) {
      setSelected(null);
      setNote("");
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Recognize ${targetUser.full_name}`}
    >
      <div className="space-y-4">
        <p className="text-sm text-warm-600">
          Choose a badge to award. They&apos;ll see it on their profile.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PEER_BADGES.map((def) => (
            <button
              key={def.key}
              onClick={() => setSelected(def.key)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer",
                selected === def.key
                  ? "border-ember-400 bg-ember-50 ring-2 ring-ember-400/20"
                  : "border-warm-200 bg-white hover:border-warm-300"
              )}
            >
              <BadgeIcon badgeKey={def.key} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-warm-900">
                  {def.name}
                </p>
                <p className="text-[10px] text-warm-500">
                  {def.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional) — why are you recognizing them?"
            className="w-full px-3 py-2 rounded-lg border border-warm-300 bg-white text-sm text-warm-900 placeholder:text-warm-400 focus:border-steel-400 focus:outline-none focus:ring-2 focus:ring-steel-400/20 resize-y min-h-[60px]"
            maxLength={280}
          />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selected || saving}
          >
            {saving ? "Awarding..." : "Award Badge"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
