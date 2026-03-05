// ──────────────────────────────────────────────────────────────────────
//  Blog data — compatibility layer
//  Content lives in content/blog/*.mdx files (decoupled from code).
//  This module re-exports everything consumers expect, reading from MDX.
// ──────────────────────────────────────────────────────────────────────

import {
    getAllPosts,
    getPostBySlug as _getPostBySlug,
    getPostsByCategory as _getPostsByCategory,
    getRelatedPosts as _getRelatedPosts,
    getAllTags as _getAllTags,
    getPostsByTag as _getPostsByTag,
} from "./mdx"

import type { BlogPost } from "./blog-shared"

// ── Re-export client-safe types & utilities from blog-shared ───────
export type { BlogPost } from "./blog-shared"
export { BLOG_CATEGORIES, AUTHOR, getReadingTime, getTagsFromPosts } from "./blog-shared"

// ── Data ───────────────────────────────────────────────────────────

/** All blog posts, sorted newest-first. Content loaded from MDX files. */
export const blogPosts = getAllPosts()

export function getPostBySlug(slug: string): BlogPost | undefined {
    return _getPostBySlug(slug)
}

export function getPostsByCategory(category: string): BlogPost[] {
    return _getPostsByCategory(category)
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
    return _getRelatedPosts(slug, limit)
}

export function getAllTags(): string[] {
    return _getAllTags()
}

export function getPostsByTag(tag: string): BlogPost[] {
    return _getPostsByTag(tag)
}
