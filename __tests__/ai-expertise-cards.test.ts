import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

describe("AI Expertise Cards Redesign TDD", () => {
  const file = path.resolve(__dirname, "../components/sections/ai-expertise.tsx")
  const content = fs.readFileSync(file, "utf-8")

  it("uses glowing card styling with high contrast borders and distinct step numbers", () => {
    expect(content).toContain("border-primary/20")
    expect(content).toContain("bg-primary/10")
    expect(content).toContain("text-primary")
    expect(content).not.toContain("bg-white/[0.04]")
  })

  it("has high visibility detail item containers", () => {
    expect(content).toContain("bg-secondary/40")
    expect(content).toContain("border-primary/15")
  })
})
