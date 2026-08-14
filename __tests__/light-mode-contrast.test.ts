import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

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
