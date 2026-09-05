/**
 * Hero entrance choreography + reduced-motion delay collapse.
 *
 * The hero used to assign its entrance delays per component, and they had
 * drifted out of DOM order: the tagline animated in before the name, the CTAs
 * before the subtitle they answer, and the stat row before the badge sitting
 * above it. Everything landed inside ~0.6s in the wrong sequence, so the hero
 * read as one jumbled pop. `HERO_BEAT` in `components/hero/data.ts` is now the
 * single ascending ladder every hero block reads from.
 *
 * The second half of this file pins the accessibility half of that change:
 * a stagger is a *delay*, so `prefers-reduced-motion: reduce` has to zero
 * delays as well as durations — otherwise removing the motion just leaves a
 * reduced-motion visitor staring at invisible content for the length of the
 * ladder.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8")
const css = read("app/globals.css")

/** The hero's blocks, top to bottom as they appear in the DOM. */
const BEAT_ORDER = [
  "tagline",
  "subtitle",
  "ctas",
  "tokscale",
  "social",
  "stats",
  "scrollCue",
] as const

describe("Hero entrance ladder", () => {
  it("beats ascend in DOM order — the reveal reads top to bottom", async () => {
    const { HERO_BEAT } = await import("@/components/hero/data")
    const values = BEAT_ORDER.map((beat) => HERO_BEAT[beat])
    expect(Object.keys(HERO_BEAT).sort()).toEqual([...BEAT_ORDER].sort())
    for (let i = 1; i < values.length; i++) {
      expect(
        values[i],
        `${BEAT_ORDER[i]} (${values[i]}ms) must come after ${BEAT_ORDER[i - 1]} (${values[i - 1]}ms)`
      ).toBeGreaterThan(values[i - 1])
    }
  })

  it("starts after the name reveal begins and settles inside 2s", async () => {
    const { HERO_BEAT } = await import("@/components/hero/data")
    const { HERO_NAME_REVEAL } = await import("@/components/hero/role-rotator")
    expect(HERO_BEAT.tagline).toBeGreaterThan(HERO_NAME_REVEAL.delayMs)
    expect(HERO_BEAT.scrollCue).toBeLessThanOrEqual(2000)
  })

  it("every hero block reads its delay from the ladder, not a local literal", () => {
    const blocks: [string, string][] = [
      ["components/hero/role-rotator.tsx", 'heroBeatDelay("tagline")'],
      ["components/hero/role-rotator.tsx", "delay={HERO_BEAT.subtitle}"],
      ["components/hero/hero-actions.tsx", 'heroBeatDelay("ctas")'],
      ["components/hero/hero-actions.tsx", 'heroBeatDelay("social")'],
      ["components/sections/tokscale-stats.tsx", 'heroBeatDelay("tokscale")'],
      ["components/hero/rotating-stats.tsx", 'heroBeatDelay("stats")'],
      ["components/hero/index.tsx", 'heroBeatDelay("scrollCue")'],
    ]
    for (const [file, marker] of blocks) {
      expect(read(file), `${file} should use ${marker}`).toContain(marker)
    }
  })
})

describe("Reduced motion — staggers collapse instead of stalling", () => {
  // The file has several reduce blocks; the global one is the block carrying
  // the universal selector.
  const reduceBlock =
    css
      .match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/g)
      ?.find((block) => /\*,\s*\n\s*\*::before/.test(block)) ?? ""

  it("zeroes animation-delay and transition-delay, not just durations", () => {
    expect(reduceBlock).toMatch(/animation-delay:\s*0ms\s*!important/)
    expect(reduceBlock).toMatch(/transition-delay:\s*0ms\s*!important/)
  })

  it("AnimatedName skips its JS stagger timer — a CSS rule cannot reach it", () => {
    // The name reveal is gated by setTimeout(delay), not a CSS delay, so the
    // global rule above does not cover it; without this branch the headline
    // sits at opacity 0 for `delay` ms with no animation to justify the wait.
    const src = read("components/animations/animated-name.tsx")
    expect(src).toMatch(/prefers-reduced-motion: reduce/)
    expect(src).toMatch(/if \(wantsReducedMotion\(\)\) \{[\s\S]{0,160}setExpanded\(true\)/)
  })

  it("uses !important so it outranks the hero's inline animationDelay styles", () => {
    // The hero sets animation-delay inline; a non-important author rule loses
    // to an inline style, so dropping !important silently re-breaks this.
    expect(read("components/hero/hero-actions.tsx")).toContain("animationDelay:")
    expect(reduceBlock).toContain("!important")
  })
})

describe("Glass buttons — keyboard parity", () => {
  it("focus-visible gets the same treatment as hover", () => {
    expect(css).toMatch(/\.glass-btn:hover,\s*\n\s*\.glass-btn:focus-visible \{/)
    expect(css).toMatch(/\.glass-btn:hover::before,\s*\n\s*\.glass-btn:focus-visible::before \{/)
  })

  it("that focus treatment is disabled under reduced motion too", () => {
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\.glass-btn:focus-visible \{ border-radius: 14px; transform: none; \}/
    )
  })
})
