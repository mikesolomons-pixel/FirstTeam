"use client";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  userName?: string;
  roleLabel?: string;
  isStreaming?: boolean;
}

export function ChatMessage({
  role,
  content,
  userName,
  roleLabel,
  isStreaming,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%]",
        isUser ? "ml-auto flex-row-reverse" : ""
      )}
    >
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <Avatar name={userName ?? "You"} size="sm" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-steel-600 to-steel-800 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">AI</span>
          </div>
        )}
      </div>
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-steel-600 text-white rounded-br-sm"
            : "bg-white border border-warm-200 text-warm-800 rounded-bl-sm shadow-sm"
        )}
      >
        {!isUser && (
          <p className="text-[10px] font-medium text-warm-400 mb-1">
            {roleLabel ?? "AI"}
          </p>
        )}
        <p className="whitespace-pre-wrap">{content}</p>
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-steel-400 rounded-sm ml-0.5 animate-pulse" />
        )}
      </div>
    </div>
  );
}
