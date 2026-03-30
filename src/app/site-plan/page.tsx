"use client";

import { useState } from "react";
import {
  ClipboardList,
  Plus,
  Filter,
  Save,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSitePlan } from "@/hooks/use-site-plan";
import { PLAN_CATEGORIES, STATUS_CONFIG } from "@/lib/plan-categories";
import { GoalCard } from "@/components/site-plan/goal-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { GoalStatus } from "@/types";

const PLANT_OPTIONS = [
  { value: "all", label: "All Plants" },
  { value: "Automotive Assembly", label: "Automotive Assembly" },
  { value: "Body Shop", label: "Body Shop" },
  { value: "Paint Shop", label: "Paint Shop" },
  { value: "Stamping Plant", label: "Stamping Plant" },
  { value: "Powertrain", label: "Powertrain" },
  { value: "Engine Plant", label: "Engine Plant" },
  { value: "Transmission Plant", label: "Transmission Plant" },
  { value: "Battery Plant", label: "Battery Plant" },
  { value: "Distribution Center", label: "Distribution Center" },
  { value: "Quality Lab", label: "Quality Lab" },
];

const STATUS_OPTIONS = [
  { value: "on_track", label: "On Track" },
  { value: "at_risk", label: "At Risk" },
  { value: "behind", label: "Behind" },
  { value: "achieved", label: "Achieved" },
];

const PRIORITY_OPTIONS = [
  { value: "1", label: "1 — Critical" },
  { value: "2", label: "2 — High" },
  { value: "3", label: "3 — Medium" },
  { value: "4", label: "4 — Low" },
  { value: "5", label: "5 — Nice to Have" },
];

export default function SitePlanPage() {
  const { user } = useAuth();
  const [plantFilter, setPlantFilter] = useState(user?.plant_name ?? "all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    fetchUpdates,
    addUpdate,
  } = useSitePlan(plantFilter);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    category: "safety",
    target_value: "",
    current_value: "",
    status: "on_track" as GoalStatus,
    priority: 3,
  });
  const [saving, setSaving] = useState(false);

  const filteredGoals = categoryFilter === "all"
    ? goals
    : goals.filter((g) => g.category === categoryFilter);

  // Group by category for cross-plant view
  const isAllPlants = plantFilter === "all";
  const groupedGoals = isAllPlants
    ? PLAN_CATEGORIES.reduce((acc, cat) => {
        const catGoals = filteredGoals.filter((g) => g.category === cat.key);
        if (catGoals.length > 0) acc.push({ category: cat, goals: catGoals });
        return acc;
      }, [] as { category: (typeof PLAN_CATEGORIES)[0]; goals: typeof goals }[])
    : null;

  const handleCreate = async () => {
    if (!user || !newGoal.title.trim()) return;
    setSaving(true);
    await createGoal({
      plant_name: user.plant_name,
      title: newGoal.title,
      category: newGoal.category,
      target_value: newGoal.target_value,
      current_value: newGoal.current_value,
      status: newGoal.status,
      priority: newGoal.priority,
      author_id: user.id,
    });
    setShowCreateModal(false);
    setNewGoal({ title: "", category: "safety", target_value: "", current_value: "", status: "on_track", priority: 3 });
    setSaving(false);
  };

  // Stats
  const statusCounts = {
    on_track: goals.filter((g) => g.status === "on_track").length,
    at_risk: goals.filter((g) => g.status === "at_risk").length,
    behind: goals.filter((g) => g.status === "behind").length,
    achieved: goals.filter((g) => g.status === "achieved").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-5 h-5 text-steel-500" />
            <span className="text-sm font-medium text-steel-500">Site Plan</span>
          </div>
          <h1 className="text-3xl font-bold text-warm-900">Site Master Plan</h1>
          <p className="text-warm-500 mt-1">
            Define what your plant is trying to achieve — targets, progress, and learnings shared across the team.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={PLANT_OPTIONS}
            value={plantFilter}
            onChange={(e) => setPlantFilter(e.target.value)}
          />
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.entries(statusCounts) as [keyof typeof STATUS_CONFIG, number][]).map(
          ([key, count]) => {
            const config = STATUS_CONFIG[key];
            return (
              <Card key={key}>
                <CardContent className="flex items-center gap-3 py-3">
                  <span className={cn("w-3 h-3 rounded-full", config.dot)} />
                  <div>
                    <p className="text-xl font-bold text-warm-900">{count}</p>
                    <p className="text-[10px] text-warm-500">{config.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          }
        )}
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-1 flex-wrap bg-warm-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setCategoryFilter("all")}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
            categoryFilter === "all"
              ? "bg-white text-warm-900 shadow-sm"
              : "text-warm-500 hover:text-warm-700"
          )}
        >
          All ({goals.length})
        </button>
        {PLAN_CATEGORIES.map((cat) => {
          const count = goals.filter((g) => g.category === cat.key).length;
          return (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                categoryFilter === cat.key
                  ? "bg-white text-warm-900 shadow-sm"
                  : "text-warm-500 hover:text-warm-700"
              )}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Goals list */}
      {isAllPlants && groupedGoals ? (
        // Cross-plant view: grouped by category
        <div className="space-y-8">
          {groupedGoals.map(({ category, goals: catGoals }) => (
            <div key={category.key}>
              <h2 className="text-sm font-semibold text-warm-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", `bg-${category.color}-500`)} />
                {category.label} ({catGoals.length} goals across plants)
              </h2>
              <div className="space-y-3">
                {catGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    isOwner={goal.author_id === user?.id}
                    onDelete={() => deleteGoal(goal.id)}
                    onFetchUpdates={fetchUpdates}
                    onAddUpdate={addUpdate}
                    userId={user?.id}
                    showPlant
                  />
                ))}
              </div>
            </div>
          ))}
          {groupedGoals.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="w-10 h-10 text-warm-200 mx-auto mb-3" />
              <p className="text-warm-500">No goals found for this filter</p>
            </div>
          )}
        </div>
      ) : (
        // Single plant view
        <div className="space-y-3">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isOwner={goal.author_id === user?.id}
              onDelete={() => deleteGoal(goal.id)}
              onFetchUpdates={fetchUpdates}
              onAddUpdate={addUpdate}
              userId={user?.id}
            />
          ))}
          {filteredGoals.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="w-10 h-10 text-warm-200 mx-auto mb-3" />
              <p className="text-warm-500">
                {goals.length === 0
                  ? "No goals yet — add your first strategic goal!"
                  : "No goals match this category filter"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create Goal Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Strategic Goal"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-warm-500">
            Define a goal for <strong>{user?.plant_name ?? "your plant"}</strong>.
          </p>
          <Textarea
            label="Goal Title"
            placeholder="e.g. Reduce TRIR below 1.0 by Q4 2026"
            rows={2}
            value={newGoal.title}
            onChange={(e) => setNewGoal((g) => ({ ...g, title: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              options={PLAN_CATEGORIES.map((c) => ({ value: c.key, label: c.label }))}
              value={newGoal.category}
              onChange={(e) => setNewGoal((g) => ({ ...g, category: e.target.value }))}
            />
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={newGoal.status}
              onChange={(e) => setNewGoal((g) => ({ ...g, status: e.target.value as GoalStatus }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Value"
              placeholder="e.g. TRIR < 1.0"
              value={newGoal.target_value}
              onChange={(e) => setNewGoal((g) => ({ ...g, target_value: e.target.value }))}
            />
            <Input
              label="Current Value"
              placeholder="e.g. TRIR 1.4"
              value={newGoal.current_value}
              onChange={(e) => setNewGoal((g) => ({ ...g, current_value: e.target.value }))}
            />
          </div>
          <Select
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={String(newGoal.priority)}
            onChange={(e) => setNewGoal((g) => ({ ...g, priority: parseInt(e.target.value) }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving || !newGoal.title.trim()}>
              <Save className="w-4 h-4" />
              {saving ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
