/**
 * Regression: on lg+ the skills render as an orbital "Storm of Skills" the
 * visitor can grab and spin either direction; mobile/tablet keep the classic
 * category cards. The storm is a 3D carousel driven by a single shared angle:
 * pills ride tilted rings via CSS trig — sweeping across the page, receding
 * INTO it (smaller, dimmer, behind the centre title) and swinging back OUT
 * toward the viewer. It idles with a gentle drift and flings with inertia
 * after a drag. Its layout must never drop a skill.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")
const storm = fs.readFileSync(path.join(ROOT, "components/sections/skill-storm.tsx"), "utf8")
const skills = fs.readFileSync(path.join(ROOT, "components/sections/skills.tsx"), "utf8")
const skillsData = fs.readFileSync(path.join(ROOT, "data/skills.ts"), "utf8")
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

  it("is drag-to-rotate, either direction, with pointer capture", () => {
    expect(storm).toMatch(/onPointerDown/)
    expect(storm).toMatch(/onPointerMove/)
    expect(storm).toMatch(/onPointerUp/)
    expect(storm).toMatch(/setPointerCapture/)
    // A single shared angle drives the whole constellation…
    expect(storm).toContain("--storm-angle")
    // …and each pill derives its 3D ring position from it via CSS trig:
    // cos() sweeps across the page, sin() drives depth (translateZ).
    expect(css).toMatch(/cos\(var\(--storm-angle/)
    expect(css).toMatch(/sin\(var\(--storm-angle/)
    // Drag must not scroll the page under the pointer.
    expect(css).toMatch(/touch-action:\s*none/)
  })

  it("idles with drift + inertia via rAF, and cleans up on unmount", () => {
    expect(storm).toMatch(/requestAnimationFrame/)
    expect(storm).toMatch(/cancelAnimationFrame/)
    // Fling carries velocity that decays by friction back toward idle drift.
    expect(storm).toMatch(/velocity/i)
    // A real drag suppresses the pill's click so spinning never opens a modal.
    expect(storm).toMatch(/moved/i)
    // Respect reduced-motion: no idle drift when the user opts out.
    expect(storm).toMatch(/prefers-reduced-motion/)
  })

  it("never drops a skill — the outer ring absorbs all overflow", () => {
    // Last ring's capacity is Infinity, so every skill is placed.
    expect(storm).toMatch(/r === RINGS\.length - 1 \? Infinity/)
    expect(storm).toContain("Array.from(new Set(all))")
    // Cloud/platform skills the visitor explicitly expects must exist in data.
    expect(skillsData).toContain("Vercel")
  })

  it("pills orbit in real 3D — into and out of the page, occluding cleanly", () => {
    // Depth is real: a perspective scene depth-sorts pills against each other
    // and the centre title, so near pills paint over far ones (and the title).
    expect(css).toMatch(/\.skill-storm-3d\b[\s\S]{0,160}perspective/)
    expect(css).toMatch(/\.skill-storm-3d\b[\s\S]{0,160}preserve-3d/)
    expect(css).toMatch(/translate3d\(/)
    // The title is planted mid-depth so the orbit threads around it.
    expect(storm).toMatch(/translateZ\(0px\)/)
    // Dimming is brightness-based, not per-ring alpha, so overlapping pills
    // never let labels bleed through.
    expect(storm).not.toMatch(/opacity:\s*ring\.opacity/)
    expect(css).toMatch(/\.skill-orbit-item\b[\s\S]{0,900}brightness/)
    // The pill is opaque glass: a solid card background under a sheen. It
    // carries no backdrop-filter — the opaque base hid it anyway, so it only
    // cost a backdrop pass per pill (see skill-storm-performance.test.ts).
    expect(css).toMatch(/\.skill-pill\b[\s\S]{0,320}(--card|--background)/)
  })
})
