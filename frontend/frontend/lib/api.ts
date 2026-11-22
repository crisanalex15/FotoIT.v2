/**
 * Adresa API-ului vazuta din browser. Implicit e goala: cererile merg la acelasi domeniu
 * (/api/gallery/...), iar Next.js le trimite mai departe la backend (vezi next.config.ts).
 * Se poate seta NEXT_PUBLIC_API_URL doar daca backend-ul e public pe alt domeniu.
 */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export type EventType = "WEDDING" | "SWEET_16" | "EVENT" | string;

export interface PhotoDto {
  id: number;
  filename: string;
  url: string;
  thumbnailUrl: string;
  fileId: string;
}

export interface GalleryResponse {
  code: string;
  eventType: EventType;
  name: string;
  description?: string;
  photos: PhotoDto[];
  totalPhotos: number;
}

export const galleryApi = {
  thumbnail: (fileId: string) => `${API_BASE_URL}/api/gallery/thumbnail/${encodeURIComponent(fileId)}`,
  preview: (fileId: string) => `${API_BASE_URL}/api/gallery/preview/${encodeURIComponent(fileId)}`,
  download: (fileId: string) => `${API_BASE_URL}/api/gallery/download/${encodeURIComponent(fileId)}`,
  downloadAll: (code: string) => `${API_BASE_URL}/api/gallery/${encodeURIComponent(code)}/download-all`,
  zip: (code: string, name: string) =>
    `${API_BASE_URL}/api/gallery/download/zip?code=${encodeURIComponent(code)}&galleryName=${encodeURIComponent(name)}`,
};

export class GalleryError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function fetchGallery(code: string, signal?: AbortSignal): Promise<GalleryResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/gallery/${encodeURIComponent(code)}`, { signal });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new GalleryError("Serverul nu poate fi contactat. Verifică conexiunea la internet.", 0);
  }

  if (res.ok) return res.json();

  switch (res.status) {
    case 400:
    case 404:
      throw new GalleryError(`Nu există nicio galerie cu codul „${code}”. Verifică dacă l-ai scris corect.`, res.status);
    case 429:
      throw new GalleryError("Prea multe încercări. Te rugăm să aștepți un minut și să încerci din nou.", 429);
    default:
      throw new GalleryError("Fotografiile nu au putut fi încărcate. Încearcă din nou peste câteva momente.", res.status);
  }
}
