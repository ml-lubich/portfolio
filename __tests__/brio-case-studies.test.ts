import { describe, expect, it } from "vitest"
import fs from "node:fs"
import path from "node:path"
import { projects } from "@/data/projects"

const root = path.resolve(__dirname, "..")
const brioProjects = ["brio-bot", "briopedia", "brioscope"]

describe("Brio portfolio case studies", () => {
    it("uses approved illustrative cover art with a clear non-screenshot alt", () => {
        for (const id of brioProjects) {
            const matches = projects.filter((project) => project.id === id)
            expect(matches, `${id} should appear exactly once`).toHaveLength(1)

            const project = matches[0]
            expect(project.coverImage).toBeTruthy()
            expect(project.coverAlt).toMatch(/illustrative 3D artwork/i)
            expect(project.coverAlt).toMatch(/not a product screenshot/i)
            expect(fs.existsSync(path.join(root, "public", project.coverImage!))).toBe(true)
            expect(project.detail.subtitle).toMatch(/prior Brio team work/i)
        }
    })

    it("preserves the caveats on BrioBot's modeled cost and offline benchmark", () => {
        const bot = projects.find((project) => project.id === "brio-bot")!
        const evidence = [...(bot.detail.highlights ?? []), ...(bot.detail.metrics ?? []).map(({ label, value }) => `${label}: ${value}`)].join(" ")

        expect(evidence).toContain("$2 per case")
        expect(evidence).toContain("$4,000 for 2,000 cases")
        expect(evidence).toContain("$0.02 per case")
        expect(evidence).toContain("$35 for 2,000 cases")
        expect(evidence).toMatch(/not realized net savings/i)
        expect(evidence).toMatch(/excludes labor, implementation, platform costs, and human review/i)
        expect(evidence).toMatch(/Offline 355-case benchmark/i)
        expect(evidence).toContain("75% type, 66% reason, and 55% source")
    })

    it("uses the current Briopedia retrieval stack and source-backed BrioScope scope", () => {
        const encyclopedia = projects.find((project) => project.id === "briopedia")!
        expect(encyclopedia.detail.techStack).toContain("Chroma")
        expect(encyclopedia.detail.techStack).not.toContain("FAISS")

        const scope = projects.find((project) => project.id === "brioscope")!
        const description = [scope.summary, scope.detail.description, ...(scope.detail.highlights ?? [])].join(" ")
        expect(description).toContain("Gorgias")
        expect(description).toContain("Aircall")
        expect(description).toContain("four-month")
        expect(description).toContain("three speech-processing options")
        expect(description).not.toMatch(/\b(production|deployed|live customer)\b/i)
    })

    it("passes explicit cover alt text through to the project image", () => {
        const renderer = fs.readFileSync(path.join(root, "components/sections/projects.tsx"), "utf8")
        expect(renderer).toContain("alt={project.coverAlt ??")
    })
})
