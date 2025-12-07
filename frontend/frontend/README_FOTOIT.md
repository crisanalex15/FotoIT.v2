# 📸 FotoIT - Frontend Next.js

Frontend-ul pentru aplicația FotoIT, construit cu Next.js 16, TypeScript și Tailwind CSS.

**Design recreat după versiunea originală FotoIT** cu:
- Culori elegante: auriu (#d4af37) și negru (#1e1e1e)
- Fonturi elegante: Playfair Display, Dancing Script
- Secțiuni: Hero, Despre, Galerie, Contact
- Modală pentru introducere cod galerie

## 🚀 Quick Start

### 1️⃣ **Instalează Dependențele**

```bash
cd frontend/frontend
npm install
```

### 2️⃣ **Configurează API URL**

Creează fișierul `.env.local`:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SITE_NAME=FotoIT
```

### 3️⃣ **Adaugă Asset-urile (Opțional)**

Pentru design complet, copiază asset-urile din proiectul original:

```powershell
# Logo
Copy-Item "FotoIT-main\FotoIT-main\src\Screen1\Fotoit.png" -Destination "public\logo-fotoit.png"

# Background-uri
Copy-Item "FotoIT-main\FotoIT-main\src\Screen1\Background1.png" -Destination "public\Background1.png"
Copy-Item "FotoIT-main\FotoIT-main\src\Screen1\Background2.png" -Destination "public\Background2.png"

# Profil
Copy-Item "FotoIT-main\FotoIT-main\src\Screen2\Profil.jpg" -Destination "public\profil.jpg"

# Instagram
Copy-Item "FotoIT-main\FotoIT-main\src\instagram.png" -Destination "public\instagram.png"
```

**Notă:** Dacă asset-urile lipsesc, aplicația are fallback-uri și va funcționa oricum.

### 4️⃣ **Pornește Aplicația**

```bash
npm run dev
```

Aplicația va rula pe: **http://localhost:3000**

---

## 📁 Structura Proiectului

```
frontend/frontend/
├── app/
│   ├── page.tsx                    → Pagina principală (introducere cod)
│   ├── gallery/
│   │   └── [code]/
│   │       ├── page.tsx            → Pagina galeriei
│   │       └── not-found.tsx       → Pagina 404 pentru galerii negăsite
│   └── layout.tsx                  → Layout principal
├── components/
│   ├── gallery/
│   │   ├── PhotoGallery.tsx        → Componenta pentru afișarea pozelor
│   │   ├── CodeInput.tsx           → Input pentru cod galerie
│   │   └── ShareSection.tsx        → Secțiune partajare link
│   └── ui/                         → Componente UI reutilizabile
├── lib/
│   └── api.ts                      → Service API pentru backend
├── types/
│   └── gallery.ts                  → Tipuri TypeScript pentru galerie
└── next.config.ts                  → Configurare Next.js
```

---

## 🎯 Funcționalități

### ✅ Pagina Principală (`/`)
- **Hero Section:** "Prinde Momente, Modelează Amintiri" (design original)
- **Despre Section:** Profil Alex cu poza și descriere
- **Galerie Preview:** Informații despre tipurile de evenimente
- **Contact Section:** Date de contact + buton pentru galerie
- **Modală Cod:** Buton "📸 GALERIE" în header deschide modală pentru introducere cod

### ✅ Pagina Galerie (`/gallery/[code]`)
- Afișare grid responsive cu poze (design elegant)
- Lightbox pentru vizualizare full-screen
- Badge pentru tipul evenimentului (Nunti/Majorate/Evenimente)
- Secțiune pentru partajare link
- Header cu numele evenimentului

### ✅ Componente
- **PhotoGallery**: Grid cu poze + lightbox
- **CodeInput**: Formular pentru introducere cod
- **ShareSection**: Partajare link galerie

---

## 🔌 Integrare cu Backend

Frontend-ul comunică cu backend-ul Spring Boot prin API:

### **Endpoint Folosit:**
```
GET /api/gallery/{code}
```

### **Response:**
```json
{
  "code": "ABC123",
  "eventType": "WEDDING",
  "name": "Nunta Maria & Ion",
  "description": "...",
  "totalPhotos": 25,
  "photos": [
    {
      "id": 1,
      "filename": "IMG_001.jpg",
      "url": "https://drive.google.com/file/d/.../view",
      "thumbnailUrl": "https://drive.google.com/thumbnail?id=...",
      "weddingId": 1,
      "fileId": "...",
      "createdAt": "2025-12-05T10:00:00"
    }
  ]
}
```

---

## 🎨 Stilizare

Aplicația folosește **Tailwind CSS** pentru styling:
- Design responsive (mobile-first)
- Suport dark mode
- Componente UI moderne

---

## 🔧 Configurare

### **Variabile de Mediu**

Creează `.env.local`:

```env
# URL-ul backend-ului Spring Boot
NEXT_PUBLIC_API_URL=http://localhost:8080

# Numele site-ului (opțional)
NEXT_PUBLIC_SITE_NAME=FotoIT
```

### **Next.js Config**

`next.config.ts` este configurat pentru:
- Imagini externe de la Google Drive
- Optimizări pentru producție

---

## 📱 Responsive Design

Aplicația este complet responsive:
- **Mobile**: 1 coloană
- **Tablet**: 2 coloane
- **Desktop**: 3-4 coloane (grid adaptiv)

---

## 🚀 Build pentru Producție

```bash
# Build
npm run build

# Start production server
npm start
```

---

## 🐛 Troubleshooting

### **Eroare: "Failed to fetch"**

**Cauză:** Backend-ul nu rulează sau URL-ul e greșit.

**Soluție:**
1. Verifică că backend-ul rulează pe port 8080
2. Verifică `NEXT_PUBLIC_API_URL` în `.env.local`
3. Verifică CORS în backend (ar trebui să fie activat)

### **Imaginile nu se încarcă**

**Cauză:** Google Drive thumbnails necesită autentificare.

**Soluție:** Componenta folosește deja `<img>` în loc de Next.js `Image` pentru a permite imagini externe.

### **404 pentru galerii valide**

**Cauză:** Backend-ul nu returnează date sau codul e greșit.

**Soluție:**
1. Verifică în browser Network tab ce returnează API-ul
2. Verifică că codul introdus este corect
3. Verifică că backend-ul are poze sincronizate

---

## 📚 Tehnologii

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React 19** - UI library

---

## 🎯 Workflow Utilizator

1. **Utilizatorul accesează** `/`
2. **Introdu codul** galeriei primit
3. **Click "Accesează Galeria"**
4. **Redirect către** `/gallery/{code}`
5. **Vede pozele** în grid responsive
6. **Click pe poză** → Lightbox full-screen
7. **Poate partaja** link-ul galeriei

---

## ✅ Gata de Utilizare!

Frontend-ul este complet funcțional și gata să fie folosit cu backend-ul Spring Boot.

**Testare:**
1. Pornește backend-ul: `http://localhost:8080`
2. Pornește frontend-ul: `http://localhost:3000`
3. Introdu un cod de galerie valid
4. Explorează pozele!

---

**🎉 Succes cu FotoIT!**

