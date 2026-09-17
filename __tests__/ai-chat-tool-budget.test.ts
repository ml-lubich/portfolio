/**
 * Live mishalubich.com 2026-09-17: "What has Misha built with agents?" showed
 * "Searching the profile" then "Pulling up projects", then
 * "I looked that up a few different ways but couldn't land on a clean answer."
 *
 * search_profile and get_projects both return the agent work (Case Triage
 * Agent, SynthData Forge, twig…), so the data was never the problem — the
 * model spent all four rounds reaching for another lookup. These tests pin the
 * fix: the final round is asked with no tools at all, and if it still says
 * nothing the answer comes from the payloads, not an apology.
 */
import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const sse = (chunks: unknown[]) =>
    new Response(
        new ReadableStream({
            start(c) {
                const enc = new TextEncoder()
                for (const chunk of chunks) c.enqueue(enc.encode(`data: ${JSON.stringify(chunk)}\n\n`))
                c.enqueue(enc.encode("data: [DONE]\n\n"))
                c.close()
            },
        }),
        { status: 200, headers: { "Content-Type": "text/event-stream" } },
    )

const toolCall = (name: string, args: string) =>
    sse([{ choices: [{ delta: { tool_calls: [{ index: 0, id: `c-${name}`, function: { name, arguments: args } }] } }] }])

const text = (s: string) => sse([{ choices: [{ delta: { content: s } }] }])

/** Every request body the route sent to OpenRouter, in order. */
function install(responses: Response[]) {
    const bodies: Record<string, unknown>[] = []
    vi.stubGlobal(
        "fetch",
        vi.fn(async (_url: string, init: RequestInit) => {
            bodies.push(JSON.parse(String(init.body)))
            return responses[Math.min(bodies.length - 1, responses.length - 1)]
        }),
    )
    return bodies
}

async function ask(question: string, ip: string): Promise<string> {
    const { POST } = await import("@/app/api/chat/route")
    const res = await POST(
        new NextRequest("http://localhost/api/chat", {
            method: "POST",
            headers: { "content-type": "application/json", "x-forwarded-for": ip },
            body: JSON.stringify({ messages: [{ role: "user", content: question }] }),
        }),
    )
    return await new Response(res.body).text()
}

describe("tool-round budget", () => {
    beforeEach(() => {
        process.env.OPENROUTER_API_KEY = "test-key"
        vi.unstubAllGlobals()
    })

    it("asks the last round with no tools so the model has to answer", async () => {
        const bodies = install([
            toolCall("search_profile", '{"query":"agents"}'),
            toolCall("get_projects", '{"tag":"agents"}'),
            toolCall("search_profile", '{"query":"agentic"}'),
            text("He built the Case Triage Agent and SynthData Forge."),
        ])

        const out = await ask("What has Misha built with agents?", "10.1.1.1")

        expect(bodies).toHaveLength(4)
        for (const body of bodies.slice(0, 3)) expect(body.tools).toBeDefined()
        // The round that has to produce prose is offered nothing to call.
        expect(bodies[3].tools).toBeUndefined()
        expect(bodies[3].tool_choice).toBeUndefined()
        expect(out).toContain("Case Triage Agent")
        expect(out).not.toContain("couldn't land on a clean answer")
    })

    it("answers from the lookups when even the tool-free round is silent", async () => {
        install([
            toolCall("search_profile", '{"query":"agents"}'),
            toolCall("get_projects", '{"tag":"agents"}'),
            toolCall("get_projects", '{"tag":"agentic"}'),
            text(""),
        ])

        const out = await ask("What has Misha built with agents?", "10.1.1.2")

        expect(out).toContain("Case Triage Agent")
        expect(out).not.toContain("couldn't land on a clean answer")
    })
})
