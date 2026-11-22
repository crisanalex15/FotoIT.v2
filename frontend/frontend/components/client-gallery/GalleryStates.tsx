"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, KeyRound, RotateCw, Sparkles } from "lucide-react";

export function GallerySkeleton() {
  return (
    <div aria-busy="true" aria-label="Se încarcă fotografiile">
      <div className="mb-6 h-5 w-40 animate-pulse rounded bg-white/10" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-white/10" />
        ))}
      </div>
    </div>
  );
}

const primaryButton =
  "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-extrabold text-[#1e1e1e] " +
  "bg-gradient-to-r from-[#d4af37] to-[#b8922d] shadow-lg transition-opacity hover:opacity-90 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-white " +
  "bg-white/10 border border-white/15 transition-colors hover:bg-white/20 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]";

export function GalleryErrorState({
  message,
  canRetry,
  onRetry,
}: {
  message: string;
  canRetry: boolean;
  onRetry: () => void;
}) {
  const openCodeModal = () => window.dispatchEvent(new CustomEvent("open-code-modal"));

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center sm:py-24">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-400">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="mb-2 text-2xl font-extrabold text-white sm:text-3xl">Galerie indisponibilă</h2>
      <p className="mb-8 leading-relaxed text-gray-400">{message}</p>
      <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        {canRetry ? (
          <button type="button" onClick={onRetry} className={primaryButton}>
            <RotateCw className="h-4 w-4" />
            <span>Încearcă din nou</span>
          </button>
        ) : (
          <button type="button" onClick={openCodeModal} className={primaryButton}>
            <KeyRound className="h-4 w-4" />
            <span>Introdu alt cod</span>
          </button>
        )}
        <Link href="/" className={secondaryButton}>
          <ArrowLeft className="h-4 w-4" />
          <span>Înapoi pe FotoIT</span>
        </Link>
      </div>
    </div>
  );
}

export function GalleryEmptyState({ favoritesOnly }: { favoritesOnly?: boolean }) {
  return (
    <div className="py-24 text-center text-gray-400">
      <Sparkles className="mx-auto mb-4 h-14 w-14 text-[#d4af37] opacity-70" />
      {favoritesOnly ? (
        <>
          <p className="mb-1 text-xl font-bold text-white">Nu ai nicio fotografie favorită încă.</p>
          <p className="text-sm">Apasă pe inimioara de pe o poză ca să o adaugi aici.</p>
        </>
      ) : (
        <>
          <p className="mb-1 text-xl font-bold text-white">Albumul nu conține încă fotografii.</p>
          <p className="text-sm">Te rugăm să revii curând sau să iei legătura cu fotograful.</p>
        </>
      )}
    </div>
  );
}
