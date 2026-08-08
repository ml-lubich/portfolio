import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { skillCategories } from "@/data/skills"
import { projects } from "@/data/projects"
import { toolMatrix } from "@/data/tool-matrix"

const ROOT = path.join(__dirname, "..")

describe("agent OSS portfolio surface", () => {
  it("has a dense skill bank for the storm (≥110 unique)", () => {
    const unique = new Set(skillCategories.flatMap((c) => c.items))
    expect(unique.size).toBeGreaterThanOrEqual(110)
  })

  it("includes agent-family OSS projects", () => {
    const ids = new Set(projects.map((p) => p.id))
    for (const id of [
      "imsg-mcp",
      "imail-mcp",
      "inotes-mcp",
      "wa-mcp",
      "bitbucket-cli",
      "like-fable",
    ]) {
      expect(ids.has(id), `missing project ${id}`).toBe(true)
    }
  })

  it("keeps bitbucket-cli as CLI brand (not *-mcp)", () => {
    const bb = projects.find((p) => p.id === "bitbucket-cli")
    expect(bb?.name).toBe("bitbucket-cli")
    expect(bb?.name.endsWith("-mcp")).toBe(false)
  })

  it("tool matrix covers the family", () => {
    const ids = toolMatrix.map((r) => r.id)
    expect(ids).toEqual(
      expect.arrayContaining([
        "imsg-mcp",
        "imail-mcp",
        "inotes-mcp",
        "wa-mcp",
        "bitbucket-cli",
        "twig",
        "confluence-cli",
      ]),
    )
  })

  it("wires the open-source showcase into the homepage", () => {
    const page = fs.readFileSync(path.join(ROOT, "app/page.tsx"), "utf8")
    // The CLI/MCP comparison table was removed; OSS is now its own top-level
    // section so the "OSS" nav anchor resolves without waiting on projects.
    expect(page).toMatch(/OpenSourceShowcase/)
    expect(page).toMatch(/sectionId="open-source"/)
    expect(page).not.toMatch(/ToolMatrix/)
  })

  it("dropped the Value-maxxing section but kept its slogan", () => {
    // Six paragraphs of manifesto became one line above the tools it describes.
    expect(fs.existsSync(path.join(ROOT, "components/sections/value-maxxing.tsx"))).toBe(false)
    const page = fs.readFileSync(path.join(ROOT, "app/page.tsx"), "utf8")
    expect(page).not.toMatch(/ValueMaxxing/)
    const nav = fs.readFileSync(path.join(ROOT, "components/nav/nav-links.ts"), "utf8")
    expect(nav).not.toMatch(/value-maxxing/)

    const oss = fs.readFileSync(path.join(ROOT, "components/sections/open-source-showcase.tsx"), "utf8")
    expect(oss).toMatch(/Value-maxxing/)
    expect(oss).toMatch(/tokenmaxxing/)
  })

  it("ships section components", () => {
    expect(fs.existsSync(path.join(ROOT, "components/sections/tool-matrix.tsx"))).toBe(true)
  })
})
