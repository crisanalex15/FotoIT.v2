"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GallerySwiper from "@/components/gallery/GallerySwiper";

// Înregistrează ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Pagina Principală - Design original FotoIT
 *
 * Include:
 * - Hero Section: "Prinde Momente, Modelează Amintiri"
 * - Despre Section: Profil Alex
 * - Galerie Section: Preview galerie
 * - Contact Section: Footer cu contact + input cod galerie
 */
export default function Home() {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [galleryCode, setGalleryCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedCode = galleryCode.trim().toUpperCase();

    if (!trimmedCode) {
      setError("Te rog introdu un cod");
      return;
    }

    router.push(`/gallery/${trimmedCode}`);
  };
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e1e1e] via-[#2a2a2a] to-[#1e1e1e] overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #d4af37 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 py-24">
          <div
            className="mb-8"
            ref={(el) => {
              if (el) {
                gsap.fromTo(
                  el.children,
                  { opacity: 0, y: 50 },
                  {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    stagger: 0.2,
                    ease: "power3.out",
                    delay: 1,
                  }
                );
              }
            }}
          >
            <h3 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 font-['Dancing_Script'] drop-shadow-2xl">
              Prinde Momente
            </h3>
            <h3 className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#d4af37] font-['Dancing_Script'] drop-shadow-2xl">
              Modelează Amintiri
            </h3>
          </div>
          <p className="text-xl md:text-2xl text-[#f5e6ca] mt-8 max-w-2xl mx-auto"></p>
        </div>

        {/* Decorative elements cu animatie GSAP */}
        <div
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-1 h-36 bg-gradient-to-b from-[#d4af37] to-transparent"
          ref={(el) => {
            if (el) {
              // Animatie: de jos in sus + fade-in
              gsap.fromTo(
                el,
                { opacity: 0, y: 150 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 1,
                  ease: "ease-in-out",
                }
              );
            }
          }}
        />
      </section>

      {/* Despre Section */}
      <section
        id="despre"
        className="relative min-h-[60vh] flex items-center bg-gradient-to-b from-[#f4f4f4] to-white py-20 overflow-hidden"
        ref={(el) => {
          if (el) {
            const line = el.querySelector(".about-line");
            const image = el.querySelector(".about-image");
            const text = el.querySelector(".about-text");

            if (line && image && text) {
              // Timeline pentru animație secvențială
              const tl = gsap.timeline({
                scrollTrigger: {
                  trigger: el,
                  start: "top 70%",
                  toggleActions: "play none none reverse",
                },
              });

              // 1. Linia: începe verticală cu înălțime mare
              gsap.set(line, {
                opacity: 0,
                y: -200,
                width: "1px",
                height: "400px",
              });

              // Pasul 1: Linia apare cu înălțime mare (verticală), se mișcă în jos
              tl.to(line, {
                height: "1px",
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
              })
                // Pasul 2: Scade înălțimea la valoarea pentru linia orizontală
                .to(line, {
                  height: "1px",
                  duration: 0.2,
                  ease: "power2.inOut",
                })
                // Pasul 3: Se extinde lateral (width crește)
                .to(line, {
                  width: "400px",
                  duration: 0.6,
                  ease: "power2.inOut",
                })
                // 2. Apoi apare poza
                .fromTo(
                  image,
                  {
                    left: "100px",
                    opacity: 0,
                    scale: 0.8,
                    y: 30,
                  },
                  {
                    left: "0",
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                  },
                  "-=0.3"
                )
                // 3. Apoi apare textul
                .fromTo(
                  text,
                  { opacity: 0, x: 50 },
                  {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    ease: "power2.out",
                  },
                  "-=0.4"
                );
            }
          }
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            {/* Profil Image */}
            <div className="flex justify-center">
              <div className="relative about-image">
                <div className="absolute inset-0 bg-[#d4af37] rounded-full blur-2xl opacity-30 transform scale-110" />
                <img
                  src="/profil.jpg"
                  alt="Alex - Fotograf"
                  className="relative w-64 h-64 rounded-full object-cover border-4 border-[#d4af37] shadow-2xl z-10"
                  onError={(e) => {
                    // Fallback dacă imaginea nu există
                    (e.target as HTMLImageElement).style.display = "none";
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<div class="w-64 h-64 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8922d] flex items-center justify-center text-white text-4xl font-bold">A</div>';
                    }
                  }}
                />
              </div>
            </div>

            {/* Text Despre */}
            <div className="text-[#1e1e1e] about-text">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#1e1e1e]">
                Bună, sunt{" "}
                <span className="text-[#d4af37] font-['Dancing_Script']">
                  Alex!
                </span>
              </h1>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  Am început această călătorie în fotografie din{" "}
                  <b className="text-[#1e1e1e]">2020</b>. Mă specializez în
                  fotografie de{" "}
                  <b className="text-[#1e1e1e]">evenimente și portrete</b>
                </p>
                <p>
                  Stilul meu este{" "}
                  <b className="text-[#1e1e1e]">
                    realist, cald și cât mai natural
                  </b>
                  . Îmi place să surprind emoțiile autentice și să transform
                  momentele simple în{" "}
                  <b className="text-[#1e1e1e]">amintiri de neuitat</b>.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="about-line absolute left-1/2 bottom-12 transform -translate-x-1/2 h-1 w-[400px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
      </section>

      {/* Galerie Preview Section */}
      <section
        className="relative min-h-[80vh] py-20 bg-gradient-to-b from-white via-[#fafafa] to-[#f4f4f4] overflow-hidden"
        ref={(el) => {
          if (el) {
            const title = el.querySelector(".gallery-title");
            const swiperContainer = el.querySelector(
              ".gallery-swiper-container"
            );

            if (title && swiperContainer) {
              // Timeline pentru animații
              const tl = gsap.timeline({
                scrollTrigger: {
                  trigger: el,
                  start: "top 70%",
                  toggleActions: "play none none reverse",
                },
              });

              // 1. Typing animation pentru "Galerie"
              const text = "Galerie";
              const chars = text.split("");
              const originalText = title.textContent || "";

              // Doar dacă nu a fost deja animat
              if (title.children.length === 0) {
                title.innerHTML = ""; // Golește conținutul

                chars.forEach((char) => {
                  const span = document.createElement("span");
                  span.textContent = char === " " ? "\u00A0" : char;
                  span.style.opacity = "0";
                  title.appendChild(span);

                  tl.to(span, {
                    opacity: 1,
                    duration: 0.2,
                    ease: "power2.out",
                  });
                });
              }

              // 2. Animație pentru pozele din swiper - apar din centru și se expandează
              // Așteaptă puțin pentru ca Swiper să se inițializeze
              setTimeout(() => {
                const swiperWrapper =
                  swiperContainer.querySelector(".swiper-wrapper");
                const slides =
                  swiperWrapper?.querySelectorAll(".swiper-slide") || [];
                const navButtons =
                  swiperContainer.querySelectorAll("button[aria-label]");

                if (slides.length > 0) {
                  // Setează poziția inițială - toate în centru (scale 0, opacity 0)
                  gsap.set(slides, {
                    scale: 0,
                    opacity: 0,
                  });

                  // Setează butoanele de navigare inițial (opacity 0)
                  if (navButtons.length > 0) {
                    gsap.set(navButtons, {
                      opacity: 0,
                      scale: 0.8,
                    });
                  }

                  // Animează către pozițiile finale cu stagger
                  tl.to(
                    slides,
                    {
                      scale: 1,
                      opacity: 1,
                      duration: 0.6,
                      stagger: 0.1,
                      ease: "back.out(1.7)",
                      delay: 0.2,
                    },
                    "-=0.3"
                  )
                    // 3. Apoi apar butoanele de navigare
                    .to(
                      navButtons,
                      {
                        opacity: 1,
                        scale: 1,
                        duration: 0.5,
                        stagger: 0.1,
                        ease: "power2.out",
                      },
                      "-=0.3"
                    );
                }
              }, 200);
            }
          }
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="gallery-title text-5xl md:text-5xl font-bold mb-4 text-[#1e1e1e]">
              Galerie
            </h1>
            <div className="absolute top-[135px] left-1/2 transform -translate-x-1/2 w-1 h-10 bg-gradient-to-b from-[#d4af37] to-transparent" />
          </div>

          {/* Gallery Swiper */}
          <div className="mb-12 gallery-swiper-container">
            <GallerySwiper />
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
              <div className="text-5xl mb-4">💒</div>
              <h3 className="text-2xl font-bold text-[#1e1e1e] mb-3">Nunti</h3>
              <p className="text-gray-600 leading-relaxed">
                Galerii foto pentru evenimente de nuntă
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
              <div className="text-5xl mb-4">🎂</div>
              <h3 className="text-2xl font-bold text-[#1e1e1e] mb-3">
                Majorate
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Galerii pentru majorate și aniversări
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-[#1e1e1e] mb-3">
                Evenimente
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Galerii pentru diverse evenimente
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section / Footer */}
      <section
        id="contact"
        className="relative bg-gradient-to-b from-[#1e1e1e] to-[#0f0f0f] text-[#d4af37] py-16 overflow-hidden"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Contactează-mă
          </h2>
          <div className="w-24 h-1 bg-[#d4af37] mx-auto mb-8" />

          <div className="space-y-4 mb-8 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">✉️</span>
              <a
                href="mailto:alexfotoit@gmail.com"
                className="text-lg hover:text-[#f5e6ca] transition-colors"
              >
                alexfotoit@gmail.com
              </a>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">📞</span>
              <a
                href="tel:0771277906"
                className="text-lg hover:text-[#f5e6ca] transition-colors"
              >
                0771 277 906
              </a>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <a
                href="https://instagram.com/fotoit"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-[#d4af37] rounded-full flex items-center justify-center hover:bg-[#b8922d] transition-all hover:scale-110"
              >
                <img
                  src="/instagram.png"
                  alt="Instagram"
                  className="w-6 h-6"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<span class="text-[#1e1e1e] text-xl">📷</span>';
                    }
                  }}
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Modală pentru Introducere Cod Galerie */}
      {showCodeModal && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9] transition-opacity"
            onClick={() => {
              setShowCodeModal(false);
              setGalleryCode("");
              setError("");
            }}
          />

          {/* Modală */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] max-w-[90%] bg-[#1e1e1e] z-[12] rounded-[30px] p-8 shadow-2xl">
            <button
              onClick={() => {
                setShowCodeModal(false);
                setGalleryCode("");
                setError("");
              }}
              className="absolute top-4 right-4 text-[#d4af37] text-3xl hover:text-[#f5e6ca] transition-colors"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-[#d4af37] mb-6 text-center">
              Accesează Galeria
            </h2>

            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="galleryCodeHome"
                  className="block text-[#d4af37] font-semibold mb-2"
                >
                  Introdu codul galeriei:
                </label>
                <input
                  id="galleryCodeHome"
                  type="text"
                  value={galleryCode}
                  onChange={(e) => {
                    setGalleryCode(e.target.value.toUpperCase());
                    setError("");
                  }}
                  placeholder="ABC123"
                  className="w-full px-4 py-3 text-lg text-center font-mono border-2 border-[#d4af37] rounded-lg bg-[#1e1e1e] text-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  maxLength={20}
                  autoFocus
                />
                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#d4af37] text-[#1e1e1e] font-bold rounded-lg hover:bg-[#b8922d] transition-colors"
              >
                Accesează Galeria
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
