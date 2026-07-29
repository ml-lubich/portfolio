"use client"

/**
 * Single source of truth for header-style logo markup (SSR + client must match).
 *
 * Renders the metallic chrome "ML" monogram (`/logo.png`) — the real brand mark.
 * Same prop contract every consumer (nav, footer, blog-header, tools, llm-prices)
 * relies on; `sizes`/`loading` map straight onto the underlying <img>.
 */
export function SiteLogoMark({
  width,
  height,
  sizes,
  className = "h-full w-full object-contain",
  alt = "Misha Lubich logo",
  loading,
  suppressHydrationWarning,
}: {
  width: number
  height: number
  sizes: string
  className?: string
  alt?: string
  loading?: "lazy" | "eager"
  suppressHydrationWarning?: boolean
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      width={width}
      height={height}
      sizes={sizes}
      loading={loading}
      alt={alt}
      className={className}
      suppressHydrationWarning={suppressHydrationWarning}
    />
  )
}
