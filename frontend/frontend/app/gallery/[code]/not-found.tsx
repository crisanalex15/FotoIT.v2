import Link from "next/link";
import Button from "@/components/ui/Button";

/**
 * Pagina 404 pentru galerii negăsite
 */
export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-6xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Galerie negăsită
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Codul introdus nu corespunde unei galerii existente.
          <br />
          Verifică codul și încearcă din nou.
        </p>
        <Button asChild href="/" size="lg">
          ← Înapoi la Home
        </Button>
      </div>
    </div>
  );
}
