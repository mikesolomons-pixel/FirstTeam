"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Truck,
  DollarSign,
  Users,
  TrendingUp,
  Target,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { CATEGORY_MAP, STATUS_CONFIG } from "@/lib/plan-categories";
import { UpdateThread } from "./update-thread";
import { cn, timeAgo } from "@/lib/utils";
import type { SitePlanGoal, SitePlanUpdate, UpdateType } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck,
  CheckCircle,
  Truck,
  DollarSign,
  Users,
  TrendingUp,
};

interface GoalCardProps {
  goal: SitePlanGoal;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onFetchUpdates: (goalId: string) => Promise<SitePlanUpdate[]>;
  onAddUpdate: (update: { goal_id: string; author_id: string; body: string; update_type: UpdateType }) => Promise<SitePlanUpdate | null>;
  userId?: string;
  showPlant?: boolean;
}

export function GoalCard({
  goal,
  isOwner,
  onEdit,
  onDelete,
  onFetchUpdates,
  onAddUpdate,
  userId,
  showPlant = false,
}: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [updates, setUpdates] = useState<SitePlanUpdate[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);

  const cat = CATEGORY_MAP[goal.category];
  const status = STATUS_CONFIG[goal.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.on_track;
  const Icon = ICON_MAP[cat?.icon ?? "Target"] || Target;

  useEffect(() => {
    if (expanded && updates.length === 0) {
      setLoadingUpdates(true);
      onFetchUpdates(goal.id).then((data) => {
        setUpdates(data);
        setLoadingUpdates(false);
      });
    }
  }, [expanded]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddUpdate = async (body: string, type: UpdateType) => {
    if (!userId) return;
    const result = await onAddUpdate({
      goal_id: goal.id,
      author_id: userId,
      body,
      update_type: type,
    });
    if (result) {
      setUpdates((prev) => [result, ...prev]);
    }
  };

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left cursor-pointer"
      >
        <CardContent className="flex items-start gap-4">
          {/* Category icon */}
          <div
            className={cn(
              "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg flex-shrink-0 mt-0.5",
              cat?.gradient ?? "from-steel-500 to-steel-700"
            )}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge className={cn("text-[9px]", `bg-${cat?.color ?? "steel"}-100 text-${cat?.color ?? "steel"}-700`)}>
                {cat?.label ?? goal.category}
              </Badge>
              <Badge className={cn("text-[9px]", status.bg, status.text)}>
                <span className={cn("w-1.5 h-1.5 rounded-full mr-1", status.dot)} />
                {status.label}
              </Badge>
              {showPlant && (
                <Badge className="text-[9px] bg-warm-100 text-warm-600">
                  {goal.plant_name}
                </Badge>
              )}
            </div>

            <h3 className="font-semibold text-warm-900 text-sm leading-snug">
              {goal.title}
            </h3>

            {/* Target vs Current */}
            <div className="flex items-center gap-4 mt-2">
              <div className="text-xs">
                <span className="text-warm-400">Target: </span>
                <span className="font-medium text-warm-700">{goal.target_value}</span>
              </div>
              {goal.current_value && (
                <div className="text-xs">
                  <span className="text-warm-400">Current: </span>
                  <span className="font-bold text-warm-900">{goal.current_value}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions + expand */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {isOwner && onEdit && (
              <span
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-1.5 text-warm-300 hover:text-steel-600 hover:bg-steel-50 rounded-lg transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </span>
            )}
            {isOwner && onDelete && (
              <span
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1.5 text-warm-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </span>
            )}
            <span className="text-warm-400 ml-1">
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          </div>
        </CardContent>
      </button>

      {/* Expanded: updates thread */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-warm-100 pt-4">
          {loadingUpdates ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
            </div>
          ) : (
            <UpdateThread
              updates={updates}
              onAdd={handleAddUpdate}
            />
          )}
        </div>
      )}
    </Card>
  );
}
