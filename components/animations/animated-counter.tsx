"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedCounterProps {
  /** The target string, e.g. "100M+", "300%", "99.9%", "6", "15+" */
  value: string
  /** Duration of the count-up animation in ms. Default: 2000 */
  duration?: number
  /** Only animate once when entering the viewport. Default: true */
  once?: boolean
  className?: string
}

/**
 * Parses a display string like "100M+" into a numeric part, suffix, and prefix.
 * Handles: 100M+, 300%, 99.9%, 5+, 6, 10M+, $12K
 */
function parseValue(raw: string) {
  const match = raw.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/)
  if (!match) return { prefix: "", number: 0, decimals: 0, suffix: raw }
  const prefix = match[1]
  const numStr = match[2]
  const suffix = match[3]
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0
  return { prefix, number: parseFloat(numStr), decimals, suffix }
}

/**
 * Animated rolling counter.
 * Numbers count up from 0 → target with a satisfying ease-out deceleration
 * when the element scrolls into view. Smooth rAF-driven animation.
 */
export function AnimatedCounter({
  value,
  duration = 2000,
  once = true,
  className = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState("0")
  const [hasAnimated, setHasAnimated] = useState(false)
  const parsed = useRef(parseValue(value))

  useEffect(() => {
    parsed.current = parseValue(value)
  }, [value])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        if (once && hasAnimated) return

        setHasAnimated(true)
        const { number: target, decimals } = parsed.current
        const start = performance.now()

        const tick = (now: number) => {
          const elapsed = now - start
          const progress = Math.min(elapsed / duration, 1)
          // Ease-out cubic for a satisfying deceleration
          const eased = 1 - Math.pow(1 - progress, 3)
          const current = eased * target
          setDisplay(current.toFixed(decimals))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.3 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [duration, once, hasAnimated])

  const { prefix, suffix } = parsed.current

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}
