/**
 * Skill storm perf guards. All three of these were pure waste — none of them
 * changed a pixel, so if one comes back it is a regression, not a trade-off.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const read = (p: string) => fs.readFileSync(path.resolve(__dirname, p), "utf-8")

describe("Skill storm performance", () => {
  const storm = read("../components/sections/skill-storm.tsx")
  const skills = read("../components/sections/skills.tsx")
  const css = read("../app/globals.css")

  it("does not backdrop-filter the pills", () => {
    // `.skill-pill` paints an opaque `hsl(var(--card))` base, so a blurred
    // backdrop is covered 100% — invisible, but a backdrop pass per pill.
    const rule = css.slice(css.indexOf(".skill-pill {"), css.indexOf(".skill-pill:hover"))
    expect(rule).not.toMatch(/backdrop-filter/)
    // The opaque base is what makes dropping it safe — keep it opaque.
    expect(rule).toContain("hsl(var(--card))")
  })

  it("code-splits the storm instead of shipping it to phones that hide it", () => {
    expect(skills).not.toMatch(/^import \{ SkillStorm \}/m)
    expect(skills).toMatch(/const SkillStorm = dynamic\(/)
    expect(skills).toMatch(/import\("\.\/skill-storm"\)/)
  })

  it("skips the per-frame CSS var write when nothing can see it", () => {
    // Below lg the storm is display:none; a write there still dirties every
    // pill subtree. Gated by matchMedia, never by reading layout.
    expect(storm).toMatch(/matchMedia\("\(min-width: 1024px\)"\)/)
    expect(storm).not.toMatch(/\.offsetParent/)
    // And no redundant write when the angle is parked (hover / reduced motion).
    expect(storm).toMatch(/if \(angleRef\.current === written\) return/)
  })

  it("memoises the pills so they never re-render", () => {
    expect(storm).toMatch(/const SkillPill = memo\(/)
    // memo only holds if the callbacks it receives are stable.
    expect(storm).toMatch(/const handleSelect = useCallback\(/)
    expect(storm).toMatch(/const handleHoverChange = useCallback\(/)
  })

  it("keeps the visual contract: depth cues and the shared-angle transform", () => {
    expect(css).toMatch(/filter: brightness\(calc\(0\.5 \+ 0\.25 \* \(var\(--d\) \+ 1\)\)\)/)
    expect(css).toMatch(/opacity: calc\(0\.72 \+ 0\.14 \* \(var\(--d\) \+ 1\)\)/)
    expect(storm).toMatch(/--storm-angle/)
  })
})
