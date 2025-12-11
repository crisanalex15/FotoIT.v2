"use client";

import { GalleryResponse, EventType, Photo } from "@/types/gallery";
import { useState, useEffect, useRef, useCallback } from "react";
import { getGalleryPaginated } from "@/lib/api";

interface ImageLoadState {
  [key: number]: "loading" | "loaded" | "error";
}

interface PhotoGalleryProps {
  gallery: GalleryResponse;
}

const PHOTOS_PER_PAGE = 20;

/**
 * Componenta pentru afișarea galeriei foto cu infinite scroll
 *
 * Afișează pozele într-un grid responsive cu lightbox pentru vizualizare
 * și încarcă mai multe poze când utilizatorul face scroll
 */
export default function PhotoGallery({
  gallery: initialGallery,
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());
  const [imageStates, setImageStates] = useState<ImageLoadState>({});
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string>("");

  // Infinite scroll state
  const [photos, setPhotos] = useState<Photo[]>(initialGallery.photos);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(
    initialGallery.photos.length < initialGallery.totalPhotos
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const totalPhotos = initialGallery.totalPhotos;

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Funcție pentru încărcare mai multe poze
  const loadMorePhotos = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await getGalleryPaginated(
        initialGallery.code,
        nextPage,
        PHOTOS_PER_PAGE
      );

      if (response.photos && response.photos.length > 0) {
        setPhotos((prev) => [...prev, ...response.photos]);
        setCurrentPage(nextPage);
        setHasMore(
          photos.length + response.photos.length < response.totalPhotos
        );
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Eroare la încărcarea pozelor:", error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore, initialGallery.code, photos.length]);

  // Intersection Observer pentru infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMorePhotos();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, loadMorePhotos]);

  // Navigare cu tastatură în lightbox
  useEffect(() => {
    if (!selectedPhoto) return;

    const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < photos.length - 1;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasPrevious) {
        setSelectedPhoto(photos[currentIndex - 1]);
      } else if (e.key === "ArrowRight" && hasNext) {
        setSelectedPhoto(photos[currentIndex + 1]);
      } else if (e.key === "Escape") {
        setSelectedPhoto(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, photos]);

  const getEventTypeLabel = (type: EventType): string => {
    switch (type) {
      case EventType.WEDDING:
        return "💒 Nuntă";
      case EventType.SWEET_16:
        return "🎂 Majorată";
      case EventType.EVENT:
        return "🎉 Eveniment";
      default:
        return "📸 Galerie";
    }
  };

  const getEventTypeColor = (type: EventType): string => {
    switch (type) {
      case EventType.WEDDING:
        return "bg-[#d4af37] text-[#1e1e1e]";
      case EventType.SWEET_16:
        return "bg-[#d4af37] text-[#1e1e1e]";
      case EventType.EVENT:
        return "bg-[#d4af37] text-[#1e1e1e]";
      default:
        return "bg-[#d4af37] text-[#1e1e1e]";
    }
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedPhotos(new Set());
    }
  };

  const togglePhotoSelection = (photoId: number) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  // Funcție interna pentru descărcare fără loading (folosită în fallback)
  const downloadPhotoInternal = async (photo: Photo) => {
    try {
      const url = photo.fileId
        ? `${API_BASE_URL}/api/gallery/download/${
            photo.fileId
          }?filename=${encodeURIComponent(photo.filename)}`
        : photo.url;

      // Pentru descărcări din API, așteptăm răspunsul
      if (photo.fileId) {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Eroare la descărcare");
        }
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = photo.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = photo.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Delay mic pentru a permite browser-ului să proceseze descărcarea
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error("Eroare la descărcare:", error);
      throw error;
    }
  };

  const downloadPhoto = async (photo: Photo) => {
    setIsDownloading(true);
    setDownloadProgress(`Se descarcă ${photo.filename}...`);
    try {
      await downloadPhotoInternal(photo);
    } catch (error) {
      alert("Eroare la descărcarea pozei. Te rog încearcă din nou.");
    } finally {
      setIsDownloading(false);
      setDownloadProgress("");
    }
  };

  const downloadSelected = async () => {
    const selected = photos.filter((p) => selectedPhotos.has(p.id));
    if (selected.length === 0) return;

    setIsDownloading(true);
    setDownloadProgress(
      `Se pregătește ZIP-ul cu ${selected.length} ${
        selected.length === 1 ? "poză" : "poze"
      }...`
    );

    try {
      // Descarcă ca ZIP
      const fileIds = selected.map((p) => p.fileId).filter((id) => id);
      if (fileIds.length === 0) {
        // Fallback: descarcă individual dacă nu avem fileId
        setDownloadProgress(
          `Se descarcă ${selected.length} ${
            selected.length === 1 ? "poză" : "poze"
          }...`
        );
        for (let i = 0; i < selected.length; i++) {
          const photo = selected[i];
          setDownloadProgress(
            `Se descarcă ${i + 1}/${selected.length}: ${photo.filename}...`
          );
          try {
            await downloadPhotoInternal(photo);
          } catch (error) {
            console.error(`Eroare la descărcarea ${photo.filename}:`, error);
          }
        }
        setSelectedPhotos(new Set());
        setIsSelectMode(false);
        setIsDownloading(false);
        setDownloadProgress("");
        return;
      }

      setDownloadProgress("Se creează arhiva ZIP...");
      const response = await fetch(
        `${API_BASE_URL}/api/gallery/download/zip?galleryName=${encodeURIComponent(
          initialGallery.name
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fileIds),
        }
      );

      if (!response.ok) {
        throw new Error("Eroare la descărcarea ZIP-ului");
      }

      setDownloadProgress("Se descarcă arhiva ZIP...");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${initialGallery.name || "galerie"}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Delay mic pentru a permite browser-ului să proceseze descărcarea
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSelectedPhotos(new Set());
      setIsSelectMode(false);
    } catch (error) {
      console.error("Eroare la descărcare ZIP:", error);
      setDownloadProgress("Eroare la ZIP, se descarcă individual...");
      // Fallback: descarcă individual
      for (let i = 0; i < selected.length; i++) {
        const photo = selected[i];
        setDownloadProgress(
          `Se descarcă ${i + 1}/${selected.length}: ${photo.filename}...`
        );
        try {
          await downloadPhotoInternal(photo);
        } catch (err) {
          console.error(`Eroare la descărcarea ${photo.filename}:`, err);
        }
      }
      setSelectedPhotos(new Set());
      setIsSelectMode(false);
    } finally {
      setIsDownloading(false);
      setDownloadProgress("");
    }
  };

  if (photos.length === 0 && !isLoadingMore) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Nu există poze în această galerie.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-[#f4f4f4] to-white min-h-screen py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-8" suppressHydrationWarning>
      {/* Loading Overlay pentru Descărcări */}
      {isDownloading && (
        <div className="fixed inset-0 bg-[#1e1e1e]/90 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-[#d4af37] border-t-transparent"></div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#1e1e1e] mb-2">
              Se descarcă...
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {downloadProgress || "Te rog așteaptă"}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Nu închide această pagină
            </p>
          </div>
        </div>
      )}
      {/* Header Galerie */}
      <div className="mb-6 sm:mb-8 text-center" suppressHydrationWarning>
        {/* Butoane de acțiune */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center" suppressHydrationWarning>
          <button
            onClick={toggleSelectMode}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-semibold transition-all w-full sm:w-auto ${
              isSelectMode
                ? "bg-[#d4af37] text-[#1e1e1e] hover:bg-[#b8922d]"
                : "bg-transparent border-2 border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#1e1e1e]"
            }`}
          >
            {isSelectMode ? "Anulează selecția" : "Selectează poze"}
          </button>
          {isSelectMode && selectedPhotos.size > 0 && (
            <button
              onClick={downloadSelected}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-semibold bg-[#d4af37] text-[#1e1e1e] hover:bg-[#b8922d] transition-all w-full sm:w-auto"
            >
              Descarcă {selectedPhotos.size}{" "}
              {selectedPhotos.size === 1 ? "poză" : "poze"}
            </button>
          )}
        </div>
      </div>

      {/* Grid cu Poze - Design elegant */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6" suppressHydrationWarning>
        {photos.map((photo, index) => {
          // Construiește URL-ul pentru thumbnail
          // Dacă thumbnailUrl este relativ (începe cu /api/), adaugă API_BASE_URL
          let imageUrl = photo.thumbnailUrl || photo.url;
          if (imageUrl && imageUrl.startsWith("/api/")) {
            imageUrl = `${API_BASE_URL}${imageUrl}`;
          }
          const fullImageUrl = photo.url?.startsWith("/api/")
            ? `${API_BASE_URL}${photo.url}`
            : photo.url;
          const hasError = imageStates[photo.id] === "error";
          const isSelected = selectedPhotos.has(photo.id);

          return (
            <div
              key={photo.id}
              className={`relative aspect-square overflow-hidden rounded-lg cursor-pointer group bg-[#1e1e1e] shadow-lg hover:shadow-2xl transition-all duration-300 ${
                isSelectMode ? "" : "hover:scale-105"
              } ${isSelected ? "ring-4 ring-[#d4af37]" : ""}`}
              onClick={() => {
                if (isSelectMode) {
                  togglePhotoSelection(photo.id);
                } else {
                  setSelectedPhoto(photo);
                }
              }}
            >
              {!hasError && imageUrl ? (
                <>
                  {/* Placeholder skeleton în timpul încărcării */}
                  {imageStates[photo.id] !== "loaded" && imageStates[photo.id] !== "error" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#2a2a2a] animate-pulse flex items-center justify-center z-0">
                      <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <img
                    src={imageUrl}
                    alt={photo.filename}
                    className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
                      imageStates[photo.id] === "loaded" || imageStates[photo.id] === undefined
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => {
                      setImageStates((prev) => ({
                        ...prev,
                        [photo.id]: "loaded",
                      }));
                    }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      console.error(`Eroare la încărcarea thumbnail-ului pentru ${photo.filename}:`, img.src);
                      
                      // Dacă thumbnail-ul nu funcționează, încearcă URL-ul complet
                      if (
                        photo.thumbnailUrl &&
                        img.src.includes(photo.thumbnailUrl) &&
                        photo.url
                      ) {
                        const fallbackUrl = photo.url?.startsWith("/api/")
                          ? `${API_BASE_URL}${photo.url}`
                          : photo.url;
                        console.log(`Încercare fallback la URL complet: ${fallbackUrl}`);
                        img.src = fallbackUrl;
                        return;
                      }

                      // Dacă nici URL-ul complet nu funcționează, marchează ca eroare
                      console.error(`Nu s-a putut încărca nici thumbnail-ul, nici URL-ul complet pentru ${photo.filename}`);
                      setImageStates((prev) => ({
                        ...prev,
                        [photo.id]: "error",
                      }));
                    }}
                  />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1e1e1e] to-[#2a2a2a]">
                  <span className="text-[#d4af37] text-sm font-semibold text-center px-2">
                    {photo.filename || `Poză ${index + 1}`}
                  </span>
                </div>
              )}

              {/* Overlay la hover */}
              {!hasError && imageUrl && !isSelectMode && (
                <div className="absolute inset-0 bg-[#1e1e1e]/0 group-hover:bg-[#1e1e1e]/40 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-semibold text-lg">
                    Vezi
                  </span>
                </div>
              )}

              {/* Checkbox pentru selecție */}
              {isSelectMode && (
                <div className="absolute top-2 left-2 z-10">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-[#d4af37] border-[#d4af37]"
                        : "bg-white/90 border-[#d4af37]"
                    }`}
                  >
                    {isSelected && (
                      <span className="text-[#1e1e1e] text-sm font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Buton descărcare individual */}
              {!isSelectMode && !hasError && imageUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadPhoto(photo);
                  }}
                  className="absolute bottom-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-[#d4af37] hover:bg-[#b8922d] text-[#1e1e1e] p-1.5 sm:p-2 rounded-full z-[5] shadow-lg touch-manipulation flex items-center justify-center"
                  title="Descarcă poza"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="20px"
                    viewBox="0 -960 960 960"
                    width="20px"
                    className="sm:h-6 sm:w-6"
                    fill="#1e1e1e"
                  >
                    <path d="M160-80v-80h640v80H160Zm320-160L200-600h160v-280h240v280h160L480-240Zm0-130 116-150h-76v-280h-80v280h-76l116 150Zm0-150Z" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div ref={observerTarget} className="w-full py-8 flex justify-center">
          {isLoadingMore && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600">
                Se încarcă mai multe poze...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto &&
        (() => {
          const currentIndex = photos.findIndex(
            (p) => p.id === selectedPhoto.id
          );
          const hasPrevious = currentIndex > 0;
          const hasNext = currentIndex < photos.length - 1;

          const goToPrevious = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (hasPrevious) {
              setSelectedPhoto(photos[currentIndex - 1]);
            }
          };

          const goToNext = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (hasNext) {
              setSelectedPhoto(photos[currentIndex + 1]);
            }
          };

          let touchStartX = 0;
          let touchEndX = 0;

          const handleTouchStart = (e: React.TouchEvent) => {
            touchStartX = e.changedTouches[0].screenX;
          };

          const handleTouchEnd = (e: React.TouchEvent) => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
              if (diff > 0 && hasNext) {
                // Swipe left - next
                setSelectedPhoto(photos[currentIndex + 1]);
              } else if (diff < 0 && hasPrevious) {
                // Swipe right - previous
                setSelectedPhoto(photos[currentIndex - 1]);
              }
            }
          };

          return (
            <div
              className="fixed inset-0 bg-[#1e1e1e] bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
              onClick={() => setSelectedPhoto(null)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="relative max-w-7xl max-h-full w-full flex items-center justify-center">
                {/* Buton închidere */}
                <button
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 text-[#d4af37] hover:text-[#f5e6ca] text-3xl sm:text-4xl font-bold z-10 transition-colors touch-manipulation p-2"
                  onClick={() => setSelectedPhoto(null)}
                  aria-label="Închide"
                >
                  ×
                </button>

                {/* Buton anterior */}
                {hasPrevious && (
                  <button
                    onClick={goToPrevious}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-[#d4af37] hover:text-[#f5e6ca] text-3xl sm:text-4xl font-bold z-10 bg-[#1e1e1e]/80 hover:bg-[#d4af37] hover:text-[#1e1e1e] border-2 border-[#d4af37] rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all leading-none touch-manipulation"
                    aria-label="Poză anterioară"
                  >
                    <span className="relative -left-0.5 mb-1 sm:mb-2">‹</span>
                  </button>
                )}

                {/* Imagine */}
                <img
                  src={
                    selectedPhoto.url?.startsWith("/api/")
                      ? `${API_BASE_URL}${selectedPhoto.url}`
                      : selectedPhoto.url
                  }
                  alt={selectedPhoto.filename || "Poză selectată"}
                  className="max-w-full max-h-[85vh] sm:max-h-[90vh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />

                {/* Buton următor */}
                {hasNext && (
                  <button
                    onClick={goToNext}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-[#d4af37] hover:text-[#f5e6ca] text-3xl sm:text-4xl font-bold z-10 bg-[#1e1e1e]/80 hover:bg-[#d4af37] hover:text-[#1e1e1e] border-2 border-[#d4af37] rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all leading-none touch-manipulation"
                    aria-label="Poză următoare"
                  >
                    <span className="relative -right-0.5 mb-1 sm:mb-2">›</span>
                  </button>
                )}

                {/* Info și butoane */}
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
                  <div className="text-[#d4af37] text-xs sm:text-sm bg-[#1e1e1e]/80 border border-[#d4af37] px-2 sm:px-3 py-1 rounded">
                    {currentIndex + 1} / {totalPhotos}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPhoto(selectedPhoto);
                      }}
                      className="bg-[#d4af37] hover:bg-[#b8922d] text-[#1e1e1e] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-semibold transition-all touch-manipulation"
                    >
                      📥 Descarcă
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
