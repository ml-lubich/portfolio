import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const source = readFileSync(join(process.cwd(), "components/sections/about.tsx"), "utf8")

describe("about — content", () => {
    it("leads with the current EchoStar role", () => {
        expect(source).toMatch(/Staff AI Engineer/)
        expect(source).toMatch(/EchoStar/)
        // The terminal is the first thing read; it must open on EchoStar.
        const firstLine = source.slice(source.indexOf("const bio = ["), source.indexOf("const bio = [") + 200)
        expect(firstLine).toMatch(/EchoStar/)
    })

    it("never uses the retired titles", () => {
        expect(source).not.toMatch(/Senior Software Engineer/)
        expect(source).not.toMatch(/Vibe Coder/i)
    })

    it("keeps the established facts", () => {
        expect(source).toMatch(/UC Berkeley/)
        expect(source).toMatch(/B\.A\. Computer Science/)
        expect(source).toMatch(/"6"/) // six papers, counted up
        expect(source).toMatch(/Hydrology/)
        expect(source).toMatch(/"100M\+"/)
        expect(source).toMatch(/Apple/)
        expect(source).toMatch(/Walmart/)
        expect(source).toMatch(/Honda Innovations/)
    })

    it("describes the real open-source work, not the stale framework list", () => {
        expect(source).not.toMatch(/LangChain, CrewAI, Spring/)
        expect(source).toMatch(/imsg/)
        expect(source).toMatch(/MCP/)
    })
})

describe("about — theming", () => {
    it("has no hard-coded dark literals in the tiles", () => {
        expect(source).not.toMatch(/rgba\(0,\s*0,\s*0/)
        expect(source).not.toMatch(/rgba\(255,\s*255,\s*255/)
        expect(source).not.toMatch(/bg-\[#/)
        expect(source).not.toMatch(/\btext-white\b/)
        expect(source).not.toMatch(/\bbg-black\b|\btext-black\b/)
    })

    it("never paints headline text solid tech-blue", () => {
        expect(source).not.toMatch(/hsl\(217 100% 68%\)/)
    })
})

describe("about — layout", () => {
    it("stacks tiles 1 / 2 / 3 across phone, tablet and desktop", () => {
        expect(source).toMatch(/grid-cols-1 .*sm:grid-cols-2 lg:grid-cols-3/)
    })

    it("caps the portrait width when it stacks above the terminal", () => {
        expect(source).toMatch(/max-w-\[20rem\]/)
    })
})

describe("about — reduced motion", () => {
    it("skips the JS-driven typing and count-up when the visitor asks for less motion", () => {
        // The global CSS zeroes CSS animations; the typewriter and counter are
        // setTimeout/rAF driven and need their own branch.
        expect(source).toMatch(/useReducedMotion/)
    })
})
