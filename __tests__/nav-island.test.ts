import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const css = readFileSync("app/globals.css", "utf8")

/* Island nav: no bar below xl (logo + hamburger float in the corners), a
 * translucent capsule that clip-reveals from the centre at xl+. */
describe("island nav", () => {
    const belowXl = css.match(/@media \(max-width: 1279\.98px\) \{[\s\S]*?\n\}/)?.[0] ?? ""
    const atXl = css.match(/@media \(min-width: 1280px\) \{[\s\S]*?\n\}/)?.[0] ?? ""

    it("paints nothing behind the shell below xl", () => {
        expect(belowXl).toContain(".nav-shell")
        expect(belowXl).toMatch(/background:\s*none/)
        expect(belowXl).toMatch(/box-shadow:\s*none/)
        expect(belowXl).toMatch(/\.nav-shell::before \{\s*display:\s*none/)
    })

    it("is a translucent capsule at xl, without backdrop-filter", () => {
        expect(atXl).toMatch(/color-mix\(in srgb, var\(--surface-2\) \d+%, transparent\)/)
        expect(atXl).not.toContain("backdrop-filter")
    })

    it("reveals from the centre on first paint, and only when motion is allowed", () => {
        expect(css).toMatch(/@keyframes nav-island-in \{[\s\S]*?clip-path: inset\(0 50% 0 50% round/)
        expect(css).toMatch(/\(min-width: 1280px\) and \(prefers-reduced-motion: no-preference\) \{\s*\.nav-shell \{\s*animation: nav-island-in/)
    })
})
