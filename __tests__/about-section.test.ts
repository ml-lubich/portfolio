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

/* ── Calm pass (2026-09-13) ───────────────────────────────────────────
 *  Owner: "too much shimmer and lit, it looks like liquid glass but not a
 *  big fan" / "looks too wall of text". The section drops the liquid-glass
 *  plinths, the 3D tilt and the always-on shimmer, and the copy is cut to
 *  short single lines. Facts are unchanged — only the prose around them.
 * ─────────────────────────────────────────────────────────────────── */
describe("about — calm, not liquid glass", () => {
    it("has no liquid-glass plinth: no conic ring, no spin, no floor-light pool", () => {
        expect(source).not.toMatch(/conic-gradient/)
        expect(source).not.toMatch(/holo-spin/)
        expect(source).not.toMatch(/backdrop-blur-md/)
    })

    it("has no pointer-tilt 3D cell — depth came from the transform and read as glass", () => {
        expect(source).not.toMatch(/HoloCell/)
        expect(source).not.toMatch(/translateZ/)
        expect(source).not.toMatch(/preserve-3d/)
        expect(source).not.toMatch(/rotateX\(\$\{/)
    })

    it("drops the always-on shimmer sweep over the tile panel", () => {
        expect(source).not.toMatch(/ShimmerOverlay/)
    })

    it("paints the tiles with design tokens, not white-alpha glass", () => {
        expect(source).toMatch(/bg-card/)
        expect(source).toMatch(/border-border/)
        expect(source).not.toMatch(/bg-white\/\[0\.0/)
    })

    it("uses the same two-orb ambient wash as the open-source section, not a pulsing orb stack", () => {
        expect(source).not.toMatch(/translucent-glow/)
        expect(source).not.toMatch(/ParticleField/)
        expect((source.match(/blur-\[100px\]/g) ?? []).length).toBe(2)
    })
})

describe("about — not a wall of text", () => {
    const bioBlock = source.slice(source.indexOf("const bio = ["), source.indexOf("]\n", source.indexOf("const bio = [")))
    const bioLines = [...bioBlock.matchAll(/^\s*"(.*)",$/gm)].map((m) => m[1])

    it("types at most four bio lines", () => {
        expect(bioLines.length).toBeGreaterThan(0)
        expect(bioLines.length).toBeLessThanOrEqual(4)
    })

    it("keeps every bio line short enough to sit on one row", () => {
        for (const line of bioLines) {
            expect(line.length, `bio line too long: "${line}"`).toBeLessThanOrEqual(72)
        }
    })

    it("keeps the section subtitle to a single short sentence pair", () => {
        const subtitle = source.match(/subtitle="([^"]+)"/)?.[1] ?? ""
        expect(subtitle.length).toBeGreaterThan(0)
        expect(subtitle.length).toBeLessThanOrEqual(190)
    })
})
