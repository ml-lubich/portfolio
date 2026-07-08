/**
 * Site-wide skeleton shimmer sweep — the single shimmer primitive used across
 * section cards. Always animating: never hidden until hover and never paused
 * by hover. Reduced-motion users get a static overlay via the global
 * `.shimmer` media query in globals.css.
 */
export function ShimmerOverlay({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`shimmer pointer-events-none absolute inset-0 ${className}`.trim()}
    />
  )
}
