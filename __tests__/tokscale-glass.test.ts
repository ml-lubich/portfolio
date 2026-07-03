/**
 * Tokscale liquid-glass panel — the embed SVG ships an opaque card background
 * (#0D1117 gradient + solid border). The /api/tokscale proxy strips it so the
 * stats sit on the site's translucent glass instead.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")

const SAMPLE_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="460" height="162" viewBox="0 0 460 162" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="card-clip"><rect width="460" height="162" rx="16"/></clipPath>
  </defs>
  <rect width="460" height="162" rx="16" fill="url(#bg)"/>
  <rect x="0.5" y="0.5" width="459" height="161" rx="15.5" fill="none" stroke="#30363D"/>
  <rect width="460" height="162" rx="16" fill="url(#glow)" clip-path="url(#card-clip)"/>
  <text x="18" y="30" fill="#E6EDF3">Tokscale Stats</text>
</svg>`

describe("tokscale SVG background stripping", () => {
  it("removes the opaque background rect and the solid border rect", async () => {
    const { stripTokscaleBackground } = await import("@/lib/tokscale-svg")
    const out = stripTokscaleBackground(SAMPLE_SVG)
    expect(out).not.toContain('fill="url(#bg)"')
    expect(out).not.toContain('stroke="#30363D"')
  })

  it("keeps the glow overlay, clip path, and content", async () => {
    const { stripTokscaleBackground } = await import("@/lib/tokscale-svg")
    const out = stripTokscaleBackground(SAMPLE_SVG)
    expect(out).toContain('fill="url(#glow)"')
    expect(out).toContain('<clipPath id="card-clip"><rect width="460" height="162" rx="16"/></clipPath>')
    expect(out).toContain("Tokscale Stats")
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
