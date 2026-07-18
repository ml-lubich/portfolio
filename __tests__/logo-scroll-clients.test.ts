/**
 * The "Trusted & partnered with" marquee under the hero must also carry the
 * consulting client brands — LUPFR Entertainment, Seaside, and ERIA (eria.co)
 * — using their real logo assets, not just employer icons.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")

describe("LogoScroll client brands", () => {
  const src = fs.readFileSync(
    path.join(ROOT, "components/sections/logo-scroll.tsx"),
    "utf8",
  )

  it("includes LUPFR, Seaside, and ERIA entries", () => {
    expect(src).toContain("LUPFR")
    expect(src).toContain("Seaside")
    expect(src).toMatch(/eria\.co|ERIA/)
  })

  it("uses the real logo image assets for LUPFR and ERIA", () => {
    expect(src).toContain("/logos/lupfr-mark.png")
    expect(src).toContain("/logos/eria-wordmark.png")
  })

  it("every referenced /logos asset exists in public/", () => {
    const refs = [...src.matchAll(/["'](\/logos\/[^"']+)["']/g)].map((m) => m[1])
    expect(refs.length).toBeGreaterThanOrEqual(2)
    for (const ref of refs) {
      const file = path.join(ROOT, "public", ref)
      expect(fs.existsSync(file), `${ref} missing under public/`).toBe(true)
    }
  })

  it("renders the Seaside \"//\" brand mark inline", () => {
    // Seaside ships an SVG mark (circle + double slash), not a raster file
    expect(src).toMatch(/SeasideMark|seaside-mark/i)
  })
})
