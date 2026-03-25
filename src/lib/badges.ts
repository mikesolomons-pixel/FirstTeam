import type { BadgeDefinition } from "@/types";

export const ACTIVITY_BADGES: BadgeDefinition[] = [
  {
    key: "first-challenge",
    name: "Shift Starter",
    description: "Posted your first challenge",
    category: "activity",
    icon: "Target",
    color: "steel",
  },
  {
    key: "5-stories",
    name: "Story Foreman",
    description: "Shared 5 stories with the team",
    category: "activity",
    icon: "BookOpen",
    color: "forge",
  },
  {
    key: "10-comments",
    name: "Shop Floor Voice",
    description: "Posted 10 comments across the platform",
    category: "activity",
    icon: "MessageSquare",
    color: "steel",
  },
  {
    key: "3-votes",
    name: "Priority Setter",
    description: "Voted in 3 challenge priority sessions",
    category: "activity",
    icon: "Vote",
    color: "ember",
  },
  {
    key: "first-brainstorm",
    name: "Spark Plug",
    description: "Created your first brainstorm session",
    category: "activity",
    icon: "Lightbulb",
    color: "ember",
  },
  {
    key: "10-ideas",
    name: "Idea Mill",
    description: "Contributed 10 brainstorm ideas",
    category: "activity",
    icon: "Zap",
    color: "forge",
  },
  {
    key: "5-reactions",
    name: "Signal Booster",
    description: "Reacted to 5 pieces of content",
    category: "activity",
    icon: "ThumbsUp",
    color: "forge",
  },
  {
    key: "cross-plant",
    name: "Cross-Plant Connector",
    description: "Engaged with content from 3+ different plants",
    category: "activity",
    icon: "Factory",
    color: "steel",
  },
];

export const PEER_BADGES: BadgeDefinition[] = [
  {
    key: "great-mentor",
    name: "Great Mentor",
    description: "Recognized for guiding and developing others",
    category: "peer",
    icon: "GraduationCap",
    color: "ember",
  },
  {
    key: "problem-solver",
    name: "Problem Solver",
    description: "Known for tackling tough challenges head-on",
    category: "peer",
    icon: "Wrench",
    color: "steel",
  },
  {
    key: "cross-plant-champion",
    name: "Cross-Plant Champion",
    description: "Bridges gaps between plants and teams",
    category: "peer",
    icon: "Globe",
    color: "forge",
  },
  {
    key: "culture-builder",
    name: "Culture Builder",
    description: "Strengthens team culture and belonging",
    category: "peer",
    icon: "Heart",
    color: "ember",
  },
  {
    key: "innovation-driver",
    name: "Innovation Driver",
    description: "Pushes bold new ideas and ways of working",
    category: "peer",
    icon: "Rocket",
    color: "forge",
  },
];

export const ALL_BADGES: BadgeDefinition[] = [
  ...ACTIVITY_BADGES,
  ...PEER_BADGES,
];

export const BADGE_MAP: Record<string, BadgeDefinition> = Object.fromEntries(
  ALL_BADGES.map((b) => [b.key, b])
);

export function getBadgeDef(key: string): BadgeDefinition | undefined {
  return BADGE_MAP[key];
}
