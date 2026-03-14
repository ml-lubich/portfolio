/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hide X-Powered-By header for security
  poweredByHeader: false,
  // Enable React strict mode for catching bugs early
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },
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
      "framer-motion",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-popover",
      "@radix-ui/react-tabs",
      "recharts",
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
        // X-DNS-Prefetch-Control — enables DNS prefetching for performance
        { key: "X-DNS-Prefetch-Control", value: "on" },
      ],
    },
  ],
}

export default nextConfig
