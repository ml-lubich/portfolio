"use client"

/**
 * Single source of truth for header-style logo markup (SSR + client must match).
 *
 * Renders a crisp, resolution-independent inline SVG "ML" monogram instead of
 * a raster `/logo.png` — legible at 32px and 64px alike, and free of the
 * washed-out look a compressed PNG gets at small sizes. Keeps the exact prop
 * contract every consumer (nav, footer, blog-header, tools, llm-prices) relies
 * on, even though `sizes`/`loading` no longer apply to an <img>.
 */
export function SiteLogoMark({
  width,
  height,
  sizes,
  className = "h-full w-full object-cover",
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
  // sizes/loading are meaningful only for a raster <img>'s responsive
  // loading strategy; an inline SVG has neither, so they're accepted for a
  // stable prop contract across consumers but intentionally unused here.
  void sizes
  void loading

  return (
    <svg
      viewBox="0 0 48 48"
      width={width}
      height={height}
      role="img"
      aria-label={alt}
      className={className}
      suppressHydrationWarning={suppressHydrationWarning}
    >
      <defs>
        <linearGradient id="site-logo-mark-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(0 0% 100%)" />
          <stop offset="100%" stopColor="hsl(0 0% 68%)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="48" height="48" rx="12" fill="hsl(220 20% 6%)" />
      <text
        x="50%"
        y="53%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="21"
        fontWeight="700"
        letterSpacing="-0.02em"
        fill="url(#site-logo-mark-fill)"
      >
        ML
      </text>
    </svg>
  )
}
