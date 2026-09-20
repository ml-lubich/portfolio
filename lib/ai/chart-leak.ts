/**
 * Chart tool-result leak detection — shared by server scrub (chat-stream.ts)
 * and client segment splitter (chat-segments.ts).
 */

const TOOL_CHART_KINDS = new Set(["bar", "line", "pie", "radar"])
const DIAGRAM_TYPES = new Set(["pipeline", "comparison", "tree", "pie"])

export function isChartToolPayload(value: unknown): boolean {
    const obj = Array.isArray(value) ? value[0] : value
    if (typeof obj !== "object" || obj === null) return false
    const rec = obj as Record<string, unknown>
    if ("chart" in rec) return true
    if (typeof rec.type === "string" && DIAGRAM_TYPES.has(rec.type)) return false
    const kind = (rec.kind ?? rec.type) as unknown
    if (typeof kind !== "string" || !TOOL_CHART_KINDS.has(kind)) return false
    return Array.isArray(rec.data) || "series" in rec
}

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

const RAW_IMG_TAG = /<img\b[^>]*>/gi

export function stripImageArtifacts(text: string): string {
    return stripMdImages(text).replace(RAW_IMG_TAG, "")
}

export function endOfJsonValue(s: string, start: number): number {
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
        else if (c === "{" || c === "[") depth++
        else if ((c === "}" || c === "]") && --depth === 0) return i + 1
    }
    return -1
}

const FENCE = /```[a-z]*\n([\s\S]*?)```/gi
const BARE_JSON = /(?:^|\n)[ \t]*(\[)?\{"/g
const INLINE_CODE = /`([^`\n]+)`/g
const TOOL_CALL_BLOCK =
    /<\s*tool_call\s*>[\s\S]*?<\s*\/\s*tool_call\s*>|<\s*\/?\s*tool_call\s*>|<\|tool_call\|>/gi

function isJsonChartPayload(candidate: string): boolean {
    try {
        return isChartToolPayload(JSON.parse(candidate))
    } catch {
        return false
    }
}

function stripFencedChartLeaks(text: string): string {
    return text.replace(FENCE, (whole, body: string) => (isJsonChartPayload(body.trim()) ? "" : whole))
}

function stripInlineChartLeaks(text: string): string {
    return text.replace(INLINE_CODE, (whole, body: string) => (isJsonChartPayload(body.trim()) ? "" : whole))
}

function stripBareChartLeaks(text: string): string {
    let out = ""
    let cursor = 0
    BARE_JSON.lastIndex = 0

    for (let m = BARE_JSON.exec(text); m; m = BARE_JSON.exec(text)) {
        const start = m[1] ? m.index + m[0].indexOf("[") : m.index + m[0].length - 2
        const end = endOfJsonValue(text, start)
        if (end === -1) break

        if (isJsonChartPayload(text.slice(start, end))) {
            out += text.slice(cursor, start)
            cursor = end
        }
        BARE_JSON.lastIndex = end
    }

    return out + text.slice(cursor)
}

export function stripToolCallLeaks(text: string): string {
    return text.replace(TOOL_CALL_BLOCK, "")
}

export function stripToolChartLeaks(text: string): string {
    const stripped = stripToolCallLeaks(
        stripImageArtifacts(stripBareChartLeaks(stripInlineChartLeaks(stripFencedChartLeaks(text)))),
    )
    return stripped.replace(/\n{3,}/g, "\n\n").trim()
}

const TOOL_CALL_LEAK = /<\s*\/?\s*tool_call\s*>|<\|tool_call\|>|^\s*\{\s*"name"\s*:\s*"[\w.-]+"\s*,\s*"(arguments|parameters)"\s*:/i

export function isRealAnswer(text: string): boolean {
    return text.length > 0 && !TOOL_CALL_LEAK.test(text)
}
