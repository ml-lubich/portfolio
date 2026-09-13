/**
 * Typography system gate.
 *
 * The site loaded seven families — JetBrains Mono, Cormorant Garamond,
 * Italiana, Urbanist, Instrument Serif, Geist Sans and Geist Mono — three of
 * them literary serifs. The owner's read was "too literate … I want a more
 * futuristic / minimalist", pointing at josephheupler.com, which runs two:
 * Oxanium for everything and JetBrains Mono for labels and code.
 *
 * Contract: two families, loaded once, referenced through
 * `--font-oxanium` / `--font-jetbrains`. A family that stops being loaded but
 * is still referenced falls back to the browser default somewhere nobody
 * looks, so the removal and the references are asserted together.
 */

import { describe, expect, it } from "vitest"
import fs from "node:fs"
import path from "node:path"

const ROOT = path.resolve(__dirname, "..")
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8")

const layout = read("app/layout.tsx")
const tailwind = read("tailwind.config.ts")

/** Families the redesign drops. Each must be gone from loading AND from use. */
const RETIRED = [
  "Cormorant_Garamond",
  "Italiana",
  "Urbanist",
  "Instrument_Serif",
  "GeistSans",
  "GeistMono",
]

const RETIRED_VARS = [
  "--font-cormorant",
  "--font-italiana",
  "--font-urbanist",
  "--font-instrument-serif",
  "--font-geist-sans",
  "--font-geist-mono",
]

function walk(dir: string): string[] {
  const full = path.join(ROOT, dir)
  if (!fs.existsSync(full)) return []
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((e) => {
    const rel = path.join(dir, e.name)
    if (e.isDirectory()) return walk(rel)
    return /\.(tsx?|css)$/.test(e.name) ? [rel] : []
  })
}

const SOURCES = [...walk("app"), ...walk("components"), ...walk("lib"), "tailwind.config.ts"]

describe("typography — two families, not seven", () => {
  it("loads exactly Oxanium and JetBrains Mono from next/font/google", () => {
    const imported = /import\s*\{([^}]+)\}\s*from\s*["']next\/font\/google["']/.exec(layout)
    expect(imported, "next/font/google import").not.toBeNull()
    const families = imported![1].split(",").map((s) => s.trim()).filter(Boolean).sort()
    expect(families).toEqual(["JetBrains_Mono", "Oxanium"])
  })

  it("no longer pulls the geist package", () => {
    expect(layout).not.toMatch(/from\s*["']geist\/font/)
  })

  it("exposes both faces as CSS variables on <html>", () => {
    expect(layout).toMatch(/variable:\s*["']--font-oxanium["']/)
    expect(layout).toMatch(/variable:\s*["']--font-jetbrains["']/)
  })

  RETIRED.forEach((family) => {
    it(`no source still loads ${family}`, () => {
      const offenders = SOURCES.filter((f) => read(f).includes(family))
      expect(offenders, `${family} still referenced in ${offenders.join(", ")}`).toEqual([])
    })
  })

  RETIRED_VARS.forEach((token) => {
    it(`no source still reads ${token}`, () => {
      const offenders = SOURCES.filter((f) => read(f).includes(token))
      expect(offenders, `${token} still referenced in ${offenders.join(", ")}`).toEqual([])
    })
  })
})

describe("typography — the tailwind scale resolves to a loaded face", () => {
  const block = /fontFamily:\s*\{([\s\S]*?)\n\s{6}\}/.exec(tailwind)?.[1] ?? ""

  it("finds the fontFamily block", () => {
    expect(block.length).toBeGreaterThan(0)
  })

  it("sans and display are both Oxanium — one voice, two roles", () => {
    expect(block).toMatch(/sans:\s*\[\s*['"]var\(--font-oxanium\)['"]/)
    expect(block).toMatch(/display:\s*\[\s*['"]var\(--font-oxanium\)['"]/)
  })

  it("mono is JetBrains, and never falls through to a retired variable", () => {
    expect(block).toMatch(/mono:\s*\[\s*['"]var\(--font-jetbrains\)['"]/)
  })

  it("drops the one-off serif scales nothing referenced", () => {
    expect(block).not.toMatch(/\bitaliana:/)
    expect(block).not.toMatch(/\bcormorant:/)
    expect(block).not.toMatch(/['"]serif['"]/)
  })
})

describe("typography — no orphan font variable anywhere", () => {
  it("every var(--font-*) a stylesheet reads is one the layout defines", () => {
    const defined = new Set(
      [...layout.matchAll(/variable:\s*["'](--font-[a-z-]+)["']/g)].map((m) => m[1]),
    )
    const offenders: string[] = []
    for (const file of SOURCES) {
      for (const m of read(file).matchAll(/var\((--font-[a-z-]+)\)/g)) {
        if (!defined.has(m[1])) offenders.push(`${file} → ${m[1]}`)
      }
    }
    expect(offenders, `orphan font variables: ${offenders.join(", ")}`).toEqual([])
  })
})
