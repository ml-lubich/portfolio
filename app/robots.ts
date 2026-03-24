import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/site-config"

const BASE_URL = SITE_URL

/**
 * Crawler-friendly robots.txt — maximize indexable surface for SEO.
 *
 * - `Allow: /` — all public pages (home, blog, etc.) are open to every bot.
 * - `Disallow` only what must not be indexed: API handlers and Next.js build
 *   internals. Public routes like `/demo` are not blocked here; pages that
 *   should stay out of search results use `metadata.robots` (e.g. noindex).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
