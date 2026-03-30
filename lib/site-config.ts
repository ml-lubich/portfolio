/**
 * Centralised site configuration.
 *
 * The base URL defaults to https://mishalubich.com but can be
 * overridden via the NEXT_PUBLIC_BASE_URL environment variable.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ??
  "https://mishalubich.com"

/**
 * Default social / messaging preview image (path under `public/`).
 * Relative paths are resolved with `metadata.metadataBase` so og:image is always absolute for crawlers.
 */
export const SITE_DEFAULT_OG_IMAGE = "/favicon/android-chrome-512x512.png" as const

export const SITE_DEFAULT_OG_IMAGE_SIZE = {
  width: 512,
  height: 512,
} as const
