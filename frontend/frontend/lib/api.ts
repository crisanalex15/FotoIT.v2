/**
 * API Service pentru comunicarea cu backend-ul Spring Boot
 */

import { GalleryResponse, ApiError } from "@/types/gallery";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Obține galeria unui eveniment după cod
 * 
 * @param code Codul unic al evenimentului
 * @returns GalleryResponse cu toate pozele
 * @throws ApiError dacă există probleme
 */
export async function getGallery(code: string): Promise<GalleryResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/gallery/${code}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Pentru development - permite CORS
      cache: "no-store",
    });

    if (!response.ok) {
      const error: ApiError = {
        message: `Eroare ${response.status}: ${response.statusText}`,
        status: response.status,
      };
      
      if (response.status === 404) {
        error.message = "Galerie negăsită. Verifică codul introdus.";
      }
      
      throw error;
    }

    const data: GalleryResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
      } as ApiError;
    }
    throw error;
  }
}

/**
 * Obține galeria unui eveniment după cod cu paginare
 * 
 * @param code Codul unic al evenimentului
 * @param page Numărul paginii (0-indexed)
 * @param size Numărul de poze per pagină
 * @returns GalleryResponse cu pozele paginate
 * @throws ApiError dacă există probleme
 */
export async function getGalleryPaginated(
  code: string,
  page: number = 0,
  size: number = 20
): Promise<GalleryResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/gallery/${code}?page=${page}&size=${size}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const error: ApiError = {
        message: `Eroare ${response.status}: ${response.statusText}`,
        status: response.status,
      };
      
      if (response.status === 404) {
        error.message = "Galerie negăsită. Verifică codul introdus.";
      }
      
      throw error;
    }

    const data: GalleryResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
      } as ApiError;
    }
    throw error;
  }
}

/**
 * Verifică dacă un cod de galerie este valid
 * 
 * @param code Codul de verificat
 * @returns true dacă codul este valid, false altfel
 */
export async function validateGalleryCode(code: string): Promise<boolean> {
  try {
    await getGallery(code);
    return true;
  } catch (error) {
    return false;
  }
}

