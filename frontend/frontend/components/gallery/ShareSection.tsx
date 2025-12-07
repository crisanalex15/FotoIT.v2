"use client";

import { useState, useEffect } from "react";

interface ShareSectionProps {
  code: string;
}

/**
 * Componenta pentru partajarea galeriei
 */
export default function ShareSection({ code }: ShareSectionProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  const handleCopy = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Eroare la copiere:", err);
    }
  };

  return (
    <div className="mt-12 text-center border-t border-[#d4af37]/30 pt-8">
      <p className="text-[#1e1e1e] text-lg font-semibold mb-4">
        Partajează această galerie:
      </p>
      <div className="flex items-center justify-center gap-2 max-w-2xl mx-auto">
        <input
          type="text"
          value={shareUrl}
          readOnly
          className="px-4 py-3 border-2 border-[#d4af37] rounded-lg bg-white text-sm font-mono flex-1 text-[#1e1e1e] focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          onClick={handleCopy}
          disabled={copied}
          className="px-6 py-3 bg-[#d4af37] text-[#1e1e1e] font-bold rounded-lg hover:bg-[#b8922d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? "✓ Copiat!" : "Copiază"}
        </button>
      </div>
    </div>
  );
}

