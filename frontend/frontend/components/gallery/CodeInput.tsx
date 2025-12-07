"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

/**
 * Componenta pentru introducerea codului galeriei
 * 
 * Permite utilizatorilor să introducă codul pentru a accesa galeria
 */
export default function CodeInput() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode) {
      setError("Te rog introdu un cod");
      setLoading(false);
      return;
    }

    // Redirect către pagina galeriei
    router.push(`/gallery/${trimmedCode}`);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Introdu codul galeriei
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError("");
            }}
            placeholder="ABC123"
            className="w-full px-4 py-3 text-lg text-center font-mono border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            maxLength={20}
            disabled={loading}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Se încarcă..." : "Accesează Galeria"}
        </Button>
      </form>
    </div>
  );
}

