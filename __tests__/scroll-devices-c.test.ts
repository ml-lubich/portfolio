/**
 * Scroll devices C — Follow staggered rise, Skills storm rise, Writing drift.
 * SSR / compact markup must equal the pre-change baseline; pure math clamps.
 */
import { describe, it, expect } from "vitest"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { normalizeFloats } from "./helpers/normalize-floats"
import { Follow } from "@/components/sections/follow"
import { Writing } from "@/components/sections/substack"
import { Skills } from "@/components/sections/skills"
import { riseAt, RISE_PX, revealAt, REVEAL_FLOOR } from "@/lib/scroll-reveal"
import { sectionProgress } from "@/lib/use-section-progress"

describe("SSR / compact markup is unchanged", () => {
  for (const [name, C, file] of [
    ["Follow", Follow, "follow-baseline"],
    ["Writing", Writing, "writing-baseline"],
    ["Skills", Skills, "skills-baseline"],
  ] as const) {
    it(`${name} renders exactly today's markup`, async () => {
      await expect(normalizeFloats(renderToStaticMarkup(createElement(C)))).toMatchFileSnapshot(
        `__snapshots__/${file}.html`,
      )
    })
  }
})

describe("riseAt (pure)", () => {
  it("starts at the full rise and settles at 0", () => {
    expect(riseAt(0, 0, 4)).toBeCloseTo(RISE_PX, 6)
    expect(riseAt(1, 0, 4)).toBe(0)
    expect(riseAt(1, 3, 4)).toBe(0)
  })
  it("is staggered: later items rise later", () => {
    expect(riseAt(0.2, 3, 4)).toBeGreaterThan(riseAt(0.2, 0, 4))
  })
  it("is monotonic non-increasing in progress and stays within [0, RISE_PX]", () => {
    let prev = Infinity
    for (let p = -0.5; p <= 1.5; p += 0.05) {
      const r = riseAt(p, 1, 4)
      expect(r).toBeLessThanOrEqual(prev + 1e-9)
      expect(r).toBeGreaterThanOrEqual(0)
      expect(r).toBeLessThanOrEqual(RISE_PX)
      prev = r
    }
  })
  it("NaN and degenerate counts rest at 0 (visible)", () => {
    expect(riseAt(Number.NaN, 0, 4)).toBe(0)
    expect(riseAt(0.3, 5, 0)).toBeGreaterThanOrEqual(0)
  })
  it("pairs with revealAt: opacity floor and rise reach rest together", () => {
    expect(revealAt(0, 0, 4)).toBeCloseTo(REVEAL_FLOOR, 6)
    for (const p of [0.1, 0.3, 0.6]) {
      expect(revealAt(p, 2, 4) >= 1).toBe(riseAt(p, 2, 4) === 0)
    }
  })
})

describe("sectionProgress", () => {
  it("clamps", () => {
    expect(sectionProgress(2000, 100, 800)).toBe(0)
    expect(sectionProgress(-2000, 100, 800)).toBe(1)
  })
})
