/**
 * GlassBlobField — the site's "liquid glass melting into glass" signature.
 *
 * A few frosted-glass blobs drift and scale so they flow together and pull
 * apart, welded by the shared `#liquid-goo` SVG filter (see LiquidGooFilter):
 * where two blobs overlap the gooey threshold fuses them with a smooth neck,
 * exactly like the WWDC metaball look. Pure CSS transform animation (no WebGL,
 * no per-frame JS), decorative + aria-hidden, and frozen under
 * prefers-reduced-motion. Drop it into any section's backdrop.
 */
export function GlassBlobField({
  className = "",
  intensity = 1,
}: {
  className?: string
  /** 0–1 opacity multiplier for the whole field; dial down over busy content. */
  intensity?: number
}) {
  return (
    <div
      aria-hidden="true"
      className={`glass-blob-field pointer-events-none absolute inset-0 -z-0 overflow-hidden ${className}`}
      style={{ opacity: intensity }}
    >
      <div className="glass-blob-field__goo">
        <span className="glass-blob glass-blob--1" />
        <span className="glass-blob glass-blob--2" />
        <span className="glass-blob glass-blob--3" />
        <span className="glass-blob glass-blob--4" />
      </div>
    </div>
  )
}

/**
 * The gooey SVG filter, rendered once near the root so every GlassBlobField on
 * the page references the same `#liquid-goo`. Zero-size, off-screen, inert.
 */
export function LiquidGooFilter() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
    >
      <defs>
        <filter id="liquid-goo" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
          {/* Blur, then ramp alpha through a steep threshold so overlapping
              blobs weld into one shape (the metaball "neck"), then paint the
              crisp source back on top for the glass highlight. */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  )
}
