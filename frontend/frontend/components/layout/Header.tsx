"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (navRef.current && window.innerWidth >= 768) {
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
    <header className="relative bg-[#1e1e1e] text-[#d4af37] py-2.5 px-4 sm:px-6 md:px-[10%] z-10">
      <div className="max-w-[70vw] mx-auto flex justify-between items-center">
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

        <nav
          className="hidden md:flex items-center gap-4 lg:gap-8"
          ref={navRef}
        >
          <Link
            href="/#despre"
            className="text-lg lg:text-2xl font-bold text-[#d4af37] no-underline transition-all hover:text-[#f5e6ca] hover:text-xl lg:hover:text-[26px]"
          >
            DESPRE
          </Link>
          <Link
            href="/#galerie"
            className="text-lg lg:text-2xl font-bold text-[#d4af37] no-underline transition-all hover:text-[#f5e6ca] hover:text-xl lg:hover:text-[26px]"
          >
            PORTOFOLIU
          </Link>
          <Link
            href="/#contact-cta"
            className="text-lg lg:text-2xl font-bold text-[#d4af37] no-underline transition-all hover:text-[#f5e6ca] hover:text-xl lg:hover:text-[26px]"
          >
            CONTACT
          </Link>
        </nav>
      </div>

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
            href="/#galerie"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-3xl font-bold text-[#d4af37] no-underline transition-all hover:text-[#f5e6ca]"
          >
            PORTOFOLIU
          </Link>
          <Link
            href="/#contact-cta"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-3xl font-bold text-[#d4af37] no-underline transition-all hover:text-[#f5e6ca]"
          >
            CONTACT
          </Link>
        </div>
      </div>
    </header>
  );
}
