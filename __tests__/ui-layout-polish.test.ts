import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

describe("UI Layout Polish TDD", () => {
  it("logo scroll has edge-to-edge full bleed arch clip path", () => {
    const file = path.resolve(__dirname, "../components/sections/logo-scroll.tsx")
    const content = fs.readFileSync(file, "utf-8")
    expect(content).toContain("clipPath: \"ellipse(140% 100% at 50% 0%)\"")
  })

  it("consulting clients removed helper text and centered pause button", () => {
    const file = path.resolve(__dirname, "../components/sections/consulting-clients.tsx")
    const content = fs.readFileSync(file, "utf-8")
    expect(content).not.toContain("Drag to explore · tap a card for details")
    expect(content).toContain("justify-center")
  })

  it("brain wireframe uses refined 3D line shading", () => {
    const file = path.resolve(__dirname, "../components/brain/materials.ts")
    const content = fs.readFileSync(file, "utf-8")
    expect(content).toContain("Balanced 3D wireframe shading")
  })
})
