/**
 * Hero brain sizing — 1:1 with josephheupler.com (jheupler-site).
 *
 * The reference box and camera are literals in that repo, not a vibe:
 *   box:    h-[min(92vh,860px)] w-[min(120%,980px)]
 *   phone:  height min(54svh, 420px), width min(132%, 470px)
 *   camera: {1.38,48} / {1.48,47} / {1.62,46} / desktop {1.55,44}
 *
 * A smaller band (50svh / 64svh) or a further camera (z 1.82 / fov 38) is
 * how this site's brain read as a thumbnail next to Joseph's. These tests
 * pin the mapping. Pixel truth is e2e/hero-brain-fit.spec.ts.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")
const hero = fs.readFileSync(path.join(ROOT, "components/hero/index.tsx"), "utf8")
const css = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8")
const brain = fs.readFileSync(path.join(ROOT, "components/brain/index.tsx"), "utf8")
const wireframe = fs.readFileSync(path.join(ROOT, "components/brain/brain-wireframe.tsx"), "utf8")

const boxLine = hero.split("\n").find((l) => l.includes('className="hero-brain-underlay')) ?? ""

describe("hero brain stage sizing (josephheupler.com 1:1)", () => {
  it("uses Joseph's exact desktop box — 92vh capped at 860×980", () => {
    expect(boxLine, "desktop height is josephheupler.com's h-[min(92vh,860px)]").toMatch(
      /h-\[min\(92vh,860px\)\]/,
    )
    expect(boxLine, "desktop width is josephheupler.com's w-[min(120%,980px)]").toMatch(
      /w-\[min\(120%,980px\)\]/,
    )
  })

  it("does not shrink the stage into a 50svh / 64svh band", () => {
    expect(hero, "the 50svh phone band is how the mesh became a thumbnail").not.toMatch(
      /min-h-\[min\(420px,50svh\)\]/,
    )
    expect(hero, "the 64svh laptop band is how the mesh stayed half a viewport").not.toMatch(
      /sm:min-h-\[min\(\d+svh,/,
    )
  })

  it("stages the brain absolute inset-0 like josephheupler.com's .brain-stage", () => {
    expect(hero).toMatch(/hero-brain-stage[\s\S]{0,80}absolute inset-0/)
  })

  it("box is not nudged off-centre with a translate", () => {
    expect(boxLine).not.toMatch(/translate-y/)
  })

  it("mask is on the box itself, not a parent underlay", () => {
    expect(boxLine).toContain("hero-brain-underlay")
  })

  it("phone box is Joseph's 54svh / 420px canvas, written in CSS so the rule actually emits", () => {
    const block = /@media \(max-width: 639px\) \{\s*\.hero-brain-underlay \{[\s\S]*?\}\s*\}/.exec(css)?.[0] ?? ""
    expect(block, "phone .hero-brain-underlay override must exist").not.toBe("")
    expect(block).toMatch(/height:\s*min\(54svh,\s*420px\)\s*!important/)
    expect(block).toMatch(/width:\s*min\(132%,\s*470px\)\s*!important/)
    expect(block).toMatch(/mask-image:\s*none/)
  })

  it("touches never reach the brain canvas on a coarse pointer (the scroll trap)", () => {
    const block = /@media \(pointer: coarse\) \{[\s\S]*?\.hero-brain-underlay[\s\S]*?\}/.exec(css)?.[0] ?? ""
    expect(block, "pointer-events: none on coarse pointers, !important over the utility").toMatch(
      /pointer-events: none !important/,
    )
  })

  it("keeps the nav-clearance top padding on the section", () => {
    expect(hero).toMatch(/sm:pt-28/)
    expect(hero).toMatch(/md:pt-28/)
  })

  it("mask fades the crown under the nav AND the foot into the page", () => {
    const block = /\.hero-brain-underlay \{[\s\S]*?\}/.exec(css)?.[0] ?? ""
    expect(block).toMatch(/mask-image: linear-gradient\(to bottom, transparent 0%/)
    expect(block).toMatch(/,\s*transparent 100%\)/)
  })
})

describe("hero brain camera and motion (josephheupler.com 1:1)", () => {
  it("camera tiers are Joseph's literals, not a further/narrower framing", () => {
    expect(brain).toMatch(/if \(w < 480\) return \{ z: 1\.38, fov: 48 \}/)
    expect(brain).toMatch(/if \(w < 640\) return \{ z: 1\.48, fov: 47 \}/)
    expect(brain).toMatch(/if \(w < 1024\) return \{ z: 1\.62, fov: 46 \}/)
    expect(brain).toMatch(/return \{ z: 1\.55, fov: 44 \}/)
  })

  it("polar clamp keeps a vertical drag from pitching the long axis into the edge", () => {
    expect(brain).toMatch(/minPolarAngle=\{Math\.PI \/ 2 - 0\.\d+\}/)
    expect(brain).toMatch(/maxPolarAngle=\{Math\.PI \/ 2 \+ 0\.\d+\}/)
  })

  it("idles at josephheupler.com's speed for everyone, with no pointer/motion ternary", () => {
    const m = /autoRotateSpeed=\{([\d.]+)\}/.exec(brain)
    expect(m, "speed is a single literal, not a ternary").not.toBeNull()
    expect(Number(m![1]), "josephheupler.com's idle speed").toBe(0.9)
    expect(brain, "no speed ternary").not.toMatch(/autoRotateSpeed=\{[^}]*\?/)
  })

  it("keeps the pitch range wide enough to tumble, narrow enough to fit", () => {
    const lo = /minPolarAngle=\{Math\.PI \/ 2 - ([\d.]+)\}/.exec(brain)
    const hi = /maxPolarAngle=\{Math\.PI \/ 2 \+ ([\d.]+)\}/.exec(brain)
    expect(lo, "minPolarAngle clamp").not.toBeNull()
    expect(Number(lo![1])).toBe(Number(hi![1]))
    expect(Number(lo![1]), "±0.22 was effectively locked").toBeGreaterThanOrEqual(0.8)
    expect(Number(lo![1]), "measured: past ~1.1 the mesh clips the canvas").toBeLessThanOrEqual(1.0)
  })

  it("damps and tracks the drag at the reference's feel", () => {
    expect(brain).toMatch(/dampingFactor=\{0\.06\}/)
    expect(brain).toMatch(/rotateSpeed=\{0\.7\}/)
  })

  it("auto-rotate is never gated on prefers-reduced-motion (the frozen-iPhone ship)", () => {
    expect(brain).toMatch(/^\s*autoRotate\s*$/m)
    expect(brain).not.toMatch(/autoRotate=\{/)
  })

  it("pointer tilt is desktop-only: skipped on coarse pointers and reduced motion", () => {
    expect(brain).toMatch(/function BrainTilt/)
    expect(brain).toMatch(/if \(coarsePointer\(\) \|\| prefersReducedMotion\(\)\) return/)
  })

  it("telemetry exposes the projected mesh extent and azimuth for the e2e guards", () => {
    expect(brain).toMatch(/function BrainTelemetry/)
    expect(brain).toContain("dataset.brainBbox")
    expect(brain).toContain("dataset.brainRot")
    expect(brain).toContain('getObjectByName("brain-mesh")')
    expect(wireframe).toMatch(/<lineSegments name="brain-mesh"/)
    expect(wireframe).toMatch(/name="brain-root"/)
  })
})
