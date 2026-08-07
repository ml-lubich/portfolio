/**
 * Source-level guard for the OpenSourceShowcase container.
 *
 * The section features one tool at a time: a glyph rail selects it, a single
 * OssDemoCard renders it. Confirms the rail is driven only by the public
 * `ossDemos` set, every entry carries a GitHub link, the single-active-typer
 * contract still holds (one card mounted, `active` computed rather than a
 * literal true), and Explore opens the existing DetailPanel the same way
 * components/sections/projects.tsx does.
 */

import fs from "node:fs"
import path from "node:path"
import { describe, it, expect } from "vitest"
import { ossDemos } from "@/data/oss-demos"

const ROOT = path.join(__dirname, "..")
const COMPONENT_PATH = path.join(ROOT, "components/sections/open-source-showcase.tsx")
const CARD_PATH = path.join(ROOT, "components/sections/oss-demo-card.tsx")

describe("OpenSourceShowcase", () => {
  it("ships the component file", () => {
    expect(fs.existsSync(COMPONENT_PATH)).toBe(true)
  })

  const src = fs.existsSync(COMPONENT_PATH) ? fs.readFileSync(COMPONENT_PATH, "utf8") : ""

  it("is a client component exporting OpenSourceShowcase", () => {
    expect(src).toMatch(/"use client"/)
    expect(src).toMatch(/export function OpenSourceShowcase/)
  })

  it("drives the tool rail from the public data set only", () => {
    expect(src).toMatch(/import\s*\{\s*OssDemoCard\s*\}/)
    expect(src).toMatch(/ossDemos\.map/)
    expect(src).toMatch(/<OssDemoCard/)
    // Must never iterate the full `projects` list directly for the rail —
    // that would let non-public / internal project ids leak into the showcase.
    expect(src).not.toMatch(/projects\.map/)
  })

  it("every showcased entry carries a GitHub link (rendered by OssDemoCard from demo.repoUrl)", () => {
    expect(src).toMatch(/demo=\{activeDemo\}/)
    const cardSrc = fs.readFileSync(CARD_PATH, "utf8")
    expect(cardSrc).toMatch(/href=\{demo\.repoUrl\}/)
    for (const demo of ossDemos) {
      expect(demo.repoUrl).toMatch(/^https:\/\/github\.com\//)
    }
  })

  it("only public ids appear — the rail is driven by ossDemos, never re-derived from all projects", () => {
    // ossDemos.test.ts already guards the data set's contents; here we only
    // need the container to consume that set and nothing broader.
    expect(ossDemos.length).toBeGreaterThan(0)
    expect(src).toMatch(/from\s+["']@\/data\/oss-demos["']/)
  })

  it("mounts exactly one demo card, with `active` computed rather than a literal true", () => {
    expect(src).toMatch(/active=\{[^}]*===[^}]*\}/)
    expect(src).not.toMatch(/active=\{true\}/)
    // One featured card, selected by id — not a grid of every entry
    expect(src).toMatch(/const activeDemo = ossDemos\.find/)
  })

  it("auto-rotation only runs while the section is on screen, and stops once a tool is picked", () => {
    expect(src).toMatch(/useState/)
    expect(src).toMatch(/IntersectionObserver/)
    expect(src).toMatch(/onScreenRef/)
    expect(src).toMatch(/pinned/)
    expect(src).toMatch(/setPinned\(true\)/)
  })

  it("every tool in the rail is reachable by its own button", () => {
    expect(src).toMatch(/onClick=\{\(\) => pick\(demo\.id\)\}/)
    expect(src).toMatch(/aria-pressed=\{isActive\}/)
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

describe("OssDemoCard visual signature", () => {
  const cardSrc = fs.readFileSync(CARD_PATH, "utf8")

  it("draws a deterministic vertex mesh per tool, so a tool's signature never reshuffles", () => {
    expect(cardSrc).toMatch(/seededRandom/)
    expect(cardSrc).toMatch(/hashId\(id\)/)
    expect(cardSrc).toMatch(/<svg/)
  })

  it("still renders the tool's terminal demo", () => {
    expect(cardSrc).toMatch(/<DemoTerminal lines=\{demo\.demo\} active=\{active\}/)
  })
})
