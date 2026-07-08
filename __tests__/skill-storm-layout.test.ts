/**
 * Regression: on lg+ the skills render as an orbital "Storm of Skills" while
 * mobile/tablet keep the classic category cards. The storm must be driven by
 * CSS-only compositor animation (rings spin, pills counter-spin) with no
 * per-frame JS, and its layout must never drop a skill.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")
const storm = fs.readFileSync(path.join(ROOT, "components/sections/skill-storm.tsx"), "utf8")
const skills = fs.readFileSync(path.join(ROOT, "components/sections/skills.tsx"), "utf8")
const css = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8")

describe("Skill Storm", () => {
  it("swaps cards → storm at the lg breakpoint", () => {
    // Storm mounts only on lg+, cards hide on lg+ — no double render.
    expect(skills).toMatch(/hidden lg:block[\s\S]{0,80}SkillStorm/)
    expect(skills).toMatch(/flex flex-wrap[^"]*lg:hidden/)
  })

  it("shows the literal 'A Storm of Skills' label", () => {
    expect(storm).toContain("A Storm of")
    expect(storm).toContain(">Skills<")
  })

  it("is CSS-compositor driven — no per-frame JS", () => {
    expect(storm).not.toMatch(/requestAnimationFrame|setInterval/)
    // Rings spin; pills counter-spin to stay upright.
    expect(storm).toContain("skill-ring")
    expect(storm).toContain("skill-pill-spin")
    expect(css).toContain("@keyframes skill-orbit")
    // Hover freezes the whole field for reading/clicking.
    expect(css).toMatch(/:has\(\.skill-pill:hover\)[\s\S]{0,120}animation-play-state:\s*paused/)
  })

  it("never drops a skill — the outer ring absorbs all overflow", () => {
    // Last ring's capacity is Infinity, so every skill is placed.
    expect(storm).toMatch(/r === RINGS\.length - 1 \? Infinity/)
    expect(storm).toContain("Array.from(new Set(all))")
  })
})
