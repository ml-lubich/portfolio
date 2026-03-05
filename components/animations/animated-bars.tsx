"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { ChevronDown } from "lucide-react"

export interface BarItem {
  label: string
  /** 0–100 percentage fill */
  value: number
  /** Tailwind gradient classes, e.g. "from-primary to-accent" */
  gradient?: string
  /** Display text on the right, e.g. "300%" or "Expert" */
  display?: string
  /** Expandable detail bullets shown below the bar */
  details?: string[]
}

interface AnimatedBarsProps {
  bars: BarItem[]
  className?: string
  /** Animation stagger per bar in ms. Default: 180 */
  stagger?: number
  /** Total grow duration per bar in ms. Default: 1200 */
  duration?: number
}

/* ── Smooth ease-out-back: slight overshoot then settle ───────── */
function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

/**
 * Horizontal animated bar chart that fires on **scroll into view**.
 * Each bar cascades in with a stagger, counts up its percentage,
 * sweeps a shimmer, and settles with a slight overshoot.
 * Click any bar to expand cross-referenced detail bullets.
 */
export function AnimatedBars({
  bars,
  className = "",
  stagger = 180,
  duration = 1200,
}: AnimatedBarsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [triggered, setTriggered] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number>(0)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ── Hover helpers: open on enter, close on leave (with debounce) ─ */
  const handleBarEnter = useCallback((i: number, hasDetails: boolean) => {
    if (!hasDetails) return
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setExpandedIdx(i)
  }, [])

  const handleBarLeave = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => {
      setExpandedIdx(null)
      hoverTimeoutRef.current = null
    }, 200) // short grace period to prevent flicker
  }, [])

  /* cleanup hover timeout on unmount */
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  /* ── Intersection Observer: trigger once 15% visible ──────── */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /* ── rAF loop: drives the animation once triggered ──────── */
  const totalDuration = duration + bars.length * stagger + 300
  const tick = useCallback(() => {
    if (startTimeRef.current === null) startTimeRef.current = performance.now()
    const now = performance.now()
    const dt = now - startTimeRef.current
    setElapsed(dt)
    if (dt < totalDuration) {
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [totalDuration])

  useEffect(() => {
    if (!triggered) return
    startTimeRef.current = null
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [triggered, tick])

  return (
    <div ref={containerRef} className={`space-y-5 ${className}`}>
      {bars.map((bar, i) => {
        const barStart = i * stagger
        const barElapsed = Math.max(0, elapsed - barStart)
        const rawT = Math.min(1, barElapsed / duration)
        // Clamp overshoot to [0, value] so width stays valid
        const eased = Math.max(0, Math.min(1.0, easeOutBack(rawT)))
        const fillWidth = triggered ? eased * bar.value : 0
        const displayPercent = Math.round(fillWidth)
        const settled = rawT >= 1
        const isExpanded = expandedIdx === i
        const hasDetails = bar.details && bar.details.length > 0

        return (
          <div
            key={bar.label}
            className="group"
            onMouseEnter={() => handleBarEnter(i, !!hasDetails)}
            onMouseLeave={handleBarLeave}
            style={{
              opacity: triggered ? 1 : 0,
              transform: triggered ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 0.6s ${barStart}ms ease-out, transform 0.6s ${barStart}ms ease-out`,
            }}
          >
            {/* Header row — opens on hover, click still works as toggle */}
            <button
              type="button"
              className="mb-2 flex w-full items-center justify-between text-left"
              onClick={() => hasDetails && setExpandedIdx(isExpanded ? null : i)}
              aria-expanded={isExpanded}
              style={{ cursor: hasDetails ? "pointer" : "default" }}
            >
              <span className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors duration-300 group-hover:text-primary">
                {bar.label}
                {hasDetails && (
                  <ChevronDown
                    className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-300"
                    style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}
                  />
                )}
              </span>
              <div className="flex items-center gap-2.5">
                {/* Live counter */}
                <span className="font-mono text-xs tabular-nums text-muted-foreground/60 transition-colors duration-300 group-hover:text-primary/60">
                  {displayPercent}%
                </span>
                {bar.display && (
                  <span
                    className="font-mono text-xs font-semibold transition-all duration-500"
                    style={{
                      color: settled ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                      opacity: rawT > 0.15 ? 1 : 0,
                      transform: `translateX(${(1 - Math.min(1, rawT * 2)) * 12}px)`,
                    }}
                  >
                    {bar.display}
                  </span>
                )}
              </div>
            </button>

            {/* Track — visible dark background with subtle border */}
            <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-white/[0.06] shadow-inner shadow-black/30 ring-1 ring-inset ring-white/[0.08]">
              {/* Fill bar */}
              <div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${bar.gradient ?? "from-primary to-accent"}`}
                style={{ width: `${fillWidth}%` }}
              />

              {/* Glow behind fill */}
              <div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${bar.gradient ?? "from-primary to-accent"} blur-md`}
                style={{
                  width: `${fillWidth}%`,
                  opacity: settled ? 0.5 : eased * 0.4,
                }}
              />

              {/* Shimmer streak — travels once during fill */}
              {rawT > 0.2 && rawT < 0.9 && (
                <div
                  className="absolute inset-y-0 w-20 rounded-full"
                  style={{
                    left: `${fillWidth * 0.4}%`,
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    animation: "shimmer-sweep 0.8s ease-in-out forwards",
                  }}
                />
              )}

              {/* Bright leading edge */}
              <div
                className="absolute top-0 h-full w-2 rounded-full bg-white/80 blur-[2px]"
                style={{
                  left: `calc(${fillWidth}% - 4px)`,
                  opacity: rawT > 0.03 && rawT < 0.92 ? 1 : 0,
                }}
              />

              {/* Living pulse — glows after settling */}
              {settled && (
                <div
                  className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${bar.gradient ?? "from-primary to-accent"}`}
                  style={{
                    width: `${bar.value}%`,
                    opacity: 0.15,
                    animation: "bar-breathe 3s ease-in-out infinite",
                    animationDelay: `${i * 400}ms`,
                  }}
                />
              )}
            </div>

            {/* Expandable details drawer */}
            {hasDetails && (
              <div
                className="overflow-hidden"
                style={{
                  maxHeight: isExpanded ? `${(bar.details!.length * 80) + 24}px` : "0",
                  opacity: isExpanded ? 1 : 0,
                  transition: isExpanded
                    ? "max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-out"
                    : "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease-in",
                }}
              >
                <div className="mt-3 space-y-1.5 pl-1">
                  {bar.details!.map((detail, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.04]"
                      style={{
                        transitionDelay: isExpanded ? `${idx * 60}ms` : "0ms",
                        opacity: isExpanded ? 1 : 0,
                        transform: isExpanded ? "translateX(0)" : "translateX(-8px)",
                      }}
                    >
                      <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r ${bar.gradient ?? "from-primary to-accent"}`} />
                      <p className="text-xs leading-relaxed text-muted-foreground">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
