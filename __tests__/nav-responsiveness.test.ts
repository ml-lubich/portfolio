/**
 * Nav interaction responsiveness.
 *
 * The nav felt sluggish because every interactive surface animated with
 * `transition-all duration-300`: the browser has to consider every animatable
 * property, and 300ms is well past the ~100ms where a hover still reads as
 * instant. These guards keep hover/press feedback scoped and fast, and keep
 * the scroll handler off the main-thread critical path.
 */

import fs from "node:fs"
import path from "node:path"
import { describe, it, expect } from "vitest"

const ROOT = path.join(__dirname, "..")
const NAV = fs.readFileSync(path.join(ROOT, "components/nav/index.tsx"), "utf8")

/** Class strings on the nav's interactive surfaces (links, dropdowns, CTA, menu button). */
const INTERACTIVE_MARKERS = [
  "group/link relative isolate",
  "absolute left-1/2 top-full z-[300]",
]

describe("nav interaction responsiveness", () => {
  it("no interactive nav surface animates with transition-all", () => {
    for (const marker of INTERACTIVE_MARKERS) {
      let from = 0
      for (;;) {
        const at = NAV.indexOf(marker, from)
        if (at === -1) break
        // The class string runs to the end of its quoted literal
        const chunk = NAV.slice(at, NAV.indexOf('"', at + marker.length))
        expect(chunk, `transition-all found on: ${marker}`).not.toMatch(/transition-all/)
        from = at + marker.length
      }
    }
  })

  it("hover/press feedback lands within 150ms", () => {
    // Every scoped transition on an interactive surface must be <= 150ms;
    // anything slower reads as lag rather than as animation.
    const scoped = [...NAV.matchAll(/transition-\[[^\]]+\]\s+duration-(\d+)/g)]
    expect(scoped.length).toBeGreaterThan(0)
    for (const match of scoped) {
      expect(Number(match[1]), `slow transition: ${match[0]}`).toBeLessThanOrEqual(150)
    }
  })

  it("nav link pills transition only paint properties (no layout or transform work)", () => {
    expect(NAV).toMatch(
      /transition-\[color,background-color,border-color,box-shadow\]\s+duration-150/,
    )
  })

  it("dropdown panels transition only compositor properties", () => {
    expect(NAV).toMatch(/transition-\[opacity,transform,visibility\]\s+duration-150/)
  })

  it("scroll work stays rAF-batched and off React's render path", () => {
    // The nav writes its surface state through refs inside a rAF, so scrolling
    // never triggers a React re-render of the whole navigation tree.
    expect(NAV).toMatch(/requestAnimationFrame\(applyNavSurface\)/)
    expect(NAV).toMatch(/\{\s*passive:\s*true\s*\}/)
    expect(NAV).toMatch(/navSurfaceRef/)
  })
})
