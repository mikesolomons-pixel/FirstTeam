import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("relative flex flex-col items-center justify-center py-20 text-center overflow-hidden rounded-2xl border border-warm-200", className)}>
      <div className="absolute inset-0 pattern-grid opacity-30" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-steel-100 to-warm-100 flex items-center justify-center mb-4 shadow-sm">
          <Icon className="w-8 h-8 text-steel-400" />
        </div>
        <h3 className="text-lg font-semibold text-warm-800 mb-1">{title}</h3>
        <p className="text-sm text-warm-500 max-w-sm mb-6">{description}</p>
        {action}
      </div>
    </div>
  );
}
