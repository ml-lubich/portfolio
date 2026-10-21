import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const profile = readFileSync(join(process.cwd(), "components/sections/profile-intro.tsx"), "utf8")
const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8")

describe("profile card — tilted corners stay visible", () => {
    it("leaves the outer section unclipped while the card tilts", () => {
        const sectionClasses = profile.match(/<section\s+id="profile"\s+className="([^"]+)"/)?.[1]
        expect(sectionClasses).toBeDefined()
        expect(sectionClasses).not.toMatch(/\boverflow-(?:hidden|clip)\b/)
    })

    it("overrides the generic animated-section clipping after the text-glow rule", () => {
        // Both selectors have an ID and a class; source order must let the
        // profile exception win over the desktop text-glow clipping rule.
        const genericClip = css.search(/#main-content section\.animated-section\s*\{\s*overflow:\s*clip\s*;/)
        const profileVisible = css.search(/#profile section\.animated-section\s*\{\s*overflow:\s*visible\s*;/)
        expect(genericClip).toBeGreaterThanOrEqual(0)
        expect(profileVisible).toBeGreaterThan(genericClip)
    })
})
