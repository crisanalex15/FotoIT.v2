/**
 * Exemplu de utilizare GSAP în PhotoGallery
 *
 * Acest fișier arată cum să adaugi animații GSAP în componenta PhotoGallery
 */

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Înregistrează ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Exemplu: Animație pentru grid-ul de poze
export function usePhotoGridAnimation() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    const photos = gridRef.current.querySelectorAll(".photo-item");

    gsap.fromTo(
      photos,
      {
        opacity: 0,
        scale: 0.8,
        y: 30,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return gridRef;
}

// Exemplu: Animație pentru lightbox
export function useLightboxAnimation(isOpen: boolean) {
  const lightboxRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!lightboxRef.current || !imageRef.current) return;

    if (isOpen) {
      // Animație de deschidere
      gsap.fromTo(
        lightboxRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );

      gsap.fromTo(
        imageRef.current,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
        }
      );
    } else {
      // Animație de închidere
      gsap.to(lightboxRef.current, {
        opacity: 0,
        duration: 0.2,
      });
    }
  }, [isOpen]);

  return { lightboxRef, imageRef };
}
