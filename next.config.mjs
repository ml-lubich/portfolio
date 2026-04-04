import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lock workspace to this app when a parent directory has its own lockfile (avoids wrong root + hydration mismatches).
  turbopack: {
    root: __dirname,
  },
  // Webpack dev / output tracing uses this when multiple lockfiles exist (e.g. ~/package-lock.json + ./bun.lock).
  outputFileTracingRoot: __dirname,
  // Hide X-Powered-By header for security
  poweredByHeader: false,
  // Enable React strict mode for catching bugs early
  reactStrictMode: true,
  // TypeScript errors must be fixed — never ship with ignoreBuildErrors
  typescript: {
    ignoreBuildErrors: false,
  },
  // Use Next.js image optimization (vercel/cloudflare) in production
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  devIndicators: false,
  // Aggressive chunking — puts Three.js / heavy libs in their own chunk
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "framer-motion",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-popover",
      "@radix-ui/react-tabs",
      "recharts",
    ],
    // LAN / alternate host dev (Next 16+); silences cross-origin _next warnings on local network.
    allowedDevOrigins: [
      "http://192.168.1.200:3000",
      "http://192.168.1.200:3002",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3002",
    ],
  },
  // Cache static assets aggressively & add security/SEO headers
  headers: async () => [
    {
      source: "/:all*(svg|jpg|png|webp|avif|woff2|woff)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      // Cache JS/CSS chunks immutably (they have content hashes)
      source: "/_next/static/:path*",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      // RSS feed — cache for 1 hour, serve stale while revalidating
      source: "/feed.xml",
      headers: [
        { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=600" },
        { key: "Content-Type", value: "application/rss+xml; charset=utf-8" },
      ],
    },
    {
      // Sitemap — cache for 1 hour
      source: "/sitemap.xml",
      headers: [
        { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=600" },
      ],
    },
    {
      // Security & performance headers for all routes
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "Cross-Origin-Opener-Policy",
          value: "same-origin",
        },
        // X-DNS-Prefetch-Control — enables DNS prefetching for performance
        { key: "X-DNS-Prefetch-Control", value: "on" },
      ],
    },
  ],
}

export default nextConfig
