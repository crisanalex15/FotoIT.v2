"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight, X, Eye } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function GallerySwiper() {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  // Drag / swipe states for lightbox
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragCurrentX, setDragCurrentX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Lista de imagini (thumbnails și versiuni mari)
  const images = [
    { thumbnail: "/gallery/thumbnail01.jpg", full: "/gallery/big/thumbnail01.jpg", title: "Nuntă — Momente de neuitat" },
    { thumbnail: "/gallery/thumbnail02.jpg", full: "/gallery/big/thumbnail02.jpg", title: "Portret — Naturalețe și expresie" },
    { thumbnail: "/gallery/thumbnail03.jpg", full: "/gallery/big/thumbnail03.jpg", title: "Eveniment — Atmosferă de sărbătoare" },
    { thumbnail: "/gallery/thumbnail04.jpg", full: "/gallery/big/thumbnail04.jpg", title: "Nuntă — Emoții sincere" },
    { thumbnail: "/gallery/thumbnail05.jpg", full: "/gallery/big/thumbnail05.jpg", title: "Majorat — Energie și bucurie" },
    { thumbnail: "/gallery/thumbnail06.jpg", full: "/gallery/big/thumbnail06.jpg", title: "Portret — Detalii și lumină" },
    { thumbnail: "/gallery/thumbnail07.jpg", full: "/gallery/big/thumbnail07.jpg", title: "Eveniment — Amintiri vibrante" },
    { thumbnail: "/gallery/thumbnail08.jpg", full: "/gallery/big/thumbnail08.jpg", title: "Nuntă — Povestea voastră" },
    { thumbnail: "/gallery/thumbnail09.jpg", full: "/gallery/big/thumbnail09.jpg", title: "Majorat — Seară de neuitat" },
    { thumbnail: "/gallery/thumbnail10.jpg", full: "/gallery/big/thumbnail10.jpg", title: "Portret — Stil și eleganță" },
  ];

  // Navigare lightbox
  const nextPhoto = useCallback(() => {
    setSelectedPhotoIndex((prev) => (prev !== null ? (prev + 1) % images.length : 0));
  }, [images.length]);

  const prevPhoto = useCallback(() => {
    setSelectedPhotoIndex((prev) =>
      prev !== null ? (prev - 1 + images.length) % images.length : images.length - 1
    );
  }, [images.length]);

  const closeLightbox = useCallback(() => {
    setSelectedPhotoIndex(null);
    setDragStartX(null);
    setDragCurrentX(null);
    setIsDragging(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (selectedPhotoIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhotoIndex, nextPhoto, prevPhoto, closeLightbox]);

  // Mouse Drag / Touch Swipe handlers for Lightbox
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

  const activePhoto = selectedPhotoIndex !== null ? images[selectedPhotoIndex] : null;
  const dragOffset = isDragging && dragStartX !== null && dragCurrentX !== null ? dragCurrentX - dragStartX : 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4">
      {/* Swiper Carousel */}
      <div className="relative group">
        <Swiper
          modules={[Navigation, Autoplay, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            480: { slidesPerView: 1.5, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={true}
          className="pb-8"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div
                className="relative aspect-[4/5] overflow-hidden rounded-2xl cursor-pointer group/card shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#d4af37]/70 bg-neutral-900"
                onClick={() => setSelectedPhotoIndex(index)}
              >
                <img
                  src={image.thumbnail}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-108"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] p-4 text-center">
                          <span class="text-3xl mb-2">📸</span>
                          <span class="text-[#d4af37] text-sm font-bold">FotoIT</span>
                          <span class="text-gray-400 text-xs mt-1">Poză ${index + 1}</span>
                        </div>
                      `;
                    }
                  }}
                />

                {/* Overlay discret la hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                  <div className="flex items-center justify-between text-white">
                    <span className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider">
                      Vezi fotografia
                    </span>
                    <span className="w-8 h-8 rounded-full bg-[#d4af37] text-[#1e1e1e] flex items-center justify-center shadow-lg">
                      <Eye className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Butoane de navigare carusel (stânga / dreapta) */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="w-12 h-12 rounded-full bg-[#1e1e1e] text-[#d4af37] border border-[#d4af37]/30 hover:bg-[#d4af37] hover:text-[#1e1e1e] flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <span className="text-xs tracking-widest text-gray-500 uppercase font-semibold">
            Trage sau apasă pentru a naviga
          </span>

          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="w-12 h-12 rounded-full bg-[#1e1e1e] text-[#d4af37] border border-[#d4af37]/30 hover:bg-[#d4af37] hover:text-[#1e1e1e] flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* LIGHTBOX INTERACTIV (Slide cu mouse-ul / touch + Butoane mari vizibile) */}
      {activePhoto && selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none"
          onClick={closeLightbox}
        >
          {/* Bara de sus cu contor și buton de închidere */}
          <div
            className="relative z-30 flex items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-b from-black/80 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#d4af37]/20 text-[#d4af37] text-xs font-bold tracking-wider">
                {selectedPhotoIndex + 1} / {images.length}
              </span>
              <span className="text-sm text-gray-300 font-medium hidden sm:inline">
                {activePhoto.title}
              </span>
            </div>

            <button
              onClick={closeLightbox}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-[#d4af37] text-white hover:text-[#1e1e1e] flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95"
              aria-label="Close"
              title="Închide (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Zona centrală cu poza + gesturi drag/swipe */}
          <div
            className="relative flex-1 flex items-center justify-center px-4 sm:px-16 overflow-hidden cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Buton Stânga / Anterior */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              className="absolute left-3 sm:left-6 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-[#d4af37] text-white hover:text-[#1e1e1e] border border-white/20 hover:border-[#d4af37] flex items-center justify-center transition-all duration-200 shadow-2xl hover:scale-110 active:scale-90"
              aria-label="Previous"
              title="Anterior (Săgeată stânga)"
            >
              <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>

            {/* Fotografia cu efect fluid la drag */}
            <div
              className="relative max-w-full max-h-[82vh] transition-transform duration-150 ease-out"
              style={{
                transform: `translateX(${dragOffset}px)`,
              }}
            >
              <img
                src={activePhoto.full}
                alt={activePhoto.title}
                className="max-w-full max-h-[82vh] object-contain rounded-lg shadow-2xl pointer-events-none"
                draggable={false}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = activePhoto.thumbnail;
                }}
              />
            </div>

            {/* Buton Dreapta / Următor */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              className="absolute right-3 sm:right-6 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-[#d4af37] text-white hover:text-[#1e1e1e] border border-white/20 hover:border-[#d4af37] flex items-center justify-center transition-all duration-200 shadow-2xl hover:scale-110 active:scale-90"
              aria-label="Next"
              title="Următor (Săgeată dreapta)"
            >
              <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>
          </div>

          {/* Bara de jos: indicații mouse/touch */}
          <div
            className="relative z-30 py-3 text-center text-xs text-gray-400 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <span>↔️ Trage cu mouse-ul sau glisează pe ecran pentru a naviga</span>
            <span className="hidden sm:inline">• Săgeți tastatură • Esc pentru închidere</span>
          </div>
        </div>
      )}
    </div>
  );
}
