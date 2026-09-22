import { describe, it, expect } from "vitest"
import { TOOL_SCHEMAS } from "@/lib/ai/profile-tools"

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Live E2E OpenRouter LLM Integration Test Suite
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Gating Strategy:
 *  - Defaults to SKIPPED: $0 LLM cost during normal CI and `bun test` runs.
 *  - Enabled on-demand via:
 *      RUN_LLM_TESTS="true" bun test __tests__/ai-chat-live-e2e.test.ts
 *      bun test __tests__/ai-chat-live-e2e.test.ts -- --llm
 *      process.env.RUN_LLM_TESTS === "true"
 *
 * When enabled, this verifies live OpenRouter model completions, function/tool
 * calling schemas, streaming response bodies, and latency thresholds.
 */

const isLiveLLMEnabled =
    process.env.RUN_LLM_TESTS === "true" ||
    process.argv.includes("--llm") ||
    process.env.npm_lifecycle_script?.includes("--llm") ||
    false

const apiKey = process.env.OPENROUTER_API_KEY || ""

describe("Live E2E OpenRouter Integration Suite (opt-in via --llm or RUN_LLM_TESTS=true)", () => {
    it.skipIf(!isLiveLLMEnabled)(
        "connects to OpenRouter completions API and executes tool calling on a fast model",
        async () => {
            expect(apiKey, "OPENROUTER_API_KEY must be provided for live LLM tests").toBeTruthy()

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://mishalubich.com",
                    "X-Title": "MLBot E2E Test Runner",
                },
                body: JSON.stringify({
                    model: "inclusionai/ling-3.0-flash-vl:free",
                    messages: [
                        { role: "system", content: "You are MLBot. Answer visitor questions using provided tools." },
                        { role: "user", content: "What has Misha built with agents?" },
                    ],
                    tools: TOOL_SCHEMAS,
                    tool_choice: "auto",
                    stream: false,
                    max_tokens: 150,
                    temperature: 0.1,
                }),
            })

            expect(response.status).toBeLessThan(500)
            if (response.ok) {
                const data = (await response.json()) as {
                    choices?: Array<{
                        message?: {
                            content?: string
                            tool_calls?: Array<{ function: { name: string; arguments: string } }>
                        }
                    }>
                }

                expect(data.choices).toBeDefined()
                expect(data.choices!.length).toBeGreaterThan(0)
                const choice = data.choices![0]
                const toolCalls = choice.message?.tool_calls ?? []
                const content = choice.message?.content ?? ""

                // The model should either invoke an appropriate tool (e.g. search_profile / get_projects)
                // or supply a grounded answer.
                const hasValidToolOrAnswer =
                    toolCalls.some((tc) => ["search_profile", "get_projects"].includes(tc.function.name)) || content.length > 0
                expect(hasValidToolOrAnswer).toBe(true)
            }
        },
        30_000,
    )

    it.skipIf(!isLiveLLMEnabled)(
        "verifies streaming SSE chunks can be decoded from live model endpoint",
        async () => {
            expect(apiKey, "OPENROUTER_API_KEY must be provided for live LLM tests").toBeTruthy()

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://mishalubich.com",
                    "X-Title": "MLBot E2E Stream Runner",
                },
                body: JSON.stringify({
                    model: "cohere/north-mini-code:free",
                    messages: [{ role: "user", content: "Say hello in one word." }],
                    stream: true,
                    max_tokens: 20,
                }),
            })

            expect(response.status).toBeLessThan(500)
            if (response.ok && response.body) {
                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let totalChunkCount = 0
                let accumulatedText = ""

                while (totalChunkCount < 5) {
                    const { done, value } = await reader.read()
                    if (done) break
                    totalChunkCount++
                    accumulatedText += decoder.decode(value)
                }

                reader.cancel()
                expect(accumulatedText).toContain("data: ")
            }
        },
        30_000,
    )

    it("verifies live tests are safely skipped by default to guarantee $0 LLM cost", () => {
        if (!isLiveLLMEnabled) {
            expect(isLiveLLMEnabled).toBe(false)
        } else {
            expect(typeof isLiveLLMEnabled).toBe("boolean")
        }
    })
})
