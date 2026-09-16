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
/* The hero is banded now: the brain band declares the height and the box is
   `h-full` inside it, so the canvas can never extend past the band into the
   CTA strip below (e2e/hero-cta-clearance.spec.ts is the pixel guard). */
const bandLine = hero.split("\n").find((l) => l.includes("sm:min-h-[min(")) ?? ""

describe("hero brain stage sizing", () => {
  it("the box takes its height from the band, never its own", () => {
    expect(boxLine, "box must be h-full so the canvas cannot outgrow its band").toMatch(/\bh-full\b/)
    expect(boxLine, "an independent height is how the canvas came to cover the CTAs").not.toMatch(/sm:h-\[/)
  })

  it("sm+ band is at most one viewport tall and bound by viewport width", () => {
    const m = /sm:min-h-\[min\((\d+)svh,(\d+)vw\)\]/.exec(bandLine)
    expect(m, "sm+ brain band must be `sm:min-h-[min(<N>svh,<M>vw)]`").not.toBeNull()
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
    // The phone tier is authored separately from sm+. It went through a
    // 112vw/64svh box (mesh ~40% of the viewport, lost), a 190vw one (the
    // owner could not scroll past it), a 120vw/56svh square (48%), and is now
    // josephheupler.com's canvas measured on a phone: full width, 420px tall,
    // mesh ~300px inside. Capped at half the viewport so a short handset
    // (659px of usable height in a browser) doesn't get a 64%-tall mesh that
    // shoves the CTA row onto the floating chat button.
    expect(bandLine).toContain("min-h-[min(480px,58svh)]")
    expect(boxLine).toContain("max-sm:w-full")
    expect(boxLine, "vw-wide boxes are how the scroll trap shipped").not.toMatch(/max-sm:w-\[min\(\d+vw/)
  })

  it("touches never reach the brain canvas on a coarse pointer (the scroll trap)", () => {
    const block = /@media \(pointer: coarse\) \{[\s\S]*?\.hero-brain-underlay[\s\S]*?\}/.exec(css)?.[0] ?? ""
    expect(block, "pointer-events: none on coarse pointers, !important over the utility").toMatch(/pointer-events: none !important/)
  })

  it("keeps the nav-clearance top padding on the section", () => {
    expect(hero).toMatch(/sm:pt-28/)
    // md:pt-28, down from pt-36: the banded hero spends its height on three
    // stacked rows, and the extra 32px pushed the CTA row onto the scroll cue.
    expect(hero).toMatch(/md:pt-28/)
  })

  it("no CTA is drawn inside the brain band", () => {
    // The structural half of the "buttons are obscuring the brain" fix. The
    // pixel half is e2e/hero-cta-clearance.spec.ts; this catches a refactor
    // that folds HeroCTAs back into the copy stack without running a browser.
    const band = /min-h-\[min\(480px,58svh\)\][\s\S]*?<\/div>\s*\n\s*\{\/\* CTA band/.exec(hero)?.[0] ?? ""
    expect(band, "brain band must be followed by a separate CTA band").not.toBe("")
    expect(band, "HeroCTAs must not render inside the brain band").not.toContain("<HeroCTAs")
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

  /* This used to be a ternary: 0.9 for reduce/touch, 1.8 for a fine pointer.
     The owner's read of the fine-pointer half was "spinning a bit too fast" —
     josephheupler.com runs one unconditional 0.9 (≈67s per revolution) and
     that is the brain he asked for. One value now, which also means reduce
     and touch keep exactly the orbit they already had. */
  it("idles at josephheupler.com's speed for everyone, with no pointer/motion ternary", () => {
    const m = /autoRotateSpeed=\{([\d.]+)\}/.exec(brain)
    expect(m, "speed is a single literal, not a ternary").not.toBeNull()
    expect(Number(m![1]), "josephheupler.com's idle speed").toBe(0.9)
    expect(brain, "no speed ternary").not.toMatch(/autoRotateSpeed=\{[^}]*\?/)
  })

  /* Joseph clamps nothing; our desktop camera is tighter (fov 38 @ z 1.82 vs
     his 44 @ 1.55), and a free pitch measurably runs the crown past the canvas
     top. ±0.9 rad is the loosest clamp that still fits — ±0.22 was so tight a
     vertical drag moved the mesh 3px, which read as "not rotatable". */
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
    // The owner's phone has Reduce Motion on; `autoRotate={!reducedMotion}`
    // is what he saw as a broken, static brain. The reference keeps its orbit
    // under reduce; e2e/hero-brain-fit.spec.ts asserts ours does on phones
    // and desktop. Reduce still disables the pointer tilt (BrainTilt).
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
    // …and it measures the real mesh, not the oversized invisible hit sphere.
    expect(wireframe).toMatch(/<lineSegments name="brain-mesh"/)
    expect(wireframe).toMatch(/name="brain-root"/)
  })
})
