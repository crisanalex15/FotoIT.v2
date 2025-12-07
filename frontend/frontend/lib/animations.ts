/**
 * Utilitare pentru animații GSAP
 * 
 * Funcții helper pentru animații comune în aplicație
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Înregistrează plugin-ul ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Animație fade-in pentru un element
 */
export const fadeIn = (element: HTMLElement | string, options?: gsap.TweenVars) => {
  return gsap.fromTo(
    element,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1,
      ease: "power2.out",
      ...options,
    }
  );
};

/**
 * Animație slide-in pentru un element
 */
export const slideIn = (
  element: HTMLElement | string,
  direction: "left" | "right" | "up" | "down" = "left",
  options?: gsap.TweenVars
) => {
  const x = direction === "left" ? -100 : direction === "right" ? 100 : 0;
  const y = direction === "up" ? -100 : direction === "down" ? 100 : 0;

  return gsap.fromTo(
    element,
    { opacity: 0, x, y },
    {
      opacity: 1,
      x: 0,
      y: 0,
      duration: 1,
      ease: "power2.out",
      ...options,
    }
  );
};

/**
 * Animație stagger pentru mai multe elemente
 */
export const staggerAnimation = (
  elements: HTMLElement[] | string,
  options?: gsap.TweenVars
) => {
  return gsap.fromTo(
    elements,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      ...options,
    }
  );
};

/**
 * Animație pentru Hero section
 */
export const heroAnimation = (element: HTMLElement | string) => {
  const tl = gsap.timeline();

  tl.from(element, {
    opacity: 0,
    y: 50,
    duration: 1.2,
    ease: "power3.out",
  });

  return tl;
};

/**
 * Animație pentru butoane
 */
export const buttonHoverAnimation = (element: HTMLElement) => {
  return gsap.to(element, {
    scale: 1.05,
    duration: 0.3,
    ease: "power2.out",
  });
};

export const buttonHoverOutAnimation = (element: HTMLElement) => {
  return gsap.to(element, {
    scale: 1,
    duration: 0.3,
    ease: "power2.out",
  });
};

/**
 * Animație pentru lightbox
 */
export const lightboxOpenAnimation = (element: HTMLElement) => {
  return gsap.fromTo(
    element,
    { opacity: 0, scale: 0.8 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: "back.out(1.7)",
    }
  );
};

export const lightboxCloseAnimation = (
  element: HTMLElement,
  onComplete?: () => void
) => {
  return gsap.to(element, {
    opacity: 0,
    scale: 0.8,
    duration: 0.3,
    ease: "power2.in",
    onComplete,
  });
};

