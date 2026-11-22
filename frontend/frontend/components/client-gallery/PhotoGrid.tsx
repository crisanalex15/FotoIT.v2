"use client";

import { memo, useEffect, useRef, useState } from "react";
import { CheckSquare, Heart, ImageOff, Square } from "lucide-react";
import { galleryApi, type PhotoDto } from "@/lib/api";

/** Cate poze se randeaza initial si cate se adauga la fiecare scroll spre final */
const BATCH = 48;

interface PhotoGridProps {
  photos: PhotoDto[];
  selectionMode: boolean;
  selected: Set<string>;
  favorites: Set<string>;
  onOpen: (index: number) => void;
  onToggleSelect: (fileId: string) => void;
  onToggleFavorite: (fileId: string) => void;
}

export default function PhotoGrid({
  photos,
  selectionMode,
  selected,
  favorites,
  onOpen,
  onToggleSelect,
  onToggleFavorite,
}: PhotoGridProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = visibleCount < photos.length;

  // Incarcare treptata: urmatorul lot se randeaza cand utilizatorul se apropie de final
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + BATCH, photos.length));
        }
      },
      { rootMargin: "800px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, photos.length]);

  return (
    <>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4" role="list">
        {photos.slice(0, visibleCount).map((photo, index) => (
          <li key={photo.fileId}>
            <PhotoTile
              photo={photo}
              index={index}
              selectionMode={selectionMode}
              isSelected={selected.has(photo.fileId)}
              isFavorite={favorites.has(photo.fileId)}
              onOpen={onOpen}
              onToggleSelect={onToggleSelect}
              onToggleFavorite={onToggleFavorite}
            />
          </li>
        ))}
      </ul>
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-10 text-sm text-gray-500">
          Se încarcă mai multe fotografii…
        </div>
      )}
    </>
  );
}

interface PhotoTileProps {
  photo: PhotoDto;
  index: number;
  selectionMode: boolean;
  isSelected: boolean;
  isFavorite: boolean;
  onOpen: (index: number) => void;
  onToggleSelect: (fileId: string) => void;
  onToggleFavorite: (fileId: string) => void;
}

const PhotoTile = memo(function PhotoTile({
  photo,
  index,
  selectionMode,
  isSelected,
  isFavorite,
  onOpen,
  onToggleSelect,
  onToggleFavorite,
}: PhotoTileProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <div
      className={`group relative aspect-[4/3] overflow-hidden rounded-xl bg-white/5 border-2 transition-all duration-300 ${
        isSelected
          ? "border-[#d4af37] ring-4 ring-[#d4af37]/30"
          : "border-transparent hover:border-[#d4af37]/70 hover:shadow-xl"
      }`}
    >
      {/* Butonul principal acopera toata poza: deschide lightbox-ul sau selecteaza */}
      <button
        type="button"
        onClick={() => (selectionMode ? onToggleSelect(photo.fileId) : onOpen(index))}
        className="absolute inset-0 z-0 h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#d4af37]"
        aria-label={selectionMode ? `${isSelected ? "Deselectează" : "Selectează"} ${photo.filename}` : `Deschide ${photo.filename}`}
        aria-pressed={selectionMode ? isSelected : undefined}
      >
        {status === "loading" && <span className="absolute inset-0 animate-pulse bg-white/10" />}
        {status === "error" ? (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500">
            <ImageOff className="h-7 w-7" />
            <span className="text-xs">Previzualizare indisponibilă</span>
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={galleryApi.thumbnail(photo.fileId)}
            alt={photo.filename}
            loading="lazy"
            decoding="async"
            draggable={false}
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
              status === "loaded" ? "opacity-100" : "opacity-0"
            } ${isSelected ? "scale-[0.97]" : ""}`}
          />
        )}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </button>

      {/* Bifa de selectie */}
      {selectionMode && (
        <span
          className={`pointer-events-none absolute left-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-lg shadow-lg transition-colors ${
            isSelected ? "bg-[#d4af37] text-[#1e1e1e]" : "border-2 border-white/50 bg-black/60 text-white"
          }`}
          aria-hidden
        >
          {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
        </span>
      )}

      {/* Favorite: mereu vizibil pe mobil (nu exista hover), la hover pe desktop */}
      <button
        type="button"
        onClick={() => onToggleFavorite(photo.fileId)}
        className={`absolute bottom-2 right-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition-all hover:text-red-400 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] ${
          isFavorite ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        }`}
        aria-label={isFavorite ? "Scoate de la favorite" : "Adaugă la favorite"}
        aria-pressed={isFavorite}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
      </button>

      <span className="pointer-events-none absolute bottom-3 left-3 right-14 z-10 truncate text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
        {photo.filename}
      </span>
    </div>
  );
});
