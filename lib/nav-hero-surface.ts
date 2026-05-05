/**
 * Fixed nav surface: transparent over the hero (see brain), frosted once the hero
 * has fully scrolled off. Used by `components/nav/index.tsx`.
 */

/** When `#hero` is absent, treat as “past hero” only after this scroll offset (legacy pages). */
export const NAV_PAST_HERO_FALLBACK_SCROLL_Y = 50

export function computeNavPastHero(
  hero: { getBoundingClientRect: () => { bottom: number } } | null,
  scrollY: number,
): boolean {
  if (!hero) return scrollY > NAV_PAST_HERO_FALLBACK_SCROLL_Y
  return hero.getBoundingClientRect().bottom <= 0
}
