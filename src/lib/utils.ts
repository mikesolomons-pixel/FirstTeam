import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string) {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date: string) {
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export const REACTION_EMOJI_MAP: Record<string, string> = {
  wrench: "\uD83D\uDD27",
  lightbulb: "\uD83D\uDCA1",
  hardhat: "\uD83E\uDDE2",
  fire: "\uD83D\uDD25",
  thumbsup: "\uD83D\uDC4D",
};

export const REACTION_LABELS: Record<string, string> = {
  wrench: "On it",
  lightbulb: "Great idea",
  hardhat: "Working on it",
  fire: "Hot topic",
  thumbsup: "Nice",
};

export const STICKY_COLORS = [
  "#FEF3C7", // amber-100
  "#DBEAFE", // blue-100
  "#D1FAE5", // emerald-100
  "#FCE7F3", // pink-100
  "#EDE9FE", // violet-100
  "#FEE2E2", // red-100
];

export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-amber-100 text-amber-800",
  resolved: "bg-emerald-100 text-emerald-800",
};

export const CATEGORY_LABELS: Record<string, string> = {
  best_practice: "Best Practice",
  win: "Win",
  lesson_learned: "Lesson Learned",
  case_study: "Case Study",
};

export const CATEGORY_COLORS: Record<string, string> = {
  best_practice: "bg-blue-100 text-blue-800",
  win: "bg-emerald-100 text-emerald-800",
  lesson_learned: "bg-amber-100 text-amber-800",
  case_study: "bg-violet-100 text-violet-800",
};
