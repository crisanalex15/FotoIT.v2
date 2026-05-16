"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE } from "@/lib/site";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ContactCtaSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const content = el.querySelector(".contact-cta-content");
    if (!content) return;

    gsap.fromTo(
      content,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      },
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, []);

  return (
    <section
      id="contact-cta"
      ref={sectionRef}
      className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-b from-[#f4f4f4] to-[#e8e8e8] overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #d4af37 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="contact-cta-content container mx-auto px-4 sm:px-6 md:px-8 text-center max-w-2xl">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1e1e1e] mb-3 sm:mb-4">
          Hai să{" "}
          <span className="text-[#d4af37] font-['Dancing_Script']">Vorbim</span>
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 leading-relaxed">
          Ai un eveniment sau vrei o ședință foto? Scrie-mi pe WhatsApp sau pe
          email — îți răspund cât mai curând.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
          <a
            href={SITE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#d4af37] text-[#1e1e1e] text-lg font-bold rounded-lg hover:bg-[#b8922d] transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            <span aria-hidden>💬</span>
            WhatsApp
          </a>
          <a
            href={SITE.mailtoUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#d4af37] text-[#1e1e1e] text-lg font-bold rounded-lg hover:bg-[#d4af37]/10 transition-all hover:scale-[1.02]"
          >
            <span aria-hidden>✉️</span>
            Email
          </a>
        </div>
      </div>
    </section>
  );
}
