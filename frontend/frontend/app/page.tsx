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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Reset loading când componenta se unmount (navigare către altă pagină)
  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  // Timeout de siguranță pentru loading (oprește loading-ul după 3 secunde)
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedCode = galleryCode.trim().toUpperCase();

    if (!trimmedCode) {
      setError("Te rog introdu un cod");
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      // Redirect către galerie
      await router.push(`/gallery/${trimmedCode}`);
      
      // Oprește loading-ul după un scurt delay pentru a permite navigarea să înceapă
      setTimeout(() => {
        setIsLoading(false);
        setShowCodeModal(false);
        setGalleryCode("");
      }, 500);
    } catch (error) {
      // Dacă există o eroare, oprește loading-ul
      setIsLoading(false);
      setError("Eroare la accesarea galeriei. Te rog încearcă din nou.");
    }
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
        <div className="relative z-[5] text-center px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24">
          <div
            className="mb-6 sm:mb-8"
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
            <h3 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-2 sm:mb-4 font-['Dancing_Script'] drop-shadow-2xl leading-tight">
              Prinde Momente
            </h3>
            <h3 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-[#d4af37] font-['Dancing_Script'] drop-shadow-2xl leading-tight">
              Modelează Amintiri
            </h3>
          </div>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#f5e6ca] mt-6 sm:mt-8 max-w-2xl mx-auto px-4"></p>
        </div>

        {/* Decorative elements cu animatie GSAP */}
        <div
          className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-1/2 transform -translate-x-1/2 w-1 h-24 sm:h-28 md:h-36 bg-gradient-to-b from-[#d4af37] to-transparent"
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
        className="relative min-h-[60vh] flex items-center bg-gradient-to-b from-[#f4f4f4] to-white py-12 sm:py-16 md:py-20 overflow-hidden"
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
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            {/* Profil Image */}
            <div className="flex justify-center order-2 md:order-1">
              <div className="relative about-image">
                <div className="absolute inset-0 bg-[#d4af37] rounded-full blur-2xl opacity-30 transform scale-110" />
                <img
                  src="/profil.jpg"
                  alt="Alex - Fotograf"
                  className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full object-cover border-4 border-[#d4af37] shadow-2xl z-10"
                  onError={(e) => {
                    // Fallback dacă imaginea nu există
                    (e.target as HTMLImageElement).style.display = "none";
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<div class="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8922d] flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">A</div>';
                    }
                  }}
                />
              </div>
            </div>

            {/* Text Despre */}
            <div className="text-[#1e1e1e] about-text order-1 md:order-2 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-[#1e1e1e]">
                Bună, sunt{" "}
                <span className="text-[#d4af37] font-['Dancing_Script']">
                  Alex!
                </span>
              </h1>
              <div className="space-y-3 sm:space-y-4 text-base sm:text-lg text-gray-700 leading-relaxed">
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
        <div className="about-line absolute left-1/2 bottom-6 sm:bottom-8 md:bottom-12 transform -translate-x-1/2 h-1 w-[90%] sm:w-[300px] md:w-[400px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
      </section>

      {/* Galerie Preview Section */}
      <section
        className="relative min-h-[80vh] py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white via-[#fafafa] to-[#f4f4f4] overflow-hidden"
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
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h1 className="gallery-title text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-[#1e1e1e]">
              Galerie
            </h1>
            <div className="absolute top-[100px] sm:top-[115px] md:top-[135px] left-1/2 transform -translate-x-1/2 w-1 h-8 sm:h-9 md:h-10 bg-gradient-to-b from-[#d4af37] to-transparent" />
          </div>

          {/* Gallery Swiper */}
          <div className="mb-8 sm:mb-10 md:mb-12 gallery-swiper-container">
            <GallerySwiper />
          </div>

          {/* Info Cards */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg text-center hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">💒</div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1e1e1e] mb-2 sm:mb-3">Nunti</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Galerii foto pentru evenimente de nuntă
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg text-center hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎂</div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1e1e1e] mb-2 sm:mb-3">
                Majorate
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Galerii pentru majorate și aniversări
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg text-center hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100 sm:col-span-2 md:col-span-1">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎉</div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1e1e1e] mb-2 sm:mb-3">
                Evenimente
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Galerii pentru diverse evenimente
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section / Footer */}
      <section
        id="contact"
        className="relative bg-gradient-to-b from-[#1e1e1e] to-[#0f0f0f] text-[#d4af37] py-12 sm:py-14 md:py-16 overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Contactează-mă
          </h2>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-[#d4af37] mx-auto mb-6 sm:mb-8" />

          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-xl sm:text-2xl">✉️</span>
              <a
                href="mailto:alexfotoit@gmail.com"
                className="text-base sm:text-lg hover:text-[#f5e6ca] transition-colors break-all"
              >
                alexfotoit@gmail.com
              </a>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">📞</span>
              <a
                href="tel:0771277906"
                className="text-base sm:text-lg hover:text-[#f5e6ca] transition-colors"
              >
                0771 277 906
              </a>
            </div>
            <div className="flex justify-center gap-4 mt-4 sm:mt-6">
              <a
                href="https://instagram.com/fotoit"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 bg-[#d4af37] rounded-full flex items-center justify-center hover:bg-[#b8922d] transition-all hover:scale-110"
              >
                <img
                  src="/instagram.png"
                  alt="Instagram"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<span class="text-[#1e1e1e] text-lg sm:text-xl">📷</span>';
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
              if (!isLoading) {
                setShowCodeModal(false);
                setGalleryCode("");
                setError("");
                setIsLoading(false);
              }
            }}
          />

          {/* Modală */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[500px] max-w-[90vw] bg-[#1e1e1e] z-[12] rounded-[20px] sm:rounded-[30px] p-6 sm:p-8 shadow-2xl mx-4">
            {!isLoading && (
              <button
                onClick={() => {
                  setShowCodeModal(false);
                  setGalleryCode("");
                  setError("");
                  setIsLoading(false);
                }}
                className="absolute top-4 right-4 text-[#d4af37] text-3xl hover:text-[#f5e6ca] transition-colors z-10"
              >
                ×
              </button>
            )}

            <h2 className="text-2xl font-bold text-[#d4af37] mb-6 text-center">
              Accesează Galeria
            </h2>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-[#d4af37]/30 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-[#d4af37] rounded-full animate-spin"></div>
                </div>
                <p className="text-[#d4af37] text-lg font-semibold">
                  Se încarcă galeria...
                </p>
              </div>
            ) : (
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
                    className="w-full px-4 py-3 text-lg text-center font-mono border-2 border-[#d4af37] rounded-lg bg-[#1e1e1e] text-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37] disabled:opacity-50 disabled:cursor-not-allowed"
                    maxLength={20}
                    autoFocus
                    disabled={isLoading}
                  />
                  {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#d4af37] text-[#1e1e1e] font-bold rounded-lg hover:bg-[#b8922d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#d4af37] flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#1e1e1e]/30 border-t-[#1e1e1e] rounded-full animate-spin"></div>
                      <span>Se încarcă...</span>
                    </>
                  ) : (
                    "Accesează Galeria"
                  )}
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
