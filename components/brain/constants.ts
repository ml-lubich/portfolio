/* ── Brain 3D constants ────────────────────────────────────────────── */

/** Number of concurrent glowing orbs */
export const ORB_COUNT = 20

/** Base speed of orbs in edges per second */
export const ORB_SPEED = 1.8

/** How many edges to keep built ahead of the orb */
export const CHAIN_BUFFER = 40

/** Edges behind the orb before we trim old ones */
export const CHAIN_TRIM_BEHIND = 12

/** How far behind (in edges) the glow trail extends */
export const TRAIL_LENGTH = 6.0
