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

/** Strongest alpha any colour stop in one declaration paints at. */
function peakAlpha(value: string): number {
    const alphas = [...value.matchAll(/rgba\([^)]*,\s*([\d.]+)\s*\)/g)].map((m) => Number(m[1]))
    return alphas.length ? Math.max(...alphas) : 0
}

describe("hero copy halo", () => {
    it("gives the h1 a multi-layer diffuse shadow, not a box", () => {
        const rule = css.match(/\.hero-copy-halo h1,[\s\S]*?\}/)?.[0] ?? ""
        expect(rule, ".hero-copy-halo h1 rule not found").not.toBe("")
        const shadow = rule.match(/text-shadow:([^;]*);/)?.[1] ?? ""
        // Three offsets at widening blur radii — the halo follows the glyphs.
        expect(shadow.split(",").length).toBeGreaterThanOrEqual(3)
        expect(shadow).toMatch(/\d+px/)
        // A background/box-shadow here would be the rectangle we are removing.
        expect(rule).not.toMatch(/(?:^|[\s;{])(?:box-shadow|background)\s*:/)
    })

    it("halos the rest of the hero copy too", () => {
        const rule = css.match(/\.hero-copy-halo \{[^}]*\}/)?.[0] ?? ""
        expect(rule.match(/text-shadow:([^;]*);/)?.[1]?.split(",").length ?? 0).toBeGreaterThanOrEqual(3)
    })

    it("adds a white light bloom so the type reads shiny, not just ink-backed", () => {
        /* josephheupler.com's skill titles use `0 0 34px rgba(255,255,255,0.22)`.
         * The dark halo keeps glyphs sharp over the mesh; without a light
         * bloom the metallic fill still reads dull. The shine lives on the
         * halo wrapper so `.gradient-text` stays token-only (light-mode gate). */
        const start = css.indexOf(".hero-copy-halo {")
        expect(start, ".hero-copy-halo rule").toBeGreaterThan(-1)
        const filterAt = css.indexOf("filter:", start)
        const filter = css.slice(filterAt, css.indexOf(";", filterAt + 8) + 1)
        expect(filter).toMatch(/rgba\(\s*255\s*,\s*255\s*,\s*255/)
        expect(filter).toMatch(/0 0 3[0-9]px/)
    })
})

describe("hero washes", () => {
    it("never lets the stage wash dim the mesh into a grey blob", () => {
        const decls = declarations("--hero-stage-scrim")
        expect(decls.length, "no --hero-stage-scrim declarations found").toBeGreaterThan(0)
        for (const decl of decls) {
            // Was 0.78 (0.60 on phones) — dense enough to read as an ellipse
            // drawn over the brain.
            expect(peakAlpha(decl), `stage wash too strong: ${decl.trim()}`).toBeLessThanOrEqual(0.34)
        }
    })

    it("keeps the backdrop wash off full strength", () => {
        const decls = declarations("--hero-scrim")
        expect(decls.length, "no --hero-scrim declarations found").toBeGreaterThan(0)
        for (const decl of decls) {
            // The phone tier ran to 0.93, which flattened the whole hero.
            expect(peakAlpha(decl), `backdrop wash too strong: ${decl.trim()}`).toBeLessThanOrEqual(0.6)
        }
    })
})
