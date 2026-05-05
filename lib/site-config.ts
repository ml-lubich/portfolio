/**
 * Centralised site configuration.
 *
 * The base URL defaults to https://mishalubich.com but can be
 * overridden via the NEXT_PUBLIC_BASE_URL environment variable.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ??
  "https://mishalubich.com"

/** Canonical path for the blog on the apex domain (also the internal app route). */
export const BLOG_PATH = "/blog" as const

/** Absolute URL for the blog listing (matches metadata `alternates.canonical`). */
export function getBlogCanonicalUrl(): string {
  return `${SITE_URL}${BLOG_PATH}`
}

/**
 * Human-readable blog “home” for UI (e.g. `mishalubich.com/blog`). Matches canonical `SITE_URL/blog`.
 * Optional `blog.*` host still serves the same app via `proxy.ts`.
 */
export function getBlogPublicLabel(): string {
  try {
    const host = new URL(SITE_URL).hostname.replace(/^www\./i, "")
    return `${host}${BLOG_PATH}`
  } catch {
    return `mishalubich.com${BLOG_PATH}`
  }
}

/**
 * Default social / messaging preview image (path under `public/`).
 * Relative paths are resolved with `metadata.metadataBase` so og:image is always absolute for crawlers.
 */
export const SITE_DEFAULT_OG_IMAGE = "/favicon/android-chrome-512x512.png" as const

export const SITE_DEFAULT_OG_IMAGE_SIZE = {
  width: 512,
  height: 512,
} as const
