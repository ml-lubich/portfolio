/**
 * Pure math for the AI-expertise opacity reveals and the Contact kinetic
 * band. Input is `useSectionProgress`'s 0..1; everything is clamped, and
 * non-finite input resolves to the visible / at-rest side, never hidden.
 */

/** A group is never fully transparent: focus and keyboard users cannot land on nothing. */
export const REVEAL_FLOOR = 0.2
/** Every group is fully visible from this progress onward. */
export const REVEAL_DONE_AT = 0.5
/** Progress span over which one group fades in. */
export const REVEAL_WINDOW = 0.12
/** Band travel either side of centre, as a percent of its own width. */
export const BAND_MAX_PCT = 20

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n)

/** Opacity of group `index` of `count` at section progress `p`. */
export function revealAt(p: number, index: number, count: number): number {
  if (Number.isNaN(p)) return 1
  const n = Math.max(1, Math.floor(count) || 1)
  const i = Math.min(Math.max(0, index), n - 1)
  const start = n === 1 ? 0 : ((REVEAL_DONE_AT - REVEAL_WINDOW) * i) / (n - 1)
  const t = clamp01((p - start) / REVEAL_WINDOW)
  const eased = t * t * (3 - 2 * t)
  return Math.min(1, REVEAL_FLOOR + (1 - REVEAL_FLOOR) * eased)
}

/** How many of `count` groups are fully revealed at `p`. */
export function revealCount(p: number, count: number): number {
  if (Number.isNaN(p)) return 0
  let done = 0
  for (let i = 0; i < count; i++) if (revealAt(p, i, count) >= 1) done++
  return done
}

/** Band translateX in % of its width: +MAX at progress 0, -MAX at 1. */
export function bandOffsetPct(p: number): number {
  if (Number.isNaN(p)) return 0
  return (0.5 - clamp01(p)) * 2 * BAND_MAX_PCT
}
