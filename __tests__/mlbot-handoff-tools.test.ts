import { describe, it, expect } from "vitest"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { runTool, TOOL_SCHEMAS, SYSTEM_PROMPT, RESUME_URL, CONTACT_EMAIL, BOOKING_URL } from "@/lib/ai/profile-tools"
import { stripCardLinks } from "@/lib/ai/card-links"
import { TOOL_LABELS, collapseToolSteps } from "@/lib/ai/tool-labels"

const root = process.cwd()
const read = (p: string) => readFileSync(join(root, p), "utf8")

/* ── 1. Resume hand-off ──────────────────────────────────────────────── */

describe("get_resume", () => {
    it("is advertised to the model", () => {
        expect(TOOL_SCHEMAS.map((s) => s.function.name)).toContain("get_resume")
    })

    it("points at a PDF that actually ships in public/", () => {
        const { resume } = runTool("get_resume", {}) as { resume: { url: string } }
        expect(resume.url).toBe(RESUME_URL)
        expect(RESUME_URL.startsWith("/")).toBe(true)
        // Served from the repo, not hotlinked out of ~/dev/resumes.
        expect(existsSync(join(root, "public", RESUME_URL.replace(/^\//, "")))).toBe(true)
    })

    it("hands back a filename the browser can save under", () => {
        const { resume } = runTool("get_resume", {}) as { resume: { filename: string } }
        expect(resume.filename).toMatch(/\.pdf$/i)
        expect(resume.filename).toMatch(/lubich/i)
    })

    it("renders as a card rather than a pasted link", () => {
        const panel = read("components/ai-chat/mlbot.tsx")
        expect(panel).toContain("ResumeCard")
        expect(read("components/ai-chat/handoff-cards.tsx")).toContain("download=")
        // Same SSE shape as the booking card.
        expect(read("app/api/chat/route.ts")).toContain(`send("resume"`)
    })

    it("strips a pasted resume path the way the booking URL is stripped", () => {
        expect(read("lib/ai/card-links.ts")).toContain("RESUME_URL")
        expect(SYSTEM_PROMPT).toMatch(/get_resume/)
    })
})

/* The prompt says not to repeat what the card already shows. Models do it
 * anyway — a live run put the address inline as a markdown link directly under
 * the contact card — so the panel strips it rather than trusting the prompt. */
describe("stripCardLinks", () => {
    it("removes an inline email link the contact card already carries", () => {
        const said = `Email is the most direct way to reach Misha — [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}). His LinkedIn is on the card.`
        const shown = stripCardLinks(said)
        expect(shown).not.toContain(CONTACT_EMAIL)
        expect(shown).toBe("Email is the most direct way to reach Misha. His LinkedIn is on the card.")
    })

    it("removes a bare address and the dangling separator left behind", () => {
        expect(stripCardLinks(`Reach him at ${CONTACT_EMAIL}.`)).toBe("Reach him at.")
        expect(stripCardLinks(`Write to him — ${CONTACT_EMAIL}`)).toBe("Write to him")
    })

    it("still removes the booking URL and the resume path", () => {
        expect(stripCardLinks(`Book here: ${BOOKING_URL}`)).not.toContain("calendar.app.google")
        expect(stripCardLinks(`Grab it at ${RESUME_URL}`)).not.toContain(RESUME_URL)
    })

    it("keeps the label when the model wrapped the link in markdown", () => {
        expect(stripCardLinks(`[Pick a time](${BOOKING_URL}) that suits you.`)).toBe("Pick a time that suits you.")
    })

    it("leaves an ordinary answer untouched", () => {
        const prose = "Misha tripled microservice throughput at Walmart.\n\nHe now works at EchoStar."
        expect(stripCardLinks(prose)).toBe(prose)
    })

    it("does not disturb a chart fence", () => {
        const fenced = 'Here:\n\n```chart\n{"type":"pipeline","title":"RAG","steps":[{"label":"Ingest"}]}\n```'
        expect(stripCardLinks(fenced)).toBe(fenced)
    })
})

/* ── 2. Contact hand-off ─────────────────────────────────────────────── */

describe("get_contact", () => {
    it("is advertised to the model", () => {
        expect(TOOL_SCHEMAS.map((s) => s.function.name)).toContain("get_contact")
    })

    it("returns the same address the contact section and footer use", () => {
        const { contact } = runTool("get_contact", {}) as { contact: { email: string; mailto: string } }
        expect(contact.email).toBe(CONTACT_EMAIL)
        expect(contact.mailto.startsWith(`mailto:${CONTACT_EMAIL}`)).toBe(true)

        // Not invented here — it is the address already published on the site.
        expect(read("components/sections/contact.tsx")).toContain(CONTACT_EMAIL)
        expect(read("components/sections/footer.tsx")).toContain(CONTACT_EMAIL)
    })

    it("hands off rather than sending anything from the site", () => {
        const tools = read("lib/ai/profile-tools.ts")
        expect(tools).not.toMatch(/nodemailer|sendgrid|resend|smtp/i)
        expect(read("components/ai-chat/handoff-cards.tsx")).toContain("ContactCard")
    })
})

/* ── 3. Diagram-first, not wall-of-text ──────────────────────────────── */

describe("system prompt prefers a picture", () => {
    it("tells the model to draw lists, comparisons and architectures", () => {
        expect(SYSTEM_PROMPT).toMatch(/list/i)
        expect(SYSTEM_PROMPT).toMatch(/architecture/i)
        expect(SYSTEM_PROMPT).toMatch(/diagram|chart/i)
        // Explicit: do not wait to be asked to visualise it.
        expect(SYSTEM_PROMPT).toMatch(/without being asked|do not wait|even when the visitor did not ask/i)
    })

    it("keeps the existing guards it must not trade away", () => {
        expect(SYSTEM_PROMPT).toMatch(/never write a URL or a markdown link/i)
        expect(SYSTEM_PROMPT).toMatch(/never say a slot has been opened, held, reserved or booked/i)
        expect(SYSTEM_PROMPT).toMatch(/Ground every factual claim in a tool call/i)
    })
})

/* ── 4. Consecutive duplicate labels collapse ────────────────────────── */

describe("collapseToolSteps", () => {
    it("collapses two consecutive calls that read the same label", () => {
        const steps = collapseToolSteps([
            { name: "get_projects", done: true },
            { name: "get_projects", done: true },
        ])
        expect(steps).toEqual([{ name: "get_projects", done: true }])
    })

    it("keeps a genuinely different lookup as its own step", () => {
        const steps = collapseToolSteps([
            { name: "get_projects", done: true },
            { name: "get_experience", done: true },
            { name: "get_projects", done: true },
        ])
        expect(steps.map((s) => s.name)).toEqual(["get_projects", "get_experience", "get_projects"])
    })

    it("stays 'running' while any of the collapsed calls is still running", () => {
        const steps = collapseToolSteps([
            { name: "get_projects", done: true },
            { name: "get_projects", done: false },
        ])
        expect(steps).toEqual([{ name: "get_projects", done: false }])
    })

    it("collapses by label, so two tools sharing a label read as one step", () => {
        const shared = Object.entries(TOOL_LABELS).filter(([, label]) => label === TOOL_LABELS.get_projects)
        expect(shared.length).toBeGreaterThan(0)
        expect(collapseToolSteps([])).toEqual([])
    })

    it("is what the panel renders", () => {
        expect(read("components/ai-chat/mlbot.tsx")).toContain("collapseToolSteps")
    })

    /* Captured off the live endpoint answering "What has Misha built with
     * agents?". Each get_projects carried different args, so the server-side
     * memo let them all through — four identical lines in the panel. */
    it("collapses the run of get_projects a real transcript produced", () => {
        const live = ["search_profile", "get_projects", "get_projects", "get_projects", "get_projects", "chart_publications_by_year"]
        const collapsed = collapseToolSteps(live.map((name) => ({ name, done: true })))
        expect(collapsed.map((s) => s.name)).toEqual(["search_profile", "get_projects", "chart_publications_by_year"])
    })

    it("leaves a transcript that interleaves two lookups alone", () => {
        const live = ["search_profile", "get_projects", "search_profile", "chart_publications_by_year"]
        const collapsed = collapseToolSteps(live.map((name) => ({ name, done: true })))
        expect(collapsed).toHaveLength(4)
    })
})

describe("tool labels cover every tool the model can call", () => {
    it("has a label for each schema name", () => {
        for (const schema of TOOL_SCHEMAS) {
            expect(TOOL_LABELS[schema.function.name], `missing label for ${schema.function.name}`).toBeTruthy()
        }
    })
})
