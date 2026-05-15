/**
 * Fixed nav surface: transparent over the hero (see brain), frosted once the hero
 * has fully scrolled off. Used by `components/nav/index.tsx`.
 */

/** When `#hero` is absent, treat as “past hero” only after this scroll offset (legacy pages). */
export const NAV_PAST_HERO_FALLBACK_SCROLL_Y = 50

/**
 * Hysteresis band (px) around the hero/scrolled surface boundary.
 * Prevents the frosted bar from flickering on iOS Safari where the URL bar
 * resize during scroll oscillates `window.scrollY` and `getBoundingClientRect`
 * by a few pixels.
 */
const NAV_SURFACE_HYSTERESIS_PX = 24

export function computeNavPastHero(
  hero: { getBoundingClientRect: () => { bottom: number } } | null,
  scrollY: number,
  previous: boolean = false,
): boolean {
  if (!hero) {
    if (previous) return scrollY > NAV_PAST_HERO_FALLBACK_SCROLL_Y - NAV_SURFACE_HYSTERESIS_PX
    return scrollY > NAV_PAST_HERO_FALLBACK_SCROLL_Y + NAV_SURFACE_HYSTERESIS_PX
  }
  const bottom = hero.getBoundingClientRect().bottom
  // Asymmetric thresholds: easier to enter "scrolled" than to leave it.
  if (previous) return bottom <= NAV_SURFACE_HYSTERESIS_PX
  return bottom <= 0
}
