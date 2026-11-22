"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { KeyRound, Sparkles } from "lucide-react";
import GallerySwiper from "@/components/gallery/GallerySwiper";
import ContactCtaSection from "@/components/sections/ContactCtaSection";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Toate butoanele din hero au aceeasi inaltime, bordura si aliniere */
const heroButton =
  "inline-flex h-14 items-center justify-center gap-2 rounded-full border px-8 text-base sm:text-lg " +
  "transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e1e1e]";

/**
 * Pagina principală FotoIT — site de prezentare + acces galerie client
 */
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const [profileFailed, setProfileFailed] = useState(false);

  useEffect(() => {
    // Animatie Hero la încărcare
    if (heroRef.current) {
      const titles = heroRef.current.querySelectorAll(".hero-animate");
      gsap.fromTo(
        titles,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          delay: 0.3,
        }
      );
    }

    // Animatie secțiune Despre la scroll
    if (aboutRef.current) {
      const elements = aboutRef.current.querySelectorAll(".about-fade");
      gsap.fromTo(
        elements,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: aboutRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  }, []);

  const openCodeModal = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-code-modal"));
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[92vh] flex items-center justify-center bg-gradient-to-br from-[#181818] via-[#222222] to-[#141414] overflow-hidden px-4 sm:px-6"
      >
        {/* Pattern overlay discret */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #d4af37 1px, transparent 0)`,
              backgroundSize: "36px 36px",
            }}
          />
        </div>

        {/* Content Centrat */}
        <div className="relative z-10 max-w-4xl mx-auto text-center py-16 sm:py-24">
          <div className="hero-animate inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-6 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Fotografie Profesională de Eveniment</span>
          </div>

          <h1 className="hero-animate mb-6 flex flex-col gap-2 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-['Dancing_Script'] drop-shadow-xl leading-tight">
            <span className="text-white">Prinde Momente</span>
            <span className="text-[#d4af37]">Modelează Amintiri</span>
          </h1>

          <p className="hero-animate text-base sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Surprindem emoții autentice, zâmbete naturale și povești de neuitat pentru nunți, majorate și evenimente speciale.
          </p>

          {/* Butoane de Acțiune (Centrate & Vizibile) */}
          <div className="hero-animate mx-auto flex w-full max-w-sm flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
            <a href="#galerie" className={`${heroButton} border-transparent bg-gradient-to-r from-[#d4af37] to-[#b8922d] font-extrabold text-[#1e1e1e] shadow-xl hover:shadow-[#d4af37]/20 hover:brightness-105`}>
              Vezi Portofoliul
            </a>

            <button type="button" onClick={openCodeModal} className={`${heroButton} group border-[#d4af37]/40 bg-white/10 font-bold text-white shadow-lg hover:bg-[#d4af37] hover:text-[#1e1e1e]`}>
              <KeyRound className="h-5 w-5 text-[#d4af37] transition-colors group-hover:text-[#1e1e1e]" />
              <span>Cod Client</span>
            </button>

            <a href="#contact-cta" className={`${heroButton} border-white/20 font-semibold text-gray-300 hover:border-white/40 hover:bg-white/5 hover:text-white`}>
              Contact
            </a>
          </div>
        </div>

        {/* Indicator scroll jos */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 hidden flex-col items-center gap-2 opacity-60 sm:flex [@media(max-height:700px)]:hidden" aria-hidden>
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Scroll</span>
          <div className="w-0.5 h-8 bg-gradient-to-b from-[#d4af37] to-transparent animate-pulse" />
        </div>
      </section>

      {/* Secțiunea Despre (Centrată și Balansată) */}
      <section
        id="despre"
        ref={aboutRef}
        className="relative py-20 sm:py-28 bg-gradient-to-b from-[#f9f9f9] to-[#ffffff] overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 sm:gap-16 items-center">
            {/* Fotografie Alex */}
            <div className="about-fade flex justify-center order-2 md:order-1">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-tr from-[#d4af37] to-[#f5e6ca] rounded-full blur-xl opacity-40 animate-pulse" />
                {profileFailed ? (
                  <div className="relative z-10 flex h-56 w-56 flex-col items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8922d] text-white shadow-2xl sm:h-64 sm:w-64 md:h-72 md:w-72">
                    <span className="text-5xl font-bold">A</span>
                    <span className="mt-1 text-sm font-semibold">Alex FotoIT</span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/profil.jpg"
                    alt="Alex — Fotograf FotoIT"
                    className="relative z-10 h-56 w-56 rounded-full border-4 border-[#d4af37] object-cover shadow-2xl sm:h-64 sm:w-64 md:h-72 md:w-72"
                    onError={() => setProfileFailed(true)}
                  />
                )}
              </div>
            </div>

            {/* Prezentare */}
            <div className="about-fade order-1 md:order-2 text-center md:text-left space-y-5">
              <span className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#b8922d] font-bold">
                Fotograful Tău
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1e1e1e] leading-tight">
                Bună, sunt{" "}
                <span className="text-[#d4af37] font-['Dancing_Script']">Alex</span>!
              </h2>
              <div className="space-y-4 text-base sm:text-lg text-gray-700 leading-relaxed">
                <p>
                  Am pornit această călătorie în fotografie din dorința de a opri timpul în loc pentru cele mai frumoase clipe. Sunt specializat în{" "}
                  <strong className="text-[#1e1e1e] font-semibold">fotografie de nunți, majorate și portrete</strong>.
                </p>
                <p>
                  Stilul meu este{" "}
                  <strong className="text-[#1e1e1e] font-semibold">cald, natural și discret</strong>. Nu forțez cadre nenaturale, ci las momentele să se desfășoare liber pentru a surprinde râsetele sincere și privirile pline de emoție.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="inline-flex items-center px-4 py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-800">
                  📸 Echipament Profesional
                </div>
                <div className="inline-flex items-center px-4 py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-800">
                  ✨ Editare Cromatică Dedicată
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secțiunea Portofoliu (Centrată, Cu Titlu Clar & Carusel Interactiv) */}
      <section
        id="galerie"
        ref={galleryRef}
        className="relative py-20 sm:py-28 bg-[#fafafa] border-t border-neutral-200/60 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Secțiune Portofoliu (Centrat Perfect) */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs sm:text-sm uppercase tracking-[0.3em] text-[#b8922d] font-bold block mb-2">
              Selecție Cadre
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1e1e1e] tracking-tight mb-4">
              Portofoliu Foto
            </h2>
            <div className="w-20 h-1 bg-[#d4af37] mx-auto rounded-full mb-4" />
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-light">
              Explorează o selecție din cele mai dragi evenimente. Apasă pe orice poză pentru vizualizare pe tot ecranul și navigare fluidă.
            </p>
          </div>

          {/* Caruselul Swiper Interactiv cu Lightbox cu Slide Mouse/Touch */}
          <div className="mb-16">
            <GallerySwiper />
          </div>

          {/* Carduri Servicii (Centrate & Simetrice) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-neutral-200/80 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center text-3xl mb-5 shadow-inner">
                💒
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1e1e1e] mb-3">
                Nunți de Poveste
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Prezență completă de la pregătiri până la finalul petrecerii. Capturăm fiecare detaliu plin de semnificație.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-neutral-200/80 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center text-3xl mb-5 shadow-inner">
                🎂
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1e1e1e] mb-3">
                Majorate & Botezuri
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Atmosferă plină de energie, cadre dinamice alături de prieteni și familie pentru cele mai frumoase aniversări.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-neutral-200/80 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center text-3xl mb-5 shadow-inner">
                🎉
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1e1e1e] mb-3">
                Evenimente Private
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Evenimente corporate, gale, petreceri tematice sau ședințe foto individuale de portret în natură sau studio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Secțiunea Contact */}
      <ContactCtaSection />
    </div>
  );
}
