/**
 * Scroll devices B — AI expertise opacity reveals.
 *
 * Compact / SSR / reduced-motion must paint exactly the pre-change markup
 * (file snapshots captured BEFORE the devices were written); the pure math
 * must clamp, never hide content past the midpoint.
 */
import { describe, it, expect } from "vitest"
import { normalizeFloats } from "./helpers/normalize-floats"
import fs from "fs"
import path from "path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { AIExpertise } from "@/components/sections/ai-expertise"
import { Contact } from "@/components/sections/contact"
import {
  revealAt,
  revealCount,
  REVEAL_FLOOR,
  REVEAL_DONE_AT,
} from "@/lib/scroll-reveal"

const ROOT = path.resolve(__dirname, "..")
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8")

describe("SSR / compact markup is unchanged", () => {
  it("AIExpertise renders exactly today's markup", async () => {
    await expect(normalizeFloats(renderToStaticMarkup(createElement(AIExpertise)))).toMatchFileSnapshot(
      "__snapshots__/ai-expertise-baseline.html",
    )
  })
  it("Contact renders exactly today's markup", async () => {
    await expect(normalizeFloats(renderToStaticMarkup(createElement(Contact)))).toMatchFileSnapshot(
      "__snapshots__/contact-baseline.html",
    )
  })
})

describe("revealAt (pure)", () => {
  it("starts at the floor (never 0) and clamps below 0", () => {
    expect(revealAt(0, 3, 4)).toBeGreaterThanOrEqual(REVEAL_FLOOR)
    expect(revealAt(-5, 3, 4)).toBe(REVEAL_FLOOR)
    expect(REVEAL_FLOOR).toBeGreaterThan(0)
  })
  it("every group is fully visible at and past the midpoint", () => {
    expect(REVEAL_DONE_AT).toBeLessThanOrEqual(0.5)
    for (const p of [0.5, 0.51, 0.75, 1, 9]) {
      for (let i = 0; i < 4; i++) expect(revealAt(p, i, 4)).toBe(1)
    }
  })
  it("is monotonic in progress and staggered by index", () => {
    for (let i = 0; i < 4; i++) {
      let prev = 0
      for (let p = 0; p <= 1; p += 0.01) {
        const v = revealAt(p, i, 4)
        expect(v).toBeGreaterThanOrEqual(prev - 1e-12)
        expect(v).toBeLessThanOrEqual(1)
        prev = v
      }
    }
    expect(revealAt(0.15, 0, 4)).toBeGreaterThan(revealAt(0.15, 3, 4))
  })
  it("treats NaN / Infinity / bad counts as fully visible or rest, never hidden", () => {
    expect(revealAt(Number.NaN, 0, 4)).toBeGreaterThanOrEqual(REVEAL_FLOOR)
    expect(revealAt(Number.POSITIVE_INFINITY, 2, 4)).toBe(1)
    expect(revealAt(0.3, 0, 0)).toBeGreaterThanOrEqual(REVEAL_FLOOR)
    expect(revealAt(0.3, 7, 4)).toBeGreaterThanOrEqual(REVEAL_FLOOR)
  })
})

describe("revealCount (pure)", () => {
  it("counts fully revealed groups from 0 to n", () => {
    expect(revealCount(0, 4)).toBe(0)
    expect(revealCount(0.5, 4)).toBe(4)
    expect(revealCount(1, 4)).toBe(4)
    expect(revealCount(Number.NaN, 4)).toBe(0)
  })
  it("is monotonic", () => {
    let prev = 0
    for (let p = 0; p <= 1; p += 0.01) {
      const c = revealCount(p, 4)
      expect(c).toBeGreaterThanOrEqual(prev)
      prev = c
    }
  })
})

describe("component contracts", () => {
  const ai = read("components/sections/ai-expertise.tsx")
  const contact = read("components/sections/contact.tsx")

  it("AI expertise: opacity-only reveals via useSectionProgress, state published", () => {
    expect(ai).toContain("useSectionProgress(")
    expect(ai).toContain("revealAt(")
    expect(ai).toContain("style.opacity")
    expect(ai).not.toContain("clipPath")
    expect(ai).not.toContain("clip-path")
    expect(ai).toContain("dataset.scVerifyState = `reveal:")
  })
  it("AI expertise: focus inside a group forces it fully visible", () => {
    expect(ai).toContain("document.activeElement")
  })
  it("AI expertise: the constellation scrub is untouched (its state is not shadowed)", () => {
    expect(ai).toContain("<NeuralConstellation bars={techBars} metrics={metrics} />")
    expect(ai).not.toContain('data-sc-verify-state="reveal')
  })
  it("Contact: no kinetic band (stray ghost text removed)", () => {
    expect(contact).not.toContain("showBand")
    expect(contact).not.toContain("LET'S BUILD")
  })
})
