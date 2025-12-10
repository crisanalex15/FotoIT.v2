import { notFound } from "next/navigation";
import { getGallery } from "@/lib/api";
import PhotoGallery from "@/components/gallery/PhotoGallery";
import ShareSection from "@/components/gallery/ShareSection";
import Link from "next/link";

interface GalleryPageProps {
  params: Promise<{
    code: string;
  }>;
}

/**
 * Pagina pentru afișarea galeriei foto
 *
 * Route: /gallery/[code]
 *
 * Afișează toate pozele dintr-un eveniment după codul unic
 */
export default async function GalleryPage({ params }: GalleryPageProps) {
  const { code } = await params;

  try {
    const gallery = await getGallery(code);

    return (
      <div className="min-h-screen bg-[#f4f4f4]">
        {/* Header Section pentru Galerie */}
        <div className="bg-[#1e1e1e] text-[#d4af37] py-4 sm:py-6 md:py-8">
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <Link
                href="/"
                className="inline-flex items-center justify-center text-[#d4af37] hover:text-[#f5e6ca] transition-colors text-xl sm:text-2xl font-bold touch-manipulation p-1"
                title="Înapoi la Home"
              >
                ←
              </Link>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold">
                Eveniment <span className="text-[#f5e6ca]">{gallery.name.replace(/^Evenimente?\s*/i, '')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Gallery Content */}
        <div className="container mx-auto px-0 sm:px-4 md:px-8 py-4 sm:py-6 md:py-8">
          <PhotoGallery gallery={gallery} />
          <ShareSection code={code} />
        </div>
      </div>
    );
  } catch (error: any) {
    // Dacă galeria nu există sau există o eroare
    notFound();
  }
}

// Generare metadata dinamică
export async function generateMetadata({ params }: GalleryPageProps) {
  const { code } = await params;

  try {
    const gallery = await getGallery(code);
    return {
      title: `${gallery.name} - FotoIT`,
      description: gallery.description || `Galerie foto: ${gallery.name}`,
    };
  } catch {
    return {
      title: "Galerie negăsită - FotoIT",
      description: "Galerie foto negăsită",
    };
  }
}
