import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * josephheupler.com opens with a single hairline sweeping down the hero while
 * the WebGL brain is still compiling — it gives the load somewhere to look.
 * Ported here.
 *
 * Deliberately NOT reusing the existing `scan-sweep` keyframe: that one drives
 * `.scan-sweep::after` at `6s linear infinite` as an ambient shimmer. This is a
 * one-shot loader. Sharing the name would have coupled a decorative loop to a
 * load affordance, and changing either would silently alter the other.
 */
const css = readFileSync(resolve(__dirname, "../app/globals.css"), "utf8")
const hero = readFileSync(resolve(__dirname, "../components/hero/index.tsx"), "utf8")

describe("hero loading scanline", () => {
    it("renders the sweep in the hero", () => {
        expect(hero).toMatch(/hero-scanline/)
    })

    it("is decorative, so assistive tech skips it", () => {
        const line = hero.split("\n").find((l) => l.includes("hero-scanline"))
        expect(line, "hero-scanline element not found").toBeDefined()
        expect(line).toMatch(/aria-hidden/)
    })

    it("defines the class and its own keyframes", () => {
        expect(css).toMatch(/\.hero-scanline\s*\{/)
        expect(css).toMatch(/@keyframes hero-scan-sweep\s*\{/)
    })

    it("runs once — a loader that loops is not a loader", () => {
        const rule = css.match(/\.hero-scanline\s*\{[^}]*\}/)?.[0] ?? ""
        expect(rule, ".hero-scanline rule not found").not.toBe("")
        expect(rule).toMatch(/animation:[^;]*hero-scan-sweep/)
        expect(rule, "must not loop").not.toMatch(/infinite/)
    })

    it("leaves the existing ambient scan-sweep shimmer untouched", () => {
        // Regression guard: the ambient loop and this loader must stay distinct.
        expect(css).toMatch(/\.scan-sweep::after\s*\{[\s\S]*?animation:[^;]*6s linear infinite/)
    })

    it("is hidden entirely under prefers-reduced-motion", () => {
        // `animation: none` alone would freeze a visible hairline across the
        // hero forever, which is worse than the animation. It must not render.
        const blocks = [...css.matchAll(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/g)]
        const hidden = blocks.some(([, body]) =>
            /\.hero-scanline[^{]*\{[^}]*display:\s*none/.test(body),
        )
        expect(hidden, "hero-scanline must be display:none under reduced motion").toBe(true)
    })
})
