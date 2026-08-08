import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

describe("Profile Intro Photography Redesign TDD", () => {
  const file = path.resolve(__dirname, "../components/sections/profile-intro.tsx")
  const content = fs.readFileSync(file, "utf-8")

  it("uses real rectangular photography frame instead of oval border-radius ellipse", () => {
    expect(content).not.toContain("borderRadius: \"50% / 46%\"")
    expect(content).toContain("rounded-2xl")
    expect(content).toContain("misha-desk-laptop.png")
  })

  it("includes photographic work gallery grid", () => {
    expect(content).toContain("misha-office-window.png")
    expect(content).toContain("misha-cafe-notebook.png")
    expect(content).toContain("misha-headshot.png")
  })
})
