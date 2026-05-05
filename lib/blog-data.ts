// ──────────────────────────────────────────────────────────────────────
//  Blog data — compatibility layer
//  MDX bodies: content/blog/*.mdx
//  Listing metadata (covers, view labels): data/blog/post-meta.json
// ──────────────────────────────────────────────────────────────────────

import {
    getAllPosts,
    getPostBySlug as _getPostBySlug,
    getPostsByCategory as _getPostsByCategory,
    getRelatedPosts as _getRelatedPosts,
    getAllTags as _getAllTags,
    getPostsByTag as _getPostsByTag,
} from "./mdx"

import type { BlogPost, BlogPostListItem } from "./blog-shared"

// ── Re-export client-safe types & utilities from blog-shared ───────
export type { BlogPost, BlogPostListItem } from "./blog-shared"
export {
  BLOG_CATEGORIES,
  AUTHOR,
  formatBlogDate,
  getReadingTime,
  getTagsFromPosts,
  normalizeBlogCategoryFromParam,
} from "./blog-shared"

// ── Data ───────────────────────────────────────────────────────────

/** All blog posts, sorted newest-first. Content loaded from MDX files. */
export const blogPosts = getAllPosts()

/** Strip MDX bodies for the listing page client bundle (payload can be MB+ otherwise). */
export function toBlogPostListItems(posts: BlogPost[]): BlogPostListItem[] {
  return posts.map(({ content: _omit, ...rest }) => rest)
}

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
