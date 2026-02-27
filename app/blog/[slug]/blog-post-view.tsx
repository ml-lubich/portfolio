"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import type { BlogPost } from "@/lib/blog-data"
import { getRelatedPosts, getReadingTime, AUTHOR } from "@/lib/blog-data"
import { BlogContent } from "@/components/blog/blog-content"
import { BlogCard } from "@/components/blog/blog-card"

interface BlogPostViewProps {
  post: BlogPost
}

export function BlogPostView({ post }: BlogPostViewProps) {
  const readingTime = getReadingTime(post.content)
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const related = getRelatedPosts(post.slug, 3)

  // JSON-LD for this article
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Person", name: AUTHOR.name },
    image: post.coverImage,
    keywords: post.tags.join(", "),
    articleSection: post.category,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="relative mx-auto max-w-4xl px-6 py-12" itemScope itemType="https://schema.org/BlogPosting">
        {/* Ambient gradient orbs */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-[300px] right-0 h-[500px] w-[500px] rounded-full bg-primary/[0.03] blur-[120px]" />
          <div className="absolute bottom-0 -left-[200px] h-[400px] w-[400px] rounded-full bg-accent/[0.03] blur-[100px]" />
        </div>

        <div className="relative z-10">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 flex items-center gap-2 text-sm text-muted-foreground"
            aria-label="Breadcrumb"
          >
            <Link href="/blog" className="transition-colors hover:text-foreground">
              Blog
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/60 truncate max-w-[300px]">{post.title}</span>
          </motion.nav>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10"
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm" itemProp="articleSection">
                {post.category}
              </span>
              {post.tags.slice(0, 4).map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="hidden sm:inline-flex items-center rounded-full border border-white/[0.04] bg-white/[0.02] px-2.5 py-0.5 text-xs text-muted-foreground/70 backdrop-blur-sm transition-all hover:border-accent/20 hover:text-accent/80"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl" itemProp="headline">
              {post.title}
            </h1>

            <p className="mt-4 text-lg text-muted-foreground leading-relaxed" itemProp="description">
              {post.excerpt}
            </p>

            <div className="mt-6 flex items-center gap-4" itemProp="author" itemScope itemType="https://schema.org/Person">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-[0_0_20px_hsla(217,91%,60%,0.2)]">
                <span className="text-xs font-bold text-primary-foreground">ML</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground" itemProp="name">{AUTHOR.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <time dateTime={post.date} itemProp="datePublished">{formattedDate}</time>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                  <span>{readingTime} min read</span>
                </div>
              </div>
            </div>
          </motion.header>

          {/* Cover image */}
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mb-12 overflow-hidden rounded-2xl border border-white/[0.06]"
          >
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-[300px] w-full object-cover md:h-[420px]"
              itemProp="image"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="blog-content"
            itemProp="articleBody"
          >
            <BlogContent content={post.content} />
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-16 flex flex-wrap gap-2 border-t border-white/[0.06] pt-8"
          >
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="rounded-full border border-white/[0.04] bg-white/[0.02] px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm transition-all hover:border-accent/20 hover:text-accent/80"
              >
                #{tag}
              </Link>
            ))}
          </motion.div>

          {/* Share & back */}
          <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-8">
            <Link
              href="/blog"
              className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="transition-transform group-hover:-translate-x-1" aria-hidden="true">←</span>
              Back to all posts
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://blog.mishalubich.com/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/20 hover:text-foreground hover:shadow-[0_0_15px_hsla(217,91%,60%,0.1)]"
                aria-label="Share on Twitter"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://blog.mishalubich.com/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/20 hover:text-foreground hover:shadow-[0_0_15px_hsla(217,91%,60%,0.1)]"
                aria-label="Share on LinkedIn"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16"
              aria-label="Related articles"
            >
              <h2 className="mb-6 text-2xl font-semibold text-foreground">Related Articles</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <BlogCard key={p.slug} post={p} />
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </article>
    </>
  )
}
