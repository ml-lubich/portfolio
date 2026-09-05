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

  it("nav shell avoids backdrop-filter over WebGL hero", () => {
    const cssSrc = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8")
    const shellBlock = cssSrc.match(/\.nav-shell \{[\s\S]*?\n\}/)?.[0] ?? ""
    expect(shellBlock).not.toContain("backdrop-filter")
  })

  it("scrolled nav shell avoids backdrop-filter churn", () => {
    const cssSrc = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8")
    const scrolledBlock = cssSrc.match(/nav\[data-nav-scrolled="true"\] \.nav-shell \{[\s\S]*?\n\}/)?.[0] ?? ""
    expect(scrolledBlock).not.toContain("backdrop-filter")
  })

  it("top scroll progress bar is not rendered", () => {
    const navSrc = fs.readFileSync(
      path.join(ROOT, "components/nav/index.tsx"),
      "utf8",
    )
    expect(navSrc).not.toContain("ScrollProgressBar")
  })

  it("top scrim gradient exists: fixed, full-width, under the navbar, non-interactive", () => {
    const navSrc = fs.readFileSync(
      path.join(ROOT, "components/nav/index.tsx"),
      "utf8",
    )
    const scrimMatch = navSrc.match(/ref=\{scrimRef\}[\s\S]*?className="([^"]*)"[\s\S]*?\/>/)
    expect(scrimMatch, "scrim div with ref={scrimRef} must be rendered").toBeTruthy()
    const cls = scrimMatch![1]
    // Pinned to the viewport top, full width
    expect(cls).toContain("fixed")
    expect(cls).toContain("inset-x-0")
    expect(cls).toContain("top-0")
    // Gradient fading downward to transparent, from a themed token (not a
    // literal black — that painted a dark bar on the light page).
    const scrimBlock = navSrc.slice(navSrc.indexOf("ref={scrimRef}"), navSrc.indexOf("ref={scrimRef}") + 400)
    expect(scrimBlock).toContain("var(--nav-scrim)")
    expect(scrimBlock).not.toMatch(/from-black\/95/)
    // Tall enough to read as a deliberate scrim band
    expect(cls).toContain("h-32")
    expect(cls).toContain("md:h-40")
    // Under the navbar (nav is z-50 / z-[200]) but above page content
    expect(cls).toContain("z-40")
    // Hidden until past hero; never blocks clicks
    expect(cls).toContain("opacity-0")
    expect(cls).toContain("pointer-events-none")
    expect(cls).toContain("transition-opacity")
  })

  it("top scrim opacity is driven by the same past-hero state as the nav surface", () => {
    const navSrc = fs.readFileSync(
      path.join(ROOT, "components/nav/index.tsx"),
      "utf8",
    )
    // applyNavSurface must toggle the scrim from the shared `scrolled` boolean
    expect(navSrc).toMatch(/scrimRef\.current[\s\S]{0,200}scrolled \? "1" : "0"/)
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

/**
 * Defect 8: the Tools/Games nav dropdown panels. Two independent bugs:
 *   1. The panel painted a hard-coded `bg-[hsl(220_20%_5%/0.96)]` regardless
 *      of theme — a dark slab on the light page (same class of bug as the
 *      tokscale card and nav scrim).
 *   2. The item titles ("AI Tools", "Token Invaders", ...) were dimmed to
 *      `text-foreground/90` for no reason (hover already went to full
 *      opacity) — composited that's a murky ~rgb(219,220,223), visibly
 *      duller than the rest of the site's crisp white/foreground text, in
 *      BOTH themes. Not an animation — no stagger/opacity-0 default exists
 *      on this markup, confirmed by reading the component: it's a plain
 *      static span.
 */
describe("nav dropdown panels (Tools / Games)", () => {
  const navSrc = fs.readFileSync(path.join(ROOT, "components/nav/index.tsx"), "utf8")

  it("paints both dropdown panels from a themed surface token, not a literal dark hsl", () => {
    expect(navSrc).not.toMatch(/bg-\[hsl\(220_20%_5%/)
    const panelBlocks = navSrc.match(/rounded-2xl border[^"]*backdrop-blur-2xl"/g) ?? []
    expect(panelBlocks.length).toBeGreaterThanOrEqual(2)
    for (const block of panelBlocks) {
      expect(block).toMatch(/var\(--surface-1\)/)
    }
  })

  it("borders the panels with the shared hairline token, not a literal white alpha", () => {
    expect(navSrc).not.toMatch(/border-white\/\[0\.10\]/)
  })

  it("gives both dropdown item titles full-opacity foreground text, not a dimmed /90", () => {
    const titleSpans = navSrc.match(/text-sm font-medium text-foreground[^"]*"/g) ?? []
    expect(titleSpans.length).toBeGreaterThanOrEqual(2)
    for (const span of titleSpans) {
      expect(span).not.toMatch(/text-foreground\/90/)
    }
  })
})
