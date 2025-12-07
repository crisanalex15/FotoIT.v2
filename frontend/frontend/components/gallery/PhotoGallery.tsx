"use client";

import { GalleryResponse, EventType } from "@/types/gallery";
import { useState } from "react";

interface ImageLoadState {
  [key: number]: "loading" | "loaded" | "error";
}

interface PhotoGalleryProps {
  gallery: GalleryResponse;
}

/**
 * Componenta pentru afișarea galeriei foto
 * 
 * Afișează pozele într-un grid responsive cu lightbox pentru vizualizare
 */
export default function PhotoGallery({ gallery }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [imageStates, setImageStates] = useState<ImageLoadState>({});

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
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case EventType.SWEET_16:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case EventType.EVENT:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (gallery.photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Nu există poze în această galerie.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Galerie */}
      <div className="mb-8 text-center">
        <div className="inline-block mb-4">
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${getEventTypeColor(
              gallery.eventType
            )}`}
          >
            {getEventTypeLabel(gallery.eventType)}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          {gallery.name}
        </h1>
        {gallery.description && (
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {gallery.description}
          </p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          {gallery.totalPhotos} {gallery.totalPhotos === 1 ? "poză" : "poze"}
        </p>
      </div>

      {/* Grid cu Poze - Design elegant */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gallery.photos.map((photo, index) => {
          // Folosește thumbnail dacă există, altfel folosește URL-ul complet
          const imageUrl = photo.thumbnailUrl || photo.url;
          const fullImageUrl = photo.url;
          const hasError = imageStates[photo.id] === "error";
          
          return (
            <div
              key={photo.id}
              className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group bg-gray-100 dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              onClick={() => setSelectedPhoto(fullImageUrl)}
            >
              {!hasError && imageUrl ? (
                <img
                  src={imageUrl}
                  alt={photo.filename}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                  onLoad={() => {
                    setImageStates((prev) => ({ ...prev, [photo.id]: "loaded" }));
                  }}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    // Dacă thumbnail-ul nu funcționează, încearcă URL-ul complet
                    if (photo.thumbnailUrl && img.src === photo.thumbnailUrl && photo.url) {
                      img.src = photo.url;
                      return;
                    }
                    
                    // Dacă nici URL-ul complet nu funcționează, marchează ca eroare
                    setImageStates((prev) => ({ ...prev, [photo.id]: "error" }));
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <span className="text-gray-500 text-sm font-semibold text-center px-2">
                    {photo.filename || `Poză ${index + 1}`}
                  </span>
                </div>
              )}
              
              {/* Overlay la hover */}
              {!hasError && imageUrl && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-semibold text-lg">
                    👁️ Vezi
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl font-bold z-10"
              onClick={() => setSelectedPhoto(null)}
            >
              ×
            </button>
            <img
              src={selectedPhoto}
              alt="Poză selectată"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

