import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { execSync } from "node:child_process"

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8")

/**
 * Light mode inverts the page background. Anything that hard-codes a
 * dark-surface assumption disappears against it — a white-knocked-out logo on
 * a white page is invisible, which is what shipped.
 */
describe("light mode — knocked-out logos", () => {
    const source = read("components/sections/logo-scroll.tsx")

    it("never knocks a logo to white unconditionally", () => {
        // `invert` after `brightness-0` produces a white logo. Fine on a dark
        // page, invisible on a light one, so it must be gated on `dark:`.
        const bare = source.match(/(?<!dark:)\binvert\b/g) ?? []
        expect(bare).toEqual([])
    })

    it("still knocks them out in dark mode", () => {
        expect(source).toContain("dark:invert")
    })

    it("keeps brightness-0 so the mark stays monochrome in both themes", () => {
        const marks = source.match(/brightness-0/g) ?? []
        expect(marks.length).toBeGreaterThanOrEqual(3)
    })
})

describe("light mode — themed white", () => {
    const config = read("tailwind.config.ts")
    const css = read("app/globals.css")

    it("routes Tailwind's white through a themed variable", () => {
        // ~450 sites use white/<alpha> for surfaces, borders and text. Pointing
        // the palette entry at a variable flips all of them per theme instead
        // of editing every call site.
        expect(config).toMatch(/white:\s*['"]rgb\(var\(--white-rgb\)\s*\/\s*<alpha-value>\)['"]/)
    })

    it("defines white-rgb for both themes", () => {
        expect(css).toMatch(/--white-rgb:\s*255 255 255/)
        const light = css.slice(css.indexOf(".light"))
        expect(light).toMatch(/--white-rgb:\s*\d+ \d+ \d+/)
    })
})

describe("light mode — card fills", () => {
    it("has no hard-coded dark card fill outside the arcade games", () => {
        const offenders: string[] = []
        const files = execSync(
            "grep -rl 'bg-\\[#0a0c14\\]' --include='*.tsx' components app || true",
            { encoding: "utf8" },
        )
            .split("\n")
            .filter((f) => f && !f.includes("/games/"))

        offenders.push(...files)
        expect(offenders).toEqual([])
    })
})

describe("light mode — glass surfaces", () => {
    const css = read("app/globals.css")

    it("paints the stacked publication cards from the themed fill", () => {
        const block = css.slice(css.indexOf(".glass-stack-card"), css.indexOf(".glass-stack-card") + 260)
        expect(block).toContain("var(--card-fill)")
        expect(block).not.toMatch(/background:\s*hsla\(220/)
    })

    it("paints the footer from the themed fill", () => {
        const block = css.slice(css.indexOf(".footer-liquid-glass"), css.indexOf(".footer-liquid-glass") + 400)
        expect(block).toContain("var(--card-fill)")
        expect(block).not.toMatch(/hsl\(220 20% 6% \/ 0\.82\)/)
    })

    it("defines the hover fill in both themes", () => {
        expect((css.match(/--card-fill-hover:/g) ?? []).length).toBe(2)
    })
})
