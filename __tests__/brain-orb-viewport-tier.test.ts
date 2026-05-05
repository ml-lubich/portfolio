/**
 * Brain neural orbs: viewport tiers must keep laptop/desktop visuals unchanged while
 * capping point-sprite weight and glow multipliers on smaller widths.
 */

import { describe, it, expect } from "vitest"
import {
  getBrainOrbViewportTier,
  type BrainOrbViewportTier,
} from "@/components/brain/constants"

const DESKTOP_TIER: BrainOrbViewportTier = {
  activeOrbCount: 46,
  sizeBase: 0.178,
  sizeAmp: 0.028,
  uSizeMul: 372,
  trailGlowMul: 1,
  pointGlowMul: 1,
}

/** Proxy for max gl_PointSize ∝ (sizeBase + sizeAmp) * uSizeMul at a given depth. */
function maxPointWeight(tier: BrainOrbViewportTier): number {
  return (tier.sizeBase + tier.sizeAmp) * tier.uSizeMul
}

describe("getBrainOrbViewportTier", () => {
  it("keeps laptop / large-desktop tier identical (no mobile downsizing)", () => {
    expect(getBrainOrbViewportTier(1024)).toEqual(DESKTOP_TIER)
    expect(getBrainOrbViewportTier(1280)).toEqual(DESKTOP_TIER)
    expect(getBrainOrbViewportTier(1920)).toEqual(DESKTOP_TIER)
  })

  it("caps point-sprite weight on typical phone widths", () => {
    expect(maxPointWeight(getBrainOrbViewportTier(360))).toBeLessThanOrEqual(1.2)
    expect(maxPointWeight(getBrainOrbViewportTier(390))).toBeLessThanOrEqual(1.2)
  })

  it("caps point-sprite weight between phone and laptop breakpoints", () => {
    expect(maxPointWeight(getBrainOrbViewportTier(500))).toBeLessThanOrEqual(4.2)
    expect(maxPointWeight(getBrainOrbViewportTier(800))).toBeLessThanOrEqual(19)
  })

  it("tones down trail and point glow on sub-laptop viewports only", () => {
    const phone = getBrainOrbViewportTier(390)
    expect(phone.trailGlowMul).toBeLessThan(1)
    expect(phone.pointGlowMul).toBeLessThan(1)

    const desk = getBrainOrbViewportTier(1280)
    expect(desk.trailGlowMul).toBe(1)
    expect(desk.pointGlowMul).toBe(1)
  })
})
