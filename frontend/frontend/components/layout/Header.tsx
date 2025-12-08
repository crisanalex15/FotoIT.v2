"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Înregistrează ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Header - Header-ul principal în stilul original FotoIT
 *
 * Include:
 * - Logo FotoIT
 * - Navigare (ACASA, DESPRE, CONTACT)
 * - Buton pentru introducere cod galerie
 * - Modală pentru introducere cod
 * - Meniu hamburger pentru mobile
 */
export default function Header() {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [galleryCode, setGalleryCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <>
      <header className="relative bg-[#1e1e1e] text-[#d4af37] py-2.5 px-4 sm:px-6 md:px-[10%] z-10">
        <div className="max-w-[70vw] mx-auto flex justify-between items-center">
          {/* Logo FotoIT */}
          {(() => {
            const logoRef = useRef<HTMLAnchorElement>(null);
            useEffect(() => {
              if (logoRef.current) {
                gsap.fromTo(
                  logoRef.current,
                  { opacity: 0, y: -30, scale: 0.95 },
                  {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: "power3.out",
                  }
                );
              }
            }, []);
            return (
              <Link href="/" className="flex items-center z-20" ref={logoRef}>
                <img
                  src="/logo-fotoit.png"
                  alt="FotoIT"
                  className="h-[8vh] sm:h-[10vh] w-auto max-h-[40px] sm:max-h-[50px] max-w-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<span class="text-xl sm:text-2xl font-bold">FotoIT</span>';
                    }
                  }}
                />
              </Link>
            );
          })()}

          {/* Hamburger Menu Button - Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden z-20 flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span
              className={`w-6 h-0.5 bg-[#d4af37] transition-all duration-300 ${
                isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-[#d4af37] transition-all duration-300 ${
                isMobileMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-[#d4af37] transition-all duration-300 ${
                isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>

          {/* Navigare Desktop */}
          {(() => {
            const navRef = useRef<HTMLDivElement>(null);
            useEffect(() => {
              if (navRef.current && window.innerWidth >= 768) {
                // Animatie pentru fiecare copil (buton)
                gsap.fromTo(
                  navRef.current.children,
                  { opacity: 0, y: -30 },
                  {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: "power3.out",
                    delay: 0.2,
                  }
                );
              }
            }, []);
            return (
              <nav
                className={`hidden md:flex items-center gap-4 lg:gap-8`}
                ref={navRef}
              >
                <Link
                  href="/#despre"
                  className="text-lg lg:text-2xl font-bold text-[#d4af37] no-underline transition-all hover:text-[#f5e6ca] hover:text-xl lg:hover:text-[26px]"
                >
                  DESPRE
                </Link>
                <Link
                  href="/#contact"
                  className="text-lg lg:text-2xl font-bold text-[#d4af37] no-underline transition-all hover:text-[#f5e6ca] hover:text-xl lg:hover:text-[26px]"
                >
                  CONTACT
                </Link>
                <button
                  onClick={() => setShowCodeModal(true)}
                  className="text-lg lg:text-2xl font-bold text-[#d4af37] bg-transparent border-2 border-[#d4af37] px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg transition-all hover:bg-[#d4af37] hover:text-[#1e1e1e]"
                >
                  GALERIE
                </button>
              </nav>
            );
          })()}
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed inset-0 bg-[#1e1e1e] z-[50] transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col items-center justify-center h-full gap-8 px-8">
            <Link
              href="/#despre"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-3xl font-bold text-[#d4af37] no-underline transition-all hover:text-[#f5e6ca]"
            >
              DESPRE
            </Link>
            <Link
              href="/#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-3xl font-bold text-[#d4af37] no-underline transition-all hover:text-[#f5e6ca]"
            >
              CONTACT
            </Link>
            <button
              onClick={() => {
                setShowCodeModal(true);
                setIsMobileMenuOpen(false);
              }}
              className="text-3xl font-bold text-[#d4af37] bg-transparent border-2 border-[#d4af37] px-8 py-4 rounded-lg transition-all hover:bg-[#d4af37] hover:text-[#1e1e1e]"
            >
              GALERIE
            </button>
          </div>
        </div>
      </header>

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
                    htmlFor="galleryCode"
                    className="block text-[#d4af37] font-semibold mb-2"
                  >
                    Introdu codul galeriei:
                  </label>
                  <input
                    id="galleryCode"
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
    </>
  );
}
