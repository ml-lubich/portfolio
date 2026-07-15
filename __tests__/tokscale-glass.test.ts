/**
 * Tokscale liquid-glass panel — the embed SVG ships an opaque card background
 * (#0D1117 gradient + solid border). The /api/tokscale proxy strips it so the
 * stats sit on the site's translucent glass instead.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")

// Legacy embed markup (gradient bg + hex border + glow overlay).
const LEGACY_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="460" height="162" viewBox="0 0 460 162" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="card-clip"><rect width="460" height="162" rx="16"/></clipPath>
  </defs>
  <rect width="460" height="162" rx="16" fill="url(#bg)"/>
  <rect x="0.5" y="0.5" width="459" height="161" rx="15.5" fill="none" stroke="#30363D"/>
  <rect width="460" height="162" rx="16" fill="url(#glow)" clip-path="url(#card-clip)"/>
  <text x="18" y="30" fill="#E6EDF3">Tokscale Stats</text>
</svg>`

// Current live embed markup — solid-hex bg (#131822) + rgba() stroked border.
// The strip must survive this colour change, or the opaque card renders through.
const CURRENT_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg data-template="classic" width="460" height="162" viewBox="0 0 460 162" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs><style>text{font-variant-numeric:tabular-nums}</style></defs>
  <rect width="460" height="162" rx="12" fill="#131822"/>
  <rect x="0.5" y="0.5" width="459" height="161" rx="11.5" fill="none" stroke="rgba(255,255,255,0.16)"/>
  <text x="18" y="26" fill="#F4F7FB">Misha Lubich</text>
  <line x1="18" y1="58" x2="442" y2="58" stroke="rgba(255,255,255,0.09)"/>
  <text x="18" y="113" fill="#2F8FFF">8.3B</text>
</svg>`

describe("tokscale SVG background stripping", () => {
  it("strips the legacy gradient background + hex border, keeps glow/content", async () => {
    const { stripTokscaleBackground } = await import("@/lib/tokscale-svg")
    const out = stripTokscaleBackground(LEGACY_SVG)
    expect(out).not.toContain('fill="url(#bg)"')
    expect(out).not.toContain('stroke="#30363D"')
    expect(out).toContain('fill="url(#glow)"')
    expect(out).toContain('<clipPath id="card-clip"><rect width="460" height="162" rx="16"/></clipPath>')
    expect(out).toContain("Tokscale Stats")
  })

  it("strips the current solid-hex background + rgba border (regression)", async () => {
    const { stripTokscaleBackground } = await import("@/lib/tokscale-svg")
    const out = stripTokscaleBackground(CURRENT_SVG)
    // Opaque card fill and border ring must be gone → glass shows through.
    expect(out).not.toContain('fill="#131822"')
    expect(out).not.toMatch(/<rect[^>]*stroke=/)
  })

  it("keeps the stat separators, values, and name after stripping", async () => {
    const { stripTokscaleBackground } = await import("@/lib/tokscale-svg")
    const out = stripTokscaleBackground(CURRENT_SVG)
    expect(out).toContain("Misha Lubich")
    expect(out).toContain("8.3B")
    // <line> separators stroke too, but must survive (only <rect> chrome is stripped).
    expect(out).toContain('<line x1="18" y1="58"')
  })
})

describe("tokscale panel — liquid glass", () => {
  it("hero embed loads through the stripping proxy, not the raw tokscale URL", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "components/sections/tokscale-stats.tsx"),
      "utf8"
    )
    expect(src).toContain('"/api/tokscale"')
    expect(src).not.toMatch(/img[\s\S]{0,200}?src=\{?"https:\/\/tokscale/)
  })

  it("proxy route exists and serves svg with caching", () => {
    const route = fs.readFileSync(
      path.join(ROOT, "app/api/tokscale/route.ts"),
      "utf8"
    )
    expect(route).toMatch(/stripTokscaleBackground/)
    expect(route).toMatch(/image\/svg\+xml/)
    expect(route).toMatch(/revalidate/)
  })

  it("panel surface is translucent glass, not near-opaque", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "components/sections/tokscale-stats.tsx"),
      "utf8"
    )
    expect(src).toMatch(/backdrop-blur/)
    expect(src).not.toContain("0.72)]")
  })
})
