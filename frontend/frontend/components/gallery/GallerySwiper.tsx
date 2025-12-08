"use client";

import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

/**
 * Componenta Swiper pentru galerie foto
 * 
 * Afișează o galerie cu slide-uri care se pot naviga
 */
export default function GallerySwiper() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  // Lista de imagini (thumbnails și versiuni mari)
  const images = [
    { thumbnail: "/gallery/thumbnail01.jpg", full: "/gallery/big/thumbnail01.jpg" },
    { thumbnail: "/gallery/thumbnail02.jpg", full: "/gallery/big/thumbnail02.jpg" },
    { thumbnail: "/gallery/thumbnail03.jpg", full: "/gallery/big/thumbnail03.jpg" },
    { thumbnail: "/gallery/thumbnail04.jpg", full: "/gallery/big/thumbnail04.jpg" },
    { thumbnail: "/gallery/thumbnail05.jpg", full: "/gallery/big/thumbnail05.jpg" },
    { thumbnail: "/gallery/thumbnail06.jpg", full: "/gallery/big/thumbnail06.jpg" },
    { thumbnail: "/gallery/thumbnail07.jpg", full: "/gallery/big/thumbnail07.jpg" },
    { thumbnail: "/gallery/thumbnail08.jpg", full: "/gallery/big/thumbnail08.jpg" },
    { thumbnail: "/gallery/thumbnail09.jpg", full: "/gallery/big/thumbnail09.jpg" },
    { thumbnail: "/gallery/thumbnail10.jpg", full: "/gallery/big/thumbnail10.jpg" },
  ];

  return (
    <>
      <div className="w-full max-w-6xl mx-auto">
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            480: {
              slidesPerView: 1.5,
              spaceBetween: 15,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="gallery-swiper"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                onClick={() => setSelectedImage(image.full)}
              >
                <img
                  src={image.thumbnail}
                  alt={`Galerie ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback dacă imaginea nu există
                    (e.target as HTMLImageElement).style.display = "none";
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#d4af37] to-[#b8922d]"><span class="text-white text-sm font-semibold">Poză ' + (index + 1) + '</span></div>';
                    }
                  }}
                />
                {/* Overlay la hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-semibold text-lg">
                    👁️ Vezi
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Buttons */}
        <div className="flex justify-center items-center gap-3 sm:gap-4 mt-4 sm:mt-6">
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#d4af37] text-[#1e1e1e] flex items-center justify-center hover:bg-[#b8922d] transition-all shadow-lg hover:scale-110 touch-manipulation"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#d4af37] text-[#1e1e1e] flex items-center justify-center hover:bg-[#b8922d] transition-all shadow-lg hover:scale-110 touch-manipulation"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl font-bold z-10"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <img
            src={selectedImage}
            alt="Poză selectată"
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              (e.target as HTMLImageElement).src = selectedImage.replace('/big/', '/');
            }}
          />
        </div>
      )}

    </>
  );
}

