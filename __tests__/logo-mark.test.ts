/**
 * Logo mark contract — the metallic chrome "ML" monogram (/logo.png).
 *
 * `SiteLogoMark` is the single source of truth for the brand mark across the
 * nav, footer, blog-header, tools and llm-prices. It must render the real
 * metallic logo raster while keeping the exact prop contract every consumer
 * relies on, with an accessible name.
 *
 *   bunx vitest run __tests__/logo-mark.test.ts
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")
const SRC = fs.readFileSync(path.join(ROOT, "components/site-logo-mark.tsx"), "utf8")

describe("SiteLogoMark renders the metallic ML logo", () => {
    it("renders the /logo.png brand mark", () => {
        expect(SRC).toMatch(/src=["']\/logo\.png["']/)
    })

    it("keeps the existing prop contract", () => {
        for (const prop of ["width", "height", "sizes", "className", "alt", "loading", "suppressHydrationWarning"]) {
            expect(SRC, `missing prop "${prop}" in destructured signature`).toMatch(new RegExp(`\\b${prop}\\b`))
        }
    })

    it("has an accessible name (alt)", () => {
        expect(SRC, "mark must expose alt as an accessible name").toMatch(/alt=\{?alt\}?/)
    })

    it("does not hard-code the reserved tech-blue hue", () => {
        expect(SRC).not.toMatch(/hsl\(\s*217\s+100%/)
    })
})
