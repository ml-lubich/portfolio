/**
 * Scroll devices below the hero — scroll-craft's "variety is the product".
 *
 * Below the hero the page had one device family, fade-on-enter, repeated
 * on every section; scroll-craft calls that one section shown many times,
 * with dead scroll in between. Three different families now sit where
 * reveals-only used to: the skill map is SCRUBBED by scroll, the consulting
 * rail PANS sideways with the wheel, and the testimonials GROUND shifts
 * colour as you pass through. All three share one primitive
 * (`useSectionProgress`), route through the scroll-stack viewport table so
 * phones / tablets / coarse pointers / reduced motion / low-core machines
 * get the untouched section, and publish their rendered state as
 * `data-sc-verify-state` (the scroll-craft verification convention) so
 * e2e/scroll-devices.spec.ts can assert what actually paints.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"
import { sectionProgress } from "@/lib/use-section-progress"

const ROOT = path.resolve(__dirname, "..")
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8")

const hook = read("lib/use-section-progress.ts")
const neural = read("components/three/neural-constellation.tsx")
const rail = read("components/sections/consulting-clients.tsx")
const testimonials = read("components/sections/client-testimonials.tsx")

describe("sectionProgress (pure)", () => {
  it("is 0 when the section's top sits at the viewport bottom, 1 when its bottom leaves the top", () => {
    expect(sectionProgress(1000, 800, 1000)).toBe(0)
    expect(sectionProgress(-800, 800, 1000)).toBe(1)
  })
  it("is linear in between and clamped outside", () => {
    expect(sectionProgress(100, 800, 1000)).toBeCloseTo(900 / 1800, 6)
    expect(sectionProgress(2000, 800, 1000)).toBe(0)
    expect(sectionProgress(-5000, 800, 1000)).toBe(1)
  })
  it("never divides by zero on a collapsed section", () => {
    expect(sectionProgress(0, 0, 0)).toBe(0)
  })
})

describe("useSectionProgress routing", () => {
  it("routes through the scroll-stack viewport table, not a media query", () => {
    expect(hook).toContain("shouldUseCompactScrollStackViewport(")
    expect(hook).toContain("prefersReducedMotion: window.matchMedia(\"(prefers-reduced-motion: reduce)\").matches")
    expect(hook).toContain("pointerCoarse: window.matchMedia(\"(pointer: coarse)\").matches")
    expect(hook).toContain("hardwareConcurrency: navigator.hardwareConcurrency")
  })
  it("attaches nothing on static viewports and coalesces to one read per frame", () => {
    expect(hook).toMatch(/if \(!el \|\| isStaticScrollViewport\(\)\) return/)
    expect(hook).toContain("requestAnimationFrame(apply)")
    expect(hook).toContain('addEventListener("scroll", schedule, { passive: true })')
  })
})

describe("three different device families, each publishing rendered state", () => {
  it("skill map: scroll scrubs the selected node and stands the timer cycle down", () => {
    expect(neural).toContain("useSectionProgress(rootRef")
    expect(neural).toMatch(/if \(reduce \|\| hovered !== null \|\| scrubbing\) return/)
    expect(neural).toContain("el.dataset.scVerifyState = `node:${i}`")
    // the cycle progress line would lie while scrubbing
    expect(neural).toContain("{!reduce && !scrubbing && (")
    // hover still wins
    expect(neural).toContain("const active = hovered ?? cycled")
  })

  it("consulting rail: scroll adds a sideways impulse, never while the visitor is dragging", () => {
    expect(rail).toContain("useSectionProgress(railRef")
    expect(rail).toMatch(/if \(!isDraggingRef\.current\) velocityRef\.current -= \(p - last\) \* SCROLL_PAN_GAIN/)
    // a resize or anchor jump is not wheel travel
    expect(rail).toMatch(/Math\.abs\(p - last\) > 0\.12\) return/)
    // Rendered state is published where the transform is written (the physics
    // tick), not in the scroll callback — there the impulse hasn't moved anything.
    expect(rail).toContain("railRef.current.dataset.scVerifyState = `rail:${Math.round(offsetRef.current)}`")
    expect(rail).not.toContain("el.dataset.scVerifyState = `rail:")
  })

  it("testimonials: the ground shifts colour with progress, opacity only, published as state", () => {
    expect(testimonials).toContain("useSectionProgress(groundRef")
    expect(testimonials).toMatch(/Math\.sin\(p \* Math\.PI\)/)
    expect(testimonials).toContain("el.style.opacity =")
    expect(testimonials).toContain("el.dataset.scVerifyState = `ground:${")
    // theme-aware tint, not a literal colour
    expect(testimonials).toContain("var(--accent-glow)")
  })

  it("no device uses the same family as its neighbour (scrub → pan → ground)", () => {
    // Guard against the lazy refactor that makes all three "just parallax".
    expect(neural).not.toContain("translate3d(")
    expect(testimonials).not.toContain("translate3d(")
    expect(rail).toContain("translate3d(${offsetRef.current}px,0,0)")
  })
})
