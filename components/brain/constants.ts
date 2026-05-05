/* ── Brain 3D constants ────────────────────────────────────────────── */

/**
 * Max neural orbs allocated in the GPU pool (`NeuralOrbs`). Active count is
 * `tier.activeOrbCount` (smaller on mobile, larger on laptop/desktop).
 */
export const ORB_COUNT_CAP = 48

/** @deprecated Use ORB_COUNT_CAP + getBrainOrbViewportTier(). */
export const ORB_COUNT = ORB_COUNT_CAP

/** Per-viewport tuning for WebGL brain point-sprites only (not page background orbs). */
export type BrainOrbViewportTier = {
  activeOrbCount: number
  /** Passed to shader `size` attribute (base + amp * sin). */
  sizeBase: number
  sizeAmp: number
  /** Vertex shader `uSizeMul` — screen-space point scale. */
  uSizeMul: number
  /** Scales additive edge trail highlights in `NeuralOrbs` (1 = desktop). */
  trailGlowMul: number
  /** Fragment shader intensity for point sprites (1 = desktop). */
  pointGlowMul: number
}

/**
 * Whole-brain mesh scale (frozen on first paint in `BrainWireframe` — same breakpoints).
 * Smaller scale brings vertices closer in view space, which inflates `gl_PointSize` unless
 * orb tiers compensate.
 */
export function getBrainMeshViewportScale(viewportWidth: number): number {
  const w = viewportWidth
  if (w < 480) return 0.42
  if (w < 640) return 0.46
  if (w < 1024) return 0.48
  return 0.54
}

const DESKTOP_MESH_SCALE = 0.54

export function getBrainOrbViewportTier(viewportWidth: number): BrainOrbViewportTier {
  const w = viewportWidth
  const mesh = getBrainMeshViewportScale(w)
  /** `gl_PointSize` grows ~1/|mv.z|; smaller mesh → smaller |z| → scale uSizeMul down. */
  const spriteMul = mesh / DESKTOP_MESH_SCALE

  /* Sub-laptop tiers: visibly smaller than desktop, but large enough for gl_PointSize
   * after tight mobile camera + mesh scale (see vertex shader min clamp in materials.ts). */
  if (w < 400) {
    return {
      activeOrbCount: 7,
      sizeBase: 0.015,
      sizeAmp: 0.003,
      uSizeMul: Math.round(72 * spriteMul),
      trailGlowMul: 0.55,
      pointGlowMul: 0.65,
    }
  }
  if (w < 480) {
    return {
      activeOrbCount: 9,
      sizeBase: 0.018,
      sizeAmp: 0.004,
      uSizeMul: Math.round(88 * spriteMul),
      trailGlowMul: 0.6,
      pointGlowMul: 0.7,
    }
  }
  if (w < 640) {
    return {
      activeOrbCount: 12,
      sizeBase: 0.035,
      sizeAmp: 0.006,
      uSizeMul: Math.round(120 * spriteMul),
      trailGlowMul: 0.72,
      pointGlowMul: 0.78,
    }
  }
  if (w < 1024) {
    return {
      activeOrbCount: 26,
      sizeBase: 0.088,
      sizeAmp: 0.013,
      uSizeMul: Math.round(210 * spriteMul),
      trailGlowMul: 0.82,
      pointGlowMul: 0.86,
    }
  }
  return {
    activeOrbCount: 46,
    sizeBase: 0.178,
    sizeAmp: 0.028,
    uSizeMul: Math.round(372 * spriteMul),
    trailGlowMul: 1,
    pointGlowMul: 1,
  }
}

/** Base speed of orbs in edges per second */
export const ORB_SPEED = 1.8

/** How many edges to keep built ahead of the orb */
export const CHAIN_BUFFER = 40

/** Edges behind the orb before we trim old ones */
export const CHAIN_TRIM_BEHIND = 6

/** How far behind (in edges) the glow trail extends */
export const TRAIL_LENGTH = 1.5

/** Ambient base intensity on all edges (0–1) */
export const AMBIENT_RAINBOW = 0.024

/** How much to mix rainbow colors toward greyish-white (0 = full rainbow, 1 = pure white) */
export const WHITE_MIX = 0.78
