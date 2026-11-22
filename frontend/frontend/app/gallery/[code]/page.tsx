"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import {
  Download,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  Share2,
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle
} from "lucide-react";

interface PhotoDto {
  id: number;
  filename: string;
  url: string;
  thumbnailUrl: string;
  fileId: string;
}

interface GalleryResponse {
  code: string;
  eventType: string;
  name: string;
  description?: string;
  photos: PhotoDto[];
  totalPhotos: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function GalleryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = use(params);
  const code = resolvedParams.code?.toUpperCase();

  const [gallery, setGallery] = useState<GalleryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selecție poze
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Lightbox
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // Drag / swipe states for lightbox
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragCurrentX, setDragCurrentX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    async function fetchGallery() {
      if (!code) return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/api/gallery/${code}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(`Evenimentul cu codul "${code}" nu a fost găsit.`);
          }
          throw new Error("Nu s-au putut încărca fotografiile evenimentului.");
        }
        const data: GalleryResponse = await res.json();
        setGallery(data);
      } catch (err: any) {
        setError(err.message || "A apărut o eroare la conectare.");
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
  }, [code]);

  const nextPhoto = useCallback(() => {
    if (!gallery || gallery.photos.length === 0) return;
    setActivePhotoIndex((prev) =>
      prev !== null ? (prev + 1) % gallery.photos.length : 0
    );
  }, [gallery]);

  const prevPhoto = useCallback(() => {
    if (!gallery || gallery.photos.length === 0) return;
    setActivePhotoIndex((prev) =>
      prev !== null
        ? (prev - 1 + gallery.photos.length) % gallery.photos.length
        : gallery.photos.length - 1
    );
  }, [gallery]);

  const closeLightbox = useCallback(() => {
    setActivePhotoIndex(null);
    setIsDragging(false);
    setDragStartX(null);
    setDragCurrentX(null);
  }, []);

  // Tastatură pentru lightbox
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (activePhotoIndex === null || !gallery) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhotoIndex, gallery, prevPhoto, nextPhoto, closeLightbox]);

  // Gesturi Mouse Drag & Touch Swipe pentru Lightbox
  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartX(e.touches[0].clientX);
    setDragCurrentX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || dragStartX === null) return;
    setDragCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging || dragStartX === null || dragCurrentX === null) {
      setIsDragging(false);
      return;
    }
    const deltaX = dragCurrentX - dragStartX;
    if (deltaX > 50) {
      prevPhoto();
    } else if (deltaX < -50) {
      nextPhoto();
    }
    setIsDragging(false);
    setDragStartX(null);
    setDragCurrentX(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragStartX(e.clientX);
    setDragCurrentX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || dragStartX === null) return;
    setDragCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging || dragStartX === null || dragCurrentX === null) {
      setIsDragging(false);
      return;
    }
    const deltaX = dragCurrentX - dragStartX;
    if (deltaX > 60) {
      prevPhoto();
    } else if (deltaX < -60) {
      nextPhoto();
    }
    setIsDragging(false);
    setDragStartX(null);
    setDragCurrentX(null);
  };

  // Toggle selecție pentru o poză
  const toggleSelectPhoto = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  // Toggle favorite
  const toggleFavorite = (fileId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  // Selectează / deselectează tot
  const handleSelectAll = () => {
    if (!gallery) return;
    if (selectedFileIds.length === gallery.photos.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(gallery.photos.map((p) => p.fileId));
    }
  };

  // Descărcare ZIP selecție
  const downloadZip = async (fileIds: string[], customName?: string) => {
    if (!gallery || fileIds.length === 0) return;
    try {
      setIsDownloadingZip(true);
      const res = await fetch(
        `${API_BASE_URL}/api/gallery/download/zip?galleryName=${encodeURIComponent(
          customName || gallery.name || code
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fileIds),
        }
      );

      if (!res.ok) throw new Error("Eroare la generarea arhivei ZIP");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${gallery.name || "FotoIT_" + code}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Descărcarea arhivei a eșuat: " + err.message);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Copiere link partajare
  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert("Link-ul galeriei a fost copiat în clipboard!");
    }
  };

  const activePhoto =
    gallery && activePhotoIndex !== null ? gallery.photos[activePhotoIndex] : null;

  const dragOffset =
    isDragging && dragStartX !== null && dragCurrentX !== null
      ? dragCurrentX - dragStartX
      : 0;

  const eventLabel =
    gallery?.eventType === "WEDDING"
      ? "💒 Nuntă"
      : gallery?.eventType === "SWEET_16"
      ? "🎂 Majorat"
      : "🎉 Eveniment";

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* Header Galerie (Centrat, Curat, Cu Toate Acțiunile Vizibile) */}
      <header className="sticky top-0 z-30 bg-[#1e1e1e]/95 backdrop-blur-md border-b border-[#d4af37]/20 px-4 sm:px-6 lg:px-8 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2.5 rounded-full bg-white/5 hover:bg-[#d4af37] text-[#d4af37] hover:text-[#1e1e1e] transition-all shadow-sm"
              title="Înapoi pe FotoIT"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-bold">
                  {eventLabel}
                </span>
                <span className="text-xs text-gray-400 font-mono tracking-widest uppercase">
                  Cod: {code}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-wide mt-0.5">
                {gallery?.name || `Galerie ${code}`}
              </h1>
            </div>
          </div>

          {/* Butoane de acțiune */}
          {gallery && gallery.photos.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  if (isSelectionMode) setSelectedFileIds([]);
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
                  isSelectionMode
                    ? "bg-[#d4af37] text-[#1e1e1e]"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>{isSelectionMode ? "Gata Selecție" : "Selectează Poze"}</span>
              </button>

              {isSelectionMode && (
                <button
                  onClick={handleSelectAll}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-gray-200 transition-colors"
                >
                  {selectedFileIds.length === gallery.photos.length
                    ? "Deselectează tot"
                    : "Selectează tot"}
                </button>
              )}

              {selectedFileIds.length > 0 ? (
                <button
                  onClick={() => downloadZip(selectedFileIds)}
                  disabled={isDownloadingZip}
                  className="px-5 py-2.5 rounded-xl text-sm font-extrabold bg-[#d4af37] text-[#1e1e1e] hover:bg-[#b8922d] transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isDownloadingZip ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Descarcă ({selectedFileIds.length})</span>
                </button>
              ) : (
                <button
                  onClick={() =>
                    downloadZip(gallery.photos.map((p) => p.fileId))
                  }
                  disabled={isDownloadingZip}
                  className="px-5 py-2.5 rounded-xl text-sm font-extrabold bg-gradient-to-r from-[#d4af37] to-[#b8922d] hover:opacity-95 text-[#1e1e1e] transition-all flex items-center gap-2 shadow-lg"
                >
                  {isDownloadingZip ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Descarcă Tot (.ZIP)</span>
                </button>
              )}

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 transition-colors"
                title="Copiază link-ul galeriei"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Corp Pagina */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading && (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin mb-4" />
            <p className="text-gray-300 text-lg font-medium">
              Se încarcă fotografiile evenimentului...
            </p>
          </div>
        )}

        {error && (
          <div className="py-24 max-w-md mx-auto text-center px-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Galerie indisponibilă
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8922d] text-[#1e1e1e] font-extrabold hover:opacity-95 transition-all shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Înapoi pe FotoIT</span>
            </Link>
          </div>
        )}

        {gallery && (
          <>
            {/* Descriere dacă există */}
            {gallery.description && (
              <div className="mb-8 p-6 rounded-2xl bg-[#1e1e1e] border border-[#d4af37]/20 text-gray-300 text-base leading-relaxed text-center max-w-3xl mx-auto shadow-md">
                {gallery.description}
              </div>
            )}

            {/* Bara de status */}
            <div className="flex items-center justify-between text-sm text-gray-400 mb-6 pb-3 border-b border-white/10 font-medium">
              <span>{gallery.photos.length} fotografii în album</span>
              {favorites.length > 0 && (
                <span className="text-[#d4af37] flex items-center gap-1.5 font-bold">
                  <Heart className="w-4 h-4 fill-[#d4af37]" /> {favorites.length}{" "}
                  favorite
                </span>
              )}
            </div>

            {/* Grid Fotografii */}
            {gallery.photos.length === 0 ? (
              <div className="text-center py-28 text-gray-400">
                <Sparkles className="w-14 h-14 text-[#d4af37] mx-auto mb-4 opacity-70" />
                <p className="text-xl font-bold text-white mb-1">
                  Albumul nu conține încă fotografii sincronizate.
                </p>
                <p className="text-sm text-gray-400">
                  Te rugăm să revii curând sau să iei legătura cu fotograful.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {gallery.photos.map((photo, index) => {
                  const isSelected = selectedFileIds.includes(photo.fileId);
                  const isFav = favorites.includes(photo.fileId);

                  return (
                    <div
                      key={photo.fileId}
                      className={`group relative aspect-[4/3] rounded-xl overflow-hidden bg-white/5 cursor-pointer border-2 transition-all duration-300 ${
                        isSelected
                          ? "border-[#d4af37] ring-4 ring-[#d4af37]/30 scale-[0.98]"
                          : "border-transparent hover:border-[#d4af37]/70 hover:shadow-xl"
                      }`}
                      onClick={() => {
                        if (isSelectionMode) {
                          toggleSelectPhoto(photo.fileId);
                        } else {
                          setActivePhotoIndex(index);
                        }
                      }}
                    >
                      <img
                        src={`${API_BASE_URL}/api/gallery/thumbnail/${photo.fileId}`}
                        alt={photo.filename}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Overlay discret */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                        <span className="text-xs text-white truncate max-w-[70%] font-medium">
                          {photo.filename}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => toggleFavorite(photo.fileId, e)}
                            className="p-2 rounded-full bg-black/60 text-white hover:text-red-400 transition-colors"
                            title="Favorite"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isFav ? "fill-red-500 text-red-500" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Checkbox selecție */}
                      {isSelectionMode && (
                        <div className="absolute top-2 left-2 z-10">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shadow-lg ${
                              isSelected
                                ? "bg-[#d4af37] text-[#1e1e1e]"
                                : "bg-black/70 text-white border-2 border-white/40"
                            }`}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* LIGHTBOX CU SLIDE DE PE MOUSE / TOUCH + BUTOANE MARI */}
      {activePhoto && activePhotoIndex !== null && gallery && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none"
          onClick={closeLightbox}
        >
          {/* Bara de sus Lightbox */}
          <div
            className="p-4 sm:p-6 flex items-center justify-between text-white bg-gradient-to-b from-black/80 to-transparent relative z-30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#d4af37]/20 text-[#d4af37] text-xs font-bold tracking-wider">
                {activePhotoIndex + 1} / {gallery.photos.length}
              </span>
              <span className="text-sm font-medium text-gray-300 hidden sm:inline truncate max-w-xs">
                {activePhoto.filename}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href={`${API_BASE_URL}/api/gallery/download/${activePhoto.fileId}?filename=${encodeURIComponent(
                  activePhoto.filename
                )}`}
                className="p-2.5 rounded-full bg-white/10 hover:bg-[#d4af37] text-white hover:text-[#1e1e1e] transition-colors shadow-lg"
                title="Descarcă poza originală"
              >
                <Download className="w-5 h-5" />
              </a>

              <button
                onClick={() => toggleFavorite(activePhoto.fileId)}
                className="p-2.5 rounded-full bg-white/10 hover:text-red-400 transition-colors shadow-lg"
                title="Favorite"
              >
                <Heart
                  className={`w-5 h-5 ${
                    favorites.includes(activePhoto.fileId)
                      ? "fill-red-500 text-red-500"
                      : ""
                  }`}
                />
              </button>

              <button
                onClick={closeLightbox}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors shadow-lg"
                title="Închide (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Zona centrală cu imagine și gesturi mouse/touch */}
          <div
            className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Buton Anterior (Mare, Vizibil, Z-Index Ridicat) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              className="absolute left-3 sm:left-6 z-30 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/60 hover:bg-[#d4af37] text-white hover:text-[#1e1e1e] border border-white/20 hover:border-[#d4af37] flex items-center justify-center transition-all duration-200 shadow-2xl hover:scale-110 active:scale-90"
              title="Anterior (Săgeată stânga)"
            >
              <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>

            {/* Fotografie cu deplasare drag */}
            <div
              className="relative max-h-[82vh] max-w-full transition-transform duration-150 ease-out"
              style={{
                transform: `translateX(${dragOffset}px)`,
              }}
            >
              <img
                src={`${API_BASE_URL}/api/gallery/image/${activePhoto.fileId}`}
                alt={activePhoto.filename}
                className="max-h-[82vh] max-w-full object-contain rounded-lg shadow-2xl pointer-events-none select-none"
                draggable={false}
              />
            </div>

            {/* Buton Următor (Mare, Vizibil, Z-Index Ridicat) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              className="absolute right-3 sm:right-6 z-30 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/60 hover:bg-[#d4af37] text-white hover:text-[#1e1e1e] border border-white/20 hover:border-[#d4af37] flex items-center justify-center transition-all duration-200 shadow-2xl hover:scale-110 active:scale-90"
              title="Următor (Săgeată dreapta)"
            >
              <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>
          </div>

          {/* Footer Lightbox cu indicații */}
          <div
            className="p-3 text-center text-xs text-gray-400 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <span>↔️ Trage cu mouse-ul sau glisează pe ecran pentru navigare</span>
            <span className="hidden sm:inline">• Săgeți tastatură • Esc pentru închidere</span>
          </div>
        </div>
      )}
    </div>
  );
}
