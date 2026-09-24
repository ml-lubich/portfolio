import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * CSS-source regression coverage for the motion/visual polish pass:
 * blur added to AnimatedSection's reveal, a breathing pulse layered onto the
 * existing hero ambient orbs (no duplicate blob layer), and the grain
 * overlay staying inside the low-opacity band the motion-showcase recipe
 * calls for — scoped to the hero only, per the standing "no film grain"
 * page-wide decision above it in this file.
 */
const css = readFileSync(resolve(__dirname, "../app/globals.css"), "utf8")

describe("AnimatedSection blur reveal", () => {
  it("starts blurred and settles to sharp", () => {
    const base = css.match(/\.animated-section \{[^}]*\}/)?.[0] ?? ""
    const visible = css.match(/\.animated-section\[data-reveal-visible="true"\] \{[^}]*\}/)?.[0] ?? ""
    expect(base).toMatch(/filter:\s*blur\(/)
    expect(visible).toMatch(/transition-property:[^;]*filter/)
    expect(visible).toMatch(/filter:\s*none/)
  })
})

describe("hero ambient orb breathing", () => {
  it("layers a breathe keyframe onto the existing orb animation instead of adding a new blob layer", () => {
    expect(css).toMatch(/@keyframes hero-blob-breathe/)
    const rule = css.match(/\.ambient-orb \{[\s\S]*?\n\}/)?.[0] ?? ""
    expect(rule).toMatch(/animation-name:\s*var\(--orb-animation\),\s*hero-blob-breathe/)
  })

  it("keeps breathing on the mobile override too", () => {
    const mobile = css.match(/\(hover:\s*none\)\s*\{\s*\[data-ambient-orb="true"\]\s*\{[\s\S]*?\n {2}\}/)?.[0] ?? ""
    expect(mobile).toMatch(/hero-blob-breathe/)
  })
})

describe("hero grain overlay opacity band", () => {
  it("stays inside the motion-showcase recipe's 0.015–0.04 band", () => {
    const grainFile = readFileSync(resolve(__dirname, "../components/hero/grain-overlay.tsx"), "utf8")
    expect(grainFile).toMatch(/feTurbulence/)
    const opacityMatch = grainFile.match(/opacity-\[0\.(\d+)\]/)
    expect(opacityMatch, "grain overlay must set an explicit low opacity class").not.toBeNull()
    const value = Number(`0.${opacityMatch![1]}`)
    expect(value).toBeGreaterThanOrEqual(0.015)
    expect(value).toBeLessThanOrEqual(0.04)
  })

  it("is decorative only: aria-hidden and non-interactive", () => {
    const grainFile = readFileSync(resolve(__dirname, "../components/hero/grain-overlay.tsx"), "utf8")
    expect(grainFile).toMatch(/aria-hidden/)
    expect(grainFile).toMatch(/pointer-events-none/)
  })
})
