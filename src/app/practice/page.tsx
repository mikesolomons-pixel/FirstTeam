"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Crown,
  Handshake,
  Building2,
  Star,
  UserPlus,
  HardHat,
  Clock,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePractice } from "@/hooks/use-practice";
import { PRACTICE_ROLES } from "@/lib/ai/roleplay";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn, timeAgo } from "@/lib/utils";
import type { RoleDefinition, ScenarioTemplate } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Crown,
  Handshake,
  Building2,
  Star,
  UserPlus,
  HardHat,
};

const COLOR_MAP: Record<string, { bg: string; text: string; gradient: string }> = {
  steel: {
    bg: "bg-steel-100",
    text: "text-steel-600",
    gradient: "from-steel-500 to-steel-700",
  },
  forge: {
    bg: "bg-forge-100",
    text: "text-forge-600",
    gradient: "from-forge-500 to-forge-700",
  },
  ember: {
    bg: "bg-ember-100",
    text: "text-ember-600",
    gradient: "from-ember-500 to-ember-700",
  },
};

export default function PracticePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { sessions, loading, createSession, deleteSession } = usePractice(user?.id);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [creating, setCreating] = useState(false);

  const handlePickScenario = async (scenario: ScenarioTemplate) => {
    if (!selectedRole || !user) return;
    setCreating(true);
    const session = await createSession(
      selectedRole.key,
      scenario.title,
      scenario.prompt
    );
    if (session) {
      router.push(`/practice/${session.id}`);
    }
    setCreating(false);
  };

  const completedSessions = sessions.filter((s) => s.status === "completed");
  const activeSessions = sessions.filter((s) => s.status === "active");

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MessageCircle className="w-5 h-5 text-steel-500" />
          <span className="text-sm font-medium text-steel-500">Practice</span>
        </div>
        <h1 className="text-3xl font-bold text-warm-900">
          Practice Communication
        </h1>
        <p className="text-warm-500 mt-1 max-w-2xl">
          Rehearse difficult conversations with an AI that plays the other side.
          Pick a role, choose a scenario, and practice your leadership
          communication — then get coaching feedback.
        </p>
      </div>

      {/* Resume active sessions */}
      {activeSessions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-ember-600 uppercase tracking-wider mb-3">
            In Progress
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeSessions.map((s) => {
              const role = PRACTICE_ROLES.find((r) => r.key === s.role);
              const Icon = ICON_MAP[role?.icon ?? "MessageCircle"] || MessageCircle;
              return (
                <Card
                  key={s.id}
                  hover
                  className="cursor-pointer group"
                  onClick={() => router.push(`/practice/${s.id}`)}
                >
                  <CardContent className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-ember-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-ember-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-warm-900 truncate group-hover:text-steel-600">
                        {s.scenario_title}
                      </p>
                      <p className="text-xs text-warm-500">
                        {role?.label} · Started {timeAgo(s.created_at)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-warm-300 group-hover:text-steel-500" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Role Grid */}
      <div>
        <h2 className="text-sm font-semibold text-warm-500 uppercase tracking-wider mb-3">
          Choose who you&apos;re talking to
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRACTICE_ROLES.map((role) => {
            const Icon = ICON_MAP[role.icon] || MessageCircle;
            const colors = COLOR_MAP[role.color] || COLOR_MAP.steel;

            return (
              <button
                key={role.key}
                onClick={() => setSelectedRole(role)}
                className="text-left group"
              >
                <Card
                  hover
                  className="h-full border-transparent hover:border-warm-300 transition-all"
                >
                  <CardContent className="space-y-3">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform",
                        colors.gradient
                      )}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-warm-900 group-hover:text-steel-600 transition-colors">
                        {role.label}
                      </p>
                      <p className="text-xs text-warm-500 mt-1 leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                    <Badge className={cn(colors.bg, colors.text)}>
                      {role.scenarios.length} scenarios
                    </Badge>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      </div>

      {/* Past Sessions */}
      {completedSessions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-warm-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Past Sessions
          </h2>
          <Card>
            <div className="divide-y divide-warm-100">
              {completedSessions.slice(0, 10).map((s) => {
                const role = PRACTICE_ROLES.find((r) => r.key === s.role);
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-warm-50/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/practice/${s.id}`)}
                  >
                    <Badge className="bg-warm-100 text-warm-600 text-[10px]">
                      {role?.label}
                    </Badge>
                    <p className="text-sm text-warm-800 flex-1 truncate">
                      {s.scenario_title}
                    </p>
                    <span className="text-xs text-warm-400">
                      {timeAgo(s.created_at)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(s.id);
                      }}
                      className="p-1.5 text-warm-300 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Scenario Picker Modal */}
      <Modal
        open={!!selectedRole}
        onClose={() => setSelectedRole(null)}
        title={`Practice with: ${selectedRole?.label ?? ""}`}
        size="md"
      >
        <div className="space-y-3">
          <p className="text-sm text-warm-500 mb-4">
            Pick a scenario to practice. The AI will stay in character
            throughout the conversation.
          </p>
          {selectedRole?.scenarios.map((scenario) => (
            <button
              key={scenario.title}
              onClick={() => handlePickScenario(scenario)}
              disabled={creating}
              className="w-full text-left p-4 rounded-xl border border-warm-200 hover:border-steel-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <p className="font-medium text-warm-900 group-hover:text-steel-600 transition-colors">
                {scenario.title}
              </p>
              <p className="text-xs text-warm-500 mt-1 leading-relaxed">
                {scenario.prompt}
              </p>
            </button>
          ))}
          {creating && (
            <div className="flex items-center justify-center py-4">
              <div className="w-5 h-5 border-2 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
              <span className="ml-2 text-sm text-warm-500">
                Setting up your practice session...
              </span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
