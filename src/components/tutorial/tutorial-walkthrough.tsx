"use client";

import { useState } from "react";
import {
  Rocket,
  Calendar,
  Lightbulb,
  LayoutDashboard,
  Target,
  BookOpen,
  Newspaper,
  MessageCircle,
  ClipboardList,
  BarChart3,
  Award,
  Wrench,
  Zap,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { TUTORIAL_STEPS } from "@/lib/tutorial-steps";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket,
  Calendar,
  Lightbulb,
  LayoutDashboard,
  Target,
  BookOpen,
  Newspaper,
  MessageCircle,
  ClipboardList,
  BarChart3,
  Award,
  Wrench,
  Zap,
};

const COLOR_MAP: Record<string, { gradient: string; bg: string; text: string; ring: string }> = {
  steel: { gradient: "from-steel-600 to-steel-800", bg: "bg-steel-100", text: "text-steel-600", ring: "ring-steel-200" },
  forge: { gradient: "from-forge-500 to-forge-700", bg: "bg-forge-100", text: "text-forge-600", ring: "ring-forge-200" },
  ember: { gradient: "from-ember-500 to-ember-700", bg: "bg-ember-100", text: "text-ember-600", ring: "ring-ember-200" },
};

interface TutorialWalkthroughProps {
  onComplete: () => void;
  onSkip?: () => void;
  embedded?: boolean; // false = modal overlay, true = inline page
}

export function TutorialWalkthrough({
  onComplete,
  onSkip,
  embedded = false,
}: TutorialWalkthroughProps) {
  const [step, setStep] = useState(0);
  const current = TUTORIAL_STEPS[step];
  const Icon = ICON_MAP[current.icon] || Rocket;
  const colors = COLOR_MAP[current.color] || COLOR_MAP.steel;
  const total = TUTORIAL_STEPS.length;
  const isLast = step === total - 1;

  const content = (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="flex items-center gap-1 px-1">
        {TUTORIAL_STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={cn(
              "h-1 rounded-full flex-1 transition-all cursor-pointer",
              i <= step ? "bg-steel-500" : "bg-warm-200"
            )}
          />
        ))}
      </div>

      {/* Step counter + skip */}
      <div className="flex items-center justify-between px-1 py-3">
        <span className="text-xs text-warm-400">
          {step + 1} of {total}
        </span>
        {onSkip && !isLast && (
          <button
            onClick={onSkip}
            className="text-xs text-warm-400 hover:text-warm-600 transition-colors cursor-pointer"
          >
            Skip tutorial
          </button>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-1">
        {/* Icon + Title */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={cn(
              "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg flex-shrink-0",
              colors.gradient
            )}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-warm-900">{current.title}</h2>
            {current.subtitle && (
              <p className="text-sm text-warm-500 mt-0.5">{current.subtitle}</p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-sm max-w-none">
          {current.body.split("\n\n").map((paragraph, i) => (
            <p
              key={i}
              className="text-sm text-warm-700 leading-relaxed mb-3 whitespace-pre-line"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-warm-200 mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        {isLast ? (
          <Button onClick={onComplete}>
            <Zap className="w-4 h-4" />
            Get Started
          </Button>
        ) : (
          <Button onClick={() => setStep(step + 1)}>
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return <div className="max-w-2xl mx-auto p-6 md:p-8">{content}</div>;
  }

  // Modal overlay
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col p-6 relative">
        {onSkip && (
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-1.5 text-warm-400 hover:text-warm-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {content}
      </div>
    </div>
  );
}
