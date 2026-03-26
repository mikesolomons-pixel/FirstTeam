"use client";

import { useState } from "react";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Gauge,
  TrendingDown,
  Timer,
  ShieldAlert,
  CheckCircle,
  Truck,
  DollarSign,
  Pencil,
  Save,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useBenchmarking } from "@/hooks/use-benchmarking";
import { METRICS, PERIODS, METRIC_MAP } from "@/lib/benchmark-definitions";
import { MetricChart } from "@/components/benchmarking/metric-chart";
import { CommentaryThread } from "@/components/benchmarking/commentary-thread";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { BenchmarkCommentType } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Gauge,
  TrendingDown,
  Timer,
  ShieldAlert,
  CheckCircle,
  Truck,
  DollarSign,
};

const COLOR_GRADIENTS: Record<string, string> = {
  steel: "from-steel-500 to-steel-700",
  ember: "from-ember-500 to-ember-700",
  forge: "from-forge-500 to-forge-700",
};

export default function BenchmarkingPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState(PERIODS[0]);
  const {
    entries,
    loading,
    getEntriesForMetric,
    getCommentsForMetric,
    upsertEntry,
    addComment,
  } = useBenchmarking(period);

  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, { value: string; target: string }>>({});
  const [saving, setSaving] = useState(false);

  const userPlant = user?.plant_name ?? "";

  // Initialize edit form with current values
  const openEditModal = () => {
    const values: Record<string, { value: string; target: string }> = {};
    for (const m of METRICS) {
      const entry = entries.find(
        (e) => e.plant_name === userPlant && e.metric_key === m.key
      );
      values[m.key] = {
        value: entry ? String(entry.value) : "",
        target: entry?.target ? String(entry.target) : "",
      };
    }
    setEditValues(values);
    setShowEditModal(true);
  };

  const handleSaveMetrics = async () => {
    if (!user) return;
    setSaving(true);
    for (const m of METRICS) {
      const val = editValues[m.key];
      if (val?.value) {
        await upsertEntry({
          plant_name: userPlant,
          metric_key: m.key,
          period,
          value: parseFloat(val.value),
          target: val.target ? parseFloat(val.target) : null,
          author_id: user.id,
        });
      }
    }
    setSaving(false);
    setShowEditModal(false);
  };

  const handleAddComment = async (
    metricKey: string,
    body: string,
    type: BenchmarkCommentType
  ) => {
    if (!user) return;
    await addComment({
      plant_name: userPlant,
      metric_key: metricKey,
      period,
      author_id: user.id,
      body,
      comment_type: type,
    });
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
            <BarChart3 className="w-5 h-5 text-steel-500" />
            <span className="text-sm font-medium text-steel-500">
              Benchmarking
            </span>
          </div>
          <h1 className="text-3xl font-bold text-warm-900">
            Plant Performance
          </h1>
          <p className="text-warm-500 mt-1">
            Compare metrics across plants, understand what&apos;s driving performance, and share insights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={PERIODS.map((p) => ({ value: p, label: p.replace("-", " ") }))}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
          {userPlant && (
            <Button onClick={openEditModal}>
              <Pencil className="w-4 h-4" />
              Edit My Plant
            </Button>
          )}
        </div>
      </div>

      {/* Your plant badge */}
      {userPlant && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-warm-500">Your plant:</span>
          <Badge className="bg-steel-100 text-steel-700">{userPlant}</Badge>
          <span className="text-xs text-warm-400">
            (highlighted in charts below)
          </span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="space-y-4">
        {METRICS.map((metric) => {
          const metricEntries = getEntriesForMetric(metric.key);
          const metricComments = getCommentsForMetric(metric.key);
          const isExpanded = expandedMetric === metric.key;
          const Icon = ICON_MAP[metric.icon] || Gauge;
          const gradient = COLOR_GRADIENTS[metric.color] || COLOR_GRADIENTS.steel;

          // Find user's rank
          const sorted = [...metricEntries].sort((a, b) =>
            metric.direction === "higher"
              ? b.value - a.value
              : a.value - b.value
          );
          const userRank =
            sorted.findIndex((e) => e.plant_name === userPlant) + 1;
          const userEntry = metricEntries.find(
            (e) => e.plant_name === userPlant
          );

          return (
            <Card key={metric.key} className="overflow-hidden">
              {/* Metric Header — always visible */}
              <button
                onClick={() =>
                  setExpandedMetric(isExpanded ? null : metric.key)
                }
                className="w-full text-left cursor-pointer"
              >
                <CardContent className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg flex-shrink-0",
                      gradient
                    )}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-warm-900">
                        {metric.shortName}
                      </h3>
                      <span className="text-xs text-warm-400">
                        {metric.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {userEntry && (
                        <span className="text-sm font-bold text-steel-600">
                          {metric.format(userEntry.value)}
                        </span>
                      )}
                      {userRank > 0 && (
                        <Badge
                          className={cn(
                            "text-[10px]",
                            userRank <= 3
                              ? "bg-emerald-100 text-emerald-700"
                              : userRank >= sorted.length - 2
                              ? "bg-red-100 text-red-700"
                              : "bg-warm-100 text-warm-600"
                          )}
                        >
                          #{userRank} of {sorted.length}
                        </Badge>
                      )}
                      {metricComments.length > 0 && (
                        <span className="text-[10px] text-warm-400">
                          {metricComments.length} comments
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mini preview bars when collapsed */}
                  {!isExpanded && metricEntries.length > 0 && (
                    <div className="hidden lg:flex items-end gap-0.5 h-8">
                      {sorted.slice(0, 10).map((e, i) => (
                        <div
                          key={e.plant_name}
                          className={cn(
                            "w-2 rounded-t transition-all",
                            e.plant_name === userPlant
                              ? "bg-steel-500"
                              : i < 3
                              ? "bg-emerald-300"
                              : i >= sorted.length - 3
                              ? "bg-red-300"
                              : "bg-warm-200"
                          )}
                          style={{
                            height: `${Math.max(
                              (e.value /
                                Math.max(
                                  ...metricEntries.map((x) => x.value),
                                  1
                                )) *
                                100,
                              10
                            )}%`,
                          }}
                          title={`${e.plant_name}: ${metric.format(e.value)}`}
                        />
                      ))}
                    </div>
                  )}

                  <span className="text-warm-400 flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </span>
                </CardContent>
              </button>

              {/* Expanded View */}
              {isExpanded && (
                <div className="px-5 pb-5 space-y-6 border-t border-warm-100 pt-4">
                  {/* Full chart */}
                  <MetricChart
                    metric={metric}
                    entries={metricEntries}
                    userPlant={userPlant}
                  />

                  {/* Direction indicator */}
                  <p className="text-[10px] text-warm-400 text-center">
                    {metric.direction === "higher"
                      ? "▲ Higher is better"
                      : "▼ Lower is better"}
                    {" · "}Vertical line = target
                  </p>

                  {/* Commentary */}
                  <CommentaryThread
                    comments={metricComments}
                    onAdd={(body, type) =>
                      handleAddComment(metric.key, body, type)
                    }
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Edit My Plant Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Metrics: ${userPlant}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-warm-500">
            Update your plant&apos;s metrics for{" "}
            <strong>{period.replace("-", " ")}</strong>.
          </p>
          <div className="space-y-3">
            {METRICS.map((m) => (
              <div
                key={m.key}
                className="flex items-center gap-3 p-3 rounded-lg border border-warm-200"
              >
                <div className="w-28 flex-shrink-0">
                  <p className="text-sm font-medium text-warm-800">
                    {m.shortName}
                  </p>
                  <p className="text-[10px] text-warm-400">{m.unit}</p>
                </div>
                <Input
                  label=""
                  placeholder="Value"
                  type="number"
                  step="any"
                  value={editValues[m.key]?.value ?? ""}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      [m.key]: { ...prev[m.key], value: e.target.value },
                    }))
                  }
                />
                <Input
                  label=""
                  placeholder="Target"
                  type="number"
                  step="any"
                  value={editValues[m.key]?.target ?? ""}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      [m.key]: { ...prev[m.key], target: e.target.value },
                    }))
                  }
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveMetrics} disabled={saving}>
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Metrics"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
