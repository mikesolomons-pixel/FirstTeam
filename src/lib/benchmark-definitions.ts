export interface MetricDefinition {
  key: string;
  name: string;
  shortName: string;
  unit: string;
  direction: "higher" | "lower"; // higher = better, lower = better
  color: string; // tailwind color prefix
  icon: string; // lucide icon name
  format: (v: number) => string;
}

export const METRICS: MetricDefinition[] = [
  {
    key: "oee",
    name: "Overall Equipment Effectiveness",
    shortName: "OEE",
    unit: "%",
    direction: "higher",
    color: "steel",
    icon: "Gauge",
    format: (v) => `${v.toFixed(1)}%`,
  },
  {
    key: "forecast_variance",
    name: "Forecast Variance",
    shortName: "Forecast Var.",
    unit: "%",
    direction: "lower",
    color: "ember",
    icon: "TrendingDown",
    format: (v) => `${v.toFixed(1)}%`,
  },
  {
    key: "changeover_time",
    name: "Changeover Time",
    shortName: "Changeover",
    unit: "min",
    direction: "lower",
    color: "forge",
    icon: "Timer",
    format: (v) => `${v.toFixed(0)} min`,
  },
  {
    key: "safety_trir",
    name: "Safety (TRIR)",
    shortName: "TRIR",
    unit: "rate",
    direction: "lower",
    color: "ember",
    icon: "ShieldAlert",
    format: (v) => v.toFixed(2),
  },
  {
    key: "quality_fpy",
    name: "First Pass Yield",
    shortName: "FPY",
    unit: "%",
    direction: "higher",
    color: "forge",
    icon: "CheckCircle",
    format: (v) => `${v.toFixed(1)}%`,
  },
  {
    key: "delivery_otd",
    name: "On-Time Delivery",
    shortName: "OTD",
    unit: "%",
    direction: "higher",
    color: "steel",
    icon: "Truck",
    format: (v) => `${v.toFixed(1)}%`,
  },
  {
    key: "cost_per_unit",
    name: "Cost per Unit",
    shortName: "CPU",
    unit: "$/unit",
    direction: "lower",
    color: "ember",
    icon: "DollarSign",
    format: (v) => `$${v.toFixed(2)}`,
  },
];

export const METRIC_MAP = Object.fromEntries(
  METRICS.map((m) => [m.key, m])
) as Record<string, MetricDefinition>;

export const PERIODS = [
  "2026-Q1",
  "2025-Q4",
  "2025-Q3",
  "2025-Q2",
];
