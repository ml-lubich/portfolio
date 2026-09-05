/**
 * Splits an MLBot reply into prose and diagram segments.
 *
 * The model draws flows the same way blog posts do: a ```chart fence holding
 * the BlogChart JSON schema (pipeline | comparison | tree | pie). The panel
 * streams tokens, so a fence is routinely half-written — an unclosed fence is
 * withheld until its closing backticks arrive rather than shown as raw JSON.
 *
 * Models also print JSON with no fence at all, most often the chart *tool's*
 * own spec (`{"type":"bar",…}`) tacked onto the end of an answer. That chart
 * already arrived over the `chart` SSE event, so the object is a duplicate —
 * it is dropped, not shown.
 */

export type ChatSegment =
    | { kind: "text"; value: string }
    | { kind: "diagram"; json: string }

/** Any fenced block. The label is a hint the model gets wrong (```json is
 *  common), so the payload decides whether it is a diagram. */
const FENCE = /```[a-z]*\s*\n([\s\S]*?)```/gi

/** The shapes `BlogChart` knows how to draw. */
const CHART_TYPES = new Set(["pipeline", "comparison", "tree", "pie"])

/** The shapes the `chart` event already rendered — printing them duplicates. */
const TOOL_CHART_TYPES = new Set(["bar", "line", "radar"])

/** A JSON object opening at the start of a line, e.g. a spec the model typed
 *  out as prose. */
const BARE_OBJECT = /(?:^|\n)[ \t]*\{"/g

type Verdict = "diagram" | "drop" | "text"

function classify(json: string): Verdict {
    let type: unknown
    try {
        type = (JSON.parse(json) as { type?: unknown }).type
    } catch {
        return "text"
    }
    if (typeof type !== "string") return "text"
    if (CHART_TYPES.has(type)) return "diagram"
    if (TOOL_CHART_TYPES.has(type)) return "drop"
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

function pushText(out: ChatSegment[], raw: string) {
    const value = raw.trim()
    if (value) out.push({ kind: "text", value })
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

        const verdict = classify(raw.slice(start, end))
        if (verdict !== "text") {
            pushText(out, raw.slice(cursor, start))
            if (verdict === "diagram") out.push({ kind: "diagram", json: raw.slice(start, end) })
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
        const json = match[1].trim()
        pushProse(out, content.slice(cursor, match.index))
        const verdict = classify(json)
        // Bad JSON stays prose: BlogChart would throw on it, and showing what
        // the model actually said beats rendering nothing.
        if (verdict === "diagram") out.push({ kind: "diagram", json })
        else if (verdict === "text") pushText(out, match[0])
        cursor = match.index + match[0].length
    }

    const tail = content.slice(cursor)
    // An opening fence with no closer is still streaming — drop the partial.
    const open = tail.search(/```/)
    pushProse(out, open === -1 ? tail : tail.slice(0, open))

    return out
}
