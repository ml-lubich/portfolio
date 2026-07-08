/**
 * Regression: skeleton shimmer is one shared component (ShimmerOverlay),
 * always animating — never hidden until hover and never stopped by hover.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")

function source(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8")
}

const SHIMMER_SECTIONS = [
  "components/sections/about.tsx",
  "components/sections/skills.tsx",
  "components/sections/ai-expertise.tsx",
  "components/sections/consulting-clients.tsx",
]

describe("shared ShimmerOverlay component", () => {
  it("exists as the single site-wide shimmer primitive", () => {
    const src = source("components/ui/shimmer-overlay.tsx")
    expect(src).toContain("export function ShimmerOverlay")
    expect(src).toContain("shimmer")
    expect(src).toContain("pointer-events-none")
    expect(src).toContain("absolute inset-0")
    expect(src).toContain('aria-hidden')
  })

  it("the shimmer sweep animates forever (not one-shot)", () => {
    const css = source("app/globals.css")
    const block = css.match(/\.shimmer \{[\s\S]*?\n\}/)?.[0] ?? ""
    expect(block).toMatch(/animation:\s*shimmer[^;]*infinite/)
    expect(block).not.toContain("animation-play-state")
  })

  SHIMMER_SECTIONS.forEach((file) => {
    it(`${file} uses ShimmerOverlay`, () => {
      const src = source(file)
      expect(src).toContain("ShimmerOverlay")
    })
  })

  it("no section hides the shimmer until hover (opacity-0 + group-hover gating)", () => {
    SHIMMER_SECTIONS.forEach((file) => {
      const src = source(file)
      expect(src, `${file} must not gate shimmer behind hover`).not.toMatch(
        /shimmer[^"']*opacity-0/,
      )
    })
  })
})
