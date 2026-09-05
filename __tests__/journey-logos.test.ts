/**
 * Journey timeline cards should show each employer's real logo instead of a
 * generic briefcase icon, wherever a logo asset exists for that entry.
 */

import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"
import { experiences } from "@/data/experiences"

const ROOT = path.resolve(__dirname, "..")
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8")

describe("Experience logos", () => {
    it("every experience with a logo points at a file that exists under public/", () => {
        for (const exp of experiences) {
            if (!exp.logo) continue
            const file = path.join(ROOT, "public", exp.logo)
            expect(fs.existsSync(file), `${exp.id}: ${exp.logo} missing under public/`).toBe(true)
        }
    })

    it("gives EchoStar and Polaris Wireless a real logo asset (not the briefcase fallback)", () => {
        const echostar = experiences.find((e) => e.id === "echostar")
        const polaris = experiences.find((e) => e.id === "polaris")
        expect(echostar?.logo).toBe("/logos/echostar.svg")
        expect(polaris?.logo).toBe("/logos/polaris-wireless.svg")
    })

    it("leaves the independent consulting entry without a fabricated logo", () => {
        const consulting = experiences.find((e) => e.id === "ai-consulting")
        expect(consulting?.logo).toBeUndefined()
    })

    it("reuses the existing berkeley-lab asset for the LBNL entry", () => {
        const lbnl = experiences.find((e) => e.id === "lbnl")
        expect(lbnl?.logo).toBe("/logos/berkeley-lab.svg")
    })
})

describe("Journey card rendering", () => {
    const source = read("components/sections/journey.tsx")

    it("renders a logo image when the experience has one, falling back to the briefcase icon", () => {
        expect(source).toContain("exp.logo")
        expect(source).toContain("Briefcase")
    })
})
