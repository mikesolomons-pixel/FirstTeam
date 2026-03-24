"use client";

import { useState } from "react";
import { X, Sparkles, FileText, Link2, PenTool, Loader2 } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type AIAction = "summarize" | "connections" | "draft";

export function AIAssistantPanel() {
  const { aiPanelOpen, aiPanelContext, closeAIPanel } = useAppStore();
  const [action, setAction] = useState<AIAction>("summarize");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [draftInput, setDraftInput] = useState("");

  if (!aiPanelOpen) return null;

  const actions: { id: AIAction; label: string; icon: typeof FileText; description: string }[] = [
    { id: "summarize", label: "Summarize", icon: FileText, description: "Get a concise summary of the discussion" },
    { id: "connections", label: "Find Connections", icon: Link2, description: "Discover related challenges, stories, and ideas" },
    { id: "draft", label: "Draft Writeup", icon: PenTool, description: "Turn rough notes into a polished writeup" },
  ];

  const handleRun = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      let endpoint = "";
      let body: Record<string, unknown> = {};

      if (action === "summarize") {
        endpoint = "/api/ai/summarize";
        body = {
          type: aiPanelContext?.type || "content",
          title: aiPanelContext?.title || "Untitled",
          content: aiPanelContext?.title || "",
          comments: [],
        };
      } else if (action === "connections") {
        endpoint = "/api/ai/suggest-connections";
        body = {
          currentItem: {
            type: aiPanelContext?.type || "challenge",
            title: aiPanelContext?.title || "",
            description: "",
          },
          allItems: [],
        };
      } else if (action === "draft") {
        endpoint = "/api/ai/draft-writeup";
        body = {
          roughNotes: draftInput,
          context: {
            type: aiPanelContext?.type || "best practice",
            title: aiPanelContext?.title,
          },
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setResult(data.summary || data.connections || data.draft || "");
      }
    } catch {
      setError("Failed to connect to AI service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[70vh] bg-white rounded-xl shadow-2xl border border-warm-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-steel-600 text-white rounded-t-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold text-sm">AI Assistant</span>
        </div>
        <button
          onClick={closeAIPanel}
          className="p-1 rounded hover:bg-steel-500 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Context */}
      {aiPanelContext && (
        <div className="px-4 py-2 bg-steel-50 border-b border-warm-200 text-xs text-warm-600">
          Context: <span className="font-medium text-warm-800">{aiPanelContext.title}</span>
        </div>
      )}

      {/* Action Tabs */}
      <div className="flex border-b border-warm-200">
        {actions.map((a) => (
          <button
            key={a.id}
            onClick={() => {
              setAction(a.id);
              setResult("");
              setError("");
            }}
            className={cn(
              "flex-1 px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer",
              action === a.id
                ? "text-steel-700 border-b-2 border-steel-600 bg-steel-50"
                : "text-warm-500 hover:text-warm-700 hover:bg-warm-50"
            )}
          >
            <a.icon className="w-4 h-4 mx-auto mb-1" />
            {a.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-xs text-warm-500">
          {actions.find((a) => a.id === action)?.description}
        </p>

        {action === "draft" && (
          <Textarea
            placeholder="Paste your rough notes here..."
            value={draftInput}
            onChange={(e) => setDraftInput(e.target.value)}
            className="text-sm min-h-[100px]"
          />
        )}

        <Button
          onClick={handleRun}
          disabled={loading || (action === "draft" && !draftInput.trim())}
          size="sm"
          variant="accent"
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Run
            </>
          )}
        </Button>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-lg bg-warm-50 border border-warm-200 p-4">
            <div className="prose prose-sm max-w-none text-warm-800 whitespace-pre-wrap text-sm leading-relaxed">
              {result}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              className="mt-3 text-xs text-steel-600 hover:text-steel-800 font-medium cursor-pointer"
            >
              Copy to clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
