/**
 * Render/source-level guard for the OpenSourceShowcase container (Task A4).
 * Confirms: one OssDemoCard per public ossDemos entry, a GitHub link reaches
 * every card, the single-active-typer wiring is real (per-card computed prop,
 * not a literal true), and Explore opens the existing DetailPanel the same
 * way components/sections/projects.tsx does.
 */

import fs from "node:fs"
import path from "node:path"
import { describe, it, expect } from "vitest"
import { ossDemos } from "@/data/oss-demos"

const ROOT = path.join(__dirname, "..")
const COMPONENT_PATH = path.join(ROOT, "components/sections/open-source-showcase.tsx")

describe("OpenSourceShowcase", () => {
  it("ships the component file", () => {
    expect(fs.existsSync(COMPONENT_PATH)).toBe(true)
  })

  const src = fs.existsSync(COMPONENT_PATH) ? fs.readFileSync(COMPONENT_PATH, "utf8") : ""

  it("is a client component exporting OpenSourceShowcase", () => {
    expect(src).toMatch(/"use client"/)
    expect(src).toMatch(/export function OpenSourceShowcase/)
  })

  it("renders one OssDemoCard per ossDemos entry, sourced only from the public data set", () => {
    expect(src).toMatch(/import\s*\{\s*OssDemoCard\s*\}/)
    expect(src).toMatch(/ossDemos\.map/)
    expect(src).toMatch(/<OssDemoCard/)
    // Must never iterate the full `projects` list directly for the grid —
    // that would let non-public / internal project ids leak into the showcase.
    expect(src).not.toMatch(/projects\.map/)
  })

  it("every showcased entry carries a GitHub link (rendered by OssDemoCard from demo.repoUrl)", () => {
    expect(src).toMatch(/demo=\{demo\}/)
    for (const demo of ossDemos) {
      expect(demo.repoUrl).toMatch(/^https:\/\/github\.com\//)
    }
  })

  it("only public ids appear — the grid is driven by ossDemos, never re-derived from all projects", () => {
    // ossDemos.test.ts already guards the data set's contents; here we only
    // need the container to consume that set and nothing broader.
    expect(ossDemos.length).toBeGreaterThan(0)
    expect(src).toMatch(/from\s+["']@\/data\/oss-demos["']/)
  })

  it("wires a single-active-typer: the active prop is computed per card, not a literal true for every card", () => {
    expect(src).toMatch(/active=\{[^}]*===[^}]*\}/)
    expect(src).not.toMatch(/active=\{true\}/)
  })

  it("tracks active-card state with an IntersectionObserver (perf contract: only one DemoTerminal types at a time)", () => {
    expect(src).toMatch(/useState/)
    expect(src).toMatch(/IntersectionObserver/)
  })

  it("opens the existing DetailPanel the same way projects.tsx does (selected-id state, not a forked modal)", () => {
    expect(src).toMatch(/import\s*\{\s*DetailPanel\s*\}/)
    expect(src).toMatch(/<DetailPanel/)
    expect(src).not.toMatch(/function DetailPanel/)
    expect(src).toMatch(/onExplore=\{/)
  })

  it("uses SectionHeader like every other section", () => {
    expect(src).toMatch(/import\s*\{\s*SectionHeader\s*\}/)
    expect(src).toMatch(/<SectionHeader/)
  })
})
