/** Pure math for the scroll-craft depth devices (About parallax, OSS rail). */

/** Hard ceiling on any parallax layer's travel, in px. */
export const DEPTH_CAP_PX = 40

const clamp = (n: number, lo: number, hi: number) => (n < lo ? lo : n > hi ? hi : n)

/**
 * translateY for a layer drifting at `rate` (-1..1, fraction of the cap).
 * Progress 0.5 (section centred) is rest; the layer slides +cap→-cap across
 * the section's travel, mirrored for negative rates. NaN input rests at 0.
 */
export function depthOffset(progress: number, rate: number): number {
  if (Number.isNaN(progress) || Number.isNaN(rate)) return 0
  const p = clamp(progress, 0, 1)
  return (0.5 - p) * 2 * clamp(rate, -1, 1) * DEPTH_CAP_PX
}

/** scaleY fill for the progress rail: progress clamped to 0..1, NaN → 0. */
export function railFill(progress: number): number {
  return Number.isNaN(progress) ? 0 : clamp(progress, 0, 1)
}
