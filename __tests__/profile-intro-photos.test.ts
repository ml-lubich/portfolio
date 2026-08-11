/**
 * The photo set is spread down the page rather than piled into one card.
 * Profile-intro carries a single portrait; the rest surface in About,
 * Research, and Contact so a face appears as you scroll.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const read = (p: string) => fs.readFileSync(path.resolve(__dirname, p), "utf-8")

describe("Profile photography", () => {
  const profile = read("../components/sections/profile-intro.tsx")

  it("uses a rectangular photography frame, not an oval ellipse", () => {
    expect(profile).not.toContain("borderRadius: \"50% / 46%\"")
    expect(profile).toContain("rounded-2xl")
    expect(profile).toContain("misha-headshot.png")
  })

  it("never crops the top of the head", () => {
    expect(profile).toMatch(/object-cover object-top/)
  })

  it("carries exactly one photo — the thumbnail strip moved out", () => {
    expect(profile.match(/<Image/g)?.length).toBe(1)
    expect(profile).not.toContain("misha-office-window.png")
    expect(profile).not.toContain("misha-cafe-notebook.png")
    expect(profile).not.toContain("misha-desk-laptop.png")
  })
})

describe("Photos spread through the page", () => {
  const placements: [string, string][] = [
    ["../components/sections/about.tsx", "misha-desk-laptop.png"],
    ["../components/sections/consulting-clients.tsx", "misha-office-window.png"],
    ["../components/sections/contact.tsx", "misha-loft-window.png"],
  ]

  it.each(placements)("%s carries %s", (file, asset) => {
    expect(read(file)).toContain(asset)
  })

  it.each(placements)("%s ships the asset it references", (_file, asset) => {
    expect(fs.existsSync(path.resolve(__dirname, "../public", asset))).toBe(true)
  })

  // The research section is the papers, not another portrait.
  it("publications stays photo-free", () => {
    expect(read("../components/sections/publications.tsx")).not.toContain("<Image")
  })
})
