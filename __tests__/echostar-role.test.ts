import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { experiences } from "@/data/experiences"

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8")

describe("current role", () => {
    it("leads the journey with EchoStar", () => {
        expect(experiences[0].company).toBe("EchoStar")
        expect(experiences[0].title).toBe("Staff AI Engineer")
        expect(experiences[0].period).toMatch(/Sep(tember)? 2026 – Present/)
        expect(experiences[0].location).toBe("SF Bay Area")
    })

    it("closes Polaris out rather than leaving two current roles", () => {
        const polaris = experiences.find((e) => e.id === "polaris")
        expect(polaris?.period).not.toMatch(/Present/)
        expect(polaris?.period).toMatch(/2026/)
    })

    it("keeps the display ordinals contiguous from 01", () => {
        expect(experiences.map((e) => e.number)).toEqual(
            experiences.map((_, i) => String(i + 1).padStart(2, "0")),
        )
    })

    it("says why he chose EchoStar over the defence offers", () => {
        const blob = read("data/experiences.ts")
        expect(blob).toMatch(/Anduril/)
        expect(blob).toMatch(/Mach Industries/)
        expect(blob).toMatch(/consumer/i)
    })
})

describe("offers strip", () => {
    const source = read("components/sections/logo-scroll.tsx")

    it("labels the offers row honestly, apart from the partners row", () => {
        expect(source).toMatch(/Offers & final rounds/i)
        expect(source).toMatch(/Trusted & partnered with/i)
    })

    it("draws both marks from real asset files", () => {
        expect(source).toContain("/logos/anduril.svg")
        expect(source).toContain("/logos/mach-industries.svg")
    })
})

describe("site metadata reflects the new title", () => {
    it("names Staff AI Engineer in the page title and JSON-LD", () => {
        expect(read("app/layout.tsx")).toMatch(/Staff AI Engineer/)
        expect(read("components/seo/json-ld.tsx")).toMatch(/Staff AI Engineer/)
    })

    it("declares EchoStar as the current employer in structured data", () => {
        const jsonLd = read("components/seo/json-ld.tsx")
        expect(jsonLd).toMatch(/worksFor/)
        expect(jsonLd).toMatch(/EchoStar/)
    })
})

/* He is Staff now, and the rotation is his own title line — "Senior Software
 * Engineer" undersells it and "Vibe Coder" was a joke he has outgrown. */
describe("hero role rotation", () => {
    it("leads with Staff AI Engineer", async () => {
        const { roles } = await import("@/components/hero/data")
        expect(roles[0]).toBe("Staff AI Engineer")
    })

    it("no longer claims a Senior title", async () => {
        const { roles } = await import("@/components/hero/data")
        expect(roles.some((r) => /^Senior/.test(r))).toBe(false)
    })

    it("says agentic rather than vibe", async () => {
        const { roles } = await import("@/components/hero/data")
        expect(roles.some((r) => /vibe/i.test(r))).toBe(false)
        expect(roles.some((r) => /agentic/i.test(r))).toBe(true)
    })
})
