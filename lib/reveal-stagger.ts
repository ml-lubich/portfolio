/**
 * Pure stagger/distance math for scroll-triggered reveals — no DOM, no
 * timers. `motion-showcase`'s recipe: vary delay and travel distance per
 * element instead of one global fade class, and collapse everything to
 * zero under reduced motion (the sitewide `@media (prefers-reduced-motion)`
 * block in app/globals.css already zeroes CSS transition/animation delay
 * with `!important`; this covers the inline-style / JS-driven reveals that
 * stylesheet can't reach, mirroring AnimatedName's approach).
 */

export interface StaggerOptions {
  baseMs?: number
  stepMs?: number
  maxMs?: number
}

const DEFAULT_STEP_MS = 90
const DEFAULT_MAX_MS = 640

/** Delay for the nth staggered child, ascending and capped. */
export function staggerDelayMs(index: number, options: StaggerOptions = {}): number {
  if (index < 0) throw new RangeError("index must be >= 0")
  const base = options.baseMs ?? 0
  const step = options.stepMs ?? DEFAULT_STEP_MS
  const max = options.maxMs ?? DEFAULT_MAX_MS
  return Math.min(base + index * step, max)
}

/** motion-showcase's travel-distance table: badges 4-16px, body 14-24px,
 *  big visuals 40-80px. */
export type RevealKind = "badge" | "body" | "visual"

const REVEAL_DISTANCE_PX: Record<RevealKind, number> = {
  badge: 10,
  body: 20,
  visual: 56,
}

export function revealDistancePx(kind: RevealKind): number {
  return REVEAL_DISTANCE_PX[kind]
}

export interface RevealMotion {
  delayMs: number
  distancePx: number
  blurPx: number
}

const REVEAL_BLUR_PX = 6

/** Full reveal recipe for one staggered element. Reduced-motion visitors get
 *  the settled state outright — no delay, no travel, no blur. */
export function revealMotion(
  kind: RevealKind,
  index: number,
  reducedMotion: boolean,
  options?: StaggerOptions,
): RevealMotion {
  if (reducedMotion) return { delayMs: 0, distancePx: 0, blurPx: 0 }
  return {
    delayMs: staggerDelayMs(index, options),
    distancePx: revealDistancePx(kind),
    blurPx: REVEAL_BLUR_PX,
  }
}
