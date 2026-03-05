import { blogPosts, getReadingTime, AUTHOR } from "@/lib/blog-data"

import { SITE_URL } from "@/lib/site-config"

const BASE_URL = SITE_URL

/**
 * RSS 2.0 feed for the blog.
 *
 * Google News, Feedly, and other aggregators discover content through RSS,
 * which increases crawl frequency and can surface posts in Google Discover.
 *
 * Route: /feed.xml
 */
export async function GET() {
  const posts = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const latestDate = posts[0]?.date
    ? new Date(posts[0].date).toUTCString()
    : new Date().toUTCString()

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")

  const rssItems = posts
    .map((post) => {
      const readingTime = getReadingTime(post.content)
      const url = `${BASE_URL}/blog/${post.slug}`
      // Strip markdown for a plain-text excerpt
      const plainExcerpt = post.excerpt.replace(/[#*`>|\-\[\]()]/g, "").trim()

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(plainExcerpt)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>misha@mishalubich.com (${AUTHOR.name})</author>
      <category>${escapeXml(post.category)}</category>
${post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n")}
      <enclosure url="${escapeXml(post.coverImage)}" type="image/jpeg" length="0" />
      <source url="${BASE_URL}/feed.xml">AI Engineering Perspectives by Misha Lubich</source>
    </item>`
    })
    .join("\n")

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
>
  <channel>
    <title>AI Engineering Perspectives — Misha Lubich</title>
    <link>${BASE_URL}/blog</link>
    <description>Deep dives on modern AI engineering, LLMs, MLOps, prompt engineering, and the future of software development. Hard-won production lessons by Misha Lubich.</description>
    <language>en-us</language>
    <lastBuildDate>${latestDate}</lastBuildDate>
    <managingEditor>misha@mishalubich.com (Misha Lubich)</managingEditor>
    <webMaster>misha@mishalubich.com (Misha Lubich)</webMaster>
    <copyright>Copyright ${new Date().getFullYear()} Misha Lubich. All rights reserved.</copyright>
    <generator>Next.js</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <ttl>60</ttl>
    <image>
      <url>${BASE_URL}/logo.png</url>
      <title>AI Engineering Perspectives — Misha Lubich</title>
      <link>${BASE_URL}/blog</link>
      <width>144</width>
      <height>144</height>
    </image>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
