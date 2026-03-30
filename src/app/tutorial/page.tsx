"use client";

import { useRouter } from "next/navigation";
import {
  Rocket,
  Calendar,
  Lightbulb,
  Wrench,
  GraduationCap,
  Play,
} from "lucide-react";
import { TUTORIAL_OVERVIEW, TUTORIAL_TIPS } from "@/lib/tutorial-steps";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket,
  Calendar,
  Lightbulb,
  Wrench,
};

const COLOR_MAP: Record<string, string> = {
  steel: "from-steel-600 to-steel-800",
  forge: "from-forge-500 to-forge-700",
  ember: "from-ember-500 to-ember-700",
};

export default function TutorialPage() {
  const router = useRouter();

  const startTour = () => {
    // Clear tour state so it restarts
    localStorage.removeItem("first-team-tutorial-done");
    localStorage.removeItem("first-team-tutorial-step");
    router.push("/");
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in-up max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-5 h-5 text-steel-500" />
          <span className="text-sm font-medium text-steel-500">Tutorial</span>
        </div>
        <h1 className="text-3xl font-bold text-warm-900">
          How First Team Works
        </h1>
        <p className="text-warm-500 mt-1">
          A quick overview of the platform and how it fits into your leadership cohort.
        </p>
      </div>

      {/* Start Tour button */}
      <Button onClick={startTour} className="gap-2">
        <Play className="w-4 h-4" />
        Start Guided Tour
      </Button>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TUTORIAL_OVERVIEW.map((card) => {
          const Icon = ICON_MAP[card.icon] || Rocket;
          return (
            <Card key={card.title}>
              <CardContent className="space-y-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
                    COLOR_MAP[card.color] || COLOR_MAP.steel
                  )}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-warm-900">{card.title}</h3>
                <p className="text-sm text-warm-600 leading-relaxed">
                  {card.body}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Section Guide */}
      <div>
        <h2 className="text-lg font-semibold text-warm-900 mb-3">
          Platform Sections
        </h2>
        <div className="space-y-2">
          {TUTORIAL_TIPS.map((tip) => (
            <button
              key={tip.id}
              onClick={() => router.push(tip.page)}
              className="w-full text-left p-4 rounded-xl border border-warm-200 bg-white hover:border-steel-300 hover:shadow-sm transition-all cursor-pointer group"
            >
              <p className="font-medium text-warm-900 group-hover:text-steel-600 transition-colors">
                {tip.title}
              </p>
              <p className="text-xs text-warm-500 mt-0.5">{tip.body}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
