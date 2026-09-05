import { test, expect } from "@playwright/test"

/**
 * API route coverage against the real dev server (playwright `request`
 * context, no browser needed). Read-only proxy routes hit their real
 * upstreams — consistent with this repo's existing convention of probing
 * real URLs in `media-references.test.ts` rather than mocking them.
 *
 * /api/chat is guard-rail-only: this suite never lets a request reach the
 * model. Validation failures and the rate limiter both short-circuit before
 * any OpenRouter call, so these assertions cost nothing to run.
 */

test.describe("GET /api/tokscale", () => {
  test("returns an SVG or a clean upstream-failure status", async ({ request }) => {
    const res = await request.get("/api/tokscale")
    expect([200, 502]).toContain(res.status())
    if (res.status() === 200) {
      expect(res.headers()["content-type"]).toContain("image/svg+xml")
      expect(await res.text()).toContain("<svg")
    }
  })
})

test.describe("GET /api/github", () => {
  test("returns the trimmed profile/repo/contribution payload", async ({ request }) => {
    const res = await request.get("/api/github")
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty("user")
    expect(body).toHaveProperty("repos")
    expect(body.user).toHaveProperty("login")
  })
})

test.describe("GET /api/llm-prices", () => {
  test("returns upstream pricing data or a typed error", async ({ request }) => {
    const res = await request.get("/api/llm-prices")
    expect([200, 500, 502]).toContain(res.status())
    const body = await res.json()
    if (res.status() !== 200) expect(body).toHaveProperty("error")
  })
})

test.describe("POST /api/prompt-lint", () => {
  // Unique fake IPs per test so the route's in-memory rate bucket (keyed by
  // x-forwarded-for) can't leak state between these tests or collide with
  // real traffic on the shared dev server.
  test("lints a prompt and returns the expected response shape", async ({ request }) => {
    const res = await request.post("/api/prompt-lint", {
      headers: { "x-forwarded-for": "198.51.100.10" },
      data: { prompt: "You are a helpful assistant. Answer concisely." },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty("source")
    expect(body).toHaveProperty("result")
    expect(body).toHaveProperty("notice")
    expect(body.result).toHaveProperty("score")
  })

  test("tolerates a missing/malformed body instead of 500ing", async ({ request }) => {
    const res = await request.post("/api/prompt-lint", {
      headers: { "x-forwarded-for": "198.51.100.11", "content-type": "application/json" },
      data: "not json",
    })
    expect(res.status()).toBe(200)
  })

  test("rate-limits a burst of requests from one IP", async ({ request }) => {
    const ip = "198.51.100.12"
    const results: number[] = []
    // Config allows 8/min (see lib/ai-tools/config.ts PROMPT_LINTER_CONFIG).
    for (let i = 0; i < 9; i++) {
      const res = await request.post("/api/prompt-lint", {
        headers: { "x-forwarded-for": ip },
        data: { prompt: "test" },
      })
      results.push(res.status())
    }
    expect(results.filter((s) => s === 429).length, `statuses: ${results}`).toBeGreaterThan(0)
  })
})

test.describe("POST /api/chat — guard rails only, no model calls", () => {
  test("rejects an empty message list before touching the model", async ({ request }) => {
    const res = await request.post("/api/chat", {
      headers: { "x-forwarded-for": "198.51.100.20" },
      data: { messages: [] },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty("error")
  })

  test("burst guard trips after 5 requests/20s from one IP", async ({ request }) => {
    // Empty-history requests fail validation (400) *after* the rate-limit
    // gate runs, so this exercises the limiter without ever reaching
    // runAgent()/the model. See lib/ai/rate-limit.ts CHAT_LIMITS.burst.
    const ip = "198.51.100.21"
    const statuses: number[] = []
    for (let i = 0; i < 6; i++) {
      const res = await request.post("/api/chat", {
        headers: { "x-forwarded-for": ip },
        data: { messages: [] },
      })
      statuses.push(res.status())
    }
    expect(statuses.slice(0, 5).every((s) => s === 400), `first 5: ${statuses}`).toBe(true)
    expect(statuses[5], `6th request: ${statuses}`).toBe(429)
    const body = await (
      await request.post("/api/chat", { headers: { "x-forwarded-for": ip }, data: { messages: [] } })
    ).json()
    expect(body).toHaveProperty("retryAfter")
  })
})
