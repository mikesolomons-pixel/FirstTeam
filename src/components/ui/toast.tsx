"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

let addToast: (type: ToastType, message: string) => void;

export function toast(type: ToastType, message: string) {
  addToast?.(type, message);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  addToast = (type, message) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "toast-enter flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg bg-white",
            {
              "border-forge-200": t.type === "success",
              "border-red-200": t.type === "error",
              "border-steel-200": t.type === "info",
            }
          )}
        >
          {t.type === "success" && <CheckCircle className="w-5 h-5 text-forge-500 shrink-0 mt-0.5" />}
          {t.type === "error" && <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
          {t.type === "info" && <Info className="w-5 h-5 text-steel-500 shrink-0 mt-0.5" />}
          <p className="text-sm text-warm-800 flex-1">{t.message}</p>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="text-warm-400 hover:text-warm-600 shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
