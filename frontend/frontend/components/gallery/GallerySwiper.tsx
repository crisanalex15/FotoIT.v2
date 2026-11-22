"use client";

import { useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import Lightbox, { type LightboxItem } from "./Lightbox";

import "swiper/css";

const IMAGES = [
  { id: "01", title: "Nuntă — Momente de neuitat" },
  { id: "02", title: "Portret — Naturalețe și expresie" },
  { id: "03", title: "Eveniment — Atmosferă de sărbătoare" },
  { id: "04", title: "Nuntă — Emoții sincere" },
  { id: "05", title: "Majorat — Energie și bucurie" },
  { id: "06", title: "Portret — Detalii și lumină" },
  { id: "07", title: "Eveniment — Amintiri vibrante" },
  { id: "08", title: "Nuntă — Povestea voastră" },
  { id: "09", title: "Majorat — Seară de neuitat" },
  { id: "10", title: "Portret — Stil și eleganță" },
].map((img) => ({
  ...img,
  thumbnail: `/gallery/thumbnail${img.id}.jpg`,
  full: `/gallery/big/thumbnail${img.id}.jpg`,
}));

const carouselButton =
  "inline-flex shrink-0 items-center justify-center w-12 h-12 rounded-full bg-[#1e1e1e] text-[#d4af37] " +
  "border border-[#d4af37]/30 shadow-lg transition-colors duration-200 hover:bg-[#d4af37] hover:text-[#1e1e1e] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2";

export default function GallerySwiper() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const swiperRef = useRef<SwiperType | null>(null);

  const lightboxItems: LightboxItem[] = useMemo(
    () =>
      IMAGES.map((img) => ({
        id: img.id,
        src: img.full,
        placeholder: img.thumbnail,
        alt: img.title,
        title: img.title,
      })),
    []
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={16}
        slidesPerView={1.15}
        centeredSlides
        breakpoints={{
          480: { slidesPerView: 1.6, spaceBetween: 16, centeredSlides: true },
          640: { slidesPerView: 2, spaceBetween: 20, centeredSlides: false },
          768: { slidesPerView: 3, spaceBetween: 24, centeredSlides: false },
          1024: { slidesPerView: 4, spaceBetween: 24, centeredSlides: false },
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop
      >
        {IMAGES.map((image, index) => (
          <SwiperSlide key={image.id}>
            <button
              type="button"
              className="group/card relative block w-full aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-900 shadow-md border-2 border-transparent transition-all duration-300 hover:shadow-2xl hover:border-[#d4af37]/70 focus-visible:outline-none focus-visible:border-[#d4af37]"
              onClick={() => setActiveIndex(index)}
              aria-label={`Deschide fotografia: ${image.title}`}
            >
              {failed[image.id] ? (
                <span className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] p-4 text-center">
                  <span className="text-3xl">📸</span>
                  <span className="text-sm font-bold text-[#d4af37]">FotoIT</span>
                  <span className="text-xs text-gray-400">Poză {index + 1}</span>
                </span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.thumbnail}
                  alt={image.title}
                  loading="lazy"
                  draggable={false}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                  onError={() => setFailed((f) => ({ ...f, [image.id]: true }))}
                />
              )}

              <span className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                <span className="flex items-center justify-between text-white">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
                    Vezi fotografia
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#d4af37] text-[#1e1e1e] shadow-lg">
                    <Eye className="h-4 w-4" />
                  </span>
                </span>
              </span>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigare carusel */}
      <div className="mt-8 flex items-center justify-center gap-4 sm:gap-6">
        <button
          type="button"
          onClick={() => swiperRef.current?.slidePrev()}
          className={carouselButton}
          aria-label="Fotografiile anterioare"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <span className="hidden sm:block text-center text-xs font-semibold uppercase tracking-widest text-gray-500">
          Trage sau apasă pentru a naviga
        </span>

        <button
          type="button"
          onClick={() => swiperRef.current?.slideNext()}
          className={carouselButton}
          aria-label="Fotografiile următoare"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {activeIndex !== null && (
        <Lightbox
          items={lightboxItems}
          index={activeIndex}
          onIndexChange={setActiveIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </div>
  );
}
