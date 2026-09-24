import { describe, expect, it } from "vitest"
import { ossDemos } from "@/data/oss-demos"
import { getHeroFloatingDemo, HERO_FLOATING_DEMO_ID } from "@/lib/hero-floating-demo"

describe("getHeroFloatingDemo", () => {
  it("resolves to a real entry in data/oss-demos.ts, not a fabricated script", () => {
    const source = ossDemos.find((d) => d.id === HERO_FLOATING_DEMO_ID)
    expect(source).toBeDefined()
    // Same array reference — the hero card types exactly what the
    // Open-Source showcase already ships, never a hero-only duplicate.
    expect(getHeroFloatingDemo()).toBe(source!.demo)
  })

  it("only contains lines that already exist in the real demo script", () => {
    const lines = getHeroFloatingDemo()
    const source = ossDemos.find((d) => d.id === HERO_FLOATING_DEMO_ID)!
    expect(lines).toEqual(source.demo)
    expect(lines.some((l) => l.t === "cmd")).toBe(true)
  })

  it("throws loudly if the configured id drifts out of the real data set", () => {
    expect(() => getHeroFloatingDemo([])).toThrow(/not found/i)
  })
})
