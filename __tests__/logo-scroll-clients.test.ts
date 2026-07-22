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

  it("includes LUPFR, Seaside, ERIA, and W3 Sourcing entries", () => {
    expect(src).toContain("LUPFR")
    expect(src).toContain("Seaside")
    expect(src).toMatch(/eria\.co|ERIA/)
    expect(src).toContain("W3 Sourcing")
  })

  it("uses official Simple Icons brand marks, not hand-drawn clip-art", () => {
    // The childish generic icons (grad cap, flask, hand-rolled spark) are gone.
    expect(src).toMatch(/SiApple|SiWalmart|SiHonda|SiGithub/)
    expect(src).not.toContain("GraduationCap")
    expect(src).not.toContain("FlaskConical")
    expect(src).not.toContain("WalmartSpark")
    expect(src).not.toContain("SeasideMark")
  })

  it("wires real logo image assets for the client brands", () => {
    for (const asset of [
      "/logos/lupfr-mark.png",
      "/logos/uc-berkeley.svg",
      "/logos/w3sourcing.png",
      "/logos/enrichdata.png",
      "/logos/eria-wordmark.png",
    ]) {
      expect(src).toContain(asset)
    }
  })

  it("every referenced /logos asset exists in public/", () => {
    const refs = [...src.matchAll(/["'](\/logos\/[^"']+)["']/g)].map((m) => m[1])
    expect(refs.length).toBeGreaterThanOrEqual(1)
    for (const ref of refs) {
      const file = path.join(ROOT, "public", ref)
      expect(fs.existsSync(file), `${ref} missing under public/`).toBe(true)
    }
  })

  it("deals brands across rows with no vertical repetition", () => {
    // Each row is a distinct round-robin slice of LOGOS, so no brand shows twice.
    expect(src).toMatch(/i % 3 === 0/)
    expect(src).toMatch(/i % 3 === 1/)
    expect(src).toMatch(/i % 3 === 2/)
  })
})
