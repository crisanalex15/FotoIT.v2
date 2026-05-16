import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-[#1e1e1e] to-[#0f0f0f] text-[#d4af37] border-t border-[#d4af37]/30">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 items-start text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-[#d4af37]">{SITE.name}</span>
            </Link>
            <p className="font-['Dancing_Script'] text-xl sm:text-2xl text-[#f5e6ca]">
              {SITE.tagline}
            </p>
          </div>

          <nav className="flex flex-col items-center md:items-start gap-3">
            <p className="text-sm uppercase tracking-wider text-[#f5e6ca]/70 font-semibold">
              Navigare
            </p>
            <Link
              href="/"
              className="text-base hover:text-[#f5e6ca] transition-colors"
            >
              Acasă
            </Link>
            <Link
              href="/#despre"
              className="text-base hover:text-[#f5e6ca] transition-colors"
            >
              Despre
            </Link>
            <Link
              href="/#galerie"
              className="text-base hover:text-[#f5e6ca] transition-colors"
            >
              Portofoliu
            </Link>
            <Link
              href="/#contact-cta"
              className="text-base hover:text-[#f5e6ca] transition-colors"
            >
              Contact
            </Link>
          </nav>

          <div className="flex flex-col items-center md:items-start gap-3">
            <p className="text-sm uppercase tracking-wider text-[#f5e6ca]/70 font-semibold">
              Contact
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="text-base hover:text-[#f5e6ca] transition-colors break-all"
            >
              {SITE.email}
            </a>
            <a
              href={`tel:${SITE.phone}`}
              className="text-base hover:text-[#f5e6ca] transition-colors"
            >
              {SITE.phoneDisplay}
            </a>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base hover:text-[#f5e6ca] transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#d4af37]/20 text-center text-sm text-[#f5e6ca]/60">
          <p>
            &copy; {currentYear} {SITE.name}. Toate drepturile rezervate.
          </p>
        </div>
      </div>
    </footer>
  );
}
