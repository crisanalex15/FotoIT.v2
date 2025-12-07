# Ghid GSAP pentru FotoIT

Acest ghid explică cum să folosești GSAP pentru animații în proiectul FotoIT.

## 📦 Instalare

GSAP este deja instalat. Dacă trebuie să-l reinstalezi:

```bash
npm install gsap
```

## 🎯 Utilizare de bază

### 1. Import GSAP

```typescript
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Înregistrează plugin-ul (doar o dată)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
```

### 2. Animație simplă

```typescript
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function MyComponent() {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      gsap.fromTo(
        elementRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      );
    }
  }, []);

  return <div ref={elementRef}>Conținut animat</div>;
}
```

## 🎨 Hooks disponibile

### `useFadeInOnScroll`

Animație fade-in când elementul intră în viewport:

```typescript
import { useFadeInOnScroll } from "@/hooks/useGSAP";

export default function MyComponent() {
  const fadeRef = useFadeInOnScroll();

  return <div ref={fadeRef}>Apare la scroll</div>;
}
```

### `useSlideIn`

Animație slide-in din direcții diferite:

```typescript
import { useSlideIn } from "@/hooks/useGSAP";

export default function MyComponent() {
  const slideRef = useSlideIn("left"); // sau "right", "up", "down"

  return <div ref={slideRef}>Slide din stânga</div>;
}
```

### `useStaggerAnimation`

Animație cascadă pentru mai multe elemente:

```typescript
import { useStaggerAnimation } from "@/hooks/useGSAP";

export default function MyComponent() {
  const containerRef = useStaggerAnimation(".item");

  return (
    <div ref={containerRef}>
      <div className="item">Item 1</div>
      <div className="item">Item 2</div>
      <div className="item">Item 3</div>
    </div>
  );
}
```

## 🛠️ Funcții helper

### `fadeIn`

```typescript
import { fadeIn } from "@/lib/animations";

fadeIn(".my-element", { duration: 2 });
```

### `slideIn`

```typescript
import { slideIn } from "@/lib/animations";

slideIn(".my-element", "right", { duration: 1.5 });
```

### `staggerAnimation`

```typescript
import { staggerAnimation } from "@/lib/animations";

const elements = document.querySelectorAll(".item");
staggerAnimation(elements, { stagger: 0.2 });
```

## 📝 Exemple pentru componente existente

### Hero Section

```typescript
<div
  ref={(el) => {
    if (el) {
      gsap.fromTo(
        el.children,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.2,
          ease: "power3.out",
        }
      );
    }
  }}
>
  <h1>Titlu 1</h1>
  <h1>Titlu 2</h1>
</div>
```

### Grid de poze

```typescript
const gridRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!gridRef.current) return;

  const photos = gridRef.current.querySelectorAll(".photo-item");

  gsap.fromTo(
    photos,
    { opacity: 0, scale: 0.8, y: 30 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: gridRef.current,
        start: "top 80%",
      },
    }
  );
}, []);

return <div ref={gridRef}>...</div>;
```

### Lightbox

```typescript
useEffect(() => {
  if (isOpen) {
    gsap.fromTo(
      lightboxRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 }
    );

    gsap.fromTo(
      imageRef.current,
      { scale: 0.8, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(1.7)",
      }
    );
  }
}, [isOpen]);
```

## 🎭 Easing functions

- `power1.out` - Smooth, natural
- `power2.out` - Mai rapid
- `power3.out` - Foarte rapid
- `back.out(1.7)` - Bounce effect
- `elastic.out(1, 0.3)` - Elastic bounce

## 📚 Resurse

- [GSAP Documentation](https://greensock.com/docs/)
- [ScrollTrigger Plugin](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [GSAP Ease Visualizer](https://greensock.com/docs/v3/Eases)

## ⚠️ Note importante

1. **Cleanup**: Întotdeauna cleanup ScrollTrigger în `useEffect` return:
```typescript
return () => {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
};
```

2. **Client-side only**: GSAP funcționează doar în browser, deci verifică `typeof window !== "undefined"`

3. **Performance**: Folosește `will-change` CSS pentru elemente animate frecvent

4. **Mobile**: Testează animațiile pe mobile - pot fi prea intense

