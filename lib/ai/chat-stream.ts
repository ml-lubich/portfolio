/**
 * ─── OpenRouter stream + empty-final recovery ─────────────────────────
 *
 * Production 2026-09-14: MLBot called search_profile + get_projects, then
 * streamed `event: done` with no text. Two independent causes:
 *
 * 1. Some models put the answer on `choices[0].message` and never emit a
 *    `delta.content` string. Reading only deltas drops a real reply.
 * 2. Some models call tools, get the payload, and then emit nothing. A
 *    silent final after tools is not success — we write a grounded fallback
 *    from the tool JSON rather than a blank bubble.
 *
 * Cascade failures used to overwrite `lastError` each attempt, so the panel
 * named the last slug and hid why the earlier ones died.
 */

export interface StreamToolCall {
    id: string
    type: "function"
    function: { name: string; arguments: string }
}

export interface StreamState {
    content: string
    toolCalls: Map<number, StreamToolCall>
}

export function emptyStreamState(): StreamState {
    return { content: "", toolCalls: new Map() }
}

export function ingestCompletionChunk(state: StreamState, chunk: unknown): void {
    if (typeof chunk !== "object" || chunk === null) return
    const choice = (chunk as { choices?: unknown[] }).choices?.[0]
    if (typeof choice !== "object" || choice === null) return

    const delta = (choice as { delta?: unknown }).delta
    const message = (choice as { message?: unknown }).message

    const deltaContent = readContent(field(delta, "content"))
    if (deltaContent) state.content += deltaContent
    else if (!state.content) {
        const messageContent = readContent(field(message, "content"))
        if (messageContent) state.content = messageContent
    }

    applyToolFragments(state, field(delta, "tool_calls"))
    if (state.toolCalls.size === 0) applyToolFragments(state, field(message, "tool_calls"))
}

function field(obj: unknown, key: string): unknown {
    if (typeof obj !== "object" || obj === null) return undefined
    return (obj as Record<string, unknown>)[key]
}

function readContent(value: unknown): string {
    if (typeof value === "string") return value
    if (!Array.isArray(value)) return ""
    return value
        .map((part) => {
            if (typeof part === "string") return part
            if (typeof part === "object" && part !== null && typeof (part as { text?: unknown }).text === "string") {
                return (part as { text: string }).text
            }
            return ""
        })
        .join("")
}

function applyToolFragments(state: StreamState, raw: unknown): void {
    if (!Array.isArray(raw)) return
    for (const frag of raw) {
        if (typeof frag !== "object" || frag === null) continue
        const index = typeof (frag as { index?: unknown }).index === "number" ? (frag as { index: number }).index : 0
        const existing = state.toolCalls.get(index) ?? {
            id: "",
            type: "function" as const,
            function: { name: "", arguments: "" },
        }
        const id = (frag as { id?: unknown }).id
        if (typeof id === "string" && id) existing.id = id
        const fn = (frag as { function?: unknown }).function
        if (typeof fn === "object" && fn !== null) {
            const name = (fn as { name?: unknown }).name
            const args = (fn as { arguments?: unknown }).arguments
            if (typeof name === "string" && name) existing.function.name = name
            if (typeof args === "string" && args) existing.function.arguments += args
        }
        state.toolCalls.set(index, existing)
    }
}

export interface AssistantTurn {
    content: string
    tool_calls?: StreamToolCall[]
    followups?: string[]
}

export type TurnDecision =
    | { kind: "tools" }
    | { kind: "answer"; text: string }
    | { kind: "fallback"; text: string }

/** After a model round: keep looping, accept the text, or recover from silence.
 *
 * `sawVisual` covers chart/booking/resume/contact cards: the client already
 * rendered something real for the tool call that just ran, so a silent final
 * reply is not a failure to recover from — it is a model that (correctly)
 * had nothing left to say. Live 2026-09-18: "Show his skills as a chart"
 * rendered the chart, then the fallback line printed underneath it anyway. */
export function finalizeAssistantTurn(
    reply: AssistantTurn,
    toolPayloads: string[],
    sawVisual = false,
): TurnDecision {
    if (reply.tool_calls?.length) return { kind: "tools" }
    const text = reply.content.trim()
    if (text) return { kind: "answer", text: reply.content }
    if (sawVisual) return { kind: "answer", text: "" }
    if (toolPayloads.length) return { kind: "fallback", text: fallbackFromToolPayloads(toolPayloads) }
    return { kind: "answer", text: "" }
}

/** A silent final after tools still needs a grounded reply, but never a raw
 *  hit-list with typed bullets — that reads as an answer the model wrote,
 *  when nothing actually wrote one. A short prose sentence instead, same
 *  spirit as jheupler-site's fix: name what was found, point at a way
 *  forward. */
export function fallbackFromToolPayloads(payloads: string[]): string {
    const fromMatchProjects = collectMatchProjects(payloads)
    const names = fromMatchProjects.length ? fromMatchProjects : collectNames(payloads, "projects")
    const items = names.length ? names : collectExperience(payloads)
    if (!items.length) {
        return "I looked that up but the write-up did not come back. Ask again, or name a project."
    }
    return `I found ${toProseList(items.slice(0, 3))} in the profile — ask about any of them.`
}

function toProseList(items: string[]): string {
    if (items.length === 1) return items[0]
    if (items.length === 2) return `${items[0]} and ${items[1]}`
    return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`
}

function collectMatchProjects(payloads: string[]): string[] {
    const names: string[] = []
    for (const raw of payloads) {
        const data = parseJson(raw)
        const rows = data?.matches
        if (!Array.isArray(rows)) continue
        for (const row of rows) {
            if (typeof row !== "object" || row === null) continue
            const rec = row as Record<string, unknown>
            if (rec.kind !== "project") continue
            if (typeof rec.name === "string" && rec.name.trim()) names.push(rec.name.trim())
        }
    }
    return [...new Set(names)].slice(0, 8)
}

function collectNames(payloads: string[], key: "matches" | "projects"): string[] {
    const names: string[] = []
    for (const raw of payloads) {
        const data = parseJson(raw)
        const rows = data?.[key]
        if (!Array.isArray(rows)) continue
        for (const row of rows) {
            if (typeof row !== "object" || row === null) continue
            const rec = row as Record<string, unknown>
            const name = rec.name ?? rec.role ?? rec.title ?? rec.category
            if (typeof name === "string" && name.trim()) names.push(name.trim())
        }
    }
    return [...new Set(names)].slice(0, 8)
}

function collectExperience(payloads: string[]): string[] {
    const names: string[] = []
    for (const raw of payloads) {
        const data = parseJson(raw)
        const rows = data?.experience
        if (!Array.isArray(rows)) continue
        for (const row of rows) {
            if (typeof row !== "object" || row === null) continue
            const rec = row as Record<string, unknown>
            if (typeof rec.role === "string" && typeof rec.company === "string") {
                names.push(`${rec.role} at ${rec.company}`)
            }
        }
    }
    return [...new Set(names)].slice(0, 8)
}

function parseJson(raw: string): Record<string, unknown> | null {
    try {
        const parsed = JSON.parse(raw) as unknown
        return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null
    } catch {
        return null
    }
}

export interface CascadeAttempt {
    model: string
    status: number
    body: string
}

export function formatCascadeFailure(attempts: CascadeAttempt[]): string {
    if (!attempts.length) return "No model responded."
    return attempts.map((a) => `${a.model}: ${a.status} ${a.body.slice(0, 200)}`).join(" | ")
}
