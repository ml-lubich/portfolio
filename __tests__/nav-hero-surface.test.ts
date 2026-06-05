/**
 * Regression: navbar stays transparent while #hero is in view; frosted after it clears the viewport.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"
import {
  computeNavPastHero,
  NAV_PAST_HERO_FALLBACK_SCROLL_Y,
} from "@/lib/nav-hero-surface"

const ROOT = path.resolve(__dirname, "..")

describe("computeNavPastHero", () => {
  it("hero still in view when its bottom is below the viewport top (bottom > 0)", () => {
    const hero = { getBoundingClientRect: () => ({ bottom: 200 }) }
    expect(computeNavPastHero(hero, 0)).toBe(false)
  })

  it("hero still in view with a thin sliver (positive bottom)", () => {
    const hero = { getBoundingClientRect: () => ({ bottom: 0.5 }) }
    expect(computeNavPastHero(hero, 10_000)).toBe(false)
  })

  it("past hero when bottom edge meets viewport top (bottom === 0)", () => {
    const hero = { getBoundingClientRect: () => ({ bottom: 0 }) }
    expect(computeNavPastHero(hero, 0, false)).toBe(true)
  })

  it("past hero when section is fully above the viewport (bottom < 0)", () => {
    const hero = { getBoundingClientRect: () => ({ bottom: -1 }) }
    expect(computeNavPastHero(hero, 500, false)).toBe(true)
  })

  it("hysteresis: once past hero, small positive bottom does not flip back to transparent", () => {
    const hero = { getBoundingClientRect: () => ({ bottom: 12 }) }
    // previous=true (already scrolled): stays scrolled until bottom > 24
    expect(computeNavPastHero(hero, 1000, true)).toBe(true)
    const farther = { getBoundingClientRect: () => ({ bottom: 100 }) }
    expect(computeNavPastHero(farther, 1000, true)).toBe(false)
  })

  describe("without #hero element", () => {
    it("not past when scrollY is at or below fallback threshold", () => {
      expect(computeNavPastHero(null, 0)).toBe(false)
      expect(computeNavPastHero(null, NAV_PAST_HERO_FALLBACK_SCROLL_Y)).toBe(false)
    })

    it("past when scrollY exceeds fallback threshold + hysteresis", () => {
      expect(computeNavPastHero(null, NAV_PAST_HERO_FALLBACK_SCROLL_Y + 25)).toBe(true)
    })
  })
})

describe("Navigation wiring (regression)", () => {
  it("nav delegates hero boundary to computeNavPastHero", () => {
    const navSrc = fs.readFileSync(
      path.join(ROOT, "components/nav/index.tsx"),
      "utf8",
    )
    expect(navSrc).toContain('from "@/lib/nav-hero-surface"')
    expect(navSrc).toContain("computeNavPastHero(hero, window.scrollY")
  })

  it("nav does not auto-hide on scroll-down (no hideNav flicker on mobile)", () => {
    const navSrc = fs.readFileSync(
      path.join(ROOT, "components/nav/index.tsx"),
      "utf8",
    )
    expect(navSrc).not.toMatch(/navSurfaceRef\.current\.hideNav/)
    expect(navSrc).not.toMatch(/-translate-y-full/)
  })

  it("hero surface tokens: transparent vs frosted classes stay defined", () => {
    const navSrc = fs.readFileSync(
      path.join(ROOT, "components/nav/index.tsx"),
      "utf8",
    )
    expect(navSrc).toMatch(/backdrop-blur-none/)
    expect(navSrc).toMatch(/backdrop-blur-2xl/)
  })

  it("desktop nav uses the modern floating glass shell", () => {
    const navSrc = fs.readFileSync(
      path.join(ROOT, "components/nav/index.tsx"),
      "utf8",
    )
    expect(navSrc).toContain("nav-shell")
  })

  it("capsule frost is gated to scrolled state (no per-frame hero blur)", () => {
    const navSrc = fs.readFileSync(
      path.join(ROOT, "components/nav/index.tsx"),
      "utf8",
    )
    expect(navSrc).toContain("nav.dataset.navScrolled")
  })

  it("mobile menu keeps Contact as the CTA instead of duplicating it in the link list", () => {
    const navSrc = fs.readFileSync(
      path.join(ROOT, "components/nav/index.tsx"),
      "utf8",
    )
    expect(navSrc).toContain('link.href !== "#contact"')
    expect(navSrc).toContain('href="#contact"')
    expect(navSrc).toContain("Get In Touch")
  })
})
