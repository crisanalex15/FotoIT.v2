"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckSquare, Download, Heart, Share2, X } from "lucide-react";
import Lightbox, { lightboxIconButton, type LightboxItem } from "@/components/gallery/Lightbox";
import PhotoGrid from "@/components/client-gallery/PhotoGrid";
import { GalleryEmptyState, GalleryErrorState, GallerySkeleton } from "@/components/client-gallery/GalleryStates";
import { useToast } from "@/components/client-gallery/Toast";
import { fetchGallery, GalleryError, galleryApi, type GalleryResponse } from "@/lib/api";
import { startDownload } from "@/lib/download";

/** Trebuie sa fie <= app.zip.max-files din backend */
const MAX_ZIP_FILES = 500;

const EVENT_LABELS: Record<string, string> = {
  WEDDING: "💒 Nuntă",
  SWEET_16: "🎂 Majorat",
};

const btnBase =
  "inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-sm font-bold whitespace-nowrap transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e1e1e] " +
  "disabled:opacity-50 disabled:cursor-not-allowed";
const btnGhost = `${btnBase} bg-white/10 text-white hover:bg-white/20`;
const btnPrimary = `${btnBase} bg-gradient-to-r from-[#d4af37] to-[#b8922d] text-[#1e1e1e] shadow-lg hover:opacity-90`;

function useFavorites(code: string) {
  const key = `fotoit:favorites:${code}`;
  // Favoritele sunt afisate doar dupa ce galeria s-a incarcat in browser, deci citirea
  // directa din localStorage nu produce diferente intre server si client.
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = window.localStorage.getItem(key);
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      return new Set();
    }
  });

  const toggle = useCallback(
    (fileId: string) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(fileId)) next.delete(fileId);
        else next.add(fileId);
        try {
          window.localStorage.setItem(key, JSON.stringify([...next]));
        } catch {
          /* stocare indisponibila (mod privat) - favoritele raman doar in sesiune */
        }
        return next;
      });
    },
    [key]
  );

  return { favorites, toggle };
}

export default function GalleryPage({ params }: { params: Promise<{ code: string }> }) {
  const code = (use(params).code ?? "").toUpperCase();

  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${code}#${reloadKey}`;
  // Rezultatul e legat de cererea care l-a produs; o cerere noua inseamna automat "se incarca"
  const [result, setResult] = useState<{ key: string; gallery?: GalleryResponse; error?: GalleryError } | null>(null);
  const current = result?.key === requestKey ? result : null;
  const gallery = current?.gallery ?? null;
  const error = current?.error ?? null;

  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { favorites, toggle: toggleFavorite } = useFavorites(code);
  const { show: showToast, toast } = useToast();

  useEffect(() => {
    if (!code) return;
    const controller = new AbortController();
    fetchGallery(code, controller.signal)
      .then((data) => setResult({ key: requestKey, gallery: data }))
      .catch((err: unknown) => {
        if ((err as Error).name === "AbortError") return;
        setResult({
          key: requestKey,
          error: err instanceof GalleryError ? err : new GalleryError("A apărut o eroare neașteptată.", 0),
        });
      });
    return () => controller.abort();
  }, [code, requestKey]);

  useEffect(() => {
    if (gallery?.name) document.title = `${gallery.name} | FotoIT`;
  }, [gallery?.name]);

  const allPhotos = useMemo(() => gallery?.photos ?? [], [gallery]);
  const photos = useMemo(
    () => (favoritesOnly ? allPhotos.filter((p) => favorites.has(p.fileId)) : allPhotos),
    [allPhotos, favorites, favoritesOnly]
  );

  const lightboxItems: LightboxItem[] = useMemo(
    () =>
      photos.map((p) => ({
        id: p.fileId,
        src: galleryApi.preview(p.fileId),
        placeholder: galleryApi.thumbnail(p.fileId),
        alt: p.filename,
        title: p.filename,
      })),
    [photos]
  );

  const toggleSelect = useCallback((fileId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  }, []);

  const exitSelection = () => {
    setSelectionMode(false);
    setSelected(new Set());
  };

  const allVisibleSelected = photos.length > 0 && photos.every((p) => selected.has(p.fileId));
  const toggleSelectAll = () =>
    setSelected(allVisibleSelected ? new Set() : new Set(photos.map((p) => p.fileId)));

  const downloadSelected = () => {
    if (!gallery || selected.size === 0) return;
    if (selected.size > MAX_ZIP_FILES) {
      showToast(`Poți descărca maxim ${MAX_ZIP_FILES} fotografii o dată.`);
      return;
    }
    startDownload(galleryApi.zip(gallery.code, gallery.name), {
      method: "POST",
      fields: { fileIds: [...selected] },
    });
    showToast(`Se pregătește arhiva cu ${selected.size} fotografii. Descărcarea începe imediat.`);
  };

  const downloadAll = () => {
    if (!gallery) return;
    startDownload(galleryApi.downloadAll(gallery.code));
    showToast("Se pregătește arhiva cu toate fotografiile. Descărcarea începe imediat.");
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: gallery?.name ?? "Galerie FotoIT", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast("Link-ul galeriei a fost copiat.");
    } catch (err) {
      if ((err as Error).name !== "AbortError") showToast("Link-ul nu a putut fi copiat.");
    }
  };

  const hasPhotos = allPhotos.length > 0;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#141414] text-white">
      {/* Bara galeriei: lipita sub header-ul site-ului (h-20) */}
      <div className="sticky top-20 z-30 border-b border-[#d4af37]/20 bg-[#1e1e1e]/95 shadow-lg backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-4 sm:px-6 md:flex-row md:justify-between lg:px-8">
          <div className="flex w-full min-w-0 items-center gap-3 md:w-auto">
            <Link
              href="/"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-[#d4af37] transition-colors hover:bg-[#d4af37] hover:text-[#1e1e1e]"
              aria-label="Înapoi pe FotoIT"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#d4af37]/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                  {EVENT_LABELS[gallery?.eventType ?? ""] ?? "🎉 Eveniment"}
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-gray-400">Cod: {code}</span>
              </div>
              <h1 className="mt-0.5 truncate text-xl font-extrabold tracking-wide sm:text-2xl md:text-3xl">
                {gallery?.name || `Galerie ${code}`}
              </h1>
            </div>
          </div>

          {hasPhotos && (
            <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:gap-3 md:w-auto md:justify-end">
              {selectionMode ? (
                <>
                  <button type="button" onClick={toggleSelectAll} className={btnGhost}>
                    {allVisibleSelected ? "Deselectează tot" : "Selectează tot"}
                  </button>
                  <button
                    type="button"
                    onClick={downloadSelected}
                    disabled={selected.size === 0}
                    className={btnPrimary}
                  >
                    <Download className="h-4 w-4" />
                    <span>Descarcă ({selected.size})</span>
                  </button>
                  <button type="button" onClick={exitSelection} className={btnGhost} aria-label="Ieși din selecție">
                    <X className="h-4 w-4" />
                    <span>Gata</span>
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => setSelectionMode(true)} className={btnGhost}>
                    <CheckSquare className="h-4 w-4" />
                    <span>Selectează</span>
                  </button>
                  <button type="button" onClick={downloadAll} className={btnPrimary}>
                    <Download className="h-4 w-4" />
                    <span>Descarcă tot</span>
                  </button>
                  <button
                    type="button"
                    onClick={share}
                    className={`${btnGhost} w-11 px-0`}
                    aria-label="Distribuie galeria"
                    title="Distribuie galeria"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {!gallery && !error && <GallerySkeleton />}

        {error && (
          <GalleryErrorState
            message={error.message}
            canRetry={error.status !== 404 && error.status !== 400}
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        )}

        {gallery && (
          <>
            {gallery.description && (
              <p className="mx-auto mb-8 max-w-3xl rounded-2xl border border-[#d4af37]/20 bg-[#1e1e1e] p-6 text-center leading-relaxed text-gray-300 shadow-md">
                {gallery.description}
              </p>
            )}

            {hasPhotos && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 text-sm font-medium text-gray-400">
                <span>
                  {selectionMode
                    ? `${selected.size} din ${photos.length} selectate`
                    : `${allPhotos.length} fotografii în album`}
                </span>
                <div className="inline-flex rounded-full bg-white/5 p-1" role="group" aria-label="Filtru fotografii">
                  <button
                    type="button"
                    onClick={() => setFavoritesOnly(false)}
                    aria-pressed={!favoritesOnly}
                    className={`inline-flex h-8 items-center rounded-full px-4 text-xs font-bold transition-colors ${
                      !favoritesOnly ? "bg-[#d4af37] text-[#1e1e1e]" : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Toate
                  </button>
                  <button
                    type="button"
                    onClick={() => setFavoritesOnly(true)}
                    aria-pressed={favoritesOnly}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-xs font-bold transition-colors ${
                      favoritesOnly ? "bg-[#d4af37] text-[#1e1e1e]" : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${favoritesOnly ? "fill-current" : ""}`} />
                    Favorite ({favorites.size})
                  </button>
                </div>
              </div>
            )}

            {photos.length === 0 ? (
              <GalleryEmptyState favoritesOnly={favoritesOnly && hasPhotos} />
            ) : (
              <PhotoGrid
                key={favoritesOnly ? "fav" : "all"}
                photos={photos}
                selectionMode={selectionMode}
                selected={selected}
                favorites={favorites}
                onOpen={setActiveIndex}
                onToggleSelect={toggleSelect}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </>
        )}
      </section>

      {activeIndex !== null && lightboxItems[activeIndex] && (
        <Lightbox
          items={lightboxItems}
          index={activeIndex}
          onIndexChange={setActiveIndex}
          onClose={() => setActiveIndex(null)}
          actions={(item) => (
            <>
              <a
                href={galleryApi.download(item.id)}
                className={lightboxIconButton}
                aria-label="Descarcă originalul"
                title="Descarcă originalul"
              >
                <Download className="h-5 w-5" />
              </a>
              <button
                type="button"
                onClick={() => toggleFavorite(item.id)}
                className={lightboxIconButton}
                aria-label={favorites.has(item.id) ? "Scoate de la favorite" : "Adaugă la favorite"}
                aria-pressed={favorites.has(item.id)}
              >
                <Heart className={`h-5 w-5 ${favorites.has(item.id) ? "fill-red-500 text-red-500" : ""}`} />
              </button>
            </>
          )}
        />
      )}

      {toast}
    </div>
  );
}
