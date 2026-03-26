"use client";

import { cn } from "@/lib/utils";
import type { MetricDefinition } from "@/lib/benchmark-definitions";
import type { BenchmarkEntry } from "@/types";

interface MetricChartProps {
  metric: MetricDefinition;
  entries: BenchmarkEntry[];
  userPlant?: string;
  compact?: boolean;
}

export function MetricChart({
  metric,
  entries,
  userPlant,
  compact = false,
}: MetricChartProps) {
  if (entries.length === 0) {
    return (
      <p className="text-warm-400 text-sm text-center py-4">No data yet</p>
    );
  }

  // Sort: for "higher is better" → descending, for "lower is better" → ascending
  const sorted = [...entries].sort((a, b) =>
    metric.direction === "higher" ? b.value - a.value : a.value - b.value
  );

  const maxVal = Math.max(...entries.map((e) => e.value), 0.01);

  // Quartile boundaries for coloring
  const q1 = Math.floor(sorted.length * 0.25);
  const q3 = Math.floor(sorted.length * 0.75);

  return (
    <div className="space-y-1.5">
      {sorted.map((entry, i) => {
        const isUser = entry.plant_name === userPlant;
        const barWidth = (entry.value / maxVal) * 100;
        const rank = i + 1;

        // Color based on quartile position (already sorted best→worst)
        let barColor = "bg-warm-300"; // middle
        if (i < q1) barColor = "bg-emerald-500"; // top quartile
        else if (i >= q3) barColor = "bg-red-400"; // bottom quartile
        else barColor = "bg-amber-400"; // middle

        // Target indicator
        const targetPct = entry.target
          ? (entry.target / maxVal) * 100
          : null;

        return (
          <div
            key={entry.plant_name}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1 transition-all",
              isUser && "bg-steel-50 ring-1 ring-steel-300",
              compact && "py-0.5"
            )}
          >
            {/* Rank */}
            <span
              className={cn(
                "text-[10px] font-bold w-5 text-center flex-shrink-0",
                i === 0 ? "text-emerald-600" : "text-warm-400"
              )}
            >
              {rank}
            </span>

            {/* Plant name */}
            <span
              className={cn(
                "text-xs w-28 truncate flex-shrink-0",
                isUser
                  ? "font-bold text-steel-700"
                  : "text-warm-600"
              )}
            >
              {entry.plant_name}
              {isUser && " ●"}
            </span>

            {/* Bar */}
            <div className="flex-1 relative h-4 bg-warm-100 rounded overflow-hidden">
              <div
                className={cn(
                  "h-full rounded transition-all duration-500",
                  isUser ? "bg-steel-500" : barColor
                )}
                style={{ width: `${Math.max(barWidth, 2)}%` }}
              />
              {/* Target line */}
              {targetPct && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-warm-900/40"
                  style={{ left: `${Math.min(targetPct, 100)}%` }}
                  title={`Target: ${metric.format(entry.target!)}`}
                />
              )}
            </div>

            {/* Value */}
            <span
              className={cn(
                "text-xs font-mono w-16 text-right flex-shrink-0",
                isUser ? "font-bold text-steel-700" : "text-warm-600"
              )}
            >
              {metric.format(entry.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
