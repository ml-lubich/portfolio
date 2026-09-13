import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * MLBot went dead in production with:
 *
 *   openai/gpt-oss-20b:free: 404 {"error":{"message":"This model is
 *   unavailable for free. The paid version is available now - use this slug
 *   instead: openai/gpt-oss-20b"}}
 *
 * OpenRouter retired the `:free` variant. Nothing in the repo referenced a
 * missing file or a bad type, so every local gate stayed green while the
 * last-resort net in the cascade was a 404. The cascade only helps if its
 * entries still exist.
 *
 * Network-gated the way links.test.ts is: these run locally and in the git
 * hooks, and skip inside the Vercel build so a third-party API having a bad
 * minute cannot block an unrelated deploy.
 */
const NETWORK_GATED = Boolean(process.env.VERCEL)

const ROUTE = resolve(__dirname, "../app/api/chat/route.ts")

/** Parse the MODELS array out of the route rather than importing it: the route
 *  pulls in next/server and the whole tool surface just to read four strings. */
function declaredModels(): string[] {
  const src = readFileSync(ROUTE, "utf8")
  const block = src.match(/const MODELS = \[([\s\S]*?)\] as const/)
  if (!block) throw new Error("MODELS array not found in app/api/chat/route.ts")
  // Strip comments first: the array carries prose that itself quotes an
  // upstream error string, and a bare string match reads that as a model id.
  const body = block[1].replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "")
  return [...body.matchAll(/"([^"]+)"/g)].map((m) => m[1])
}

describe("chat model cascade", () => {
  const models = declaredModels()

  it("declares a cascade, not a single point of failure", () => {
    expect(models.length).toBeGreaterThanOrEqual(2)
  })

  it("has no duplicate entries", () => {
    expect(new Set(models).size).toBe(models.length)
  })

  it("keeps at least one free model as a last resort", () => {
    expect(models.some((m) => m.endsWith(":free"))).toBe(true)
  })

  /* Free-first is the owner's call, traded against first-token latency — the
   * rationale is on the MODELS comment. Assert the shape so a later "just move
   * the fast one up" has to argue with a failing test. */
  it("tries every free model before spending money", () => {
    const firstPaid = models.findIndex((m) => !m.endsWith(":free"))
    const lastFree = models.map((m) => m.endsWith(":free")).lastIndexOf(true)
    expect(firstPaid, "no paid backstop behind the free tier").toBeGreaterThan(0)
    expect(lastFree).toBeLessThan(firstPaid)
  })

  it("backstops the free tier with paid models, so a free 429 is not the end", () => {
    expect(models.filter((m) => !m.endsWith(":free")).length).toBeGreaterThanOrEqual(2)
  })

  /* Every paid backstop is open-weight and served by several providers. A
   * single-host proprietary model is one business decision away from being the
   * retired slug that took the bot down last time. */
  it("draws each entry from a different lab", () => {
    const labs = models.map((m) => m.split("/")[0])
    expect(new Set(labs).size).toBe(labs.length)
  })

  it("excludes a model that answered a lookup without calling the tool", () => {
    // nex-n2.5-pro:free claimed the resume card was on screen having never
    // called get_resume. Fabricating a tool result is worse than being slow.
    for (const m of models) expect(m).not.toMatch(/nex-n2\.5-pro/)
  })

  it("excludes models that stream reasoning as ordinary content", () => {
    // These leak the system prompt into the panel; reasoning.exclude does not
    // stop them, so they are barred regardless of capability.
    for (const m of models) {
      expect(m).not.toMatch(/nemotron-3\.5-lightning|nemotron-3-super/)
    }
  })

  it.skipIf(NETWORK_GATED)(
    "every declared model still exists upstream and supports tools",
    async () => {
      const res = await fetch("https://openrouter.ai/api/v1/models")
      expect(res.ok, `OpenRouter catalogue fetch: ${res.status}`).toBe(true)
      const catalogue = (await res.json()).data as Array<{
        id: string
        supported_parameters?: string[]
      }>
      const byId = new Map(catalogue.map((m) => [m.id, m]))

      for (const id of models) {
        const entry = byId.get(id)
        expect(entry, `${id} is not in the OpenRouter catalogue (retired slug?)`).toBeDefined()
        // The cascade calls tools; a model without them answers, then fails the
        // moment it needs to look anything up.
        expect(
          entry!.supported_parameters ?? [],
          `${id} does not advertise tool support`,
        ).toContain("tools")
      }
    },
    30_000,
  )
})
