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

import { isMermaidDsl } from "@/lib/ai/mermaid-dsl"

export type ChatSegment =
    | { kind: "text"; value: string }
    | { kind: "diagram"; json: string }
    | { kind: "mermaid"; source: string }

/** Any fenced block. The label is a hint the model gets wrong (```json is
 *  common), so the payload decides whether it is a diagram. */
const FENCE = /```([a-z]*)\s*\n([\s\S]*?)```/gi

/** The shapes `BlogChart` knows how to draw. */
const CHART_TYPES = new Set(["pipeline", "comparison", "tree", "pie"])

/** The shapes the `chart` event already rendered — printing them duplicates. */
const TOOL_CHART_TYPES = new Set(["bar", "line", "radar"])

/** A JSON object opening at the start of a line, e.g. a spec the model typed
 *  out as prose. */
const BARE_OBJECT = /(?:^|\n)[ \t]*\{"/g

type Verdict = "diagram" | "mermaid" | "drop" | "text"

function classifyJson(json: string): Verdict {
    let type: unknown
    try {
        type = (JSON.parse(json) as { type?: unknown }).type
    } catch {
        return isMermaidDsl(json) ? "mermaid" : "text"
    }
    if (typeof type !== "string") return "text"
    if (CHART_TYPES.has(type)) return "diagram"
    if (TOOL_CHART_TYPES.has(type)) return "drop"
    return "text"
}

function classifyFence(lang: string, body: string): Verdict {
    const trimmed = body.trim()
    const jsonVerdict = classifyJson(trimmed)
    if (jsonVerdict === "diagram" || jsonVerdict === "drop") return jsonVerdict
    if (isMermaidDsl(trimmed)) return "mermaid"
    // An explicit ```mermaid fence the client cannot render — e.g.
    // xychart-beta's `title`/`x-axis`/`bar` DSL, which MermaidFlowDiagram
    // does not support — must never leak as a raw code block. Unlike
    // ```chart/```json, whose label the model gets wrong constantly, a
    // ```mermaid label is a deliberate diagram attempt: drop it rather
    // than print DSL lines the visitor cannot read.
    if (lang === "mermaid") return "drop"
    return "text"
}

/** Index just past the object opening at `start`, or -1 while it is still
 *  streaming. Brace counting skips braces inside strings. */
function endOfObject(s: string, start: number): number {
    let depth = 0
    let inString = false
    let escaped = false

    for (let i = start; i < s.length; i++) {
        const c = s[i]
        if (inString) {
            if (escaped) escaped = false
            else if (c === "\\") escaped = true
            else if (c === '"') inString = false
            continue
        }
        if (c === '"') inString = true
        else if (c === "{") depth++
        else if (c === "}" && --depth === 0) return i + 1
    }
    return -1
}

/** Markdown image syntax, `![alt](url)` — including the malformed form a
 *  model emits when it tries to "re-draw" a chart that already rendered,
 *  where the "url" is unescaped prose with raw spaces in it. Stripped
 *  wholesale: the alt text is not a caption worth keeping either. */
/** Removes `![alt](target)`, matching the target's parentheses so a model
 *  that writes a whole sentence there — "![Skills](chart above: BI (14),
 *  Platform (12))" — loses all of it, not just up to the first ")". An
 *  unclosed target is left alone. */
function stripMdImages(s: string): string {
    let out = ""
    let i = 0
    for (let start = s.indexOf("![", i); start !== -1; start = s.indexOf("![", i)) {
        const mid = s.indexOf("](", start + 2)
        if (mid === -1 || s.slice(start + 2, mid).includes("]")) {
            out += s.slice(i, start + 2)
            i = start + 2
            continue
        }
        let depth = 0
        let end = mid + 1
        // A real target is short; capping the scan keeps many unclosed "![x](" linear.
        const limit = Math.min(s.length, mid + 500)
        for (; end < limit; end++) {
            if (s[end] === "(") depth++
            else if (s[end] === ")" && --depth === 0) break
        }
        if (end >= limit) {
            out += s.slice(i, start + 2)
            i = start + 2
            continue
        }
        out += s.slice(i, start)
        i = end + 1
    }
    return out + s.slice(i)
}

/** A raw HTML `<img>` tag typed straight into the reply. ReactMarkdown
 *  never turns this into an element (no rehype-raw), but left in place it
 *  still prints as literal tag text — so it is stripped at the source. */
const HTML_IMG = /<img\b[^>]*>/gi

/** Strips both forms, then collapses the double space a removed inline
 *  image leaves behind ("Here: ␣␣as shown" → "Here: as shown"). Only
 *  horizontal runs collapse — newlines are left alone so paragraph and
 *  list structure survives. */
function stripImages(s: string): string {
    return stripMdImages(s).replace(HTML_IMG, "").replace(/[ \t]{2,}/g, " ")
}

function pushText(out: ChatSegment[], raw: string) {
    const value = stripImages(raw).trim()
    if (value) out.push({ kind: "text", value })
}

function pushSegment(out: ChatSegment[], verdict: Verdict, payload: string, fence?: string) {
    if (verdict === "diagram") out.push({ kind: "diagram", json: payload })
    else if (verdict === "mermaid") out.push({ kind: "mermaid", source: payload })
    else if (verdict === "text" && fence) pushText(out, fence)
}

/** Prose, minus any bare chart object hiding in it. */
function pushProse(out: ChatSegment[], raw: string) {
    let cursor = 0
    BARE_OBJECT.lastIndex = 0

    for (let m = BARE_OBJECT.exec(raw); m; m = BARE_OBJECT.exec(raw)) {
        const start = m.index + m[0].length - 2 // the `{` itself
        const end = endOfObject(raw, start)

        // Unterminated: the model is still typing it. Withhold the rest.
        if (end === -1) {
            pushText(out, raw.slice(cursor, start))
            return
        }

        const verdict = classifyJson(raw.slice(start, end))
        if (verdict !== "text") {
            pushText(out, raw.slice(cursor, start))
            pushSegment(out, verdict, raw.slice(start, end))
            cursor = end
        }
        BARE_OBJECT.lastIndex = end
    }

    pushText(out, raw.slice(cursor))
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
