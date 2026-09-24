/**
 * Very faint film-grain texture, scoped to the hero only — the page-wide
 * grain tried earlier (app/globals.css `.page-texture` comment) "read as
 * dirt, not depth" at full-page scale. At hero scale and this opacity it
 * reads as texture behind the mesh instead. Static SVG `feTurbulence`, own
 * baseFrequency — no external asset, no JS.
 */
const GRAIN_SVG =
  "data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='hero-grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23hero-grain)'/%3E%3C/svg%3E"

export function HeroGrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="hero-grain-overlay pointer-events-none absolute inset-0 z-[1] opacity-[0.025]"
      style={{ backgroundImage: `url("${GRAIN_SVG}")`, backgroundSize: "220px 220px" }}
    />
  )
}
