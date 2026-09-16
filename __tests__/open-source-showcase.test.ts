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

  it("ships a copy-pasteable install-all <pre><code> block above the rail", () => {
    expect(src).toMatch(/ossInstallAll/)
    expect(src).toMatch(/<pre[\s\S]{0,200}<code/)
    expect(src).toMatch(/select-all|user-select:\s*all|oss-install-all/)
  })

  it("renders the OSS agent tool grid with click-to-copy install rows", () => {
    expect(src).toMatch(/OssToolGrid/)
    const grid = fs.readFileSync(path.join(ROOT, "components/sections/oss-tool-grid.tsx"), "utf8")
    expect(grid).toMatch(/CopyCommand/)
    expect(grid).toMatch(/Open-Source Agent Tools/)
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

  it("renders the install as selectable <pre><code>, not a truncated button label", () => {
    expect(cardSrc).toMatch(/<pre[\s\S]*<code[\s\S]*demo\.install/)
    expect(cardSrc).toMatch(/user-select:\s*all|select-all|oss-install/)
  })
})

/* ── Motion + colour pass (2026-09-13) ───────────────────────────────
 *  Owner: "the demos have too much text, needs to have more animations /
 *  coloring". The signature mesh now paints with the tool's own accent and
 *  runs signal pulses along its edges; the rail and the stat gauges pick up
 *  the tool's gradient. Every new animation is guarded for reduced motion.
 * ─────────────────────────────────────────────────────────────────── */
describe("OssDemoCard — motion and colour carry the demo", () => {
  const railSrc = fs.readFileSync(COMPONENT_PATH, "utf8")
  const cardSrc = fs.readFileSync(CARD_PATH, "utf8")
  const cssSrc = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8")

  it("paints the mesh with the tool's own accent instead of a flat white wireframe", () => {
    expect(cardSrc).not.toMatch(/stroke="rgba\(223,226,236/)
    expect(cardSrc).not.toMatch(/fill="rgba\(255,\s*255,\s*255/)
    expect(cardSrc).toMatch(/stroke=\{accent\}/)
  })

  it("runs signal pulses along the mesh edges", () => {
    expect(cardSrc).toMatch(/oss-signal/)
    expect(cssSrc).toMatch(/@keyframes oss-signal-run/)
  })

  it("guards every new OSS animation behind prefers-reduced-motion", () => {
    for (const cls of ["oss-signal", "oss-signature-spin", "oss-node-pulse"]) {
      const guard = cssSrc.match(
        new RegExp(`@media \\(prefers-reduced-motion: reduce\\)[\\s\\S]{0,600}?\\.${cls}\\b`),
      )
      expect(guard, `.${cls} has no reduced-motion guard`).not.toBeNull()
    }
  })

  it("gives every tool its own accent, from the theme's hue cycle", () => {
    const theme = fs.readFileSync(path.join(ROOT, "lib/theme.ts"), "utf8")
    expect(theme).toMatch(/export function ossAccent/)
    // Hues the gradient table already owns — no new colour language.
    expect(theme).toMatch(/ossAccentCycle[\s\S]{0,200}hsl\.cyan/)
    expect(theme).toMatch(/ossAccentCycle[\s\S]{0,200}hsl\.magenta/)
    // ...and it reaches the rail chip, the mesh and the gauges.
    expect(railSrc).toMatch(/ossAccent\(i\)/)
    expect(cardSrc).toMatch(/ossAccent\(index\)/)
    expect(cardSrc).toMatch(/accent=\{accent\}/)
  })

  it("hardcodes no hex colour — every accent comes from lib/theme", () => {
    expect(cardSrc).not.toMatch(/#[0-9a-fA-F]{6}\b/)
    expect(railSrc).not.toMatch(/#[0-9a-fA-F]{6}\b/)
  })
})
