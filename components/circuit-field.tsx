/**
 * Tron-style circuit backdrop: a static grid with two accent pulses
 * travelling across it. Server component — all motion is CSS.
 *
 * Sits behind the brain and behind every content layer (see the z-index in
 * the hero), so glass surfaces above it never show the grid through.
 */
export function CircuitField() {
  return (
    <div className="circuit-field" aria-hidden="true">
      <span className="circuit-pulse circuit-pulse--h" />
      <span className="circuit-pulse circuit-pulse--v" />
    </div>
  )
}
