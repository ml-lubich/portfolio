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
import { ToolMemo } from "@/lib/ai/tool-memo"
import {
    emptyStreamState,
    fallbackFromToolPayloads,
    finalizeAssistantTurn,
    formatCascadeFailure,
    ingestCompletionChunk,
    type CascadeAttempt,
} from "@/lib/ai/chat-stream"

export const runtime = "nodejs"
export const maxDuration = 60

/* Free first, then a cheap paid backstop. Each entry is a different lab, so
 * one provider being down, rate-limited or retired does not take the bot with
 * it; `fetchWithFallback` walks the list on any non-2xx.
 *
 * This order REVERSES an earlier one, deliberately, so the tradeoff is on the
 * record. The previous cascade was paid-first on measured first-token latency
 * (ling-3.0-flash 0.77s, glm-4.7-flash 1.45s, qwen3.7-flash 1.69s, free
 * 2.39s) — free models are the slow ones and spend budget on reasoning tokens
 * before emitting an answer. Free-first is the owner's call: the running cost
 * of a portfolio chat should be zero by default, and a free tier that 429s
 * costs one failed round-trip before the paid net catches it. So the panel is
 * slower to first token than it was, and free.
 *
 * The paid backstop is chosen for DURABILITY, not for being cheapest today.
 * All three are open-weight models served by many providers, so a single
 * host withdrawing does not retire the slug — which is exactly how the old
 * last-resort net died (OpenRouter retired `openai/gpt-oss-20b:free` and it
 * began 404ing with "This model is unavailable for free").
 * __tests__/ai-model-slugs.test.ts asserts every slug here still exists
 * upstream and advertises tools, so a retirement fails a test, not production.
 *
 * Every entry is verified for BOTH tool calling and clean output. Models that
 * stream chain-of-thought as ordinary content (nemotron-3.5-lightning,
 * nemotron-3-super-120b) leak the system prompt into the panel and are
 * excluded regardless of capability — reasoning.exclude does not stop them.
 * `nex-agi/nex-n2.5-pro:free` is excluded for worse: asked for the resume it
 * answered "it is on screen and ready to download" without calling the tool,
 * so nothing was on screen. A model that fabricates the result of a lookup is
 * more dangerous than a slow one. */
const MODELS = [
    "inclusionai/ling-3.0-flash-vl:free",
    "cohere/north-mini-code:free",
    "nex-agi/nex-n2.5-mini:free",
    "mistralai/mistral-nemo",
    "openai/gpt-oss-20b",
    "meta-llama/llama-3.1-8b-instruct",
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
                /* Scoped to this request: one conversation's lookups, so a
                   later question still gets fresh data. */
                const memo = new ToolMemo()
                const toolPayloads: string[] = []

                for (let round = 0; round < LIMITS.maxToolRounds; round++) {
                    /* The last round is asked WITHOUT tools. A model that keeps
                       reaching for another lookup burns the budget and the
                       visitor gets an apology while the payloads that answered
                       the question sit in `messages` ("What has Misha built
                       with agents?" — live 2026-09-17). Withholding the tools
                       makes the final round produce prose, not a fifth call. */
                    const lastRound = round === LIMITS.maxToolRounds - 1
                    const reply = await callModel(messages, apiKey, send, !lastRound)
                    const decision = finalizeAssistantTurn(
                        { content: reply.content, tool_calls: reply.tool_calls, followups: reply.followups },
                        toolPayloads,
                    )

                    // Tools keep the loop going. A silent final after a lookup
                    // is not success — write a grounded fallback instead of
                    // `done` with an empty bubble (live 2026-09-14).
                    if (decision.kind !== "tools") {
                        if (decision.kind === "fallback") send("text", decision.text)
                        if (reply.followups?.length) send("followups", reply.followups)
                        send("done", {})
                        controller.close()
                        return
                    }

                    messages.push(reply)

                    for (const call of reply.tool_calls ?? []) {
                        const args = safeParseArgs(call.function.arguments)

                        /* A repeat is served from memory. maxToolRounds caps
                           rounds, not calls — one round can carry several — so
                           without this the model re-asked for the same data
                           until the budget ran out and it gave up. No `tool`
                           event either: nine "Pulling up projects" lines was
                           the same lookup echoed, not nine lookups. */
                        const prior = memo.recall(call.function.name, args)
                        if (prior !== null) {
                            messages.push({
                                role: "tool",
                                tool_call_id: call.id,
                                content: memo.repeatNotice(call.function.name, prior),
                            })
                            continue
                        }

                        send("tool", { name: call.function.name })

                        const result = runTool(call.function.name, args)
                        // Charts render client-side; the model still sees the spec so it
                        // knows what the user is looking at and does not narrate the bars.
                        if ("chart" in result) send("chart", result.chart)
                        // Booking card renders client-side; the model still sees the
                        // spec so it knows the card is on screen and does not paste a URL.
                        if ("booking" in result) send("booking", result.booking)
                        // Same hand-off pattern: the card carries the file and the
                        // address, so the model has nothing left to paste.
                        if ("resume" in result) send("resume", result.resume)
                        if ("contact" in result) send("contact", result.contact)

                        const serialized = JSON.stringify(result).slice(0, 6000)
                        memo.remember(call.function.name, args, serialized)
                        toolPayloads.push(serialized)
                        messages.push({
                            role: "tool",
                            tool_call_id: call.id,
                            content: serialized,
                        })
                    }
                }

                /* Only reachable if the last (tool-free) round returned nothing
                   at all: answer from what the lookups already returned rather
                   than apologising on top of good data. */
                send(
                    "text",
                    toolPayloads.length
                        ? fallbackFromToolPayloads(toolPayloads)
                        : "I looked that up a few different ways but couldn't land on a clean answer. Try asking more specifically?",
                )
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
    withTools = true,
): Promise<ChatMessage & { followups?: string[] }> {
    const res = await fetchWithFallback(messages, apiKey, withTools)

    const reader = res.body?.getReader()
    if (!reader) throw new Error("No response body from the model.")

    const decoder = new TextDecoder()
    let buffer = ""
    // Strips the trailing FOLLOWUPS: line before any of it reaches the client.
    const followupFilter = new FollowupStream()
    const state = emptyStreamState()

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

            let parsed: unknown
            try {
                parsed = JSON.parse(payload)
            } catch {
                continue
            }

            const before = state.content
            ingestCompletionChunk(state, parsed)
            const added = state.content.slice(before.length)
            if (added) {
                const visible = followupFilter.push(added)
                if (visible) send("text", visible)
            }
        }
    }

    const { tail, followups } = followupFilter.finish()
    if (tail) send("text", tail)

    const calls = [...state.toolCalls.values()].filter((c) => c.function.name)
    return {
        role: "assistant",
        // The model's own transcript keeps the raw text; only the user's view is filtered.
        content: state.content,
        ...(calls.length ? { tool_calls: calls } : {}),
        ...(followups.length ? { followups } : {}),
    }
}

/** Tries each model in order; a model being down or rate-limited moves to the next. */
async function fetchWithFallback(messages: ChatMessage[], apiKey: string, withTools = true): Promise<Response> {
    const attempts: CascadeAttempt[] = []

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
                ...(withTools ? { tools: TOOL_SCHEMAS, tool_choice: "auto" } : {}),
                stream: true,
                // Honoured by providers that separate reasoning tokens; models
                // that ignore it are kept out of MODELS entirely.
                reasoning: { exclude: true },
                max_tokens: LIMITS.maxTokens,
                temperature: 0.3,
            }),
        })

        if (res.ok && res.body) return res
        attempts.push({ model, status: res.status, body: (await res.text()).slice(0, 200) })
    }

    throw new Error(formatCascadeFailure(attempts))
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
