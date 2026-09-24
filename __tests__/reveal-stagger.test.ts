import { describe, expect, it } from "vitest"
import { revealDistancePx, revealMotion, staggerDelayMs } from "@/lib/reveal-stagger"

describe("staggerDelayMs", () => {
  it("increases with index using the step size", () => {
    expect(staggerDelayMs(0)).toBe(0)
    expect(staggerDelayMs(1)).toBe(90)
    expect(staggerDelayMs(2)).toBe(180)
  })

  it("honors a custom base and step", () => {
    expect(staggerDelayMs(2, { baseMs: 100, stepMs: 50 })).toBe(200)
  })

  it("caps at maxMs so a long list never lags too far behind", () => {
    expect(staggerDelayMs(50, { stepMs: 90, maxMs: 400 })).toBe(400)
  })

  it("rejects a negative index", () => {
    expect(() => staggerDelayMs(-1)).toThrow(RangeError)
  })

  it("delays are strictly ascending across a small sequence", () => {
    const delays = [0, 1, 2, 3].map((i) => staggerDelayMs(i))
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeGreaterThan(delays[i - 1])
    }
  })
})

describe("revealDistancePx", () => {
  it("matches the motion-showcase distance table (badge < body < visual)", () => {
    expect(revealDistancePx("badge")).toBeLessThan(revealDistancePx("body"))
    expect(revealDistancePx("body")).toBeLessThan(revealDistancePx("visual"))
  })

  it("stays within the recipe's documented ranges", () => {
    expect(revealDistancePx("badge")).toBeGreaterThanOrEqual(4)
    expect(revealDistancePx("badge")).toBeLessThanOrEqual(16)
    expect(revealDistancePx("body")).toBeGreaterThanOrEqual(14)
    expect(revealDistancePx("body")).toBeLessThanOrEqual(24)
    expect(revealDistancePx("visual")).toBeGreaterThanOrEqual(40)
    expect(revealDistancePx("visual")).toBeLessThanOrEqual(80)
  })
})

describe("revealMotion reduced-motion branch", () => {
  it("zeroes delay, distance, and blur under reduced motion", () => {
    const motion = revealMotion("visual", 3, true)
    expect(motion).toEqual({ delayMs: 0, distancePx: 0, blurPx: 0 })
  })

  it("returns non-zero staggered motion when motion is allowed", () => {
    const motion = revealMotion("visual", 1, false)
    expect(motion.delayMs).toBe(90)
    expect(motion.distancePx).toBe(revealDistancePx("visual"))
    expect(motion.blurPx).toBeGreaterThan(0)
  })

  it("reduced motion overrides even a nonzero index", () => {
    const a = revealMotion("badge", 0, true)
    const b = revealMotion("badge", 5, true)
    expect(a).toEqual(b)
  })
})
