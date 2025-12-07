# Next.js Frontend - Arhitectură Completă

Acest proiect este un exemplu complet de arhitectură frontend modernă construită cu Next.js 16, TypeScript și Tailwind CSS.

## 📁 Structura Proiectului

```
frontend/
├── app/                    # App Router (Next.js 13+)
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Pagina principală
│   ├── about/             # Pagina despre
│   ├── contact/           # Pagina de contact
│   └── globals.css        # Stiluri globale
├── components/            # Componente React
│   ├── ui/                # Componente UI reutilizabile
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── index.ts
│   ├── layout/            # Componente de layout
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── forms/             # Formulare
│       └── ContactForm.tsx
├── hooks/                 # Custom React Hooks
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
├── lib/                   # Biblioteci și utilitare
│   └── utils.ts           # Funcții helper
├── types/                 # Tipuri TypeScript
│   └── index.ts
└── utils/                 # Constante și configurări
    └── constants.ts
```

## 🚀 Caracteristici

- ✅ **Next.js 16** cu App Router
- ✅ **TypeScript** pentru type safety
- ✅ **Tailwind CSS** pentru stilizare
- ✅ **Componente modulare** și reutilizabile
- ✅ **Dark mode** support
- ✅ **Responsive design**
- ✅ **Custom hooks** (useLocalStorage, useDebounce)
- ✅ **Structură organizată** și scalabilă

## 📦 Instalare

```bash
npm install
```

## 🏃 Rulare

### Development
```bash
npm run dev
```

Aplicația va fi disponibilă la [http://localhost:3000](http://localhost:3000)

### Build pentru producție
```bash
npm run build
npm start
```

## 🎨 Componente

### UI Components
- **Button** - Buton reutilizabil cu variante (primary, secondary, outline, ghost)
- **Card** - Card component cu header, content, footer

### Layout Components
- **Header** - Header cu navigare
- **Footer** - Footer cu informații

### Forms
- **ContactForm** - Formular de contact funcțional

## 🔧 Utilitare

- `cn()` - Combină clase Tailwind CSS
- `formatDate()` - Formatează date
- `truncate()` - Truncatează text
- `isValidEmail()` - Validează email

## 📝 Hooks Custom

- `useLocalStorage` - Gestionare localStorage
- `useDebounce` - Debounce pentru valori

## 🌐 Routing

Aplicația folosește App Router din Next.js:
- `/` - Pagina principală
- `/about` - Despre
- `/contact` - Contact

## 🎯 Best Practices

1. **Componente modulare** - Fiecare componentă are un scop clar
2. **TypeScript** - Toate componentele sunt type-safe
3. **Reutilizare** - Componente UI reutilizabile în `components/ui/`
4. **Organizare** - Structură clară de foldere
5. **Performance** - Optimizări Next.js (Image, Link, etc.)

## 📚 Resurse

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
