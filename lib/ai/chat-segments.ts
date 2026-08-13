/**
 * Splits an MLBot reply into prose and diagram segments.
 *
 * The model draws flows the same way blog posts do: a ```chart fence holding
 * the BlogChart JSON schema (pipeline | comparison | tree | pie). The panel
 * streams tokens, so a fence is routinely half-written — an unclosed fence is
 * withheld until its closing backticks arrive rather than shown as raw JSON.
 */

export type ChatSegment =
    | { kind: "text"; value: string }
    | { kind: "diagram"; json: string }

/** Any fenced block. The label is a hint the model gets wrong (```json is
 *  common), so the payload decides whether it is a diagram. */
const FENCE = /```[a-z]*\s*\n([\s\S]*?)```/gi

/** The shapes `BlogChart` knows how to draw. */
const CHART_TYPES = new Set(["pipeline", "comparison", "tree", "pie"])

function pushText(out: ChatSegment[], raw: string) {
    const value = raw.trim()
    if (value) out.push({ kind: "text", value })
}

function isRenderable(json: string): boolean {
    try {
        const parsed = JSON.parse(json) as { type?: unknown }
        return typeof parsed?.type === "string" && CHART_TYPES.has(parsed.type)
    } catch {
        return false
    }
}

export function splitChatSegments(content: string): ChatSegment[] {
    const out: ChatSegment[] = []
    let cursor = 0

    for (const match of content.matchAll(FENCE)) {
        const json = match[1].trim()
        pushText(out, content.slice(cursor, match.index))
        // Bad JSON stays prose: BlogChart would throw on it, and showing what
        // the model actually said beats rendering nothing.
        if (isRenderable(json)) out.push({ kind: "diagram", json })
        else pushText(out, match[0])
        cursor = match.index + match[0].length
    }

    const tail = content.slice(cursor)
    // An opening fence with no closer is still streaming — drop the partial.
    const open = tail.search(/```/)
    pushText(out, open === -1 ? tail : tail.slice(0, open))

    return out
}
