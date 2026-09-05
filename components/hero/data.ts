/* ── Hero section constants & data ─────────────────────────────────── */

export const statSets = [
  [
    { value: "100M+", label: "Users Impacted" },
    { value: "6", label: "Research Papers" },
    { value: "150%", label: "ML Performance Gains" },
    { value: "5+", label: "Years Experience" },
  ],
  [
    { value: "1", label: "FAANG Company (Apple)" },
    { value: "15+", label: "ML Models Deployed" },
    { value: "99.5%", label: "System Uptime" },
    { value: "5x", label: "Cost Reduction" },
  ],
  [
    { value: "10+", label: "AI Products Shipped" },
    { value: "200K+", label: "Lines of Code" },
    { value: "1", label: "UC Berkeley Degree" },
    { value: "24/7", label: "Production AI Systems" },
  ],
  [
    { value: "4", label: "AI Frameworks Mastered" },
    { value: "500+", label: "GitHub Contributions" },
    { value: "8+", label: "Tech Talks Given" },
    { value: "3", label: "Platforms Architected" },
  ],
]

export const roles = [
  "Staff AI Engineer",
  "Agentic Engineer",
  "AI & Machine Learning Engineer",
  "ML Systems Architect",
  "Full-Stack Software Architect",
  "Applied AI Research Engineer",
  "Engineering Lead",
  "Agentic Systems Architect",
  "Agentic Engineering Lead",
]

/** ms between stat set changes */
export const STAT_ROTATE_INTERVAL = 5500

/** ms stagger between each card's animation */
export const STAT_STAGGER_DELAY = 120

/* ── Hero entrance choreography ─────────────────────────────────────────
 *  One ladder, in the order the eye travels the hero. Every hero block reads
 *  its beat from here instead of carrying its own literal — before this the
 *  delays were assigned per component and had drifted out of order (the
 *  tagline landed before the name, the CTAs before the subtitle they answer,
 *  and the stat row before the badge above it), so the hero read as one
 *  jumbled pop rather than a reveal.
 *
 *  The name is not in this table: it is `HERO_NAME_REVEAL` in
 *  `role-rotator.tsx`, because the 3D brain fade is derived from it.
 *
 *  Reduced motion: `app/globals.css` zeroes `animation-delay` /
 *  `transition-delay` under `prefers-reduced-motion: reduce`, so the whole
 *  ladder collapses to 0 and every block is present on first paint. Nothing
 *  here needs a per-component reduced-motion branch — but the values must
 *  stay ascending, or the ladder stops reading top-to-bottom.
 * ────────────────────────────────────────────────────────────────────── */
export const HERO_BEAT = {
  tagline: 620,
  subtitle: 820,
  ctas: 1000,
  tokscale: 1160,
  social: 1280,
  stats: 1400,
  scrollCue: 1520,
} as const

/** `HERO_BEAT` value as the CSS `animation-delay` string these blocks take. */
export function heroBeatDelay(beat: keyof typeof HERO_BEAT): string {
  return `${HERO_BEAT[beat]}ms`
}
