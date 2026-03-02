"use client"

import { useScrollProgress } from "@/hooks/use-scroll-progress"

interface ScrollMiniBarProps {
  /** Target width 0–100 */
  value: number
  /** Tailwind gradient classes */
  gradient: string
  className?: string
}

/**
 * A tiny scroll-driven progress bar. Fills as the element scrolls into view,
 * empties when it scrolls away. Includes a subtle glow pulse when full.
 */
export function ScrollMiniBar({ value, gradient, className = "" }: ScrollMiniBarProps) {
  const { ref, progress } = useScrollProgress(0.45)
  const eased = 1 - Math.pow(1 - progress, 3)
  const fillWidth = eased * value

  return (
    <div ref={ref} className={`mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary/60 ${className}`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
        style={{
          width: `${fillWidth}%`,
          transition: "width 0.12s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: eased > 0.5 ? `0 0 8px 1px hsl(var(--primary) / 0.3)` : "none",
        }}
      />
    </div>
  )
}
