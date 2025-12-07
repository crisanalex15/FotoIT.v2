// Constante globale

export const SITE_NAME = 'Next.js App';
export const SITE_DESCRIPTION = 'Aplicație Next.js modernă cu arhitectură completă';

export const NAV_LINKS = [
  { href: '/', label: 'Acasă' },
  { href: '/about', label: 'Despre' },
  { href: '/contact', label: 'Contact' },
] as const;

export const API_ENDPOINTS = {
  USERS: '/api/users',
  POSTS: '/api/posts',
} as const;

