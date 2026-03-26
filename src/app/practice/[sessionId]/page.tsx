"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Square,
  Loader2,
  MessageCircle,
  Star,
  BarChart3,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePractice } from "@/hooks/use-practice";
import { useSpeech } from "@/hooks/use-speech";
import { PRACTICE_ROLES, ROLE_MAP } from "@/lib/practice-roles";
import { ChatMessage } from "@/components/practice/chat-message";
import { MicButton, SpeakerToggle } from "@/components/practice/speech-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PracticeMessage, PracticeSession } from "@/types";

interface FeedbackData {
  overall: string;
  strengths: string[];
  improvements: string[];
  ratings: Record<string, number>;
  tip: string;
}

function ChatContent() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { user } = useAuth();
  const { getSession, addMessage, completeSession } = usePractice(user?.id);
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    supported: speechSupported,
    isSpeaking,
    speak,
    stopSpeaking,
  } = useSpeech();

  const [session, setSession] = useState<PracticeSession | null>(null);
  const [messages, setMessages] = useState<PracticeMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load session
  useEffect(() => {
    async function load() {
      const data = await getSession(sessionId);
      if (data.session) {
        setSession(data.session);
        setMessages(data.messages);
        if (data.session.feedback) {
          try {
            setFeedback(JSON.parse(data.session.feedback));
          } catch {
            // not valid JSON
          }
        }
      }
      setLoading(false);
    }
    if (user) load();
  }, [sessionId, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // Sync speech transcript to input
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // AI opening message
  useEffect(() => {
    if (session && messages.length === 0 && !loading && !streaming) {
      sendToAI([]);
    }
  }, [session, messages.length, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendToAI = useCallback(
    async (currentMessages: PracticeMessage[]) => {
      if (!session) return;
      setStreaming(true);

      // Add placeholder for assistant
      const placeholder: PracticeMessage = {
        id: "streaming",
        session_id: sessionId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, placeholder]);

      try {
        const role = ROLE_MAP[session.role];
        const scenario = role?.scenarios.find(
          (s) => s.title === session.scenario_title
        ) ?? {
          title: session.scenario_title,
          systemContext: session.scenario_prompt,
        };

        const res = await fetch("/api/ai/roleplay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roleKey: session.role,
            scenario,
            userName: user?.full_name,
            messages: currentMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok) throw new Error("API error");

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: fullText,
            };
            return updated;
          });
        }

        // Save to Supabase
        const saved = await addMessage(sessionId, "assistant", fullText);
        if (saved) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = saved;
            return updated;
          });
        }

        // Speak if enabled
        if (voiceEnabled && fullText) {
          speak(fullText);
        }
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== "streaming"));
      } finally {
        setStreaming(false);
      }
    },
    [session, sessionId, user, voiceEnabled, addMessage, speak]
  );

  const handleSend = async () => {
    const text = input.trim();
    if (!text || streaming || !session) return;

    setInput("");
    stopSpeaking();

    // Save user message
    const saved = await addMessage(sessionId, "user", text);
    if (!saved) return;

    const updated = [...messages, saved];
    setMessages(updated);

    // Send to AI
    await sendToAI(updated);
    inputRef.current?.focus();
  };

  const handleEndConversation = async () => {
    if (!session || messages.length < 2) return;
    setFeedbackLoading(true);
    stopSpeaking();

    try {
      const res = await fetch("/api/ai/roleplay/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleKey: session.role,
          scenarioTitle: session.scenario_title,
          messages,
        }),
      });

      if (!res.ok) throw new Error("Feedback API error");
      const { feedback: fb } = await res.json();
      setFeedback(fb);

      await completeSession(sessionId, JSON.stringify(fb));
      setSession((prev) => (prev ? { ...prev, status: "completed" } : prev));
    } catch {
      // fallback
    } finally {
      setFeedbackLoading(false);
    }
  };

  const role = session ? ROLE_MAP[session.role] : null;
  const isCompleted = session?.status === "completed";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 text-center">
        <p className="text-warm-500">Session not found</p>
        <Button variant="secondary" onClick={() => router.push("/practice")} className="mt-4">
          Back to Practice
        </Button>
      </div>
    );
  }

  const RATING_LABELS: Record<string, string> = {
    clarity: "Clarity",
    empathy: "Empathy",
    assertiveness: "Assertiveness",
    listening: "Active Listening",
    outcome_focus: "Outcome Focus",
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-warm-200 bg-white flex-shrink-0">
        <button
          onClick={() => router.push("/practice")}
          className="p-1.5 text-warm-400 hover:text-warm-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-steel-600 to-steel-800 flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-warm-900 truncate">
            {role?.label}: {session.scenario_title}
          </p>
          <p className="text-[10px] text-warm-500">
            {isCompleted ? "Completed" : "In progress"}
          </p>
        </div>
        {speechSupported && !isCompleted && (
          <SpeakerToggle
            enabled={voiceEnabled}
            onToggle={() => {
              if (voiceEnabled) stopSpeaking();
              setVoiceEnabled(!voiceEnabled);
            }}
            isSpeaking={isSpeaking}
          />
        )}
        {!isCompleted && messages.length >= 2 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleEndConversation}
            disabled={feedbackLoading || streaming}
          >
            <Square className="w-3.5 h-3.5 mr-1" />
            End &amp; Get Feedback
          </Button>
        )}
      </div>

      {/* Scenario Briefing */}
      <div className="px-6 py-3 bg-steel-50 border-b border-warm-200 flex-shrink-0">
        <p className="text-xs text-steel-600 leading-relaxed">
          <span className="font-semibold">Scenario:</span>{" "}
          {session.scenario_prompt}
        </p>
      </div>

      {/* Feedback Loading */}
      {feedbackLoading && (
        <div className="flex-1 flex items-center justify-center bg-warm-50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-steel-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-warm-700">
              Analyzing your communication...
            </p>
            <p className="text-xs text-warm-500 mt-1">
              Generating coaching feedback
            </p>
          </div>
        </div>
      )}

      {/* Feedback Display */}
      {feedback && !feedbackLoading && (
        <div className="flex-1 overflow-y-auto bg-warm-50 p-6 space-y-4">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-lg font-bold text-warm-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-steel-500" />
              Coaching Feedback
            </h2>

            {/* Overall */}
            <Card>
              <CardContent>
                <p className="text-sm text-warm-800 leading-relaxed">
                  {feedback.overall}
                </p>
              </CardContent>
            </Card>

            {/* Ratings */}
            <Card>
              <CardContent className="space-y-3">
                <h3 className="text-sm font-semibold text-warm-700">Ratings</h3>
                {Object.entries(feedback.ratings ?? {}).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-warm-600 w-28">
                      {RATING_LABELS[key] ?? key}
                    </span>
                    <div className="flex-1 h-2 bg-warm-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          val >= 4
                            ? "bg-forge-500"
                            : val >= 3
                            ? "bg-ember-400"
                            : "bg-red-400"
                        )}
                        style={{ width: `${(val / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-warm-700 w-6 text-right">
                      {val}/5
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Strengths */}
            {feedback.strengths?.length > 0 && (
              <Card>
                <CardContent>
                  <h3 className="text-sm font-semibold text-forge-600 flex items-center gap-1.5 mb-2">
                    <Star className="w-4 h-4" /> Strengths
                  </h3>
                  <ul className="space-y-2">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-warm-700 flex gap-2">
                        <span className="text-forge-400 flex-shrink-0">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Improvements */}
            {feedback.improvements?.length > 0 && (
              <Card>
                <CardContent>
                  <h3 className="text-sm font-semibold text-ember-600 flex items-center gap-1.5 mb-2">
                    <Lightbulb className="w-4 h-4" /> Areas to Improve
                  </h3>
                  <ul className="space-y-2">
                    {feedback.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-warm-700 flex gap-2">
                        <span className="text-ember-400 flex-shrink-0">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Tip */}
            {feedback.tip && (
              <Card className="bg-steel-50 border-steel-200">
                <CardContent>
                  <p className="text-sm text-steel-800">
                    <span className="font-semibold">💡 Quick tip:</span>{" "}
                    {feedback.tip}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Conversation transcript toggle */}
            <details className="group">
              <summary className="text-xs text-warm-400 cursor-pointer hover:text-warm-600 transition-colors">
                View conversation transcript
              </summary>
              <div className="mt-3 space-y-3">
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    userName={user?.full_name}
                    roleLabel={role?.label}
                  />
                ))}
              </div>
            </details>

            <div className="flex gap-3 pt-2">
              <Button onClick={() => router.push("/practice")}>
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Practice Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      {!feedback && !feedbackLoading && (
        <>
          <div className="flex-1 overflow-y-auto bg-warm-50 p-6 space-y-4">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                userName={user?.full_name}
                roleLabel={role?.label}
                isStreaming={msg.id === "streaming" && streaming}
              />
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          {!isCompleted && (
            <div className="px-6 py-3 border-t border-warm-200 bg-white flex-shrink-0">
              {isListening && (
                <div className="mb-2 px-3 py-1.5 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600 animate-pulse">
                    🎤 Listening... {transcript || "speak now"}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2">
                {speechSupported && (
                  <MicButton
                    isListening={isListening}
                    onToggle={() => {
                      if (isListening) {
                        stopListening();
                      } else {
                        stopSpeaking();
                        startListening();
                      }
                    }}
                    disabled={streaming || isSpeaking}
                  />
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your response..."
                  disabled={streaming}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-warm-300 bg-white text-sm text-warm-900 placeholder:text-warm-400 focus:border-steel-400 focus:outline-none focus:ring-2 focus:ring-steel-400/20 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || streaming}
                  className={cn(
                    "p-2.5 rounded-xl transition-all cursor-pointer",
                    input.trim() && !streaming
                      ? "bg-steel-600 text-white hover:bg-steel-700"
                      : "bg-warm-100 text-warm-300"
                  )}
                >
                  {streaming ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function PracticeChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
