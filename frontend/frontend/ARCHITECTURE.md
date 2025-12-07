# Arhitectura Frontend

## 📐 Structura Proiectului

### `/app` - App Router (Next.js 13+)
Conține toate rutele și layout-urile aplicației folosind App Router-ul din Next.js.

- `layout.tsx` - Layout principal cu Header și Footer
- `page.tsx` - Pagina principală (Home)
- `about/page.tsx` - Pagina despre
- `contact/page.tsx` - Pagina de contact
- `globals.css` - Stiluri globale și variabile CSS

### `/components` - Componente React

#### `/components/ui` - Componente UI Reutilizabile
Componente de bază care pot fi folosite în întreaga aplicație:
- `Button.tsx` - Buton cu variante și dimensiuni
- `Card.tsx` - Card component cu sub-componente (Header, Content, Footer)

#### `/components/layout` - Componente de Layout
- `Header.tsx` - Header cu navigare
- `Footer.tsx` - Footer cu informații

#### `/components/forms` - Formulare
- `ContactForm.tsx` - Formular de contact funcțional

### `/hooks` - Custom React Hooks
- `useLocalStorage.ts` - Hook pentru gestionarea localStorage
- `useDebounce.ts` - Hook pentru debounce a valorilor

### `/lib` - Biblioteci și Utilitare
- `utils.ts` - Funcții helper (cn, formatDate, truncate, isValidEmail)

### `/types` - Tipuri TypeScript
- `index.ts` - Tipuri globale (User, Post, ApiResponse, Theme)

### `/utils` - Constante și Configurări
- `constants.ts` - Constante globale (SITE_NAME, NAV_LINKS, API_ENDPOINTS)

## 🎯 Principii de Design

### 1. Componentizare
- Fiecare componentă are un scop clar și bine definit
- Componentele sunt reutilizabile și modulare
- Separare între componente UI și componente de business logic

### 2. Type Safety
- Toate componentele sunt type-safe cu TypeScript
- Tipuri definite pentru toate interfețele și props-urile
- Export de tipuri pentru reutilizare

### 3. Stilizare
- Tailwind CSS pentru stilizare utility-first
- Variabile CSS pentru teme (light/dark)
- Clase reutilizabile prin funcția `cn()`

### 4. Organizare
- Structură de foldere clară și logică
- Separare între componente, utilitare, tipuri și configurații
- Fișiere index pentru export-uri organizate

## 🔄 Flux de Date

1. **Server Components** (implicit în App Router)
   - Paginile sunt Server Components by default
   - Acces direct la date și API-uri

2. **Client Components** (cu 'use client')
   - Pentru interactivitate (formulare, hooks, state)
   - Folosite când este necesară interactivitatea

3. **State Management**
   - React hooks pentru state local
   - Custom hooks pentru logică reutilizabilă
   - localStorage pentru persistență (prin useLocalStorage)

## 🎨 Stilizare

### Tailwind CSS
- Configurație în `postcss.config.mjs`
- Variabile CSS în `globals.css`
- Dark mode support prin `prefers-color-scheme`

### Componente Stilizate
- Toate componentele folosesc Tailwind classes
- Funcția `cn()` pentru combinarea claselor
- Variante și dimensiuni pentru componente (ex: Button)

## 📦 Dependențe Principale

- **next** - Framework React
- **react** & **react-dom** - Biblioteca UI
- **typescript** - Type safety
- **tailwindcss** - Stilizare
- **clsx** & **tailwind-merge** - Utilitare pentru clase CSS

## 🚀 Extindere

### Adăugare Pagină Nouă
1. Creează folder în `/app` (ex: `/app/products`)
2. Adaugă `page.tsx` în folder
3. Adaugă link în `NAV_LINKS` din `utils/constants.ts`

### Adăugare Componentă UI
1. Creează componentă în `/components/ui`
2. Exportă din `/components/ui/index.ts`
3. Folosește tipuri TypeScript pentru props

### Adăugare Hook Custom
1. Creează hook în `/hooks`
2. Folosește prefixul `use` pentru nume
3. Exportă direct din fișier

## 📝 Best Practices

1. **Naming**: Folosește PascalCase pentru componente, camelCase pentru funcții
2. **Exports**: Folosește named exports pentru utilitare, default exports pentru componente
3. **Types**: Definește tipuri în `/types` pentru reutilizare
4. **Constants**: Păstrează constantele în `/utils/constants.ts`
5. **Styling**: Folosește Tailwind classes, evită inline styles
6. **Performance**: Folosește Server Components când este posibil

