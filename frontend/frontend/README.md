# FotoIT — Site de prezentare (Next.js)

Site marketing pentru fotografie de evenimente: hero, despre, portofoliu static, contact WhatsApp/email.

## Stack

- Next.js 16 (App Router)
- TypeScript + Tailwind CSS
- GSAP + ScrollTrigger (animații)
- Swiper (carusel portofoliu)

**Nu necesită Spring Boot.** Pozele pentru clienți se livrează manual prin link Google Drive (WhatsApp / email).

## Rulare

```bash
cd frontend/frontend
npm install
npm run dev
```

Site: [http://localhost:3000](http://localhost:3000)

Health check API: `GET /api/health`

## Structură

```
app/
  page.tsx              # Homepage
  api/health/route.ts   # Health check
components/
  gallery/GallerySwiper.tsx   # Portofoliu static (/public/gallery)
  sections/ContactCtaSection.tsx
  layout/Header.tsx, Footer.tsx
lib/site.ts             # Email, telefon, WhatsApp, Instagram
```

## Configurare

Copiază `.env.example` în `.env.local` (opțional):

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Credențiale Google Drive **nu sunt necesare** pentru site-ul de prezentare. Dacă vei automatiza Drive din Next în viitor, vezi comentariile din `.env.example`.

## Livrare poze clienți

1. Folder în Google Drive → încarcă pozele
2. Partajare → link pentru client
3. Trimite linkul pe WhatsApp sau email

## Build producție

```bash
npm run build
npm start
```
