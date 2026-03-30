"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  X,
  GraduationCap,
  Rocket,
  Calendar,
  Lightbulb,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TUTORIAL_OVERVIEW } from "@/lib/tutorial-steps";
import { cn } from "@/lib/utils";
import type { TutorialTip } from "@/lib/tutorial-steps";

/* ── Icon + color maps for the intro modal ── */
const INTRO_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket, Calendar, Lightbulb, Wrench,
};
const INTRO_COLORS: Record<string, string> = {
  steel: "from-steel-600 to-steel-800",
  forge: "from-forge-500 to-forge-700",
  ember: "from-ember-500 to-ember-700",
};

/* ═══════════════════════════════════════════════
   INTRO MODAL — centered, shown on first login
   ═══════════════════════════════════════════════ */
interface IntroModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function IntroModal({ onComplete, onSkip }: IntroModalProps) {
  const [step, setStep] = useState(0);
  const steps = TUTORIAL_OVERVIEW;
  const current = steps[step];
  const Icon = INTRO_ICONS[current.icon] || Rocket;
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
        {/* Close */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 p-1.5 text-warm-400 hover:text-warm-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress */}
        <div className="flex gap-1 mb-5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-all",
                i <= step ? "bg-steel-500" : "bg-warm-200"
              )}
            />
          ))}
        </div>

        {/* Icon + content */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={cn(
              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg flex-shrink-0",
              INTRO_COLORS[current.color] || INTRO_COLORS.steel
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] text-warm-400 uppercase tracking-wider font-medium">
              {step + 1} of {steps.length}
            </p>
            <h2 className="text-lg font-bold text-warm-900 mt-0.5">
              {current.title}
            </h2>
          </div>
        </div>

        <p className="text-sm text-warm-600 leading-relaxed">
          {current.body}
        </p>

        {/* Nav */}
        <div className="flex items-center justify-between mt-6">
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
              Explore the App
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={() => setStep(step + 1)}>
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface TutorialTipCardProps {
  tip: TutorialTip;
  stepNumber: number;
  totalSteps: number;
  onDismiss: () => void;
  onSkipAll: () => void;
}

export function TutorialTipCard({
  tip,
  stepNumber,
  totalSteps,
  onDismiss,
  onSkipAll,
}: TutorialTipCardProps) {
  const router = useRouter();

  const handleNext = () => {
    onDismiss();
    if (tip.nextPage) {
      router.push(tip.nextPage);
    }
  };

  return (
    <div className="mx-6 md:mx-8 mt-4 mb-2 animate-fade-in-up">
      <div className="relative bg-gradient-to-r from-steel-800 to-steel-900 rounded-xl px-5 py-4 text-white shadow-lg max-w-2xl">
        {/* Close button */}
        <button
          onClick={onSkipAll}
          className="absolute top-3 right-3 p-1 text-steel-400 hover:text-white transition-colors cursor-pointer"
          title="End tour"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="w-4 h-4 text-ember-400" />
          <span className="text-[10px] font-medium text-steel-400 uppercase tracking-wider">
            Tour — {stepNumber} of {totalSteps}
          </span>
        </div>

        {/* Content */}
        <h3 className="font-bold text-base">{tip.title}</h3>
        <p className="text-sm text-steel-200 mt-1 leading-relaxed">
          {tip.body}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={onSkipAll}
            className="text-xs text-steel-400 hover:text-steel-200 transition-colors cursor-pointer"
          >
            End tour
          </button>
          {tip.nextPage ? (
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-ember-500 hover:bg-ember-600 text-white"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onSkipAll}
              className="bg-ember-500 hover:bg-ember-600 text-white"
            >
              Finish Tour
            </Button>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex gap-1 mt-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < stepNumber ? "bg-ember-400" : "bg-steel-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
