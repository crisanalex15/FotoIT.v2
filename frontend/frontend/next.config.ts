import type { NextConfig } from "next";

/** Adresa interna a backend-ului Spring Boot (nu e expusa in browser) */
const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:8080").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  /**
   * Browserul cere pozele de la acelasi domeniu (/api/gallery/...), iar Next.js le preia
   * de la backend. Asa e nevoie de un singur port public (ex: prin Cloudflare Tunnel),
   * iar panoul de admin de pe 8080 ramane accesibil doar local.
   */
  async rewrites() {
    return [
      {
        source: "/api/gallery/:path*",
        destination: `${BACKEND_URL}/api/gallery/:path*`,
      },
    ];
  },
  experimental: {
    // Arhivele ZIP mari pot dura cateva minute; implicit proxy-ul renunta dupa 30s
    proxyTimeout: 10 * 60 * 1000,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
