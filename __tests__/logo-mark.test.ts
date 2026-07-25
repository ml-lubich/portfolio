/**
 * Logo mark contract — inline SVG monogram, not a raster image.
 *
 * Regression: the nav/footer/blog-header/tools logo tile rendered a bare
 * `next/image` pointed at /logo.png, which looked washed-out/low-contrast
 * at small sizes and doesn't scale crisply. `SiteLogoMark` must render an
 * inline `<svg>` monogram instead, while keeping the exact prop contract
 * every consumer (nav, footer, blog-header, tools, llm-prices) relies on.
 *
 *   bunx vitest run __tests__/logo-mark.test.ts
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")
const SRC = fs.readFileSync(path.join(ROOT, "components/site-logo-mark.tsx"), "utf8")

describe("SiteLogoMark renders an inline SVG monogram", () => {
    it("renders an inline <svg>, not solely a next/image", () => {
        expect(SRC).toMatch(/<svg[\s>]/)
    })

    it("does not render a raster <Image src=\"/logo.png\"> as the mark", () => {
        expect(SRC).not.toMatch(/src=["']\/logo\.png["']/)
    })

    it("keeps the existing prop contract", () => {
        for (const prop of ["width", "height", "sizes", "className", "alt", "loading", "suppressHydrationWarning"]) {
            expect(SRC, `missing prop "${prop}" in destructured signature`).toMatch(new RegExp(`\\b${prop}\\b`))
        }
    })

    it("has an accessible name (alt / aria-label / <title>)", () => {
        const hasAccessibleName =
            /aria-label=\{?alt\}?/.test(SRC) ||
            /<title>\{?alt\}?<\/title>/.test(SRC) ||
            /role=["']img["'][^>]*aria-label/.test(SRC)
        expect(hasAccessibleName, "svg mark must expose alt as an accessible name (aria-label or <title>)").toBe(true)
    })

    it("does not hard-code the reserved tech-blue hue", () => {
        expect(SRC).not.toMatch(/hsl\(\s*217\s+100%/)
    })
})
