"use client"

import { useScrollProgress } from "@/hooks/use-scroll-progress"

interface BarItem {
  label: string
  /** 0–100 percentage fill */
  value: number
  /** Tailwind gradient classes, e.g. "from-primary to-accent" */
  gradient?: string
  /** Display text on the right, e.g. "300%" or "Expert" */
  display?: string
}

interface AnimatedBarsProps {
  bars: BarItem[]
  className?: string
  /** Animation stagger per bar in ms. Default: 120 */
  stagger?: number
  /** Total grow duration per bar in ms. Default: 1400 */
  duration?: number
}

/**
 * Horizontal animated bar chart driven by **scroll position**.
 * Bars grow from 0% → target as you scroll in — shrink back when you scroll away.
 * Includes a living glow pulse, shimmer tip, and per-bar stagger.
 */
export function AnimatedBars({
  bars,
  className = "",
  stagger = 150,
  duration = 1800,
}: AnimatedBarsProps) {
  const { ref, progress } = useScrollProgress(0.4)

  return (
    <div ref={ref} className={`space-y-5 ${className}`}>
      {bars.map((bar, i) => {
        // Per-bar stagger: each subsequent bar lags slightly behind
        const staggerOffset = (i * stagger) / duration
        const barProgress = Math.max(0, Math.min(1, (progress - staggerOffset * 0.3) / (1 - staggerOffset * 0.3)))
        // Ease-out for calm, gentle deceleration
        const eased = 1 - Math.pow(1 - barProgress, 1.5)
        const fillWidth = eased * bar.value
        // Glow intensity peaks when bar is near its target
        const glowIntensity = Math.max(0, eased - 0.3) / 0.7

        return (
          <div key={bar.label} className="group">
            {/* Label row */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground transition-colors duration-300 group-hover:text-primary">
                {bar.label}
              </span>
              {bar.display && (
                <span
                  className="font-mono text-xs font-semibold text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:scale-110"
                  style={{
                    opacity: eased > 0.05 ? 1 : 0.4,
                    transform: `translateX(${(1 - eased) * 10}px)`,
                    transition: "opacity 0.3s, transform 0.3s",
                  }}
                >
                  {bar.display}
                </span>
              )}
            </div>

            {/* Track */}
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/60">
              {/* Fill bar */}
              <div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${bar.gradient ?? "from-primary to-accent"}`}
                style={{
                  width: `${fillWidth}%`,
                  transition: "width 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />

              {/* Animated glow behind the fill */}
              <div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${bar.gradient ?? "from-primary to-accent"} blur-sm`}
                style={{
                  width: `${fillWidth}%`,
                  opacity: 0.35 + glowIntensity * 0.25,
                  transition: "width 0.18s, opacity 0.4s",
                }}
              />

              {/* Shimmer tip — bright dot at the leading edge */}
              <div
                className="absolute top-0 h-full w-3 rounded-full bg-white/60 blur-[3px]"
                style={{
                  left: `calc(${fillWidth}% - 6px)`,
                  opacity: eased > 0.05 && eased < 0.98 ? 0.8 : 0,
                  transition: "left 0.18s, opacity 0.5s",
                }}
              />

              {/* Living pulse overlay */}
              <div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${bar.gradient ?? "from-primary to-accent"}`}
                style={{
                  width: `${fillWidth}%`,
                  opacity: glowIntensity * 0.15,
                  animation: eased > 0.3 ? "pulse 2s ease-in-out infinite" : "none",
                  transition: "width 0.12s",
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
