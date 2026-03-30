"use client";

import { useRouter } from "next/navigation";
import {
  ChevronRight,
  X,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TutorialTip } from "@/lib/tutorial-steps";

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
