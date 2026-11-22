"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

/** Notificare scurta in partea de jos a ecranului (inlocuieste alert()). */
export function useToast(duration = 3500) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (text: string) => {
      setMessage(text);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(null), duration);
    },
    [duration]
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const toast = (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4 transition-all duration-300 ${
        message ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      {message && (
        <div className="inline-flex max-w-md items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#1e1e1e] px-5 py-3 text-sm font-medium text-white shadow-2xl">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#d4af37]" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );

  return { show, toast };
}
