"use client";

import { Mic, MicOff, Volume2, VolumeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpeechButtonProps {
  isListening: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

export function MicButton({
  isListening,
  onToggle,
  disabled,
  className,
}: SpeechButtonProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "relative p-2.5 rounded-full transition-all cursor-pointer",
        isListening
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-warm-100 text-warm-600 hover:bg-warm-200",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      title={isListening ? "Stop recording" : "Start recording"}
    >
      {isListening ? (
        <MicOff className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
      {isListening && (
        <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
      )}
    </button>
  );
}

interface SpeakerToggleProps {
  enabled: boolean;
  onToggle: () => void;
  isSpeaking: boolean;
  className?: string;
}

export function SpeakerToggle({
  enabled,
  onToggle,
  isSpeaking,
  className,
}: SpeakerToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "p-2 rounded-lg transition-all cursor-pointer text-xs flex items-center gap-1.5 font-medium",
        enabled
          ? "bg-forge-100 text-forge-700 hover:bg-forge-200"
          : "bg-warm-100 text-warm-400 hover:bg-warm-200",
        isSpeaking && "ring-2 ring-forge-300",
        className
      )}
      title={enabled ? "Disable voice output" : "Enable voice output"}
    >
      {enabled ? (
        <Volume2 className="w-3.5 h-3.5" />
      ) : (
        <VolumeOff className="w-3.5 h-3.5" />
      )}
      {enabled ? "Voice on" : "Voice off"}
    </button>
  );
}
