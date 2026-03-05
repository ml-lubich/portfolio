import React from "react"
import Link from "next/link"
import { blogPosts, getReadingTime, BLOG_CATEGORIES, AUTHOR } from "@/lib/blog-data"
import { BlogPageClient } from "./blog-page-client"
import { SITE_URL } from "@/lib/site-config"

/**
 * Server-rendered blog listing page.
 *
 * This wraps the interactive client component with SEO-critical content:
 * 1. A visually-hidden but crawlable list of all blog posts
 * 2. Internal links to every blog post (critical for link equity)
 * 3. Semantic HTML structure (h1, h2, article, time, nav)
 *
 * Crawlers (Googlebot, Bingbot) will see all content immediately
 * in the HTML payload without needing JavaScript execution.
 * The interactive filtering UI still works for real users via
 * the BlogPageClient component.
 */
export default function BlogPage() {
  // Sort posts newest first for the crawler-visible list
  const sortedPosts = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Compute total views on the server so client & server always match
  const totalViews = `${blogPosts.reduce((sum, p) => sum + parseInt(p.views), 0)}k`

  return (
    <>
      {/* Interactive client-side blog page for users */}
      <BlogPageClient blogPosts={blogPosts} totalViews={totalViews} />

      {/* ── Server-rendered SEO content ────────────────────────────
       *  This section is visually hidden but in the DOM for crawlers.
       *  It provides:
       *  - Full list of blog post links (link discovery)
       *  - Proper semantic HTML (article, time, h2, p)
       *  - Internal link equity distribution to all posts
       *  - Rich text content that Googlebot can index
       * ─────────────────────────────────────────────────────────── */}
      <section
        aria-label="Blog post directory"
        className="sr-only"
      >
        <h2>All AI Engineering Articles by Misha Lubich</h2>
        <p>
          Browse {blogPosts.length} articles on AI engineering, machine learning,
          LLMs, MLOps, and modern software development. Written by {AUTHOR.name},{" "}
          {AUTHOR.role} with experience at Apple, GitHub, and cutting-edge AI startups.
        </p>

        {/* Category navigation for crawlers */}
        <nav aria-label="Blog categories">
          <h3>Categories</h3>
          <ul>
            {BLOG_CATEGORIES.filter(c => c !== "All").map((category) => (
              <li key={category}>
                <Link href={`/blog?category=${encodeURIComponent(category)}`}>
                  {category} articles
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Full blog post listing — every post gets a crawlable link */}
        <div>
          {sortedPosts.map((post) => {
            const readingTime = getReadingTime(post.content)
            return (
              <article key={post.slug}>
                <h3>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p>{post.excerpt}</p>
                <p>
                  Category: {post.category} | Reading time: {readingTime} min |{" "}
                  Tags: {post.tags.join(", ")}
                </p>
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <p>By {AUTHOR.name}</p>
              </article>
            )
          })}
        </div>

        {/* Cross-links for SEO equity */}
        <nav aria-label="Site navigation">
          <h3>Explore More</h3>
          <ul>
            <li><Link href="/">Misha Lubich — AI Engineer Portfolio</Link></li>
            <li><Link href="/blog">AI Engineering Blog</Link></li>
            <li><a href={`${SITE_URL}/feed.xml`}>Subscribe via RSS</a></li>
          </ul>
        </nav>
      </section>
    </>
  )
}
