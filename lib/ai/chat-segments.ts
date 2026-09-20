/**
 * Splits an MLBot reply into prose and diagram segments.
 *
 * The model draws flows two ways:
 * 1. ```chart / ```json fences with BlogChart JSON (pipeline | comparison | tree | pie)
 * 2. ```mermaid fences with native Mermaid DSL (graph TD, flowchart LR, …)
 *
 * The panel streams tokens, so a fence is routinely half-written — an unclosed
 * fence is withheld until its closing backticks arrive rather than shown as raw JSON.
 *
 * Models also print JSON with no fence at all, most often the chart *tool's*
 * own spec (`{"type":"bar",…}`) tacked onto the end of an answer. That chart
 * already arrived over the `chart` SSE event, so the object is a duplicate —
 * it is dropped, not shown.
 */

import { isChartToolPayload, stripImageArtifacts, stripToolCallLeaks, endOfJsonValue } from "@/lib/ai/chart-leak"
import { isMermaidDsl } from "@/lib/ai/mermaid-dsl"
import type { ChartSpec } from "@/lib/ai/profile-tools"

export type ChatSegment =
    | { kind: "text"; value: string }
    | { kind: "diagram"; json: string }
    | { kind: "mermaid"; source: string }
    /** A fenced bar/line/radar spec the model typed itself. Rendered with the
     *  same `ChatChart` as a tool chart; the panel skips it when a tool chart
     *  with the same title already arrived. */
    | { kind: "chart"; spec: ChartSpec }

/** Any fenced block. The label is a hint the model gets wrong (```json is
 *  common), so the payload decides whether it is a diagram. */
const FENCE = /```([a-z]*)\s*\n([\s\S]*?)```/gi

/** The shapes `BlogChart` knows how to draw. */
const CHART_TYPES = new Set(["pipeline", "comparison", "tree", "pie"])

/** The shapes the `chart` tool draws. Bare (unfenced) copies are duplicates
 *  of a tool chart and are dropped; a *fenced* one is the model drawing the
 *  chart itself, with no tool call behind it, so it renders. */
const TOOL_CHART_TYPES = new Set(["bar", "line", "radar"])

/** A JSON object opening at the start of a line, e.g. a spec the model typed
 *  out as prose. */
const BARE_JSON = /(?:^|\n)[ \t]*(\[)?\{"/g
const INLINE_CODE = /`([^`\n]+)`/g

type Verdict = "diagram" | "mermaid" | "chart" | "drop" | "text"

function classifyJson(json: string): Verdict {
    let parsed: unknown
    try {
        parsed = JSON.parse(json)
    } catch {
        return isMermaidDsl(json) ? "mermaid" : "text"
    }
    if (isChartToolPayload(parsed)) return "drop"
    const type = (parsed as { type?: unknown }).type
    if (typeof type === "string" && CHART_TYPES.has(type)) return "diagram"
    return "text"
}

function classifyFence(lang: string, body: string): Verdict {
    const trimmed = body.trim()
    const jsonVerdict = classifyJson(trimmed)
    if (jsonVerdict === "diagram") return "diagram"
    if (jsonVerdict === "drop") return parseChartSpec(trimmed) ? "chart" : "drop"
    if (isMermaidDsl(trimmed)) return "mermaid"
    if (lang === "mermaid") return "drop"
    if (lang === "chart" || lang === "json" || lang === "diagram") return "drop"
    return "text"
}

/** Index just past the object opening at `start`, or -1 while it is still
 *  streaming. Brace counting skips braces inside strings. */
function stripImages(s: string): string {
    return stripToolCallLeaks(stripImageArtifacts(s)).replace(/[ \t]{2,}/g, " ")
}

function pushText(out: ChatSegment[], raw: string) {
    const value = stripImages(raw).trim()
    if (value) out.push({ kind: "text", value })
}

/** `{"type":"bar","title":…,"data":[{label,value}]}` → ChartSpec, or null
 *  when the shape is not something ChatChart can draw. */
export function parseChartSpec(json: string): ChartSpec | null {
    let obj: unknown
    try {
        obj = JSON.parse(json)
    } catch {
        return null
    }
    if (!obj || typeof obj !== "object") return null
    const { kind, type, title, unit, data } = obj as Record<string, unknown>
    const rawKind = kind ?? type
    if (typeof rawKind !== "string" || !TOOL_CHART_TYPES.has(rawKind)) return null
    if (!Array.isArray(data)) return null
    const rows = data.filter(
        (d): d is { label: string; value: number } =>
            !!d && typeof d === "object" && typeof (d as { label?: unknown }).label === "string" && typeof (d as { value?: unknown }).value === "number",
    )
    if (!rows.length) return null
    return {
        kind: rawKind as ChartSpec["kind"],
        title: typeof title === "string" ? title : "",
        ...(typeof unit === "string" ? { unit } : {}),
        data: rows,
    }
}

function pushSegment(out: ChatSegment[], verdict: Verdict, payload: string, fence?: string) {
    if (verdict === "diagram") out.push({ kind: "diagram", json: payload })
    else if (verdict === "mermaid") out.push({ kind: "mermaid", source: payload })
    else if (verdict === "chart") {
        const spec = parseChartSpec(payload)
        if (spec) out.push({ kind: "chart", spec })
    }
    else if (verdict === "text" && fence) pushText(out, fence)
}

function stripInlineChartLeaks(raw: string): string {
    return raw.replace(INLINE_CODE, (whole, body: string) => {
        try {
            return isChartToolPayload(JSON.parse(body)) ? "" : whole
        } catch {
            return whole
        }
    })
}

/** Prose, minus any bare chart object hiding in it. */
function pushProse(out: ChatSegment[], raw: string) {
    const cleaned = stripInlineChartLeaks(raw)
    let cursor = 0
    BARE_JSON.lastIndex = 0

    for (let m = BARE_JSON.exec(cleaned); m; m = BARE_JSON.exec(cleaned)) {
        const start = m[1] ? m.index + m[0].indexOf("[") : m.index + m[0].length - 2
        const end = endOfJsonValue(cleaned, start)

        if (end === -1) {
            pushText(out, cleaned.slice(cursor, start))
            return
        }

        const verdict = classifyJson(cleaned.slice(start, end))
        if (verdict !== "text") {
            pushText(out, cleaned.slice(cursor, start))
            pushSegment(out, verdict, cleaned.slice(start, end))
            cursor = end
        }
        BARE_JSON.lastIndex = end
    }

    pushText(out, cleaned.slice(cursor))
}

export function splitChatSegments(content: string): ChatSegment[] {
    const out: ChatSegment[] = []
    let cursor = 0

    for (const match of content.matchAll(FENCE)) {
        const lang = (match[1] ?? "").toLowerCase()
        const body = match[2].trim()
        pushProse(out, content.slice(cursor, match.index))
        const verdict = classifyFence(lang, body)
        pushSegment(out, verdict, body, match[0])
        cursor = match.index + match[0].length
    }

    const tail = content.slice(cursor)
    // An opening fence with no closer is still streaming — drop the partial.
    const open = tail.search(/```/)
    pushProse(out, open === -1 ? tail : tail.slice(0, open))

    return out
}
