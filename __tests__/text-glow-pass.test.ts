/**
 * Body copy glows as it scrolls through the viewport — desktop only, CSS only.
 * The JS ScrollShimmer (--scroll-y on <html>) was unmounted for flicker; this
 * must stay a scroll-driven animation with no JS and never reach phones.
 */
import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const css = fs.readFileSync(path.resolve(__dirname, "../app/globals.css"), "utf8")
const block = css.match(/@supports \(animation-timeline: view\(\)\) \{[\s\S]*?\n\}/)?.[0] ?? ""

describe("text glow-pass on scroll", () => {
  it("is a scroll-driven animation on main body paragraphs", () => {
    expect(block).toContain("#main-content p")
    expect(block).toMatch(/animation:\s*text-glow-pass/)
    expect(block).toMatch(/animation-timeline:\s*view\(\)/)
    expect(css).toMatch(/@keyframes text-glow-pass/)
  })

  it("only runs on desktop fine-pointer screens with motion allowed", () => {
    expect(block).toContain("min-width: 1024px")
    expect(block).toContain("pointer: fine")
    expect(block).toContain("hover: hover")
    expect(block).toContain("prefers-reduced-motion: no-preference")
  })

  it("does not bring back the JS scroll listener", () => {
    const layout = fs.readFileSync(path.resolve(__dirname, "../app/layout.tsx"), "utf8")
    expect(layout).not.toContain("ScrollShimmer")
  })
})

describe("text glow-pass scroller safety", () => {
  it("sections clip instead of hide so view() tracks the page, and card copy is excluded", () => {
    expect(block).toMatch(/section\.overflow-hidden[\s\S]*?overflow:\s*clip/)
    expect(block).toContain(':not(section [class*="overflow-"] p)')
  })
})
