// ──────────────────────────────────────────────────────────────────────
//  MDX content loader — reads .mdx files from content/blog/
//  Keeps content DECOUPLED from code. To add a blog post, just drop
//  a new .mdx file — no TypeScript changes needed.
// ──────────────────────────────────────────────────────────────────────

import fs from "fs"
import path from "path"
import matter from "gray-matter"
import readingTime from "reading-time"

const CONTENT_DIR = path.join(process.cwd(), "content/blog")

export interface BlogPostMeta {
    slug: string
    title: string
    excerpt: string
    date: string
    category: string
    tags: string[]
    coverImage: string
    views: string
    readingTime: number
}

export interface BlogPostFull extends BlogPostMeta {
    /** Raw MDX content (without frontmatter) */
    content: string
}

// Approximate view counts (could later come from analytics)
const VIEW_COUNTS: Record<string, string> = {
    "is-rag-really-dead-in-2026": "2k",
    "langchain-considered-harmful": "3k",
    "crewai-multi-agent-reality-check": "1k",
    "agents-are-all-you-need": "2k",
    "prompt-engineering-is-not-engineering": "4k",
    "ai-code-generation-killing-junior-devs": "3k",
    "open-source-models-bet-and-won": "1k",
    "great-ai-hiring-scam": "3k",
    "ml-pipeline-technical-debt": "1k",
    "mcp-protocol-will-make-langchain-obsolete": "2k",
    "microservices-mistake-ml-systems": "1k",
    "uncomfortable-truth-ai-safety": "2k",
    "stop-building-ai-products-nobody-wants": "2k",
    "fine-tuning-new-prompt-engineering": "1k",
    "next-model-wont-save-you-architecture-matters": "1k",
    "cursor-changed-how-i-code-forever": "4k",
    "reasoning-models-o3-deepseek-change-everything": "3k",
    "claude-code-terminal-ai-that-works": "3k",
    "ai-evaluation-hardest-unsolved-problem": "1k",
    "vibe-coding-future-or-anti-pattern": "2k",
    "agentic-coding-trust-gap-2026": "1k",
    "mcp-production-engineering-2026": "1k",
    "openclaw-good-bad-ugly-2026": "1k",
}

/**
 * Get all MDX file slugs from content/blog/
 */
function getMdxSlugs(): string[] {
    if (!fs.existsSync(CONTENT_DIR)) return []
    return fs
        .readdirSync(CONTENT_DIR)
        .filter((f) => f.endsWith(".mdx"))
        .map((f) => f.replace(/\.mdx$/, ""))
}

/**
 * Read and parse a single MDX file by slug.
 * Returns null if file doesn't exist.
 */
function readMdxFile(slug: string): { meta: BlogPostMeta; content: string } | null {
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
    if (!fs.existsSync(filePath)) return null

    const raw = fs.readFileSync(filePath, "utf-8")
    const { data, content } = matter(raw)

    const rt = readingTime(content)

    return {
        meta: {
            slug,
            title: data.title ?? "",
            excerpt: data.excerpt ?? "",
            date: data.date ?? "",
            category: data.category ?? "",
            tags: data.tags ?? [],
            coverImage: data.coverImage ?? "",
            views: VIEW_COUNTS[slug] ?? "1k",
            readingTime: Math.max(1, Math.ceil(rt.minutes)),
        },
        content,
    }
}

// ── Cached data (computed once per build / server start) ───────────

let _allPosts: BlogPostFull[] | null = null

function loadAllPosts(): BlogPostFull[] {
    if (_allPosts) return _allPosts

    const slugs = getMdxSlugs()
    const posts: BlogPostFull[] = []

    for (const slug of slugs) {
        const result = readMdxFile(slug)
        if (result) {
            posts.push({ ...result.meta, content: result.content })
        }
    }

    // Sort by date descending (newest first)
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    _allPosts = posts
    return posts
}

// ── Public API (drop-in replacements for old blog-data.ts) ─────────

export function getAllPosts(): BlogPostFull[] {
    return loadAllPosts()
}

export function getPostBySlug(slug: string): BlogPostFull | undefined {
    return loadAllPosts().find((p) => p.slug === slug)
}

export function getPostsByCategory(category: string): BlogPostFull[] {
    const all = loadAllPosts()
    if (category === "All") return all
    return all.filter((p) => p.category === category)
}

export function getRelatedPosts(slug: string, limit = 3): BlogPostFull[] {
    const all = loadAllPosts()
    const current = all.find((p) => p.slug === slug)
    if (!current) return all.slice(0, limit)
    return all
        .filter((p) => p.slug !== slug && p.category === current.category)
        .slice(0, limit)
}

export function getAllTags(): string[] {
    const tagSet = new Set<string>()
    loadAllPosts().forEach((p) => p.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
}

export function getPostsByTag(tag: string): BlogPostFull[] {
    return loadAllPosts().filter((p) => p.tags.includes(tag))
}

export function getAllCategories(): string[] {
    return [
        "All",
        "AI Architecture",
        "Engineering Culture",
        "MLOps",
        "AI Products",
        "Open Source",
        "Hot Takes",
    ]
}

export const AUTHOR = {
    name: "Misha Lubich",
    role: "AI Engineer & Technical Leader",
    avatar: "/ml-avatar.jpg",
}
