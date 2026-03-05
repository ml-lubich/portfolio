/* ── Brain 3D constants ────────────────────────────────────────────── */

/** Number of concurrent glowing orbs */
export const ORB_COUNT = 38

/** Base speed of orbs in edges per second */
export const ORB_SPEED = 1.8

/** How many edges to keep built ahead of the orb */
export const CHAIN_BUFFER = 40

/** Edges behind the orb before we trim old ones */
export const CHAIN_TRIM_BEHIND = 6

/** How far behind (in edges) the glow trail extends */
export const TRAIL_LENGTH = 1.5

/** Ambient base intensity on all edges (0–1) */
export const AMBIENT_RAINBOW = 0.018

/** How much to mix rainbow colors toward greyish-white (0 = full rainbow, 1 = pure white) */
export const WHITE_MIX = 1.0
