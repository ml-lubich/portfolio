import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { runTool, BOOKING_URL, SYSTEM_PROMPT, TOOL_SCHEMAS } from "@/lib/ai/profile-tools"

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8")

function booking(args: Record<string, unknown>) {
    const r = runTool("request_consultation", args) as { booking?: Record<string, unknown> }
    if (!r.booking) throw new Error("expected a booking spec")
    return r.booking
}

describe("request_consultation", () => {
    it("is advertised to the model", () => {
        const names = TOOL_SCHEMAS.map((s) => s.function.name)
        expect(names).toContain("request_consultation")
    })

    it("returns Misha's real calendar, not a placeholder", () => {
        expect(booking({ topic: "RAG build" }).url).toBe(BOOKING_URL)
        expect(BOOKING_URL).toMatch(/^https:\/\/calendar\.app\.google\//)
    })

    it("clamps duration to a slot length the calendar actually offers", () => {
        expect(booking({ topic: "x", durationMin: 15 }).durationMin).toBe(15)
        expect(booking({ topic: "x", durationMin: 5 }).durationMin).toBe(15)
        expect(booking({ topic: "x", durationMin: 240 }).durationMin).toBe(30)
        expect(booking({ topic: "x" }).durationMin).toBe(30)
    })

    it("falls back to a usable topic when the model sends junk", () => {
        expect(booking({ topic: "   " }).topic).toBeTruthy()
        expect(booking({}).topic).toBeTruthy()
        expect(booking({ topic: 42 }).topic).toBeTruthy()
    })

    it("caps a runaway topic and summary so the card cannot be blown open", () => {
        const b = booking({ topic: "x".repeat(500), summary: "y".repeat(2000) })
        expect(b.topic.length).toBeLessThanOrEqual(90)
        expect(String(b.summary).length).toBeLessThanOrEqual(200)
    })
})

describe("no fabricated appointments", () => {
    it("instructs the model never to claim a slot is held", () => {
        expect(SYSTEM_PROMPT).toMatch(/never say a slot has been opened, held, reserved or booked/i)
        expect(SYSTEM_PROMPT).toMatch(/never write a URL or a markdown link/i)
    })

    it("the card states the visitor still picks the time", () => {
        const card = read("components/ai-chat/booking-card.tsx")
        expect(card).toMatch(/you pick the slot/i)
        // A tentative hold is honest; a CONFIRMED event would assert a
        // meeting that nobody has agreed to.
        expect(card).toContain("STATUS:TENTATIVE")
        expect(card).not.toContain("STATUS:CONFIRMED")
    })

    it("escapes ics fields so a topic with a comma cannot corrupt the file", () => {
        const card = read("components/ai-chat/booking-card.tsx")
        expect(card).toContain("icsEscape")
        expect(card).toMatch(/BEGIN:VCALENDAR/)
        expect(card).toMatch(/\\r\\n/)
    })

    it("strips the pasted booking link on display rather than trusting the prompt", () => {
        const panel = read("components/ai-chat/mlbot.tsx")
        expect(panel).toContain("stripBookingLink")
        expect(panel).toContain("BOOKING_URL")
    })
})

describe("model cascade", () => {
    const route = read("app/api/chat/route.ts")

    /* Ordered by measured latency, not price. Free models here are the slow
     * ones and spend their budget on reasoning tokens before answering, so
     * free-first made the panel feel broken. The paid leaders cost about
     * $0.0001 per conversation, which makes "fast" and "cheap" the same pick;
     * the free tier stays as a last-resort net if they all fail. */
    it("leads with the fastest verified model", () => {
        const block = route.slice(route.indexOf("const MODELS"), route.indexOf("] as const"))
        const models = [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1])
        expect(models[0]).toBe("inclusionai/ling-3.0-flash")
    })

    it("keeps a free model in the cascade as a cost/outage net", () => {
        const block = route.slice(route.indexOf("const MODELS"), route.indexOf("] as const"))
        const models = [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1])
        expect(models.some((m) => m.endsWith(":free"))).toBe(true)
    })

    it("excludes the free models that stream chain-of-thought as content", () => {
        // Verified against the live API: these leak "I need to follow the
        // rules..." straight into the panel, even with reasoning.exclude set.
        // Scoped to the array — they are named in the comment above it on purpose.
        const block = route.slice(route.indexOf("const MODELS"), route.indexOf("] as const"))
        expect(block).not.toContain("nemotron-3.5-lightning")
        expect(block).not.toContain("nemotron-3-super-120b")
    })

    it("asks providers to keep reasoning tokens out of the stream", () => {
        expect(route).toContain("reasoning: { exclude: true }")
    })

    it("has a paid fallback so a free-tier outage does not take chat down", () => {
        const block = route.slice(route.indexOf("const MODELS"), route.indexOf("] as const"))
        const models = [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1])
        expect(models.filter((m) => !m.endsWith(":free")).length).toBeGreaterThan(0)
    })
})
