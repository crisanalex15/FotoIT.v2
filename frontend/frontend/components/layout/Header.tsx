"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { KeyRound, X, ArrowRight } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [galleryCode, setGalleryCode] = useState("");

  const logoRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current,
        { opacity: 0, y: -20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }
      );
    }
  }, []);

  useEffect(() => {
    if (navRef.current && window.innerWidth >= 768) {
      gsap.fromTo(
        navRef.current.children,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.1 }
      );
    }
  }, []);

  // Ascultă evenimentul global pentru deschiderea modalului din orice parte a paginii
  useEffect(() => {
    const handleOpen = () => setIsCodeModalOpen(true);
    window.addEventListener("open-code-modal", handleOpen);
    return () => window.removeEventListener("open-code-modal", handleOpen);
  }, []);

  const handleOpenGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryCode.trim()) return;
    setIsCodeModalOpen(false);
    setIsMobileMenuOpen(false);
    router.push(`/gallery/${galleryCode.trim().toUpperCase()}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#1e1e1e]/95 backdrop-blur-md border-b border-[#d4af37]/20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" ref={logoRef}>
            <img
              src="/logo-fotoit.png"
              alt="FotoIT"
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML =
                    '<span class="text-2xl font-bold tracking-wider text-[#d4af37] font-[\'Dancing_Script\']">FotoIT</span>';
                }
              }}
            />
          </Link>

          {/* Buton Meniu Mobil (Hamburger) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-lg text-[#d4af37] hover:bg-white/5 transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`w-full h-0.5 bg-[#d4af37] transition-all duration-300 ${
                  isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`w-full h-0.5 bg-[#d4af37] transition-all duration-300 ${
                  isMobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`w-full h-0.5 bg-[#d4af37] transition-all duration-300 ${
                  isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>

          {/* Meniu Desktop Aliniat și Centrat */}
          <nav className="hidden md:flex items-center gap-8" ref={navRef}>
            <Link
              href="/#despre"
              className="text-sm lg:text-base font-bold text-gray-200 hover:text-[#d4af37] transition-colors tracking-wider uppercase"
            >
              Despre
            </Link>
            <Link
              href="/#galerie"
              className="text-sm lg:text-base font-bold text-gray-200 hover:text-[#d4af37] transition-colors tracking-wider uppercase"
            >
              Portofoliu
            </Link>
            <Link
              href="/#contact-cta"
              className="text-sm lg:text-base font-bold text-gray-200 hover:text-[#d4af37] transition-colors tracking-wider uppercase"
            >
              Contact
            </Link>

            {/* Buton Distinctiv "COD CLIENT" */}
            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8922d] text-[#1e1e1e] font-extrabold text-sm tracking-wider uppercase transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-[#d4af37]/20 hover:scale-105 active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              <span>Cod Client</span>
            </button>
          </nav>
        </div>

        {/* Meniu Mobil Dropdown */}
        <div
          className={`md:hidden fixed inset-0 top-20 bg-[#141414]/98 backdrop-blur-xl z-50 transition-all duration-300 ${
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-8 py-16 px-6 text-center">
            <Link
              href="/#despre"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-bold text-white hover:text-[#d4af37] transition-colors"
            >
              DESPRE
            </Link>
            <Link
              href="/#galerie"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-bold text-white hover:text-[#d4af37] transition-colors"
            >
              PORTOFOLIU
            </Link>
            <Link
              href="/#contact-cta"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-bold text-white hover:text-[#d4af37] transition-colors"
            >
              CONTACT
            </Link>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsCodeModalOpen(true);
              }}
              className="flex items-center justify-center gap-3 w-full max-w-xs py-3.5 px-6 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8922d] text-[#1e1e1e] font-extrabold text-base shadow-xl"
            >
              <KeyRound className="w-5 h-5" />
              <span>ACCESEAZĂ GALERIE</span>
            </button>
          </div>
        </div>
      </header>

      {/* Modal Introducere Cod Eveniment (Centrat, Clar, Cu Contrast Mare) */}
      {isCodeModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsCodeModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#1e1e1e] border-2 border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Buton Închidere X */}
            <button
              onClick={() => setIsCodeModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-[#d4af37] text-gray-300 hover:text-[#1e1e1e] flex items-center justify-center transition-all"
              aria-label="Închide"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pictogramă */}
            <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <KeyRound className="w-7 h-7" />
            </div>

            {/* Titlu și explicație clară */}
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Albumul Tău Foto
            </h3>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              Introdu codul unic de 6 caractere primit de la fotograf pentru a vizualiza și descărca fotografiile evenimentului.
            </p>

            {/* Formular Cod */}
            <form onSubmit={handleOpenGallery} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="ex: TIZFKD"
                  value={galleryCode}
                  onChange={(e) => setGalleryCode(e.target.value.toUpperCase())}
                  className="w-full text-center tracking-[0.3em] text-2xl sm:text-3xl font-mono font-bold uppercase px-4 py-3.5 bg-black/50 border-2 border-[#d4af37]/50 rounded-2xl text-[#d4af37] placeholder-gray-600 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 shadow-inner"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#b8922d] text-[#1e1e1e] font-extrabold text-base tracking-wider uppercase hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Deschide Galeria</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
