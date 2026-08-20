/**
 * ─── MLBot chat endpoint ──────────────────────────────────────────────
 *
 * Streams an agentic loop (model → tool calls → model → …) over OpenRouter
 * and emits SSE frames the client renders incrementally.
 *
 * Every request passes the adversarial limiter in `lib/ai/rate-limit` first;
 * this endpoint spends real money, so the limiter is the security boundary.
 */

import { NextRequest } from "next/server"
import { runTool, TOOL_SCHEMAS, SYSTEM_PROMPT } from "@/lib/ai/profile-tools"
import { checkRateLimit, clientIp, buildCookie, acquireSlot, COOKIE_NAME } from "@/lib/ai/rate-limit"
import { FollowupStream } from "@/lib/ai/followups"

export const runtime = "nodejs"
export const maxDuration = 60

/** Chinese open-weight models only, cheapest-with-tool-support first. Each
 *  fallback is a different lab, so one provider being down or rate-limited
 *  does not take the bot with it. */
const MODELS = [
    "qwen/qwen3-30b-a3b-instruct-2507",
    "z-ai/glm-4.7-flash",
    "deepseek/deepseek-v4-flash",
] as const

const LIMITS = {
    maxMessageChars: 1000,
    maxHistory: 12,
    maxToolRounds: 4,
    maxTokens: 800,
} as const

interface ChatMessage {
    role: "user" | "assistant" | "system" | "tool"
    content: string
    tool_calls?: ToolCall[]
    tool_call_id?: string
}

interface ToolCall {
    id: string
    type: "function"
    function: { name: string; arguments: string }
}

export async function POST(req: NextRequest) {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) return json({ error: "Chat is not configured." }, 503)

    const gate = checkRateLimit(clientIp(req.headers), req.cookies.get(COOKIE_NAME)?.value)
    if (!gate.ok) {
        return json(
            { error: rateLimitMessage(gate.reason), retryAfter: gate.retryAfterSec },
            429,
            { "Retry-After": String(gate.retryAfterSec) },
        )
    }

    // Request counts alone do not bound concurrent work: one client can hold
    // many streams open at once. Take a slot or refuse.
    const release = acquireSlot(clientIp(req.headers))
    if (!release) {
        return json({ error: "You already have a message in flight. Wait for it to finish." }, 429, {
            "Retry-After": "5",
        })
    }

    const history = parseHistory(await readJson(req))
    if (history.length === 0) {
        release()
        return json({ error: "Send a message." }, 400)
    }

    const stream = runAgent(history, apiKey, release)
    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-store, no-transform",
            Connection: "keep-alive",
            "Set-Cookie": buildCookie(gate.cookie),
            "X-RateLimit-Remaining": String(gate.remaining),
        },
    })
}

/* ── Agent loop ──────────────────────────────────────────────────────── */

function runAgent(history: ChatMessage[], apiKey: string, release: () => void): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder()

    return new ReadableStream({
        async start(controller) {
            const send = (event: string, data: unknown) => {
                controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
            }

            const messages: ChatMessage[] = [{ role: "system", content: SYSTEM_PROMPT }, ...history]

            try {
                for (let round = 0; round < LIMITS.maxToolRounds; round++) {
                    const reply = await callModel(messages, apiKey, send)

                    // No tool calls means the model produced its final answer.
                    if (!reply.tool_calls?.length) {
                        if (reply.followups?.length) send("followups", reply.followups)
                        send("done", {})
                        controller.close()
                        return
                    }

                    messages.push(reply)

                    for (const call of reply.tool_calls) {
                        const args = safeParseArgs(call.function.arguments)
                        send("tool", { name: call.function.name })

                        const result = runTool(call.function.name, args)
                        // Charts render client-side; the model still sees the spec so it
                        // knows what the user is looking at and does not narrate the bars.
                        if ("chart" in result) send("chart", result.chart)

                        messages.push({
                            role: "tool",
                            tool_call_id: call.id,
                            content: JSON.stringify(result).slice(0, 6000),
                        })
                    }
                }

                // Tool budget exhausted — say so rather than looping forever.
                send("text", "I looked that up a few different ways but couldn't land on a clean answer. Try asking more specifically?")
                send("done", {})
                controller.close()
            } catch (err) {
                send("error", { message: err instanceof Error ? err.message : "Chat failed." })
                controller.close()
            } finally {
                // Always give the concurrency slot back, including on error or
                // client disconnect — otherwise an IP leaks slots until restart.
                release()
            }
        },
    })
}

/** Calls the model, streaming text deltas out as they arrive; returns the assembled reply. */
async function callModel(
    messages: ChatMessage[],
    apiKey: string,
    send: (event: string, data: unknown) => void,
): Promise<ChatMessage & { followups?: string[] }> {
    const res = await fetchWithFallback(messages, apiKey)

    const reader = res.body?.getReader()
    if (!reader) throw new Error("No response body from the model.")

    const decoder = new TextDecoder()
    let buffer = ""
    let content = ""
    // Strips the trailing FOLLOWUPS: line before any of it reaches the client.
    const followupFilter = new FollowupStream()
    const toolCalls = new Map<number, ToolCall>()

    for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const payload = line.slice(6).trim()
            if (payload === "[DONE]") continue

            let delta: Record<string, unknown>
            try {
                const parsed = JSON.parse(payload)
                delta = parsed?.choices?.[0]?.delta ?? {}
            } catch {
                continue
            }

            if (typeof delta.content === "string" && delta.content) {
                content += delta.content
                const visible = followupFilter.push(delta.content)
                if (visible) send("text", visible)
            }

            // Tool calls stream in fragments keyed by index; stitch them back together.
            for (const frag of (delta.tool_calls as ToolCallFragment[] | undefined) ?? []) {
                const existing = toolCalls.get(frag.index) ?? {
                    id: "",
                    type: "function" as const,
                    function: { name: "", arguments: "" },
                }
                if (frag.id) existing.id = frag.id
                if (frag.function?.name) existing.function.name = frag.function.name
                if (frag.function?.arguments) existing.function.arguments += frag.function.arguments
                toolCalls.set(frag.index, existing)
            }
        }
    }

    const { tail, followups } = followupFilter.finish()
    if (tail) send("text", tail)

    const calls = [...toolCalls.values()].filter((c) => c.function.name)
    return {
        role: "assistant",
        // The model's own transcript keeps the raw text; only the user's view is filtered.
        content,
        ...(calls.length ? { tool_calls: calls } : {}),
        ...(followups.length ? { followups } : {}),
    }
}

interface ToolCallFragment {
    index: number
    id?: string
    function?: { name?: string; arguments?: string }
}

/** Tries each model in order; a model being down or rate-limited moves to the next. */
async function fetchWithFallback(messages: ChatMessage[], apiKey: string): Promise<Response> {
    let lastError = "No model responded."

    for (const model of MODELS) {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://mishalubich.com",
                "X-Title": "MLBot - mishalubich.com",
            },
            body: JSON.stringify({
                model,
                messages,
                tools: TOOL_SCHEMAS,
                tool_choice: "auto",
                stream: true,
                max_tokens: LIMITS.maxTokens,
                temperature: 0.3,
            }),
        })

        if (res.ok && res.body) return res
        lastError = `${model}: ${res.status} ${(await res.text()).slice(0, 200)}`
    }

    throw new Error(lastError)
}

/* ── Input handling ──────────────────────────────────────────────────── */

async function readJson(req: NextRequest): Promise<unknown> {
    try {
        return await req.json()
    } catch {
        return {}
    }
}

/** Trusts nothing from the client: roles, lengths and history depth are all clamped. */
function parseHistory(body: unknown): ChatMessage[] {
    if (typeof body !== "object" || body === null) return []
    const raw = (body as { messages?: unknown }).messages
    if (!Array.isArray(raw)) return []

    const clean: ChatMessage[] = []
    for (const m of raw.slice(-LIMITS.maxHistory)) {
        if (typeof m !== "object" || m === null) continue
        const { role, content } = m as { role?: unknown; content?: unknown }
        // Only user/assistant turns survive — a client cannot inject a system prompt.
        if (role !== "user" && role !== "assistant") continue
        if (typeof content !== "string" || !content.trim()) continue
        clean.push({ role, content: content.slice(0, LIMITS.maxMessageChars) })
    }
    return clean
}

function safeParseArgs(raw: string): Record<string, unknown> {
    try {
        const parsed = JSON.parse(raw || "{}")
        return typeof parsed === "object" && parsed !== null ? parsed : {}
    } catch {
        return {}
    }
}

function rateLimitMessage(reason: "burst" | "cookie" | "ip" | "global" | "replay"): string {
    if (reason === "burst") return "Slow down a moment — too many messages at once."
    if (reason === "global") return "MLBot is at capacity right now. Try again later."
    if (reason === "replay") return "That session looks stale. Reload the page and try again."
    return "You've hit the hourly message limit. Try again a bit later, or email Misha directly."
}

function json(body: unknown, status: number, headers: Record<string, string> = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...headers },
    })
}
