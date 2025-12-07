"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Header - Header-ul principal în stilul original FotoIT
 *
 * Include:
 * - Logo FotoIT
 * - Navigare (ACASA, DESPRE, CONTACT)
 * - Buton pentru introducere cod galerie
 * - Modală pentru introducere cod
 */
export default function Header() {
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

    // Redirect către galerie
    router.push(`/gallery/${trimmedCode}`);
    setShowCodeModal(false);
    setGalleryCode("");
  };

  return (
    <>
      <header className="relative bg-[#1e1e1e] text-[#d4af37] py-2.5 px-[10%] z-10">
        <div className="max-w-[70vw] mx-auto flex justify-between items-center">
          {/* Logo FotoIT */}
          <Link href="/" className="flex items-center">
            <img
              src="/logo-fotoit.png"
              alt="FotoIT"
              className="h-[10vh] w-auto max-h-[50px] max-w-full"
              onError={(e) => {
                // Fallback dacă logo-ul nu există
                (e.target as HTMLImageElement).style.display = "none";
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML =
                    '<span class="text-2xl font-bold">FotoIT</span>';
                }
              }}
            />
          </Link>

          {/* Navigare */}
          <nav className="flex items-center gap-8">
            <Link
              href="/"
              className="text-2xl font-bold text-[#d4af37] no-underline transition-all hover:text-[#f5e6ca] hover:text-[26px]"
            >
              ACASA
            </Link>
            <Link
              href="/#despre"
              className="text-2xl font-bold text-[#d4af37] no-underline transition-all hover:text-[#f5e6ca] hover:text-[26px]"
            >
              DESPRE
            </Link>
            <Link
              href="/#contact"
              className="text-2xl font-bold text-[#d4af37] no-underline transition-all hover:text-[#f5e6ca] hover:text-[26px]"
            >
              CONTACT
            </Link>
            <button
              onClick={() => setShowCodeModal(true)}
              className="text-2xl font-bold text-[#d4af37] bg-transparent border-2 border-[#d4af37] px-4 py-2 rounded-lg transition-all hover:bg-[#d4af37] hover:text-[#1e1e1e]"
            >
              GALERIE
            </button>
          </nav>
        </div>
      </header>

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
    </>
  );
}
