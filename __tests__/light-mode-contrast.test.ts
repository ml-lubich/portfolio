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

describe("light mode — metallic bold text", () => {
    const css = read("app/globals.css")

    it("has no white shine stop left hard-coded in the metallic gradients", () => {
        const block = css.slice(css.indexOf("/* 1 ─ Direct bold elements */"))
        expect(block).not.toMatch(/hsl\(0 0% 100%\) (?:30|78)%/)
        expect(block).not.toContain("hsl(220 15% 78%)")
    })

    it("themes both shine stops", () => {
        expect((css.match(/--metal-mid:/g) ?? []).length).toBe(2)
        expect((css.match(/--metal-hi:/g) ?? []).length).toBe(2)
    })

    it("darkens the shine in light mode instead of brightening it", () => {
        const light = css.slice(css.indexOf(".light"))
        const mid = light.match(/--metal-mid:\s*hsl\([\d.]+ [\d.]+% ([\d.]+)%\)/)
        const hi = light.match(/--metal-hi:\s*hsl\([\d.]+ [\d.]+% ([\d.]+)%\)/)
        // Below 70% lightness stays legible against a white card.
        expect(Number(mid![1])).toBeLessThan(70)
        expect(Number(hi![1])).toBeLessThan(70)
    })
})

/**
 * Sep 2026 contrast pass — five defects screenshotted on the light page:
 * ghosted scroll-stack cards, invisible testimonial cards, a hard-coded-dark
 * tokscale embed, a black nav scrim, and a harsh work-marquee band.
 */
describe("light mode — journey scroll-stack cards", () => {
    const journey = read("components/sections/journey.tsx")
    const css = read("app/globals.css")

    it("borders the card with a themed hairline, not a literal white alpha", () => {
        expect(journey).not.toMatch(/border-white\/\[0\.08\]/)
        expect(journey).toContain("var(--line-soft)")
    })

    it("keeps the scroll-frozen card fill opaque and themed, not a literal dark navy", () => {
        const block = css.slice(css.indexOf('[data-stack-scrolling="true"]'))
        const rule = block.slice(0, block.indexOf("}"))
        expect(rule).not.toMatch(/hsla\(220, 18%, 10%, 0\.94\)/)
        expect(rule).toContain("var(--card-fill-opaque)")
        expect((css.match(/--card-fill-opaque:/g) ?? []).length).toBe(2)
    })
})

describe("light mode — testimonial cards", () => {
    const source = read("components/sections/client-testimonials.tsx")
    const css = read("app/globals.css")

    it("paints the card via the themed .testimonial-card class, not a bare card/alpha gradient", () => {
        expect(source).not.toMatch(/bg-gradient-to-b from-card\/40/)
        expect(source).toContain("testimonial-card")
        const block = css.slice(css.indexOf(".light .testimonial-card"), css.indexOf(".light .testimonial-card") + 200)
        expect(block).toContain("var(--glass-fill)")
        expect(block).toContain("var(--glass-shadow)")
    })

    it("keeps dark mode's .testimonial-card byte-identical to the original card/40→card/12 wash", () => {
        const block = css.slice(css.indexOf(".testimonial-card {"), css.indexOf(".testimonial-card {") + 300)
        expect(block).toContain("hsl(var(--card) / 0.4)")
        expect(block).toContain("hsl(var(--card) / 0.12)")
        expect(block).toContain("rgba(0, 0, 0, 0.65)")
    })

    it("has no hard-coded white borders left on the card, divider or carousel controls", () => {
        expect(source).not.toMatch(/border-white\/\[0\.1\]/)
        expect(source).not.toMatch(/border-white\/\[0\.07\]/)
        expect(source).not.toMatch(/border-white\/15/)
    })
})

describe("light mode — projects grid cards", () => {
    const source = read("components/sections/projects.tsx")
    const css = read("app/globals.css")

    it("bumps the .marquee-card alpha in light instead of leaving it to ghost into the page", () => {
        expect(source).toContain("marquee-card")
        expect(css).toContain(".light .marquee-card")
        expect(css).toContain(".light .marquee-card:hover")
    })

    it("does not touch dark mode's card classes", () => {
        expect(source).toContain("border-white/[0.08]")
        expect(source).toContain("bg-white/[0.03]")
    })
})

describe("light mode — work marquee band (feathered edge)", () => {
    const marquee = read("components/sections/work-marquee.tsx")
    const css = read("app/globals.css")

    it("fades the band in/out in light instead of a hard-edged rectangle", () => {
        expect(marquee).toContain("work-marquee-band")
        const block = css.slice(css.indexOf(".light .work-marquee-band"))
        const rule = block.slice(0, block.indexOf("}"))
        expect(rule).toContain("linear-gradient(to bottom, transparent")
        expect(rule).toContain("var(--band-fill)")
    })

    it("keeps dark mode's flat fill + hairline untouched (no .light scoping needed there)", () => {
        expect(marquee).toContain("border-y border-[var(--line-soft)]")
        expect(marquee).toContain("bg-[var(--band-fill)]")
    })

    it("nudges the light band a little darker than the previous washed-out value", () => {
        const light = css.slice(css.indexOf(".light"))
        const match = light.match(/--band-fill:\s*hsl\([\d.]+ [\d.]+% [\d.]+% \/ ([\d.]+)\)/)
        expect(match, "--band-fill missing from .light").toBeTruthy()
        const alpha = Number(match![1])
        expect(alpha).toBeGreaterThanOrEqual(0.07)
        expect(alpha).toBeLessThan(0.15)
    })
})

describe("light mode — tokscale embed", () => {
    const component = read("components/sections/tokscale-stats.tsx")
    const svgLib = read("lib/tokscale-svg.ts")

    it("requests a theme-aware embed instead of always the dark render", () => {
        expect(component).toContain("useTheme")
        expect(component).toMatch(/theme=light/)
    })

    it("recolors the dark-baked text/line colors for a light background", () => {
        expect(svgLib).toContain("recolorForLightTheme")
        expect(svgLib).not.toMatch(/export function recolorForLightTheme\(svg: string\): string \{\s*return svg\s*\}/)
    })
})

describe("light mode — nav gradient scrim", () => {
    const nav = read("components/nav/index.tsx")
    const css = read("app/globals.css")

    it("scrims from the themed background, not literal black", () => {
        expect(nav).not.toMatch(/from-black\/95/)
        expect(nav).toContain("var(--nav-scrim)")
        expect((css.match(/--nav-scrim:/g) ?? []).length).toBe(2)
    })
})

describe("light mode — work marquee band", () => {
    const marquee = read("components/sections/work-marquee.tsx")
    const css = read("app/globals.css")

    it("fills from a themed band token, not a literal black wash", () => {
        expect(marquee).not.toMatch(/bg-black\/\[0\.15\]/)
        expect(marquee).toContain("var(--band-fill)")
        expect((css.match(/--band-fill:/g) ?? []).length).toBe(2)
    })

    it("borders with the shared hairline token instead of an invisible white one", () => {
        expect(marquee).not.toMatch(/border-white\/\[0\.05\]/)
        expect(marquee).toContain("var(--line-soft)")
    })

    it("keeps the light-mode band darker than the page but not as dark as the dark-mode band", () => {
        const light = css.slice(css.indexOf(".light"))
        const match = light.match(/--band-fill:\s*hsl\([\d.]+ [\d.]+% [\d.]+% \/ ([\d.]+)\)/)
        expect(match, "--band-fill missing from .light").toBeTruthy()
        const alpha = Number(match![1])
        // Enough to read as a band, not so much it goes harsh/washed-out.
        expect(alpha).toBeGreaterThan(0)
        expect(alpha).toBeLessThan(0.15)
    })
})
