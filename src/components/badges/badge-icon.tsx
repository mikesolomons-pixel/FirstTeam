"use client";

import {
  Target,
  BookOpen,
  MessageSquare,
  Vote,
  Lightbulb,
  Zap,
  ThumbsUp,
  Factory,
  GraduationCap,
  Wrench,
  Globe,
  Heart,
  Rocket,
  Lock,
} from "lucide-react";
import { getBadgeDef } from "@/lib/badges";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Target,
  BookOpen,
  MessageSquare,
  Vote,
  Lightbulb,
  Zap,
  ThumbsUp,
  Factory,
  GraduationCap,
  Wrench,
  Globe,
  Heart,
  Rocket,
};

const COLOR_MAP: Record<string, { bg: string; icon: string; ring: string }> = {
  steel: {
    bg: "bg-gradient-to-br from-steel-100 to-steel-200",
    icon: "text-steel-600",
    ring: "ring-steel-300",
  },
  ember: {
    bg: "bg-gradient-to-br from-ember-100 to-ember-200",
    icon: "text-ember-600",
    ring: "ring-ember-300",
  },
  forge: {
    bg: "bg-gradient-to-br from-forge-100 to-forge-200",
    icon: "text-forge-600",
    ring: "ring-forge-300",
  },
};

interface BadgeIconProps {
  badgeKey: string;
  size?: "sm" | "md" | "lg";
  locked?: boolean;
  className?: string;
}

const sizes = {
  sm: { container: "w-6 h-6", icon: "w-3 h-3" },
  md: { container: "w-8 h-8", icon: "w-4 h-4" },
  lg: { container: "w-12 h-12", icon: "w-6 h-6" },
};

export function BadgeIcon({
  badgeKey,
  size = "md",
  locked = false,
  className,
}: BadgeIconProps) {
  const def = getBadgeDef(badgeKey);
  if (!def) return null;

  const IconComponent = locked ? Lock : ICON_MAP[def.icon] || Target;
  const colors = COLOR_MAP[def.color] || COLOR_MAP.steel;
  const s = sizes[size];

  return (
    <div
      className={cn(
        "relative rounded-full flex items-center justify-center ring-2 flex-shrink-0 transition-transform hover:scale-110",
        locked
          ? "bg-warm-100 ring-warm-200 opacity-40"
          : cn(colors.bg, colors.ring),
        s.container,
        className
      )}
      title={locked ? `🔒 ${def.name}: ${def.description}` : `${def.name}: ${def.description}`}
    >
      <IconComponent
        className={cn(
          s.icon,
          locked ? "text-warm-400" : colors.icon
        )}
      />
    </div>
  );
}
