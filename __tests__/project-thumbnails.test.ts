/**
 * Enforcement: the Featured Projects marquee section contract.
 *
 * 1. Thumbnails — every project that has a public artifact (live site or a
 *    specific GitHub repo) carries a committed cover screenshot; projects
 *    without one (internal/course work) carry the ghost-number fallback.
 * 2. Whole-card interaction — the entire card opens the detail panel
 *    (role="button" + keyboard support), not just the Explore button.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"
import { projects } from "@/data/projects"

const ROOT = path.resolve(__dirname, "..")
const PROJECTS_TSX = path.join(ROOT, "components/sections/projects.tsx")

/** A detail link that represents a public artifact we can screenshot:
 *  any live site, or a specific repo under the user's GitHub (not the
 *  bare profile, and not third-party press articles). */
function hasCapturableArtifact(url: string | undefined): boolean {
    if (!url) return false
    if (url.includes("scet.berkeley.edu")) return false // press article, not a product
    if (/github\.com\/ml-lubich\/?$/.test(url)) return false // bare profile
    return true
}

describe("Featured Projects — thumbnails", () => {
    it("every project with a public artifact has a cover thumbnail", () => {
        const missing = projects
            .filter((p) => hasCapturableArtifact(p.detail.link?.url))
            .filter((p) => !p.coverImage)
            .map((p) => `${p.id} (${p.detail.link!.url})`)
        expect(
            missing,
            `These projects have a live site or repo but no coverImage thumbnail:\n${missing.join("\n")}`
        ).toEqual([])
    })

    it("every referenced coverImage exists on disk under public/", () => {
        for (const p of projects) {
            if (!p.coverImage) continue
            const file = path.join(ROOT, "public", p.coverImage)
            expect(fs.existsSync(file), `${p.id}: ${p.coverImage} missing from public/`).toBe(true)
        }
    })

    it("cover images stay lightweight for the marquee (< 500 KB each)", () => {
        for (const p of projects) {
            if (!p.coverImage) continue
            const file = path.join(ROOT, "public", p.coverImage)
            if (!fs.existsSync(file)) continue // covered by the existence test
            const kb = fs.statSync(file).size / 1024
            expect(kb, `${p.coverImage} is ${Math.round(kb)} KB`).toBeLessThan(500)
        }
    })

    it("projects without a cover still carry a 'number' for the poster corner chip", () => {
        for (const p of projects) {
            if (p.coverImage) continue
            expect(p.number, `${p.id} has no coverImage, so it needs a 'number' for the poster chip`).toBeTruthy()
        }
    })

    it("every cover-less project resolves to a diagramType the poster can theme", () => {
        // The designed poster maps detail.diagramType -> a domain icon + label.
        // A missing/unknown type would fall through to the generic bucket, which
        // is allowed, but every current cover-less project should have one set so
        // the poster is intentional rather than accidental.
        const untyped = projects
            .filter((p) => !p.coverImage)
            .filter((p) => !p.detail.diagramType)
            .map((p) => p.id)
        expect(untyped, `Cover-less projects missing detail.diagramType:\n${untyped.join("\n")}`).toEqual([])
    })
})

describe("Featured Projects — designed poster fallback", () => {
    const src = fs.readFileSync(PROJECTS_TSX, "utf8")

    it("renders a designed ProjectPoster for cover-less cards (not a bare ghost number)", () => {
        expect(src).toContain("ProjectPoster")
    })

    it("the poster themes itself from the project's diagramType", () => {
        // Poster must key its icon/label off diagramType so each domain reads
        // distinctly (pipeline vs agentic vs ML vs systems vs full-stack).
        expect(src).toMatch(/diagramType/)
        expect(src).toMatch(/POSTER_THEME|posterTheme/)
    })

    it("the poster surfaces the project metric, not just an opacity-20 number", () => {
        // The whole point of the change: cover-less cards get a real cover with
        // the headline metric, replacing the faint standalone number.
        expect(src).toMatch(/ProjectPoster[\s\S]*metric/)
    })
})

describe("Featured Projects — whole-card interaction", () => {
    const src = fs.readFileSync(PROJECTS_TSX, "utf8")

    it("the entire card is a button that opens the detail panel", () => {
        // The <article> itself must be actionable, not only the Explore CTA.
        expect(src).toMatch(/<article[^>]*\n?[^>]*role="button"/)
        expect(src).toContain("onClick={handleCardClick}")
        expect(src).toMatch(/tabIndex=\{0\}/)
    })

    it("card activation is keyboard accessible (Enter / Space)", () => {
        expect(src).toMatch(/onKeyDown/)
        expect(src).toMatch(/Enter/)
    })

    it("section copy tells visitors the whole card is clickable", () => {
        expect(src.toLowerCase()).toContain("click any card")
    })
})
