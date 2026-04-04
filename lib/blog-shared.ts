// ──────────────────────────────────────────────────────────────────────
//  Blog shared utilities — client-safe (NO fs/path imports)
//  These can be safely imported from "use client" components.
// ──────────────────────────────────────────────────────────────────────

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  tags: string[]
  coverImage: string
  content: string
  views: string
}

export const BLOG_CATEGORIES = [
  "All",
  "AI Architecture",
  "Engineering Culture",
  "MLOps",
  "AI Products",
  "Open Source",
  "Hot Takes",
] as const

/** Normalize URL `category` query to a known blog category (SSR + client must match). */
export function normalizeBlogCategoryFromParam(
  raw: string | string[] | undefined | null
): string {
  const v = Array.isArray(raw) ? raw[0] : raw
  if (v === undefined || v === null || v === "") return "All"
  return (BLOG_CATEGORIES as readonly string[]).includes(v) ? v : "All"
}

export const AUTHOR = {
  name: "Misha Lubich",
  role: "AI Engineer & Technical Leader",
  avatar: "/ml-avatar.jpg",
}

/**
 * Calculate reading time from content string.
 * ~238 words per minute average reading speed.
 */
export function getReadingTime(content: string): number {
  const codeBlockRegex = /```(?:mermaid|[\w]*)[\s\S]*?```/g
  const markdownSyntax = /[#*`>|\-[\]()]/g
  const stripped = content
    .replace(codeBlockRegex, "")
    .replace(markdownSyntax, "")
    .trim()
  const words = stripped.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 238))
}

/**
 * Extract all unique tags from a list of blog posts.
 */
export function getTagsFromPosts(posts: BlogPost[]): string[] {
  const tagSet = new Set<string>()
  posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)))
  return Array.from(tagSet).sort()
}
