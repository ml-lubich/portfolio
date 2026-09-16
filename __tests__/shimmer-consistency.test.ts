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

/* about.tsx deliberately left this list on 2026-09-13 — the owner's note was
   "too much shimmer and lit, it looks like liquid glass but not a big fan",
   and About was the heaviest offender. See the no-shimmer assertion below. */
const SHIMMER_SECTIONS = [
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

  it("about.tsx carries no shimmer at all — it reads as liquid glass there", () => {
    expect(source("components/sections/about.tsx")).not.toContain("ShimmerOverlay")
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

describe("shimmer spawn-in primitives (matching josephheupler.com)", () => {
  it("hero renders .brain-skeleton when brain is not yet mounted", () => {
    const hero = source("components/hero/index.tsx")
    expect(hero).toContain("brain-skeleton")
    expect(hero).toMatch(/showBrain\s*\?\s*\(?[\s\S]*?<Brain3D[\s\S]*?\)?\s*:\s*\(?[\s\S]*?brain-skeleton/)
  })

  it("globals.css defines .brain-skeleton with smooth wire ring and shimmer sweep", () => {
    const css = source("app/globals.css")
    expect(css).toContain(".brain-skeleton")
    expect(css).toContain(".brain-skeleton::before")
    expect(css).toContain(".brain-skeleton::after")
    expect(css).toMatch(/@keyframes\s+skeleton-shimmer/)
  })

  it("globals.css disables brain-skeleton shimmer on prefers-reduced-motion", () => {
    const css = source("app/globals.css")
    const reduceBlocks = [...css.matchAll(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{[\s\S]*?\n\}/g)].map(m => m[0]).join("\n")
    expect(reduceBlocks).toContain(".brain-skeleton::after")
  })

  it("components/ui/skeleton.tsx exports Skeleton and SectionSkeleton using .skel shimmer", () => {
    const skel = source("components/ui/skeleton.tsx")
    expect(skel).toContain("export function Skeleton")
    expect(skel).toContain("export function SectionSkeleton")
    expect(skel).toContain("skel")
  })

  it("globals.css defines .skel shimmer placeholders with reduced-motion guard", () => {
    const css = source("app/globals.css")
    expect(css).toContain(".skel")
    expect(css).toContain(".skel::after")
    const reduceBlocks = [...css.matchAll(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{[\s\S]*?\n\}/g)].map(m => m[0]).join("\n")
    expect(reduceBlocks).toContain(".skel::after")
  })

  it("components/layout/lazy-section.tsx renders SectionSkeleton placeholder when not yet visible", () => {
    const lazy = source("components/layout/lazy-section.tsx")
    expect(lazy).toContain("SectionSkeleton")
    expect(lazy).toMatch(/visible\s*\?\s*children\s*:\s*<SectionSkeleton/)
    // Must NOT violate the height reservation rules
    expect(lazy).not.toMatch(/38dvh|minHeight/)
  })

  it("app/page.tsx dynamic sections use SectionSkeleton with shimmer", () => {
    const page = source("app/page.tsx")
    expect(page).toContain("SectionSkeleton")
    expect(page).toContain("import { SectionSkeleton }")
  })
})
