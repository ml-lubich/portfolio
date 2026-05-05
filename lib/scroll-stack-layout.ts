/**
 * Scroll-stack card layout: desktop uses sticky 3D stack; phones / tablets / reduced
 * viewports use a plain column (no runway, no rAF scroll transforms).
 */

/** Matches `useIsMobile` / portrait phone layouts (<768px). */
export const MOBILE_SCROLL_STACK_BREAKPOINT_PX = 768

/**
 * At or below this width, use vertical cards (covers phones, iPad portrait/landscape,
 * small laptop windows). Above this, desktop may still compact via touch / motion / CPU heuristics.
 */
export const SCROLL_STACK_COMPACT_MAX_WIDTH_PX = 1366

/**
 * Touch-primary devices slightly wider than `SCROLL_STACK_COMPACT_MAX_WIDTH_PX` (e.g. iPad
 * “desktop” / split quirks) still get the light column layout.
 */
export const SCROLL_STACK_TOUCH_SLATE_MAX_WIDTH_PX = 1920

/** `hardwareConcurrency` at or below this (when defined) is treated as low compute. */
export const SCROLL_STACK_LOW_COMPUTE_CORE_MAX = 4

export type ScrollStackViewportSignals = {
  innerWidth: number
  pointerCoarse: boolean
  hoverNone: boolean
  maxTouchPoints: number
  prefersReducedMotion: boolean
  hardwareConcurrency: number | undefined
}

/**
 * Pure viewport / capability check for routing to `ScrollStackCardsMobile` (vertical list).
 * Used by `useScrollStackCompactViewport` and unit tests — keep behavior in sync.
 */
export function shouldUseCompactScrollStackViewport(
  s: ScrollStackViewportSignals,
): boolean {
  const w = s.innerWidth
  if (w <= SCROLL_STACK_COMPACT_MAX_WIDTH_PX) return true
  if (s.prefersReducedMotion) return true
  if (s.pointerCoarse) return true
  if (s.maxTouchPoints > 0 && s.hoverNone) return true
  if (
    s.maxTouchPoints > 0 &&
    w <= SCROLL_STACK_TOUCH_SLATE_MAX_WIDTH_PX
  ) {
    return true
  }
  const cores = s.hardwareConcurrency
  if (
    typeof cores === "number" &&
    cores > 0 &&
    cores <= SCROLL_STACK_LOW_COMPUTE_CORE_MAX
  ) {
    return true
  }
  return false
}

export type ScrollStackRouteVariant = "grid" | "compact" | "stack"

export function resolveScrollStackVariant(
  layout: "stack" | "grid" | undefined,
  compactViewport: boolean,
): ScrollStackRouteVariant {
  if (layout === "grid") return "grid"
  if (compactViewport) return "compact"
  return "stack"
}
