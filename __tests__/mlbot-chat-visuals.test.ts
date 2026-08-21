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
    // Worst-case request against the dearest model in the roster,
    // deepseek-v4-flash ($0.14/M in, $0.28/M out): 4 tool rounds ≈ 15k
    // cumulative input + 4k output.
    const WORST_CASE_USD = (15_000 / 1e6) * 0.14 + (4_000 / 1e6) * 0.28
    const MONTHLY_BUDGET_USD = 10

    it("keeps the daily ceiling inside a $5/month budget", async () => {
        const { CHAT_LIMITS } = await import("@/lib/ai/rate-limit")

        expect(CHAT_LIMITS.global.windowMs).toBe(24 * 60 * 60 * 1000)
        expect(CHAT_LIMITS.global.max * WORST_CASE_USD * 31).toBeLessThanOrEqual(MONTHLY_BUDGET_USD)
    })

    it("still allows a normal visitor's whole conversation in one day", async () => {
        const { CHAT_LIMITS } = await import("@/lib/ai/rate-limit")

        expect(CHAT_LIMITS.global.max).toBeGreaterThanOrEqual(CHAT_LIMITS.cookie.max)
    })

    it("keeps more than one lab in the roster so an outage is not an outage", () => {
        const route = read("app/api/chat/route.ts")
        const models = route.slice(route.indexOf("const MODELS"), route.indexOf("] as const"))
        const labs = new Set([...models.matchAll(/"([^"]+)\//g)].map((m) => m[1]))

        expect(labs.size).toBeGreaterThanOrEqual(2)
    })
})

describe("MLBot transcript", () => {
    const source = read("components/ai-chat/mlbot.tsx")

    it("renders replies as markdown, not raw asterisks", () => {
        expect(source).toMatch(/react-markdown/)
        expect(source).toMatch(/remark-gfm/)
    })

    it("reuses the markdown stack the blog already depends on", async () => {
        const pkg = JSON.parse(read("package.json"))
        expect(pkg.dependencies["react-markdown"]).toBeDefined()
        expect(pkg.dependencies["remark-gfm"]).toBeDefined()
    })

    it("follows the stream to the bottom as tokens arrive", () => {
        expect(source).toContain("isPinnedToBottom")
    })
})

describe("isPinnedToBottom", () => {
    it("is true at the bottom", async () => {
        const { isPinnedToBottom } = await import("@/lib/ai/chat-scroll")
        expect(isPinnedToBottom({ scrollTop: 900, scrollHeight: 1000, clientHeight: 100 })).toBe(true)
    })

    it("is true just above the bottom, inside the slack", async () => {
        const { isPinnedToBottom } = await import("@/lib/ai/chat-scroll")
        expect(isPinnedToBottom({ scrollTop: 860, scrollHeight: 1000, clientHeight: 100 })).toBe(true)
    })

    it("is false once the reader has scrolled up to re-read", async () => {
        const { isPinnedToBottom } = await import("@/lib/ai/chat-scroll")
        expect(isPinnedToBottom({ scrollTop: 200, scrollHeight: 1000, clientHeight: 100 })).toBe(false)
    })
})

describe("MLBot model roster", () => {
    const route = read("app/api/chat/route.ts")
    const models = route.slice(route.indexOf("const MODELS"), route.indexOf("] as const"))

    /* Free tiers carry normal traffic, so spend stays near zero; the paid
     * fallback tier is where the Chinese open-weight preference still applies.
     * Both cannot hold at once — OpenRouter currently ships no free Chinese
     * model with tool calling, so the free entries are necessarily other
     * vendors, chosen for clean (non-chain-of-thought) output. */
    it("is ordered fastest-first, with a free model kept as a net", () => {
        const ids = [...models.matchAll(/"([^"]+\/[^"]+)"/g)].map((m) => m[1])
        expect(ids.length).toBeGreaterThanOrEqual(2)
        expect(ids[0]).toBe("inclusionai/ling-3.0-flash")
        expect(ids.some((i) => i.endsWith(":free"))).toBe(true)
    })

    it("keeps every paid model Chinese open-weight", () => {
        const ids = [...models.matchAll(/"([^"]+\/[^"]+)"/g)].map((m) => m[1])
        const paid = ids.filter((i) => !i.endsWith(":free"))
        expect(paid.length).toBeGreaterThan(0)
        for (const id of paid) {
            expect(id).toMatch(/^(z-ai|qwen|deepseek|moonshotai|minimax|inclusionai)\//)
        }
    })

    it("streams rather than waiting for the whole reply", () => {
        expect(route).toContain("stream: true")
    })
})
