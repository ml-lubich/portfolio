import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"

/* ── Theme token gate ───────────────────────────────────────────────────
 * Regression: the light page rendered as flat grey with invisible headings.
 * Three separate causes, each a value hard-coded for the dark theme in a
 * rule that both themes share:
 *
 *   1. <body> and .page-texture painted dark navy/violet radial washes
 *      unconditionally — dark pools over a near-white page.
 *   2. `.gradient-text` built its metallic ramp out of literal
 *      `hsl(0 0% 100%)` stops, so every metallic heading outside an
 *      AnimatedText rendered white-on-white.
 *   3. The hero stat cards inlined a dark-glass gradient and a black shadow.
 *
 * Contract: anything a shared rule paints has to come from a token that both
 * `:root` (dark) and `.light` define.
 * ─────────────────────────────────────────────────────────────────────── */

const ROOT = path.resolve(__dirname, "..")
const css = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8")

/** The token block for each theme — `:root` is dark, `.light` overrides it. */
function themeBlock(selector: string): string {
    const start = css.indexOf(selector)
    expect(start, `${selector} block not found`).toBeGreaterThan(-1)
    const open = css.indexOf("{", start)
    let depth = 0
    for (let i = open; i < css.length; i++) {
        if (css[i] === "{") depth++
        else if (css[i] === "}") {
            depth--
            if (depth === 0) return css.slice(open, i)
        }
    }
    throw new Error(`unterminated ${selector} block`)
}

const THEMED_TOKENS = [
    "--body-wash",
    "--page-wash",
    "--glass-fill",
    "--glass-shadow",
    "--hero-stage-scrim",
    "--metal-mid",
    "--metal-hi",
    "--line-soft",
    "--line-strong",
]

describe("theme tokens", () => {
    it("defines every shared surface token in both themes", () => {
        const dark = themeBlock(":root")
        const light = themeBlock(".light")
        for (const token of THEMED_TOKENS) {
            expect(dark, `${token} missing from the dark theme`).toContain(`${token}:`)
            expect(light, `${token} missing from the light theme`).toContain(`${token}:`)
        }
    })

    it("paints the page-wide washes from tokens, not fixed dark radials", () => {
        expect(css).toContain("background-image: var(--body-wash);")
        expect(css).toContain("background-image: var(--page-wash);")
    })

    it("keeps literal white out of the metallic text ramp", () => {
        const start = css.indexOf(".gradient-text {")
        expect(start).toBeGreaterThan(-1)
        const rule = css.slice(start, css.indexOf("}", start))
        // White stops here are what made metallic headings vanish on the light page.
        expect(rule).not.toMatch(/hsl\(0\s+0%\s+100%\)/)
        expect(rule).toContain("hsl(var(--foreground))")
    })

    it("gives every section the one shared vertical rhythm", () => {
        expect(css).toContain(".section-y {")
        const sections = [
            "components/sections/projects.tsx",
            "components/sections/ai-expertise.tsx",
            "components/sections/contact.tsx",
            "components/sections/about.tsx",
            "components/sections/skills.tsx",
            "components/sections/client-testimonials.tsx",
            "components/sections/consulting-clients.tsx",
            "components/sections/mac-app-demos.tsx",
            "components/sections/open-source-showcase.tsx",
            "components/sections/profile-intro.tsx",
            "components/sections/github-stats.tsx",
            "components/sections/tool-matrix.tsx",
            "components/terminal/index.tsx",
        ]
        for (const file of sections) {
            const src = fs.readFileSync(path.join(ROOT, file), "utf8")
            expect(src, `${file} does not use section-y`).toContain("section-y")
            // No bespoke vertical padding alongside the shared rhythm.
            const bespoke = src.match(/className="[^"]*section-y[^"]*"/g) ?? []
            for (const cls of bespoke) {
                expect(cls, `${file} still carries its own py-*`).not.toMatch(/\bpy-\d/)
            }
        }
    })
})

describe("light mode ship gate", () => {
    const layout = fs.readFileSync(path.join(ROOT, "app/layout.tsx"), "utf8")
    const nav = fs.readFileSync(path.join(ROOT, "components/nav/index.tsx"), "utf8")
    const flag = fs.readFileSync(path.join(ROOT, "lib/light-mode.ts"), "utf8")

    it("reads the gate from a public env flag", () => {
        expect(flag).toContain("NEXT_PUBLIC_LIGHT_MODE")
    })

    it("forces dark and hides the toggle while the gate is off", () => {
        expect(layout).toContain("LIGHT_MODE_ENABLED")
        expect(layout).toMatch(/forcedTheme=\{LIGHT_MODE_ENABLED \? undefined : "dark"\}/)
        expect(nav).toMatch(/\{LIGHT_MODE_ENABLED && <ThemeToggle/)
    })
})
