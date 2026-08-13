import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { splitChatSegments } from "@/lib/ai/chat-segments"

const root = process.cwd()
const read = (p: string) => readFileSync(join(root, p), "utf8")

const PIPELINE = `{"type":"pipeline","title":"RAG","steps":[{"label":"Ingest"},{"label":"Embed"}]}`

describe("splitChatSegments", () => {
    it("returns a single text segment when there is no fence", () => {
        expect(splitChatSegments("Misha shipped agents at Apple.")).toEqual([
            { kind: "text", value: "Misha shipped agents at Apple." },
        ])
    })

    it("splits prose around a ```chart fence and parses the diagram JSON", () => {
        const segments = splitChatSegments(`Here is the flow:\n\n\`\`\`chart\n${PIPELINE}\n\`\`\`\n\nThat is the pipeline.`)

        expect(segments.map((s) => s.kind)).toEqual(["text", "diagram", "text"])
        expect(segments[0]).toEqual({ kind: "text", value: "Here is the flow:" })
        expect(segments[1]).toEqual({ kind: "diagram", json: PIPELINE })
        expect(segments[2]).toEqual({ kind: "text", value: "That is the pipeline." })
    })

    it("accepts ```mermaid as an alias, matching the blog's fence names", () => {
        const segments = splitChatSegments(`\`\`\`mermaid\n${PIPELINE}\n\`\`\``)
        expect(segments).toEqual([{ kind: "diagram", json: PIPELINE }])
    })

    it("handles several diagrams in one reply", () => {
        const text = `A\n\n\`\`\`chart\n${PIPELINE}\n\`\`\`\n\nB\n\n\`\`\`chart\n${PIPELINE}\n\`\`\``
        expect(splitChatSegments(text).map((s) => s.kind)).toEqual(["text", "diagram", "text", "diagram"])
    })

    // The panel renders every token as it streams, so a fence is incomplete for
    // as long as it takes the model to write the JSON. Showing raw braces mid
    // stream looks broken; the diagram appears once the closing fence lands.
    it("hides a fence that has not closed yet instead of leaking raw JSON", () => {
        const segments = splitChatSegments(`Here is the flow:\n\n\`\`\`chart\n{"type":"pipel`)

        expect(segments).toEqual([{ kind: "text", value: "Here is the flow:" }])
    })

    // Models label the fence however they like — ```json is the common one.
    // The payload decides, not the label.
    it("renders a chart object regardless of the fence label", () => {
        expect(splitChatSegments(`\`\`\`json\n${PIPELINE}\n\`\`\``)).toEqual([{ kind: "diagram", json: PIPELINE }])
    })

    it("leaves JSON that is not a chart as text", () => {
        const segments = splitChatSegments('```json\n{"employer":"Apple"}\n```')

        expect(segments.every((s) => s.kind === "text")).toBe(true)
    })

    it("hides an unclosed fence whatever its label", () => {
        expect(splitChatSegments('Flow:\n\n```json\n{"type":"pipel')).toEqual([{ kind: "text", value: "Flow:" }])
    })

    it("keeps an unparseable fence as text rather than handing bad JSON to the renderer", () => {
        const segments = splitChatSegments("```chart\nnot json at all\n```")

        expect(segments.every((s) => s.kind === "text")).toBe(true)
    })

    it("drops segments that are empty after trimming", () => {
        expect(splitChatSegments("   \n  ")).toEqual([])
    })
})

describe("MLBot panel", () => {
    const source = read("components/ai-chat/mlbot.tsx")
    const panel = source.slice(source.indexOf('role="dialog"'), source.indexOf('role="dialog"') + 700)

    it("fills the whole screen on mobile", () => {
        expect(panel).toContain("inset-0")
        expect(panel).toMatch(/h-dvh|h-\[100dvh\]/)
    })

    it("returns to a bottom-right panel from the sm breakpoint up", () => {
        expect(panel).toContain("sm:inset-auto")
        expect(panel).toContain("sm:right-6")
        expect(panel).toMatch(/sm:bottom-\d/)
        expect(panel).toMatch(/sm:h-\[min\(/)
        expect(panel).toMatch(/sm:w-\[min\(/)
    })

    it("squares off the corners only while it is full-screen", () => {
        expect(panel).toContain("rounded-none")
        expect(panel).toContain("sm:rounded-2xl")
    })

    it("launches from the site logo mark, not a generic chat glyph", () => {
        const launcher = source.slice(source.indexOf("mlbot-launcher"), source.indexOf("mlbot-launcher") + 500)
        expect(launcher).toContain("SiteLogoMark")
    })

    it("renders diagram segments through the blog's chart renderer", () => {
        expect(source).toContain("splitChatSegments")
        expect(source).toMatch(/from "@\/components\/blog\/(charts\/blog-chart|mermaid-diagram)"/)
    })
})

describe("MLBot system prompt", () => {
    const prompt = read("lib/ai/profile-tools.ts")

    it("tells the model how to emit a diagram fence", () => {
        // SYSTEM_PROMPT is a template literal, so its backticks are escaped in source.
        expect(prompt).toContain("\\`\\`\\`chart")
        for (const type of ["pipeline", "comparison", "tree", "pie"]) {
            expect(prompt).toContain(type)
        }
    })
})

describe("MLBot spend governor", () => {
    // Worst-case request against z-ai/glm-4.7-flash ($0.06/M in, $0.40/M out):
    // 4 tool rounds ≈ 15k cumulative input + 4k output.
    const WORST_CASE_USD = (15_000 / 1e6) * 0.06 + (4_000 / 1e6) * 0.4
    const MONTHLY_BUDGET_USD = 5

    it("keeps the daily ceiling inside a $5/month budget", async () => {
        const { CHAT_LIMITS } = await import("@/lib/ai/rate-limit")

        expect(CHAT_LIMITS.global.windowMs).toBe(24 * 60 * 60 * 1000)
        expect(CHAT_LIMITS.global.max * WORST_CASE_USD * 31).toBeLessThanOrEqual(MONTHLY_BUDGET_USD)
    })

    it("still allows a normal visitor's whole conversation in one day", async () => {
        const { CHAT_LIMITS } = await import("@/lib/ai/rate-limit")

        expect(CHAT_LIMITS.global.max).toBeGreaterThanOrEqual(CHAT_LIMITS.cookie.max)
    })

    it("falls back to $0 models so a tripped spend cap does not take the bot down", () => {
        const route = read("app/api/chat/route.ts")
        const models = route.slice(route.indexOf("const MODELS"), route.indexOf("] as const"))

        expect(models.match(/:free/g)?.length).toBeGreaterThanOrEqual(1)
    })
})
