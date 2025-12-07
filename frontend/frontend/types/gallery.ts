/**
 * Tipuri TypeScript pentru API-ul FotoIT
 */

export enum EventType {
  WEDDING = "WEDDING",
  SWEET_16 = "SWEET_16",
  EVENT = "EVENT",
}

export interface Photo {
  id: number;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  weddingId: number;
  fileId: string;
  createdAt: string;
}

export interface GalleryResponse {
  code: string;
  eventType: EventType;
  name: string;
  description?: string;
  photos: Photo[];
  totalPhotos: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

