"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "accent";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-steel-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          {
            "bg-steel-600 text-white hover:bg-steel-700 active:bg-steel-800":
              variant === "primary",
            "bg-warm-100 text-warm-800 hover:bg-warm-200 active:bg-warm-300 border border-warm-300":
              variant === "secondary",
            "text-warm-600 hover:bg-warm-100 hover:text-warm-800":
              variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700": variant === "danger",
            "bg-ember-500 text-white hover:bg-ember-600 active:bg-ember-700":
              variant === "accent",
          },
          {
            "text-sm px-3 py-1.5": size === "sm",
            "text-sm px-4 py-2": size === "md",
            "text-base px-6 py-3": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
export type { ButtonProps };
