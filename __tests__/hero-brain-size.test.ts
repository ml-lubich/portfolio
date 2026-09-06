/**
 * Hero brain sizing — "Joseph-sized" (josephheupler.com) and *contained*.
 *
 * Two things shipped wrong in one afternoon and this file pins both:
 *  1. a box taller than the hero section ran past its bottom edge and was
 *     hard-clipped by overflow-hidden before the mask's foot fade finished;
 *  2. a box bound only by viewport height ran off the sides on wide screens.
 * So the sm+ box is at most one viewport tall AND bound by viewport width,
 * and the mask lives on the box itself. The mesh's share of that box is the
 * camera's job, and the real projected extent is asserted in the browser by
 * e2e/hero-brain-fit.spec.ts via the telemetry BrainTelemetry writes.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")
const hero = fs.readFileSync(path.join(ROOT, "components/hero/index.tsx"), "utf8")
const css = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8")
const brain = fs.readFileSync(path.join(ROOT, "components/brain/index.tsx"), "utf8")
const wireframe = fs.readFileSync(path.join(ROOT, "components/brain/brain-wireframe.tsx"), "utf8")

const boxLine = hero.split("\n").find((l) => l.includes("sm:aspect-[6/5]")) ?? ""

describe("hero brain stage sizing", () => {
  it("sm+ box is at most one viewport tall and bound by viewport width", () => {
    const m = /sm:h-\[min\((\d+)svh,(\d+)vw\)\]/.exec(boxLine)
    expect(m, "sm+ brain box must be `sm:h-[min(<N>svh,<M>vw)]`").not.toBeNull()
    expect(Number(m![1]), "taller than the section → hard-clipped foot").toBeLessThanOrEqual(100)
    expect(Number(m![2]), "must be bound by width or it runs off the sides").toBeLessThanOrEqual(75)
  })

  it("box is not nudged off-centre with a translate (that is how the foot ran past the edge)", () => {
    expect(boxLine).not.toMatch(/translate-y/)
  })

  it("mask is on the box itself, not the stage underlay", () => {
    expect(boxLine).toContain("hero-brain-underlay")
  })

  it("uses a landscape aspect on sm+ so the auto-rotating long axis never clips", () => {
    expect(boxLine).toMatch(/sm:aspect-\[\s*6\s*\/\s*5\s*\]/)
  })

  it("gives the phone its own box, sized for the phone rather than inherited", () => {
    // The phone tier is authored separately from sm+: at 112vw/64svh the mesh
    // read only ~40% of viewport height and looked lost on a handset. The box
    // is deliberately wider than the viewport so the brain bleeds off both
    // edges the way it does on josephheupler.com; the section clips it.
    const m = boxLine.match(/max-sm:w-\[min\((\d+)vw,(\d+)svh\)\]/)
    expect(m, "phone box must stay bound by BOTH vw and svh").not.toBeNull()
    expect(Number(m![1]), "narrower than the viewport leaves the brain small").toBeGreaterThanOrEqual(150)
    expect(Number(m![2]), "taller than this and the brain pushes the stat row off").toBeLessThanOrEqual(92)
  })

  it("keeps the nav-clearance top padding on the section", () => {
    expect(hero).toMatch(/sm:pt-28/)
    expect(hero).toMatch(/md:pt-36/)
  })

  it("mask fades the crown under the nav AND the foot into the stat row", () => {
    const block = /\.hero-brain-underlay \{[\s\S]*?\}/.exec(css)?.[0] ?? ""
    expect(block).toMatch(/mask-image: linear-gradient\(to bottom, transparent 0%/)
    expect(block).toMatch(/,\s*transparent 100%\)/)
  })
})

describe("hero brain camera and motion", () => {
  it("desktop camera sits in the measured band (size comes from the box, framing from here)", () => {
    const m = /return \{ z: ([\d.]+), fov: (\d+) \}\s*\n\}/.exec(brain)
    expect(m, "desktop tier is the final return in getInitialCam").not.toBeNull()
    expect(Number(m![1])).toBeGreaterThanOrEqual(1.4)
    expect(Number(m![1])).toBeLessThanOrEqual(2.0)
    expect(Number(m![2])).toBeLessThanOrEqual(42)
  })

  it("polar clamp keeps a vertical drag from pitching the long axis into the edge", () => {
    expect(brain).toMatch(/minPolarAngle=\{Math\.PI \/ 2 - 0\.\d+\}/)
    expect(brain).toMatch(/maxPolarAngle=\{Math\.PI \/ 2 \+ 0\.\d+\}/)
  })

  it("idle rotation is perceptible, not a two-minute crawl", () => {
    const m = /autoRotateSpeed=\{([\d.]+)\}/.exec(brain)
    expect(Number(m?.[1])).toBeGreaterThanOrEqual(1.5)
  })

  it("auto-rotate is off under prefers-reduced-motion", () => {
    expect(brain).toContain("prefers-reduced-motion")
    expect(brain).toMatch(/autoRotate=\{!reducedMotion\}/)
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
    // …and it measures the real mesh, not the oversized invisible hit sphere.
    expect(wireframe).toMatch(/<lineSegments name="brain-mesh"/)
    expect(wireframe).toMatch(/name="brain-root"/)
  })
})
