import React, { Suspense } from "react"
import type { Metadata } from "next"
import { BlogHeader } from "@/components/blog/blog-header"
import { blogPosts } from "@/lib/blog-data"
import { shadows } from "@/lib/theme"
import {
  SITE_URL,
  SITE_DEFAULT_OG_IMAGE,
  SITE_DEFAULT_OG_IMAGE_SIZE,
} from "@/lib/site-config"

const BASE_URL = SITE_URL

export const metadata: Metadata = {
  title: {
    default: "AI Engineering Blog | Misha Lubich — Perspectives on ML, LLMs & MLOps",
    template: "%s | Misha Lubich Blog",
  },
  description:
    "Deep dives on modern AI engineering, LLMs, MLOps, prompt engineering, RAG, multi-agent systems, and the future of software development. Hard-won production lessons from Apple, GitHub, and beyond by Misha Lubich.",
  keywords: [
    "AI Engineering Blog",
    "Machine Learning Blog",
    "LLM Blog",
    "MLOps",
    "AI Architecture",
    "Prompt Engineering",
    "AI Code Generation",
    "RAG Retrieval Augmented Generation",
    "Fine-Tuning LLMs",
    "Multi-Agent Systems",
    "Misha Lubich Blog",
    "AI Engineer Perspectives",
    "Deep Learning",
    "Production ML",
    "AI Safety",
    "Open Source AI",
    "Technical Blog",
    "Software Engineering Blog",
    "Neural Networks",
    "Transformer Models",
  ],
  authors: [{ name: "Misha Lubich", url: BASE_URL }],
  creator: "Misha Lubich",
  publisher: "Misha Lubich",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: `${BASE_URL}/blog`,
    types: {
      "application/rss+xml": `${BASE_URL}/feed.xml`,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${BASE_URL}/blog`,
    siteName: "Misha Lubich — AI Engineering Blog",
    title: "AI Engineering Perspectives | Misha Lubich Blog",
    description:
      "Controversial takes and deep dives on modern AI engineering, LLMs, MLOps, and the future of software development. No hype — just what actually works in production.",
    images: [
      {
        url: SITE_DEFAULT_OG_IMAGE,
        width: SITE_DEFAULT_OG_IMAGE_SIZE.width,
        height: SITE_DEFAULT_OG_IMAGE_SIZE.height,
        alt: "Misha Lubich AI Engineering Blog — Perspectives on ML, LLMs & MLOps",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Engineering Perspectives | Misha Lubich Blog",
    description:
      "Deep dives on AI engineering, LLMs, MLOps & production ML. Hard-won lessons from Apple, GitHub, and beyond.",
    images: [{ url: SITE_DEFAULT_OG_IMAGE, alt: "Misha Lubich AI Engineering Blog" }],
    creator: "@mishalubich",
    site: "@mishalubich",
  },
}

/**
 * Server-rendered JSON-LD for the blog collection page.
 * This is in the layout so it renders on all /blog/* pages,
 * giving Google a Blog + CollectionPage schema in the initial HTML.
 */
function BlogCollectionJsonLd() {
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${BASE_URL}/blog#blog`,
    name: "AI Engineering Perspectives",
    description:
      "Deep dives on modern AI engineering, LLMs, MLOps, and the future of software development by Misha Lubich.",
    url: `${BASE_URL}/blog`,
    inLanguage: "en-US",
    author: {
      "@type": "Person",
      "@id": `${BASE_URL}/#person`,
      name: "Misha Lubich",
    },
    publisher: {
      "@type": "Person",
      "@id": `${BASE_URL}/#person`,
      name: "Misha Lubich",
    },
    blogPost: blogPosts.slice(0, 10).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      url: `${BASE_URL}/blog/${post.slug}`,
      datePublished: post.date,
      image: post.coverImage,
      author: {
        "@type": "Person",
        name: "Misha Lubich",
      },
      keywords: post.tags.join(", "),
      articleSection: post.category,
    })),
  }

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${BASE_URL}/blog#collection`,
    name: "AI Engineering Blog — All Articles",
    description: `Collection of ${blogPosts.length} articles on AI engineering, LLMs, MLOps, and production machine learning.`,
    url: `${BASE_URL}/blog`,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: blogPosts.length,
      itemListElement: blogPosts.slice(0, 20).map((post, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${BASE_URL}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${BASE_URL}/blog`,
      },
    ],
  }

  return (
    <>
      {[blogSchema, collectionSchema, breadcrumbSchema].map((schema, i) => (
        <script
          key={`blog-collection-ld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="relative z-10 min-h-screen"
      style={{
        background:
          "linear-gradient(to bottom, transparent 0%, hsl(220 20% 4% / 0.88) 120px)",
      }}
    >
      <BlogCollectionJsonLd />
      <Suspense fallback={null}>
        <BlogHeader />
      </Suspense>
      <main id="main-content" className="pt-20" role="main">{children}</main>

      {/* Blog footer — semantic nav for crawlers */}
      <footer className="border-t border-white/[0.06] py-10" role="contentinfo">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent shadow-[${shadows.blogAvatar.replace('20px', '12px')}]`}>
                <span className="text-xs font-bold text-primary-foreground">ML</span>
              </div>
              <a href={`${BASE_URL}/blog`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                blog.mishalubich.com
              </a>
            </div>
            <nav aria-label="Blog footer navigation" className="flex items-center gap-4">
              <a href={BASE_URL} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Portfolio</a>
              <a href={`${BASE_URL}/blog`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">All Posts</a>
              <a href={`${BASE_URL}/feed.xml`} className="text-xs text-muted-foreground hover:text-foreground transition-colors" title="RSS Feed">RSS</a>
            </nav>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Misha Lubich. Opinions are my own. Built with Next.js &amp; Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
