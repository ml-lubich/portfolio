/**
 * Regression: the Open Source showcase (components/sections/open-source-showcase.tsx)
 * is integrated into #projects, above the existing marquee, as a second
 * "tier" — without disturbing the marquee's own structure (ProjectPoster,
 * prototype badge, disclaimer, marquee-* classes).
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")
const src = fs.readFileSync(path.join(ROOT, "components/sections/projects.tsx"), "utf8")

describe("Projects — Open Source showcase integration", () => {
  it("imports OpenSourceShowcase", () => {
    expect(src).toMatch(/import\s+\{\s*OpenSourceShowcase\s*\}\s+from\s+["']\.\/open-source-showcase["']/)
  })

  it("renders <OpenSourceShowcase />", () => {
    expect(src).toMatch(/<OpenSourceShowcase\s*\/>/)
  })

  it("still renders the marquee track structure", () => {
    expect(src).toContain("marquee-track")
    expect(src).toContain("marquee-row")
  })

  it("still renders ProjectPoster", () => {
    expect(src).toMatch(/function ProjectPoster/)
    expect(src).toMatch(/<ProjectPoster /)
  })

  it("still renders the Prototype badge and disclaimer", () => {
    expect(src).toMatch(/project\.prototype/)
    expect(src).toContain("Prototype")
    expect(src.toLowerCase()).toContain("not full production")
  })

  it("intro copy reads as two intentional tiers (open source demos vs. breadth marquee)", () => {
    expect(src.toLowerCase()).toContain("live demos above")
  })
})
