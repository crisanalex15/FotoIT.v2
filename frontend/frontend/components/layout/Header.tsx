"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { KeyRound, X, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { href: "/#despre", label: "Despre" },
  { href: "/#galerie", label: "Portofoliu" },
  { href: "/#contact-cta", label: "Contact" },
];

const CODE_PATTERN = /^[A-Z0-9]{4,12}$/;

const goldButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8922d] " +
  "font-extrabold uppercase tracking-wider text-[#1e1e1e] shadow-md transition-all duration-200 " +
  "hover:shadow-xl hover:shadow-[#d4af37]/20 hover:brightness-105 active:scale-[0.98] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e1e1e]";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [galleryCode, setGalleryCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  const logoRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current,
        { opacity: 0, y: -20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }
      );
    }
    if (navRef.current && window.innerWidth >= 768) {
      gsap.fromTo(
        navRef.current.children,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.1 }
      );
    }
  }, []);

  // Deschiderea modalului din orice parte a site-ului
  useEffect(() => {
    const handleOpen = () => {
      setIsMobileMenuOpen(false);
      setIsCodeModalOpen(true);
    };
    window.addEventListener("open-code-modal", handleOpen);
    return () => window.removeEventListener("open-code-modal", handleOpen);
  }, []);

  // Meniul se inchide la schimbarea paginii (ajustare in timpul randarii, fara efect suplimentar)
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  // Escape inchide meniul / modalul; scroll-ul paginii e blocat cat timp sunt deschise
  const overlayOpen = isMobileMenuOpen || isCodeModalOpen;
  useEffect(() => {
    if (!overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsCodeModalOpen(false);
      }
    };
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [overlayOpen]);

  const handleOpenGallery = (e: React.FormEvent) => {
    e.preventDefault();
    const code = galleryCode.trim().toUpperCase();
    if (!CODE_PATTERN.test(code)) {
      setCodeError("Codul conține doar litere și cifre (de obicei 6 caractere).");
      return;
    }
    setCodeError(null);
    setIsCodeModalOpen(false);
    setIsMobileMenuOpen(false);
    router.push(`/gallery/${code}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#d4af37]/20 bg-[#1e1e1e]/95 shadow-md backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="group flex items-center" ref={logoRef} aria-label="FotoIT — pagina principală">
            {logoFailed ? (
              <span className="font-['Dancing_Script'] text-2xl font-bold tracking-wider text-[#d4af37]">FotoIT</span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/logo-fotoit.png"
                alt="FotoIT"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105 sm:h-12"
                onError={() => setLogoFailed(true)}
              />
            )}
          </Link>

          {/* Meniu desktop */}
          <nav className="hidden items-center gap-8 md:flex" ref={navRef} aria-label="Navigare principală">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex h-11 items-center text-sm font-bold uppercase tracking-wider text-gray-200 transition-colors hover:text-[#d4af37] lg:text-base"
              >
                {link.label}
              </Link>
            ))}
            <button type="button" onClick={() => setIsCodeModalOpen(true)} className={`${goldButton} h-11 px-5 text-sm`}>
              <KeyRound className="h-4 w-4" />
              <span>Cod Client</span>
            </button>
          </nav>

          {/* Buton meniu mobil */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#d4af37] transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] md:hidden"
            aria-label={isMobileMenuOpen ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="relative block h-5 w-6" aria-hidden>
              <span
                className={`absolute left-0 h-0.5 w-6 bg-[#d4af37] transition-all duration-300 ${
                  isMobileMenuOpen ? "top-[9px] rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-[9px] h-0.5 w-6 bg-[#d4af37] transition-opacity duration-300 ${
                  isMobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 h-0.5 w-6 bg-[#d4af37] transition-all duration-300 ${
                  isMobileMenuOpen ? "top-[9px] -rotate-45" : "top-[18px]"
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Meniu mobil: in afara <header>, altfel backdrop-blur il limiteaza la inaltimea header-ului */}
      <div
        id="mobile-menu"
        className={`fixed inset-x-0 bottom-0 top-20 z-50 overflow-y-auto bg-[#141414]/98 backdrop-blur-xl transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <nav className="flex min-h-full flex-col items-center justify-center gap-8 px-6 py-16 text-center" aria-label="Navigare mobil">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              tabIndex={isMobileMenuOpen ? 0 : -1}
              className="inline-flex h-12 items-center text-2xl font-bold uppercase text-white transition-colors hover:text-[#d4af37]"
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsCodeModalOpen(true);
            }}
            tabIndex={isMobileMenuOpen ? 0 : -1}
            className={`${goldButton} h-14 w-full max-w-xs px-6 text-base`}
          >
            <KeyRound className="h-5 w-5" />
            <span>Accesează galeria</span>
          </button>
        </nav>
      </div>

      {/* Modal cod eveniment */}
      {isCodeModalOpen && (
        <div
          className="fixed inset-0 z-[55] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={() => setIsCodeModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="code-modal-title"
            className="relative w-full max-w-md rounded-3xl border-2 border-[#d4af37]/40 bg-[#1e1e1e] p-6 text-center shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsCodeModalOpen(false)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-300 transition-colors hover:bg-[#d4af37] hover:text-[#1e1e1e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
              aria-label="Închide"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/15 text-[#d4af37] shadow-inner">
              <KeyRound className="h-7 w-7" />
            </div>

            <h3 id="code-modal-title" className="mb-2 text-2xl font-extrabold text-white sm:text-3xl">
              Albumul Tău Foto
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-gray-300">
              Introdu codul unic de 6 caractere primit de la fotograf pentru a vizualiza și descărca fotografiile evenimentului.
            </p>

            <form onSubmit={handleOpenGallery} className="space-y-4" noValidate>
              <label htmlFor="gallery-code" className="sr-only">
                Cod galerie
              </label>
              <input
                id="gallery-code"
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={12}
                placeholder="ex: TIZFKD"
                value={galleryCode}
                onChange={(e) => {
                  setGalleryCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
                  setCodeError(null);
                }}
                aria-invalid={!!codeError}
                aria-describedby={codeError ? "gallery-code-error" : undefined}
                className="w-full rounded-2xl border-2 border-[#d4af37]/50 bg-black/50 px-4 py-3.5 text-center font-mono text-2xl font-bold uppercase tracking-[0.3em] text-[#d4af37] shadow-inner placeholder:text-gray-600 focus:border-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 sm:text-3xl"
                autoFocus
              />
              {codeError && (
                <p id="gallery-code-error" className="text-sm text-red-400">
                  {codeError}
                </p>
              )}

              <button type="submit" className={`${goldButton} h-14 w-full rounded-2xl px-6 text-base`}>
                <span>Deschide galeria</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
