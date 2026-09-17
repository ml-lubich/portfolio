import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * josephheupler.com puts the darkness on the letterforms, not on the mesh:
 * `.hero-copy` / `.hero-copy h1` carry a three-layer ink halo and there is no
 * scrim over the brain at all. This site did the opposite — a near-opaque
 * ellipse at z-[1] over the canvas — which is why the wireframe read as a grey
 * blob and why the wash itself was visible as a box around the type.
 *
 * These caps are the port: the halo stays, the washes come down to a haze.
 */
const css = readFileSync(resolve(__dirname, "../app/globals.css"), "utf8")

/** Every `--token: …;` declaration in the file, value only. */
function declarations(token: string): string[] {
    return [...css.matchAll(new RegExp(`${token}:([^;]*);`, "g"))].map((m) => m[1])
}

describe("hero copy halo", () => {
    const h1Rule = () => css.match(/\.hero-copy-halo h1,[\s\S]*?\}/)?.[0] ?? ""
    const wrapRule = () => css.match(/\.hero-copy-halo \{[^}]*\}/)?.[0] ?? ""
    const filterOf = (rule: string) => rule.match(/filter:([^;]*);/)?.[1] ?? ""

    it("gives the h1 a dark ink halo, not a box", () => {
        const rule = h1Rule()
        expect(rule, ".hero-copy-halo h1 rule not found").not.toBe("")
        expect(filterOf(rule).split("drop-shadow").length).toBeGreaterThanOrEqual(3)
        expect(rule).not.toMatch(/(?:^|[\s;{])(?:box-shadow|background)\s*:/)
    })

    it("halos the rest of the hero copy too", () => {
        expect(filterOf(wrapRule()).split("drop-shadow").length).toBeGreaterThanOrEqual(3)
    })

    it("paints only dark haze around the glyphs, never a white bloom", () => {
        /* josephheupler.com: bright type, near-black haze, no white glow. A
         * white drop-shadow reads as a hazy box over the mesh. */
        for (const rule of [wrapRule(), h1Rule()]) {
            const filter = filterOf(rule)
            expect(filter).not.toMatch(/rgba\(\s*255\s*,\s*255\s*,\s*255/)
            expect(filter).toMatch(/hsl\(var\(--background\)/)
        }
    })
})
