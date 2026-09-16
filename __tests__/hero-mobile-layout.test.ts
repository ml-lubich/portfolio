/**
 * Phone hero — josephheupler.com parity, layout and brain only.
 *
 * Measured on the reference with Playwright (390×844 and 430×932, isMobile +
 * hasTouch), not eyeballed:
 *   - hero section is exactly one screenful (`min-h-[100svh]`, content
 *     vertically centred), nothing of the hero below the fold;
 *   - the brain canvas is 100vw × 420px, centred at 50% of the viewport, the
 *     mesh inside it ~300px tall (35% of an 844px viewport, 32% of 932);
 *   - no mask on the canvas: the crown is fully drawn, the copy sits over it.
 *
 * Ours before this: the section ran to 150% of the viewport with a 210px
 * empty band under the nav, and the mesh was 404px (48% of 844) — a bigger,
 * lower brain with the stat row a full screen down. Everything asserted here
 * is inside `max-sm:` / `@media (max-width: 639px)`; sm+ is untouched and
 * guarded by hero-brain-size.test.ts. Pixel truth lives in
 * e2e/hero-brain-fit.spec.ts (phone cases).
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")
const hero = fs.readFileSync(path.join(ROOT, "components/hero/index.tsx"), "utf8")
const css = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8")
const brain = fs.readFileSync(path.join(ROOT, "components/brain/index.tsx"), "utf8")

const sectionLine = hero.split("\n").find((l) => l.includes('min-h-[90svh]')) ?? ""
const bandLine = hero.split("\n").find((l) => l.includes("sm:min-h-[min(")) ?? ""
const boxLine = hero.split("\n").find((l) => l.includes("sm:aspect-[6/5]")) ?? ""

describe("phone hero layout (josephheupler.com parity)", () => {
  it("section is one screenful with the content centred in it", () => {
    expect(sectionLine).toContain("max-sm:min-h-[100svh]")
    expect(sectionLine).toContain("max-sm:justify-center")
    // The 9.5rem top pad was the empty band under the nav. The reference pads
    // 6rem under a 57px header; our nav pill ends at 79px, so 8rem.
    expect(sectionLine).toContain("max-sm:pt-32")
  })

  it("the stage stops forcing its own screenful so the stat row joins the first screen", () => {
    // The old `min-h-[calc(100svh-13rem)]` stage is gone: the hero is three
    // stacked bands, each only as tall as its own content, so nothing forces
    // a screenful any more.
    expect(hero, "the forced-screenful stage must not come back").not.toContain("min-h-[calc(100svh-13rem)]")
  })

  it("brain band is the reference canvas: full width, 480px tall, no square/vw sizing", () => {
    expect(bandLine).toContain("min-h-[min(480px,58svh)]")
    expect(boxLine).toContain("max-sm:w-full")
    expect(boxLine).not.toMatch(/max-sm:aspect-square|max-sm:w-\[min\(/)
  })

  it("phone camera tiers sit far enough back for a ~300px mesh in a 480px box", () => {
    // Was z 1.15 / 1.22: the mesh filled 86% of its box. The reference mesh
    // fills ~71% of its canvas; the tiers below were measured to land there.
    const under480 = /if \(w < 480\) return \{ z: ([\d.]+), fov: (\d+) \}/.exec(brain)
    const under640 = /if \(w < 640\) return \{ z: ([\d.]+), fov: (\d+) \}/.exec(brain)
    expect(under480).not.toBeNull()
    expect(under640).not.toBeNull()
    expect(Number(under480![1])).toBeGreaterThanOrEqual(1.35)
    expect(Number(under640![1])).toBeGreaterThanOrEqual(1.45)
  })

  it("no mask on the phone canvas — the crown is drawn in full like the reference", () => {
    const block = /@media \(max-width: 639px\) \{\s*\.hero-brain-underlay \{[\s\S]*?\}\s*\}/.exec(css)?.[0] ?? ""
    expect(block, "phone .hero-brain-underlay override must exist").not.toBe("")
    expect(block).toMatch(/mask-image: none/)
    expect(block).not.toMatch(/linear-gradient/)
  })

  it("desktop keeps its own tier", () => {
    expect(boxLine).toContain("sm:aspect-[6/5]")
    expect(bandLine).toContain("sm:min-h-[min(72svh,60vw)]")
    expect(sectionLine).toContain("sm:pt-28")
    expect(sectionLine).toContain("md:pt-28")
    expect(/return \{ z: 1\.98, fov: 38 \}/.test(brain)).toBe(true)
  })
})
