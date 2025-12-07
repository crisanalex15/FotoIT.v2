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
        <div className="bg-[#1e1e1e] text-[#d4af37] py-8">
          <div className="container mx-auto px-4">
            <Link
              href="/"
              className="inline-block mb-4 text-[#d4af37] hover:text-[#f5e6ca] transition-colors"
            >
              ← Înapoi la Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{gallery.name}</h1>
            {gallery.description && (
              <p className="text-lg text-[#f5e6ca]">{gallery.description}</p>
            )}
          </div>
        </div>

        {/* Gallery Content */}
        <div className="container mx-auto px-4 py-8">
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

