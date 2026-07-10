import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"

/* ── No solid tech blue regression gate ─────────────────────────────────
 * Regression: commit e5b85de recolored the hero name ("Misha Lubich") and
 * all section header titles to a solid tech blue — hsl(217 100% 68%) —
 * overriding the site-wide grey/silver metallic text treatment.
 *
 * Contract: this site's text treatment is the metallic silver sheen
 * (.metallic-text / .gradient-text). The solid tech-blue brand color
 * belongs to the mlubich portfolio repo on GitHub, NOT this one. No
 * stylesheet or component here may hard-code that blue as a text color.
 * ─────────────────────────────────────────────────────────────────────── */

const ROOT = path.resolve(__dirname, "..")

// The exact brand hue family used by the old tech-blue restyle.
// Catches hsl(217 100% 68%) and any lightness variant of that hue.
const TECH_BLUE = /hsl\(\s*217\s+100%/g

const SCAN_DIRS = ["app", "components", "data"]
const SCAN_EXT = /\.(css|tsx|ts)$/

function walk(dir: string): string[] {
    if (!fs.existsSync(dir)) return []
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) return walk(full)
        return SCAN_EXT.test(entry.name) ? [full] : []
    })
}

describe("no solid tech blue (reserved for the mlubich portfolio repo)", () => {
    const files = SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d)))

    it("scans a non-trivial number of source files", () => {
        expect(files.length).toBeGreaterThan(50)
    })

    it("no stylesheet or component hard-codes the tech-blue hue hsl(217 100% ...)", () => {
        const offenders: string[] = []
        for (const file of files) {
            const content = fs.readFileSync(file, "utf8")
            const lines = content.split("\n")
            lines.forEach((line, i) => {
                if (TECH_BLUE.test(line)) {
                    offenders.push(`${path.relative(ROOT, file)}:${i + 1} → ${line.trim()}`)
                }
                TECH_BLUE.lastIndex = 0
            })
        }
        expect(
            offenders,
            `Solid tech blue found — that color is for the mlubich portfolio repo, not this site:\n${offenders.join("\n")}`
        ).toEqual([])
    })

    it("hero name keeps the metallic silver treatment (background-clip: text)", () => {
        const css = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8")
        const rule = css.match(/\.animated-name-metallic \.animated-name-char \{[^}]+\}/)?.[0]
        expect(rule, ".animated-name-metallic .animated-name-char rule must exist").toBeTruthy()
        expect(rule).toContain("background-clip: text")
        expect(rule).toContain("-webkit-text-fill-color: transparent")
    })

    it("section titles are not color-overridden away from the metallic sheen", () => {
        const css = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8")
        // The old override forced .section-title to a solid color with !important.
        expect(css).not.toMatch(/\.section-title[^{]*\{[^}]*color:[^}]*!important/)
    })
})
