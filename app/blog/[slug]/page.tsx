import React from "react"
import { blogPosts, getPostBySlug, getReadingTime, getRelatedPosts, AUTHOR } from "@/lib/blog-data"
import { BlogPostView } from "./blog-post-view"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import { mdxComponents } from "@/components/blog/mdx-components"
import { ChartFence } from "@/components/blog/chart-fence"
import { transformChartFences } from "@/lib/mdx-chart-fences"
import remarkGfm from "remark-gfm"
import {
  SITE_URL,
  SITE_DEFAULT_OG_IMAGE,
  SITE_DEFAULT_OG_IMAGE_SIZE,
} from "@/lib/site-config"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: "Post Not Found", robots: { index: false } }

  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`
  const readingTime = getReadingTime(post.content)

  return {
    title: post.title,
    description: post.excerpt,
    keywords: [
      ...post.tags,
      post.category,
      "AI Engineering",
      "Misha Lubich",
      "Machine Learning",
      "Software Engineering Blog",
    ],
    authors: [{ name: AUTHOR.name, url: SITE_URL }],
    creator: AUTHOR.name,
    publisher: AUTHOR.name,
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
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      locale: "en_US",
      url: canonicalUrl,
      siteName: "Misha Lubich — AI Engineering Blog",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      modifiedTime: post.date,
      expirationTime: undefined,
      authors: [AUTHOR.name],
      section: post.category,
      tags: post.tags,
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage, alt: post.title }],
      creator: "@mishalubich",
      site: "@mishalubich",
    },
    other: {
      "article:published_time": post.date,
      "article:author": AUTHOR.name,
      "article:section": post.category,
      "article:tag": post.tags.join(","),
    },
  }
}

/**
 * Server-rendered JSON-LD for blog posts — ensures structured data
 * is in the initial HTML payload before any JS runs, critical for
 * Googlebot and other crawlers.
 */
function BlogPostJsonLd({ slug }: { slug: string }) {
  const post = getPostBySlug(slug)
  if (!post) return null

  const readingTime = getReadingTime(post.content)
  const wordCount = post.content.split(/\s+/).filter(Boolean).length
  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`
  const related = getRelatedPosts(post.slug, 3)

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonicalUrl}#article`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    headline: post.title,
    alternativeHeadline: post.excerpt.slice(0, 110),
    description: post.excerpt,
    image: {
      "@type": "ImageObject",
      url: post.coverImage,
      width: 1200,
      height: 630,
    },
    datePublished: post.date,
    dateModified: post.date,
    dateCreated: post.date,
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: AUTHOR.name,
      url: SITE_URL,
      jobTitle: AUTHOR.role,
      sameAs: [
        "https://github.com/ml-lubich",
        "https://linkedin.com/in/mishalubich",
      ],
    },
    publisher: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: AUTHOR.name,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}${SITE_DEFAULT_OG_IMAGE}`,
        width: SITE_DEFAULT_OG_IMAGE_SIZE.width,
        height: SITE_DEFAULT_OG_IMAGE_SIZE.height,
      },
    },
    keywords: post.tags.join(", "),
    articleSection: post.category,
    wordCount,
    timeRequired: `PT${readingTime}M`,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    isPartOf: {
      "@type": "Blog",
      "@id": `${SITE_URL}/blog#blog`,
      name: "AI Engineering Perspectives",
      url: `${SITE_URL}/blog`,
    },
    url: canonicalUrl,
    copyrightYear: new Date(post.date).getFullYear(),
    copyrightHolder: {
      "@type": "Person",
      name: AUTHOR.name,
    },
    ...(related.length > 0 && {
      relatedLink: related.map(r => `${SITE_URL}/blog/${r.slug}`),
    }),
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  }

  // Auto-generate FAQ schema from question-like h2 headings
  const faqMatches = post.content.match(
    /^##\s+((?:Why|How|What|Is|Are|Should|Can|Do|Does|Will|When)\b[^\n]+)/gm
  )
  const faqSchema =
    faqMatches && faqMatches.length >= 2
      ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqMatches.slice(0, 5).map((q) => {
          const question = q.replace(/^##\s+/, "").trim()
          const idx = post.content.indexOf(q)
          const afterHeading = post.content.slice(idx + q.length).trim()
          const answer = afterHeading
            .split(/\n##/)[0]
            .replace(/```[\s\S]*?```/g, "")
            .replace(/[#*`>|\-\[\]()]/g, "")
            .trim()
            .slice(0, 500)
          return {
            "@type": "Question",
            name: question.endsWith("?") ? question : `${question}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: answer || question,
            },
          }
        }),
      }
      : null

  const schemas = [articleSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])]

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={`blog-jsonld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const relatedPosts = getRelatedPosts(slug, 3)

  return (
    <>
      <BlogPostJsonLd slug={slug} />
      <BlogPostView post={post} relatedPosts={relatedPosts}>
        <div className="blog-prose mdx-content">
          <MDXRemote
            source={transformChartFences(post.content)}
            components={{ ...mdxComponents, ChartFence }}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
              },
            }}
          />
        </div>
      </BlogPostView>
    </>
  )
}
