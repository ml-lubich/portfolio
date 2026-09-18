import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { splitChatSegments } from "@/lib/ai/chat-segments"

/** The MODELS array carries prose that quotes upstream error text and file
 *  paths. Matching strings straight out of the raw slice reads that prose as a
 *  model id — a comment mentioning `a/b` satisfied even the `/`-requiring
 *  pattern. Strip comments before any string match. */
function stripComments(src: string): string {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "")
}

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

    it("renders native Mermaid DSL in a ```mermaid fence as a diagram segment", () => {
        const mermaid = `graph TD
  A["Portfolio"] --> B["Case Triage Agent"]`
        const segments = splitChatSegments(`Overview:\n\n\`\`\`mermaid\n${mermaid}\n\`\`\``)

        expect(segments.map((s) => s.kind)).toEqual(["text", "mermaid"])
        expect(segments[1]).toEqual({ kind: "mermaid", source: mermaid })
    })

    it("drops segments that are empty after trimming", () => {
        expect(splitChatSegments("   \n  ")).toEqual([])
    })
})

/* Live QA 2026-09-18: on the SECOND question of a session after a chart had
 * already been drawn, models tried to "re-draw" it as text — a markdown
 * image (often malformed, with raw spaces in the URL), a raw <img> tag, or
 * an unsupported Mermaid DSL (xychart-beta's `bar`/`title`/`x-axis` lines)
 * printed as a fenced code block. Charts only ever come from the chart SSE
 * event; none of these must reach the transcript. */
describe("splitChatSegments — no re-drawn charts in text", () => {
    it("strips a well-formed markdown image and its alt text", () => {
        const segments = splitChatSegments("Here it is: ![Skills chart](https://example.com/chart.png) as shown.")
        expect(segments).toEqual([{ kind: "text", value: "Here it is: as shown." }])
    })

    it("strips a malformed markdown image whose URL contains raw spaces", () => {
        const segments = splitChatSegments("As shown above: ![Skills chart](chart rendered above) — that's the breakdown.")
        expect(segments).toEqual([{ kind: "text", value: "As shown above: — that's the breakdown." }])
        expect(segments.map((s) => s.value).join("")).not.toContain("![")
    })

    it("strips a raw <img> tag entirely", () => {
        const segments = splitChatSegments('Skills: <img src="chart.png" alt="Skills"> as above.')
        expect(segments).toEqual([{ kind: "text", value: "Skills: as above." }])
    })

    it("drops an unsupported Mermaid DSL fence (xychart-beta) instead of printing it raw", () => {
        const xychart = `xychart-beta
    title "Skills"
    x-axis [Python, Rust, Go]
    bar [90, 80, 70]`
        const segments = splitChatSegments(`Here's the breakdown:\n\n\`\`\`mermaid\n${xychart}\n\`\`\`\n\nPython leads.`)

        expect(segments.map((s) => s.kind)).toEqual(["text", "text"])
        expect(segments[0]).toEqual({ kind: "text", value: "Here's the breakdown:" })
        expect(segments[1]).toEqual({ kind: "text", value: "Python leads." })
        const joined = segments.map((s) => s.value).join(" ")
        expect(joined).not.toContain("xychart-beta")
        expect(joined).not.toContain("x-axis")
    })
})

describe("MLBot panel", () => {
    const source = read("components/ai-chat/mlbot.tsx")
    const panel = source.slice(source.indexOf('role="dialog"'), source.indexOf('role="dialog"') + 700)

    /* iOS Safari zooms the page whenever a focused input renders below 16px,
     * and there is no way to decline it without disabling pinch-zoom for
     * everyone (user-scalable=no fails WCAG 1.4.4). The zoom is not merely
     * ugly: it shrinks the layout viewport under a panel pinned to inset-0,
     * which is what surfaced as "overflow both horizontally and vertically".
     * One cause, three symptoms — so this is the guard for all of them. */
    it("sizes the composer at 16px so iOS cannot zoom the panel on focus", () => {
        const panel = read("components/ai-chat/mlbot.tsx")
        const composer = panel
            .split("\n")
            .find((l) => l.includes("resize-none") && l.includes("flex-1"))
        expect(composer, "composer textarea class list not found").toBeDefined()

        const px = composer!.match(/text-\[([\d.]+)px\]/)
        expect(px, `composer must pin an explicit px font size, got: ${composer?.trim()}`).not.toBeNull()
        expect(
            Number(px![1]),
            "below 16px iOS zooms on focus and the fixed panel overflows",
        ).toBeGreaterThanOrEqual(16)
    })

    /* The panel is inset-0 full-screen on a phone and Escape is the only other
     * way out — which a touch device does not have. Without a visible close
     * control the reader is trapped in the chat. The resize button next to it
     * is deliberately sm:-only, so this must NOT be. */
    it("offers a close control that is visible on a phone, not just at sm and up", () => {
        const panel = read("components/ai-chat/mlbot.tsx")
        const close = panel
            .split("\n")
            .find((l) => /aria-label="(Close|Dismiss)[^"]*"/i.test(l))
        expect(close, "no close control found in the panel header").toBeDefined()

        const idx = panel.split("\n").findIndex((l) => l === close)
        const markup = panel.split("\n").slice(idx - 6, idx + 6).join("\n")
        expect(markup, "the close control must not be hidden below sm").not.toMatch(/\bhidden\b[^"]*\bsm:flex\b/)
    })

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
        // EVERY rung, not just the first — a near-full-screen rung that dropped
        // the sm: prefix would take the phone's full-screen layout with it.
        for (const rung of sizes.split("\n").filter((l) => l.includes("sm:h-"))) {
            expect(rung, `rung is not a bottom-right sm footprint: ${rung}`).toMatch(/sm:h-\[min\(.*sm:w-\[min\(/)
        }
    })

    /* "Almost full screen if we expand the chat" — a rung you climb to, while
     * the default stays a panel. Mobile is untouched: it is inset-0 already. */
    it("offers a near-full-screen rung on a laptop without making it the default", () => {
        const sizes = source.slice(source.indexOf("const PANEL_SIZES"), source.indexOf("] as const"))
        const rungs = sizes.split("\n").filter((l) => l.includes("sm:h-"))
        expect(rungs.length).toBeGreaterThanOrEqual(3)

        // Largest rung: bounded only by the viewport minus the anchor's gutters.
        expect(rungs[rungs.length - 1]).toMatch(/calc\(100dvh-[\d.]+rem\)/)
        expect(rungs[rungs.length - 1]).toMatch(/calc\(100vw-[\d.]+rem\)/)

        // Default stays a panel: the first rung is still capped by a rem width.
        expect(rungs[0]).toMatch(/sm:w-\[min\(3\d(\.\d+)?rem/)
    })

    /* The resize button cycles with (n + 1) % PANEL_SIZES.length. Anything that
     * hard-codes the top rung as index 1 goes stale the moment one is added —
     * the icon and the tooltip would say "Shrink" halfway up the ladder. */
    it("derives the top rung from PANEL_SIZES rather than hard-coding an index", () => {
        const control = source.slice(source.indexOf('aria-label="Resize MLBot"') - 400, source.indexOf('aria-label="Resize MLBot"') + 500)
        expect(control).toContain("(n + 1) % PANEL_SIZES.length")
        expect(control).toContain("PANEL_SIZES.length - 1")
        expect(control, "icon/tooltip must not assume rung 1 is the largest").not.toMatch(/size === 1|size === 0 \?/)
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

    it("renders native Mermaid segments through MermaidFlowDiagram", () => {
        expect(source).toContain("MermaidFlowDiagram")
        expect(source).toMatch(/seg\.kind === "mermaid"/)
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

    it("tells the model charts only come from the chart tools, never re-drawn in text", () => {
        expect(prompt).toMatch(/never draw a chart/i)
        expect(prompt).toMatch(/markdown image/i)
        expect(prompt).toMatch(/already shown/i)
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
        const modelsSrc = read("lib/ai/models.ts")
        const models = stripComments(
            modelsSrc.slice(modelsSrc.indexOf("const MODELS"), modelsSrc.indexOf("] as const")),
        )
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

    it("never lets ReactMarkdown render an <img>, malformed or not", () => {
        // Belt-and-suspenders on top of the text-level strip in chat-segments:
        // the renderer itself must refuse to mount an <img>.
        expect(source).toMatch(/disallowedElements=\{?\[[^\]]*"img"[^\]]*\]/)
        expect(source).toMatch(/unwrapDisallowed/)
    })

    it("never enables raw HTML passthrough (rehype-raw) in the transcript", () => {
        expect(source).not.toMatch(/rehype-raw|rehypeRaw/)
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
    const modelsSrc = read("lib/ai/models.ts")
    const models = stripComments(
        modelsSrc.slice(modelsSrc.indexOf("const MODELS"), modelsSrc.indexOf("] as const")),
    )

    /* Free-first, replacing a fastest-first order that led with a paid model:
     * a portfolio chat should cost nothing to run by default, and the paid tier
     * is a backstop for when the free one 429s. Ordering and lab-diversity are
     * asserted in __tests__/ai-model-slugs.test.ts, which also checks the slugs
     * still exist upstream; this only pins the free-first policy itself. */
    it("leads with free models and keeps a paid backstop behind them", () => {
        const ids = [...models.matchAll(/"([^"]+\/[^"]+)"/g)].map((m) => m[1])
        expect(ids.length).toBeGreaterThanOrEqual(2)
        expect(ids[0].endsWith(":free"), `cascade leads with a paid model: ${ids[0]}`).toBe(true)
        expect(ids.some((i) => !i.endsWith(":free"))).toBe(true)
    })

    /* The backstop is picked for still being there in six months, not for being
     * cheapest this week. Every paid entry is an open-weight model served by
     * several providers, so one host withdrawing does not retire the slug —
     * which is how `openai/gpt-oss-20b:free` died and took the bot with it. */
    it("backstops with open-weight models rather than single-host proprietary ones", () => {
        const ids = [...models.matchAll(/"([^"]+\/[^"]+)"/g)].map((m) => m[1])
        const paid = ids.filter((i) => !i.endsWith(":free"))
        expect(paid.length).toBeGreaterThan(0)
        for (const id of paid) {
            expect(id).toMatch(/^(mistralai|meta-llama|openai\/gpt-oss|qwen|deepseek|z-ai|moonshotai|inclusionai|google\/gemma)/)
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
    const pills = source.slice(source.indexOf("turn.followups?.length"), source.indexOf("turn.followups?.length") + 1600)

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
    // The clamp is the pill LABEL's, not the question's: parseFollowups keeps
    // the model's text whole so tapping the pill sends the real question.
    it("trims the label at a word boundary", async () => {
        const { parseFollowups, clampFollowup } = await import("@/lib/ai/followups")
        const long = "What is inside the SynthData Forge multi agent pipeline exactly and why?"
        expect(parseFollowups(long)).toEqual([long])
        const only = clampFollowup(long)
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
        const pills = source.slice(source.indexOf("turn.followups?.length"), source.indexOf("turn.followups?.length") + 1600)
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

describe("markdown image with parentheses in its target (live 2026-09-18)", () => {
    it("removes the whole image, not just up to the first ')'", () => {
        const text = splitChatSegments("Here is the chart. ![Skills by category](chart above: Analytics & BI (14), Engineering & Platform (12), and Business Systems (7).) Ask about any of them.").map((s) => s.value).join("")
        expect(text).not.toContain("![")
        expect(text).not.toContain("(12)")
        expect(text).toContain("Here is the chart.")
        expect(text).toContain("Ask about any of them.")
    })
})
