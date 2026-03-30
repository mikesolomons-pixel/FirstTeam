export interface PlanCategory {
  key: string;
  label: string;
  icon: string;
  color: string; // tailwind prefix
  gradient: string;
}

export const PLAN_CATEGORIES: PlanCategory[] = [
  { key: "safety", label: "Safety", icon: "ShieldCheck", color: "emerald", gradient: "from-emerald-500 to-emerald-700" },
  { key: "quality", label: "Quality", icon: "CheckCircle", color: "forge", gradient: "from-forge-500 to-forge-700" },
  { key: "delivery", label: "Delivery", icon: "Truck", color: "steel", gradient: "from-steel-500 to-steel-700" },
  { key: "cost", label: "Cost", icon: "DollarSign", color: "ember", gradient: "from-ember-500 to-ember-700" },
  { key: "people", label: "People", icon: "Users", color: "forge", gradient: "from-forge-400 to-forge-600" },
  { key: "growth", label: "Growth", icon: "TrendingUp", color: "steel", gradient: "from-steel-400 to-steel-600" },
];

export const CATEGORY_MAP = Object.fromEntries(
  PLAN_CATEGORIES.map((c) => [c.key, c])
) as Record<string, PlanCategory>;

export const STATUS_CONFIG = {
  on_track: { label: "On Track", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  at_risk: { label: "At Risk", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  behind: { label: "Behind", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  achieved: { label: "Achieved", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
} as const;
