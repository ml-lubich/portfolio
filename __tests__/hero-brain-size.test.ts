/**
 * Hero brain sizing — "Joseph-sized" (josephheupler.com) without colliding
 * with the floating nav pill.
 *
 * The brain stage is anchored to the viewport height (`svh`), never to the
 * hero section's own height, and on sm+ it is a landscape box at least one
 * full viewport tall so the mesh reads as the dominant object. The nav stays
 * clear because the stage keeps its top padding and the underlay mask fades
 * both the crown (under the nav) and the foot (into the stat row).
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")
const hero = fs.readFileSync(path.join(ROOT, "components/hero/index.tsx"), "utf8")
const css = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8")
const brain = fs.readFileSync(path.join(ROOT, "components/brain/index.tsx"), "utf8")

describe("hero brain stage sizing", () => {
  it("anchors the sm+ stage height to svh at a full viewport or more", () => {
    const m = /sm:h-\[min\((\d+)svh,/.exec(hero)
    expect(m, "sm+ brain box must be `sm:h-[min(<N>svh,...)]`").not.toBeNull()
    expect(Number(m![1])).toBeGreaterThanOrEqual(100)
  })

  it("uses a landscape aspect on sm+ so the auto-rotating long axis never clips", () => {
    expect(hero).toMatch(/sm:aspect-\[\s*6\s*\/\s*5\s*\]/)
  })

  it("keeps the phone tier untouched (mobile perf tier is a separate decision)", () => {
    expect(hero).toContain("max-sm:w-[min(112vw,64svh)]")
  })

  it("keeps the nav-clearance top padding on the section", () => {
    expect(hero).toMatch(/sm:pt-28/)
    expect(hero).toMatch(/md:pt-36/)
  })

  it("underlay mask fades the crown under the nav AND the foot into the stat row", () => {
    const block = /\.hero-brain-underlay \{[\s\S]*?\}/.exec(css)?.[0] ?? ""
    expect(block).toMatch(/mask-image: linear-gradient\(to bottom, transparent 0%/)
    expect(block).toMatch(/,\s*transparent 100%\)/)
  })

  it("desktop camera tier is tighter than the old 1.83 so the bigger box is filled, not padded", () => {
    const m = /return \{ z: ([\d.]+), fov: (\d+) \}\s*\n\}/.exec(brain)
    expect(m, "desktop tier is the final return in getInitialCam").not.toBeNull()
    expect(Number(m![1])).toBeLessThan(1.83)
  })

  it("tight desktop camera is paired with a polar clamp so a vertical drag cannot pitch the long axis into the edge", () => {
    expect(brain).toMatch(/minPolarAngle=\{Math\.PI \/ 2 - 0\.\d+\}/)
    expect(brain).toMatch(/maxPolarAngle=\{Math\.PI \/ 2 \+ 0\.\d+\}/)
  })

  it("idle rotation is perceptible (Heupler parity), not a 2-minute crawl", () => {
    const m = /autoRotateSpeed=\{([\d.]+)\}/.exec(brain)
    expect(Number(m?.[1])).toBeGreaterThanOrEqual(0.8)
  })
})
