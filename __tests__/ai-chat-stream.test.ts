import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
    emptyStreamState,
    fallbackFromToolPayloads,
    finalizeAssistantTurn,
    formatCascadeFailure,
    ingestCompletionChunk,
} from "@/lib/ai/chat-stream"

/**
 * Live mishalubich.com 2026-09-14 streamed:
 *
 *   event: tool  search_profile
 *   event: tool  get_projects
 *   event: done  {}
 *
 * HTTP 200, cascade intact, no text. The visitor saw the two lookup labels
 * and a blank bubble. These tests pin the three ways that happens: a stream
 * that only writes `choices[0].message` (never `delta`), a model that
 * returns empty after tools, and a cascade that reports only the last error.
 */

describe("OpenRouter stream ingest", () => {
    it("still stitches fragmented delta tool calls", () => {
        const state = emptyStreamState()
        ingestCompletionChunk(state, {
            choices: [{ delta: { tool_calls: [{ index: 0, id: "c1", function: { name: "search_profile", arguments: "" } }] } }],
        })
        ingestCompletionChunk(state, {
            choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: '{"query":"agents"}' } }] } }],
        })
        const calls = [...state.toolCalls.values()]
        expect(calls).toHaveLength(1)
        expect(calls[0].function.name).toBe("search_profile")
        expect(calls[0].function.arguments).toBe('{"query":"agents"}')
    })

    it("reads text from a final message.content when no delta ever arrived", () => {
        /* Several OpenRouter free models stream empty deltas after tools and
         * put the answer only on the terminal `message` object. Ignoring that
         * field is how a 200 becomes a blank bubble. */
        const state = emptyStreamState()
        ingestCompletionChunk(state, { choices: [{ delta: { role: "assistant", content: null } }] })
        ingestCompletionChunk(state, {
            choices: [
                {
                    delta: {},
                    message: { role: "assistant", content: "He shipped Case Triage Agent and imsg-mcp." },
                    finish_reason: "stop",
                },
            ],
        })
        expect(state.content).toBe("He shipped Case Triage Agent and imsg-mcp.")
    })

    it("joins array-shaped content parts", () => {
        const state = emptyStreamState()
        ingestCompletionChunk(state, {
            choices: [{ delta: { content: [{ type: "text", text: "AigisQuery " }, { type: "text", text: "uses MCP." }] } }],
        })
        expect(state.content).toBe("AigisQuery uses MCP.")
    })
})

describe("empty reply after tools", () => {
    it("does not treat a silent final as success once tools already ran", () => {
        const decision = finalizeAssistantTurn(
            { content: "", tool_calls: [], followups: [] },
            ['{"projects":[{"name":"Case Triage Agent"}]}'],
        )
        expect(decision.kind).toBe("fallback")
        expect(decision.text).toMatch(/Case Triage Agent/)
    })

    it("keeps going when the model still wants tools", () => {
        const decision = finalizeAssistantTurn(
            { content: "", tool_calls: [{ id: "1", type: "function", function: { name: "get_projects", arguments: "{}" } }] },
            [],
        )
        expect(decision.kind).toBe("tools")
    })

    it("uses the model's own text when it actually wrote some", () => {
        const decision = finalizeAssistantTurn(
            { content: "He built imsg-mcp and the Case Triage Agent.", tool_calls: [], followups: [] },
            ['{"projects":[{"name":"ignored"}]}'],
        )
        expect(decision.kind).toBe("answer")
        expect(decision.text).toMatch(/imsg-mcp/)
    })

    it("lists search matches before a dumped project catalogue", () => {
        const text = fallbackFromToolPayloads([
            '{"matches":[{"kind":"project","name":"Case Triage Agent"},{"kind":"project","name":"imsg-mcp"}]}',
            '{"projects":[{"name":"Equiverse.ml"},{"name":"Flyoneo.ml"}]}',
        ])
        expect(text).toMatch(/Case Triage Agent/)
        expect(text).toMatch(/imsg-mcp/)
        expect(text).not.toMatch(/Equiverse/)
    })

    it("does not print the error line when a chart already answered the turn", () => {
        /* Live mishalubich.com 2026-09-18: "Show his skills as a chart"
         * rendered the chart, then "I looked that up but the write-up did
         * not come back..." printed underneath it. A visual already
         * delivered is a valid answer, not silence to recover from. */
        const decision = finalizeAssistantTurn(
            { content: "", tool_calls: [], followups: [] },
            ['{"chart":{"type":"bar"}}'],
            true,
        )
        expect(decision.kind).not.toBe("fallback")
        expect(decision.text).toBe("")
    })

    it("fallback text never contains a raw bullet character", () => {
        const text = fallbackFromToolPayloads([
            '{"matches":[{"kind":"project","name":"Case Triage Agent"},{"kind":"project","name":"imsg-mcp"}]}',
        ])
        expect(text).not.toMatch(/•/)
        expect(text).toMatch(/Case Triage Agent/)
    })

    it("lists built projects, not job titles, when both came back from tools", () => {
        /* Live 2026-09-15: search ranked EchoStar / consultant first, so the
         * fallback printed "Staff AI Engineer" and skipped Case Triage Agent
         * even though get_projects({tag:"agents"}) had it. */
        const text = fallbackFromToolPayloads([
            '{"matches":[{"kind":"experience","role":"Staff AI Engineer"},{"kind":"project","name":"confluence-cli"}]}',
            '{"projects":[{"name":"Case Triage Agent"},{"name":"AI Invoice Agent"}]}',
        ])
        expect(text).toMatch(/Case Triage Agent|confluence-cli/)
        expect(text).not.toMatch(/Staff AI Engineer/)
    })
})

describe("route wiring", () => {
    it("the chat endpoint uses the empty-final recovery, not a bare done", () => {
        const route = readFileSync(resolve(__dirname, "../app/api/chat/route.ts"), "utf8")
        expect(route).toContain("finalizeAssistantTurn")
        expect(route).toContain("formatCascadeFailure")
        expect(route).toContain("ingestCompletionChunk")
        expect(route).not.toMatch(/let lastError/)
    })
})

describe("cascade errors", () => {
    it("names every failed attempt, not only the last", () => {
        const message = formatCascadeFailure([
            { model: "inclusionai/ling-3.0-flash-vl:free", status: 429, body: "rate limited" },
            { model: "openai/gpt-oss-20b", status: 401, body: "no auth" },
        ])
        expect(message).toMatch(/ling-3.0-flash-vl:free/)
        expect(message).toMatch(/429/)
        expect(message).toMatch(/gpt-oss-20b/)
        expect(message).toMatch(/401/)
    })
})
