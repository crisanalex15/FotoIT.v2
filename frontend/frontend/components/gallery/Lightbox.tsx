"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";

export interface LightboxItem {
  id: string;
  /** Imaginea mare afisata in lightbox */
  src: string;
  /** Imagine mica deja incarcata (thumbnail), afisata pana se incarca cea mare */
  placeholder?: string;
  alt: string;
  title?: string;
}

interface LightboxProps {
  items: LightboxItem[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** Butoane suplimentare in bara de sus (ex: descarcare, favorite) */
  actions?: (item: LightboxItem) => ReactNode;
}

const SWIPE_THRESHOLD = 60;
const CLICK_TOLERANCE = 6;

const navButton =
  "absolute top-1/2 -translate-y-1/2 z-30 inline-flex items-center justify-center rounded-full " +
  "w-11 h-11 sm:w-14 sm:h-14 bg-black/60 text-white border border-white/20 shadow-2xl " +
  "transition-colors duration-200 hover:bg-[#d4af37] hover:text-[#1e1e1e] hover:border-[#d4af37] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]";

export const lightboxIconButton =
  "inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 text-white " +
  "transition-colors hover:bg-[#d4af37] hover:text-[#1e1e1e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]";

export default function Lightbox({ items, index, onIndexChange, onClose, actions }: LightboxProps) {
  const item = items[index];
  const count = items.length;

  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [offset, setOffset] = useState(0);
  const drag = useRef<{ startX: number; pointerId: number; moved: boolean; onImage: boolean } | null>(null);

  const next = useCallback(() => onIndexChange((index + 1) % count), [index, count, onIndexChange]);
  const prev = useCallback(() => onIndexChange((index - 1 + count) % count), [index, count, onIndexChange]);

  // Tastatura
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && count > 1) next();
      else if (e.key === "ArrowLeft" && count > 1) prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onClose, count]);

  // Blocheaza scroll-ul paginii cat timp lightbox-ul e deschis
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Preincarca pozele vecine pentru navigare instantanee
  useEffect(() => {
    if (count < 2) return;
    [items[(index + 1) % count], items[(index - 1 + count) % count]].forEach((it) => {
      const img = new Image();
      img.src = it.src;
    });
  }, [index, items, count]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    const onImage = !!(e.target as HTMLElement).closest("img");
    drag.current = { startX: e.clientX, pointerId: e.pointerId, moved: false, onImage };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > CLICK_TOLERANCE) drag.current.moved = true;
    setOffset(count > 1 ? dx : dx / 4);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    setOffset(0);
    if (!d) return;
    const dx = e.clientX - d.startX;
    if (count > 1 && dx > SWIPE_THRESHOLD) prev();
    else if (count > 1 && dx < -SWIPE_THRESHOLD) next();
    else if (!d.moved && !d.onImage) onClose(); // click pe fundal
  };

  if (!item) return null;
  const isLoaded = loaded[item.id];

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex flex-col select-none"
      role="dialog"
      aria-modal="true"
      aria-label={item.title || item.alt}
    >
      {/* Bara de sus */}
      <div className="relative z-30 flex items-center justify-between gap-3 px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 inline-flex items-center px-3 py-1 rounded-full bg-[#d4af37]/20 text-[#d4af37] text-xs font-bold tracking-wider tabular-nums">
            {index + 1} / {count}
          </span>
          {item.title && (
            <span className="hidden sm:block truncate text-sm font-medium text-gray-300">{item.title}</span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {actions?.(item)}
          <button type="button" onClick={onClose} className={lightboxIconButton} aria-label="Închide" title="Închide (Esc)">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Zona centrala: imagine + gesturi (mouse si touch prin Pointer Events) */}
      <div
        className="relative flex-1 min-h-0 flex items-center justify-center px-2 sm:px-20 overflow-hidden touch-pan-y cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null;
          setOffset(0);
        }}
      >
        {count > 1 && (
          <button
            type="button"
            onClick={prev}
            className={`${navButton} left-2 sm:left-5`}
            aria-label="Fotografia anterioară"
            title="Anterior (←)"
          >
            <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
        )}

        <div
          className={`relative flex items-center justify-center max-w-full max-h-full ${
            offset === 0 ? "transition-transform duration-200 ease-out" : ""
          }`}
          style={{ transform: `translateX(${offset}px)` }}
        >
          {item.placeholder && !isLoaded && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.placeholder}
              alt=""
              aria-hidden
              draggable={false}
              className="max-h-[calc(100dvh-9rem)] max-w-full object-contain rounded-lg blur-sm opacity-70"
            />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={item.id}
            src={item.src}
            alt={item.alt}
            draggable={false}
            onLoad={() => setLoaded((l) => ({ ...l, [item.id]: true }))}
            onError={() => setLoaded((l) => ({ ...l, [item.id]: true }))}
            className={`max-h-[calc(100dvh-9rem)] max-w-full object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : item.placeholder ? "absolute inset-0 m-auto opacity-0" : "opacity-0"
            }`}
          />
          {!isLoaded && (
            <Loader2 className="absolute w-10 h-10 text-[#d4af37] animate-spin" aria-label="Se încarcă" />
          )}
        </div>

        {count > 1 && (
          <button
            type="button"
            onClick={next}
            className={`${navButton} right-2 sm:right-5`}
            aria-label="Fotografia următoare"
            title="Următor (→)"
          >
            <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
        )}
      </div>

      {/* Indicatii */}
      <div className="relative z-30 flex items-center justify-center gap-3 px-4 py-3 text-center text-xs text-gray-400 bg-gradient-to-t from-black/80 to-transparent">
        <span className="sm:hidden">Glisează stânga / dreapta pentru navigare</span>
        <span className="hidden sm:inline">Trage cu mouse-ul sau folosește săgețile • Esc pentru închidere</span>
      </div>
    </div>
  );
}
