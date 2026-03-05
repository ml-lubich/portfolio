import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/site-config"

const BASE_URL = SITE_URL

/**
 * Comprehensive robots.txt with per-bot directives.
 *
 * Key SEO decisions:
 * - Allow all major crawlers full access to content
 * - Allow AI crawlers (GPTBot, Google-Extended, etc.) for visibility
 *   in AI Overviews, ChatGPT search, Perplexity, and other AI surfaces
 * - Block API routes & Next.js internals
 * - Block demo page (non-production content)
 * - Declare sitemap for discovery
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog", "/blog/*", "/feed.xml"],
        disallow: ["/api/", "/_next/", "/demo/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
      },
      {
        // Google's AI crawler — powers AI Overviews and Gemini
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
      {
        // Social media crawlers — allow everything for rich previews
        userAgent: "Twitterbot",
        allow: "/",
      },
      {
        userAgent: "LinkedInBot",
        allow: "/",
      },
      {
        userAgent: "facebookexternalhit",
        allow: "/",
      },
      {
        // OpenAI's crawler — powers ChatGPT search & browsing
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
      {
        // OpenAI's user-triggered browsing agent
        userAgent: "ChatGPT-User",
        allow: "/",
      },
      {
        // Anthropic's crawler
        userAgent: "anthropic-ai",
        allow: "/",
      },
      {
        // Perplexity AI search crawler
        userAgent: "PerplexityBot",
        allow: "/",
      },
      {
        // Common Crawl — used by many AI training datasets
        userAgent: "CCBot",
        allow: "/",
      },
      {
        // Meta AI crawler
        userAgent: "FacebookBot",
        allow: "/",
      },
      {
        // Apple's AI crawler (Apple Intelligence features)
        userAgent: "Applebot-Extended",
        allow: "/",
      },
      {
        // Cohere AI crawler
        userAgent: "cohere-ai",
        allow: "/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
