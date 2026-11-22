# FotoIT.v2

## Proiect

**FotoIT — site de prezentare fotografie + galerii private pentru clienți**

- `frontend/frontend` — Next.js: portofoliu, despre, contact și pagina de galerie `/gallery/[cod]`
  (vizualizare, favorite, selecție, descărcare ZIP). Animații GSAP.
- `backend` — Spring Boot + SQLite: panou admin (`/admin`) pentru evenimente, sincronizare poze
  din Google Drive și API-ul public folosit de galerie (thumbnail-uri, preview, descărcări).

## Pornire rapidă (Windows)

```bat
start-dev.bat
```

Pornește backend-ul (http://localhost:8080) și frontend-ul (http://localhost:3000) în două ferestre,
așteaptă să răspundă și deschide site-ul în browser. Oprire: `stop-dev.bat`.

Necesită **Java 21** și **Node.js**. La prima rulare instalează automat dependințele npm și
creează `frontend/frontend/.env.local` din `.env.example`.

## Configurare

Copiază `backend/local.env.example` ca `backend/local.env` (ignorat de git). `start-dev.bat` îl citește automat.

| Variabilă | Rol |
|---|---|
| `ADMIN_PASSWORD` | Parola pentru `/admin` (utilizator `admin`). Fără ea se generează una aleatorie la fiecare pornire și apare în fereastra backend-ului. |
| `CORS_ALLOWED_ORIGINS` | Domeniile frontend-ului, separate prin virgulă (implicit `http://localhost:3000`). |
| `GOOGLE_CREDENTIALS_JSON` / `GOOGLE_APPLICATION_CREDENTIALS` | Credențialele contului de serviciu Google Drive (alternativ: `backend/src/main/resources/fotoit-gallery-credentials.json`). |
| `NEXT_PUBLIC_API_URL` | În `frontend/frontend/.env.local`: adresa backend-ului. |

## Rulare manuală

```bash
# backend
cd backend && ./mvnw spring-boot:run

# frontend
cd frontend/frontend && npm install && npm run dev
```

## Note

- Thumbnail-urile (800px) și preview-urile (2048px) se generează o singură dată și se păstrează în `backend/cache/`.
  Thumbnail-urile se pregenerează în fundal după fiecare sincronizare din admin.
- Baza de date `backend/fotoit.db` nu e în git; fă-i backup separat.

**Git:** github.com/crisanalex15/FotoIT
