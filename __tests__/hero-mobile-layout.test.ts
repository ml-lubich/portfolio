/**
 * Phone hero — josephheupler.com 1:1, layout and brain only.
 *
 * Reference (jheupler-site app/page.tsx + globals.css):
 *   - hero is one screenful (`min-h-[100svh]`, content vertically centred)
 *   - phone brain box is CSS `min(54svh, 420px)` × `min(132%, 470px)`
 *   - camera <480 is z 1.38 / fov 48; <640 is z 1.48 / fov 47
 *   - no mask on the phone canvas (crown drawn in full)
 *
 * Pixel truth lives in e2e/hero-brain-fit.spec.ts (phone cases).
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")
const hero = fs.readFileSync(path.join(ROOT, "components/hero/index.tsx"), "utf8")
const css = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8")
const brain = fs.readFileSync(path.join(ROOT, "components/brain/index.tsx"), "utf8")

const sectionLine = hero.split("\n").find((l) => l.includes('className="relative flex min-h-')) ?? ""
const boxLine = hero.split("\n").find((l) => l.includes('className="hero-brain-underlay')) ?? ""

describe("phone hero layout (josephheupler.com 1:1)", () => {
  it("section is one screenful with the content centred in it", () => {
    expect(sectionLine).toMatch(/max-sm:min-h-\[100svh\]|min-h-\[100svh\]/)
    expect(sectionLine).toContain("max-sm:justify-center")
    expect(sectionLine).toContain("max-sm:pt-32")
  })

  it("the stage stops forcing its own screenful so the stat row joins the first screen", () => {
    expect(hero, "the forced-screenful stage must not come back").not.toContain("min-h-[calc(100svh-13rem)]")
  })

  it("desktop box is Joseph's 92vh / 860×980, not a 6:5 band", () => {
    expect(boxLine).toMatch(/h-\[min\(92vh,860px\)\]/)
    expect(boxLine).toMatch(/w-\[min\(120%,980px\)\]/)
    expect(boxLine).not.toMatch(/sm:aspect-\[/)
  })

  it("phone camera tiers are Joseph's closer framing", () => {
    const under480 = /if \(w < 480\) return \{ z: ([\d.]+), fov: (\d+) \}/.exec(brain)
    const under640 = /if \(w < 640\) return \{ z: ([\d.]+), fov: (\d+) \}/.exec(brain)
    expect(under480).not.toBeNull()
    expect(under640).not.toBeNull()
    expect(Number(under480![1])).toBe(1.38)
    expect(Number(under480![2])).toBe(48)
    expect(Number(under640![1])).toBe(1.48)
    expect(Number(under640![2])).toBe(47)
  })

  it("no mask on the phone canvas — the crown is drawn in full like the reference", () => {
    const block = /@media \(max-width: 639px\) \{\s*\.hero-brain-underlay \{[\s\S]*?\}\s*\}/.exec(css)?.[0] ?? ""
    expect(block, "phone .hero-brain-underlay override must exist").not.toBe("")
    expect(block).toMatch(/mask-image: none/)
    expect(block).not.toMatch(/linear-gradient/)
  })

  it("desktop camera is Joseph's z 1.55 / fov 44", () => {
    expect(/return \{ z: 1\.55, fov: 44 \}/.test(brain)).toBe(true)
    expect(sectionLine).toContain("sm:pt-28")
    expect(sectionLine).toContain("md:pt-28")
  })
})
