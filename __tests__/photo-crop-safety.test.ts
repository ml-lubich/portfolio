/**
 * Every portrait of Misha must show his whole head at every width.
 *
 * The trap: a fixed height (`h-64`) plus `object-cover` gives the frame a
 * ratio that drifts as the column narrows, and the overflow is taken off the
 * TOP of a portrait — i.e. off his head. Aspect ratios are the fix, because
 * they hold the source's shape at any width. Verified in a browser at 390px
 * and 1440px, but this test is what keeps it that way.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const read = (p: string) => fs.readFileSync(path.resolve(__dirname, "..", p), "utf-8")

/** file → the frame class list that wraps its <Image>, plus the source ratio. */
const FRAMES: { file: string; asset: string; anchor: string }[] = [
  { file: "components/sections/profile-intro.tsx", asset: "misha-headshot.png", anchor: "aspect-[4/5]" },
  { file: "components/sections/about.tsx", asset: "misha-desk-laptop.png", anchor: "aspect-[3/4]" },
  { file: "components/sections/consulting-clients.tsx", asset: "misha-office-window.png", anchor: "aspect-[4/5]" },
  { file: "components/sections/contact.tsx", asset: "misha-loft-window.png", anchor: "aspect-[4/5]" },
  { file: "components/sections/publications.tsx", asset: "misha-cafe-notebook.png", anchor: "aspect-[3/2]" },
]

describe("Photo crop safety", () => {
  it.each(FRAMES)("$asset sits in an aspect-locked frame, not a fixed height", ({ file, anchor }) => {
    expect(read(file)).toContain(anchor)
  })

  it.each(FRAMES)("$asset's narrow-width frame is never a bare fixed height", ({ file, asset }) => {
    const src = read(file)
    // Grab the ~600 chars around the <Image> — the frame div plus the tag.
    const at = src.indexOf(asset)
    const block = src.slice(Math.max(0, at - 700), at)
    // A base (unprefixed) h-* on the frame is what re-introduces the crop.
    // Breakpoint-prefixed heights are fine: they only apply where width is ample.
    const bareHeights = block.match(/(?<![a-z:-])h-\[?[\d.]+(rem|px)?\]?/g) ?? []
    expect(bareHeights).toEqual([])
  })

  it("keeps the thumbnail strip out of profile-intro for good", () => {
    const profile = read("components/sections/profile-intro.tsx")
    expect(profile.match(/<Image/g)?.length).toBe(1)
    expect(profile).not.toMatch(/group\/thumb/)
  })
})
