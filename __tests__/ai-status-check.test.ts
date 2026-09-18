import { afterEach, describe, expect, it, vi } from "vitest"
import { checkAllModels, checkModelStatus } from "@/lib/ai/status-check"

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("checkModelStatus", () => {
    it("reports ok with status and latency on a 2xx", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })))
        const result = await checkModelStatus("some/model:free", "key")
        expect(result).toMatchObject({ model: "some/model:free", ok: true, status: 200 })
        expect(result.latencyMs).toBeGreaterThanOrEqual(0)
    })

    it("reports the HTTP status and a truncated body on a non-2xx", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => new Response("x".repeat(500), { status: 429, statusText: "Too Many Requests" })),
        )
        const result = await checkModelStatus("some/model:free", "key")
        expect(result.ok).toBe(false)
        expect(result.status).toBe(429)
        expect(result.error?.length).toBeLessThanOrEqual(200)
    })

    it("reports a network/timeout failure without throwing", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => {
                throw new Error("The operation was aborted")
            }),
        )
        const result = await checkModelStatus("some/model:free", "key")
        expect(result.ok).toBe(false)
        expect(result.status).toBeUndefined()
        expect(result.error).toContain("aborted")
    })

    it("never sends the API key in the response it reports", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => new Response("secret-key-leak", { status: 500 })))
        const result = await checkModelStatus("some/model:free", "sk-super-secret")
        expect(JSON.stringify(result)).not.toContain("sk-super-secret")
    })
})

describe("checkAllModels", () => {
    it("checks every model in parallel and keeps per-model results independent", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async (_url: string, init: RequestInit) => {
                const body = JSON.parse(String(init.body)) as { model: string }
                if (body.model === "bad/model") return new Response("nope", { status: 503 })
                return new Response("{}", { status: 200 })
            }),
        )
        const results = await checkAllModels(["good/model", "bad/model"], "key")
        expect(results).toHaveLength(2)
        expect(results.find((r) => r.model === "good/model")).toMatchObject({ ok: true })
        expect(results.find((r) => r.model === "bad/model")).toMatchObject({ ok: false, status: 503 })
    })
})
