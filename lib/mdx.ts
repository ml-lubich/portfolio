// ──────────────────────────────────────────────────────────────────────
//  MDX content loader — body in content/blog/*.mdx; listing metadata
//  (cover art, view labels) in data/blog/post-meta.json.
// ──────────────────────────────────────────────────────────────────────

import fs from "fs"
import path from "path"
import matter from "gray-matter"
import readingTime from "reading-time"
import { getBlogDateEpochMs } from "@/lib/blog-format"

const CONTENT_DIR = path.join(process.cwd(), "content/blog")
const POST_META_PATH = path.join(process.cwd(), "data/blog/post-meta.json")

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

interface PostMetaOverride {
    views?: string
    coverImage?: string
}

interface PostMetaFileShape {
    version?: number
    bySlug: Record<string, PostMetaOverride>
}

let _postMetaBySlug: Record<string, PostMetaOverride> | null = null

function loadPostMetaBySlug(): Record<string, PostMetaOverride> {
    if (_postMetaBySlug) return _postMetaBySlug

    if (!fs.existsSync(POST_META_PATH)) {
        _postMetaBySlug = {}
        return _postMetaBySlug
    }

    const raw = fs.readFileSync(POST_META_PATH, "utf-8")
    const parsed = JSON.parse(raw) as PostMetaFileShape
    _postMetaBySlug = parsed.bySlug ?? {}
    return _postMetaBySlug
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
    const listing = loadPostMetaBySlug()[slug] ?? {}
    const coverFromMatter = typeof data.coverImage === "string" ? data.coverImage : ""

    return {
        meta: {
            slug,
            title: data.title ?? "",
            excerpt: data.excerpt ?? "",
            date: data.date ?? "",
            category: data.category ?? "",
            tags: data.tags ?? [],
            coverImage: listing.coverImage ?? coverFromMatter,
            views: listing.views ?? "1k",
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
    posts.sort((a, b) => getBlogDateEpochMs(b.date) - getBlogDateEpochMs(a.date))

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
    avatar: "/profile_blog.png",
}
