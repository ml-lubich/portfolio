/**
 * Scroll craft — scroll-linked motion in the hero.
 *
 *  a. Release: scrolling out of the hero scales the brain down and fades it
 *     (the section is not simply covered by the next one).
 *  b. Parallax: the Tokscale badge / stat row lags the page slightly.
 *
 * Both are transform/opacity only (no layout shift, so `#contact` anchor
 * scrolling stays exact) and are routed through the scroll-stack viewport
 * function: phones, tablets, coarse pointers, reduced motion and low-core
 * devices get a static hero.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"
import {
  heroReleaseAt,
  heroStatsParallaxAt,
  HERO_STATS_PARALLAX_MAX_PX,
} from "@/components/hero/hero-scroll-release"

const ROOT = path.resolve(__dirname, "..")
const src = fs.readFileSync(
  path.join(ROOT, "components/hero/hero-scroll-release.tsx"),
  "utf8",
)
const hero = fs.readFileSync(path.join(ROOT, "components/hero/index.tsx"), "utf8")

describe("heroReleaseAt (pure)", () => {
  it("is identity at the top of the page", () => {
    expect(heroReleaseAt(0, 900)).toEqual({ scale: 1, opacity: 1 })
  })

  it("has receded and faded by one viewport of scroll", () => {
    const { scale, opacity } = heroReleaseAt(900, 900)
    expect(scale).toBeLessThanOrEqual(0.85)
    expect(opacity).toBeLessThanOrEqual(0.15)
  })

  it("is monotonic and clamped past the hero", () => {
    let prev = heroReleaseAt(0, 900)
    for (let y = 50; y <= 1800; y += 50) {
      const cur = heroReleaseAt(y, 900)
      expect(cur.scale).toBeLessThanOrEqual(prev.scale)
      expect(cur.opacity).toBeLessThanOrEqual(prev.opacity)
      prev = cur
    }
    expect(heroReleaseAt(5000, 900)).toEqual(heroReleaseAt(1800, 900))
  })
})

describe("heroStatsParallaxAt (pure)", () => {
  it("lags the page: positive, smaller than scroll, capped", () => {
    expect(heroStatsParallaxAt(0)).toBe(0)
    const y = heroStatsParallaxAt(200)
    expect(y).toBeGreaterThan(0)
    expect(y).toBeLessThan(200)
    expect(heroStatsParallaxAt(10_000)).toBe(HERO_STATS_PARALLAX_MAX_PX)
    // Cap stays inside the hero's bottom padding (pb-16 = 64px) so the
    // lagging row is never clipped by the section's overflow-hidden.
    expect(HERO_STATS_PARALLAX_MAX_PX).toBeLessThanOrEqual(64)
  })
})

describe("HeroScrollLayer wiring", () => {
  it("routes through the scroll-stack viewport function (reduced motion, coarse pointer, width, cores)", () => {
    expect(src).toContain("shouldUseCompactScrollStackViewport")
    expect(src).toContain("prefers-reduced-motion: reduce")
    expect(src).toContain("(pointer: coarse)")
  })

  it("writes transform/opacity only via a ref — no React state on scroll, no layout properties", () => {
    expect(src).toMatch(/style\.transform\s*=/)
    expect(src).toMatch(/style\.opacity\s*=/)
    expect(src).not.toMatch(/useState\s*\(/)
    expect(src).not.toMatch(/style\.(top|height|marginTop)\s*=/)
    expect(src).toMatch(/addEventListener\("scroll",[\s\S]*passive: true/)
  })

  it("hero wraps the brain in the release layer and the stat block in the parallax layer", () => {
    expect(hero).toMatch(/<HeroScrollLayer\s+layer="brain"/)
    expect(hero).toMatch(/<HeroScrollLayer\s+layer="stats"/)
  })

  it("does not call the compact-viewport hook from the hero shell (hydration-safe className)", () => {
    expect(hero).not.toMatch(/useScrollStackCompactViewport\s*\(/)
  })
})
