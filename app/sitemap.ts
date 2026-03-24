import type { MetadataRoute } from "next"
import { blogPosts, BLOG_CATEGORIES } from "@/lib/blog-data"
import { SITE_URL } from "@/lib/site-config"

/**
 * Dynamic sitemap generation.
 *
 * Best practices applied:
 * - Homepage at priority 1.0
 * - Blog listing at 0.9 (content hub with frequent updates)
 * - Blog posts at 0.8 (individual content — the main SEO target)
 * - Blog category pages at 0.6 (thin content, mostly filters)
 * - RSS feed included in sitemap for discovery
 * - Hash anchors (#about etc) removed — Google ignores fragments
 * - Dates use actual content dates, not "now"
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  // Get the most recent blog post date for the blog listing page
  const latestBlogDate = blogPosts.length > 0
    ? new Date(
        Math.max(...blogPosts.map((p) => new Date(p.date).getTime()))
      ).toISOString()
    : now

  /* ── Static pages ─────────────────────────────────────────── */
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: latestBlogDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/feed.xml`,
      lastModified: latestBlogDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ]

  /* ── Blog category pages ──────────────────────────────────── */
  const categoryPages: MetadataRoute.Sitemap = BLOG_CATEGORIES
    .filter((cat) => cat !== "All")
    .map((category) => ({
      url: `${SITE_URL}/blog?category=${encodeURIComponent(category)}`,
      lastModified: latestBlogDate,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))

  /* ── Blog posts — highest-value pages for SEO ─────────────── */
  const blogPages: MetadataRoute.Sitemap = blogPosts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date).toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))

  return [...staticPages, ...categoryPages, ...blogPages]
}
