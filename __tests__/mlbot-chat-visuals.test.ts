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
        // The width/height pair moved into PANEL_SIZES when the panel became
        // resizable; every rung still has to be a bottom-right sm: footprint.
        const sizes = source.slice(source.indexOf("const PANEL_SIZES"), source.indexOf("] as const"))
        expect(sizes).toMatch(/sm:h-\[min\(/)
        expect(sizes).toMatch(/sm:w-\[min\(/)
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

/* The model sometimes prints the chart tool's own spec as prose — an unfenced
 * `{"type":"bar",…}` object tacked onto the end of a reply. The chart itself
 * already streamed over the `chart` event, so the JSON is a duplicate that
 * renders as a wall of braces. */
describe("splitChatSegments — bare JSON leaks", () => {
    const BAR = '{"type":"bar","title":"Skill Proficiency","data":[{"label":"Python","value":97}]}'
    const BARE_PIPELINE = '{"type":"pipeline","title":"RAG","steps":[{"label":"Ingest"}]}'

    it("drops an unfenced chart-tool spec instead of printing raw JSON", () => {
        const segments = splitChatSegments(`Here are his stats.\n\n${BAR}`)
        expect(segments).toEqual([{ kind: "text", value: "Here are his stats." }])
    })

    it("drops a fenced chart-tool spec too", () => {
        expect(splitChatSegments("Stats:\n\n```json\n" + BAR + "\n```")).toEqual([
            { kind: "text", value: "Stats:" },
        ])
    })

    it("renders an unfenced diagram object rather than dropping it", () => {
        expect(splitChatSegments(`Flow:\n\n${BARE_PIPELINE}`)).toEqual([
            { kind: "text", value: "Flow:" },
            { kind: "diagram", json: BARE_PIPELINE },
        ])
    })

    it("withholds a bare object that is still streaming", () => {
        expect(splitChatSegments('Here are his stats.\n\n{"type":"bar","title":"Skill')).toEqual([
            { kind: "text", value: "Here are his stats." },
        ])
    })

    it("leaves ordinary prose braces alone", () => {
        const text = "Use {curly braces} in the template."
        expect(splitChatSegments(text)).toEqual([{ kind: "text", value: text }])
    })
})

describe("MLBot panel sizing", () => {
    const source = read("components/ai-chat/mlbot.tsx")

    it("lets the reader resize the panel", () => {
        expect(source).toMatch(/PANEL_SIZES|setSize/)
        expect(source).toMatch(/aria-label=\{?`?"?(Shrink|Enlarge|Resize)/i)
    })
})

describe("MLBot horizontal overflow", () => {
    const css = read("app/globals.css")
    const source = read("components/ai-chat/mlbot.tsx")
    const md = css.slice(css.indexOf(".mlbot-md"))

    it("breaks long unbroken strings instead of pushing the panel wide", () => {
        expect(md).toMatch(/overflow-wrap:\s*anywhere/)
    })

    it("scrolls wide tables and code inside their own box", () => {
        expect(md).toMatch(/\.mlbot-md (table|pre)[\s\S]*?overflow-x:\s*auto/)
    })

    it("gives the transcript a min-width floor so flex children can shrink", () => {
        expect(source).toMatch(/overflow-y-auto[^"]*/)
        expect(source).toContain("min-w-0")
    })
})

describe("ChatChart", () => {
    const source = read("components/ai-chat/chat-chart.tsx")

    // --primary is white in dark and near-black in light, so bars rendered as
    // black slabs on a light page. --accent-glow is defined in both themes.
    it("paints series in an accent that survives both themes", () => {
        expect(source).not.toMatch(/(fill|stroke)="hsl\(var\(--primary\)\)"/)
        expect(source).toContain("var(--accent-glow)")
    })

    it("shows every category label instead of letting recharts drop half", () => {
        expect(source).toContain("interval={0}")
    })
})

/* A pie's slice labels sit OUTSIDE the circle by default, so in a 24rem chat
 * panel they run past the card and get clipped by its overflow-hidden — the
 * reader sees "r Quality 33%" and a half-eaten "Hybrid". The legend under the
 * chart already names every slice, so the name outside it was duplication;
 * only the percentage needs to survive, and it survives inside the slice
 * where nothing can bleed. */
describe("PieChartBody labels", () => {
    const source = read("components/blog/charts/pie-chart-body.tsx")

    it("does not print the slice name outside the circle", () => {
        expect(source).not.toMatch(/`\$\{name\}\s*\$\{/)
    })

    it("anchors labels inside the slice so nothing can overflow the card", () => {
        expect(source).toMatch(/textAnchor="middle"/)
        expect(source).toMatch(/midAngle/)
    })

    it("scales the pie to its container instead of a fixed radius", () => {
        expect(source).not.toMatch(/outerRadius=\{\d+\}/)
        expect(source).toMatch(/outerRadius="\d+%"/)
    })
})

/* Blog charts render inside the chat panel too, so their card can no longer be
 * a hard-coded dark slab — on a light page it painted as a black block. The
 * literal it used, hsl(220 20% 6%), is exactly what --card resolves to in dark,
 * so the token is a drop-in that also gets light right. */
describe("BlogChart card is theme-aware", () => {
    const chart = read("components/blog/charts/blog-chart.tsx")
    const pie = read("components/blog/charts/pie-chart-body.tsx")

    it("uses theme tokens rather than a hard-coded dark surface", () => {
        expect(chart).not.toMatch(/bg-\[hsl\(220_20%_6%\)\]/)
        expect(chart).toMatch(/bg-card/)
    })

    it("leaves no hard-coded dark surface in the pie either", () => {
        expect(pie).not.toContain("hsl(220 20% 8%)")
    })
})

/* The model invents tool names (`chart_pie` showed up under a real answer).
 * TOOL_LABELS is the allowlist of what a visitor is shown; anything else is an
 * internal detail they cannot act on, so it is not rendered at all. */
describe("MLBot tool trace", () => {
    const source = read("components/ai-chat/mlbot.tsx")

    it("never prints a raw tool name it has no label for", () => {
        expect(source).not.toMatch(/TOOL_LABELS\[name\]\s*\?\?\s*name/)
        expect(source).toMatch(/TOOL_LABELS\[name\]/)
    })
})

/* Follow-up pills sat on one wrapped line each, text centred, so three of them
 * read as three ragged blobs. They are questions, not buttons — left-aligned
 * and one line each. */
describe("MLBot follow-up pills", () => {
    const source = read("components/ai-chat/mlbot.tsx")
    const pills = source.slice(source.indexOf("turn.followups?.length"), source.indexOf("turn.followups?.length") + 900)

    it("left-aligns the pill text instead of centring wrapped lines", () => {
        expect(pills).toContain("text-left")
    })

    it("stacks them left-packed, one per line, rather than a ragged wrap", () => {
        expect(pills).toMatch(/flex-col[^"]*items-start|items-start[^"]*flex-col/)
    })
})

describe("follow-up prompt", () => {
    it("asks for fragments short enough to fit one line in the panel", async () => {
        const { FOLLOWUP_LIMITS } = await import("@/lib/ai/followups")
        expect(FOLLOWUP_LIMITS.maxChars).toBeLessThanOrEqual(56)
    })

    it("tells the model to write a short fragment, not a full sentence", () => {
        const prompt = read("lib/ai/profile-tools.ts")
        expect(prompt).toMatch(/FOLLOWUPS:[\s\S]{0,600}?(words or fewer|word fragment|at most \d+ words)/)
    })
})

/* Clamping to a character count cut questions mid-word — "What's inside the
 * SynthData Forge multi-agent pipeli…" — which reads as a broken pill rather
 * than a short one. Trim at a word boundary, and let the pill wrap instead of
 * hiding the tail behind an ellipsis. */
describe("follow-up text is never cut mid-word", () => {
    it("trims at a word boundary", async () => {
        const { parseFollowups } = await import("@/lib/ai/followups")
        const long = "What is inside the SynthData Forge multi agent pipeline exactly and why?"
        const [only] = parseFollowups(long)
        expect(only.endsWith("…")).toBe(true)
        // The character before the ellipsis must end a word, not split one.
        // Whatever survives must be a whole-word prefix of the original —
        // no half-word like "pipeli" left in front of the ellipsis.
        const kept = only.slice(0, -1)
        expect(long.startsWith(kept)).toBe(true)
        expect(long[kept.length]).toBe(" ")
    })

    it("drops repeats so the same question cannot appear twice", async () => {
        const { parseFollowups } = await import("@/lib/ai/followups")
        expect(parseFollowups("Same one? | Different? | same one?")).toEqual([
            "Same one?",
            "Different?",
        ])
    })

    it("shows the whole question in the pill rather than clipping it", () => {
        const source = read("components/ai-chat/mlbot.tsx")
        const pills = source.slice(source.indexOf("turn.followups?.length"), source.indexOf("turn.followups?.length") + 900)
        expect(pills).not.toContain("truncate")
        expect(pills).toContain("text-left")
    })
})

/* The Recharts hover tooltip is a floating box positioned at the cursor, so on
 * a 22rem chat card it sat right on top of the ring, hiding the slice it was
 * describing, and its item text stayed Recharts' default #000 (dark on dark).
 * The legend already names every slice; it now also carries the value and
 * share, and hovering a slice highlights its legend row. No box, nothing to
 * clip, nothing that needs its own colour. */
describe("Pie readout lives in the legend, not a floating tooltip", () => {
    const pie = read("components/blog/charts/pie-chart-body.tsx")
    const chart = read("components/blog/charts/blog-chart.tsx")

    it("does not mount a recharts Tooltip over the ring", () => {
        expect(pie).not.toMatch(/<Tooltip/)
        expect(pie).not.toMatch(/\bTooltip\b/)
    })

    it("reports the hovered slice to its parent", () => {
        expect(pie).toMatch(/onMouseEnter=/)
        expect(pie).toMatch(/onMouseLeave=/)
        expect(pie).toMatch(/activeIndex/)
    })

    it("prints each slice's value and share in the legend", () => {
        expect(chart).toMatch(/\{d\.value\}/)
        expect(chart).toMatch(/toFixed\(0\)\}%/)
    })

    it("highlights the hovered slice's legend row", () => {
        expect(chart).toMatch(/useState<number \| null>\(null\)/)
        expect(chart).toMatch(/activeIndex === i/)
    })
})
