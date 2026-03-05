"use client"

import { useEffect, useRef, useState, useCallback } from "react"

/**
 * Returns a smooth 0→1 progress value based on how far an element has
 * scrolled into view.  0 = element is below/above the viewport,
 * 1 = element is fully "in the sweet spot" (centred or past the trigger point).
 *
 * The value **continuously updates** so bars, counters, etc. can animate
 * up AND down as the user scrolls.
 *
 * @param offset  Extra pixels before the element is "done" entering.
 *                0.0 = starts counting immediately on first pixel visible.
 *                0.5 = element centre must reach viewport centre for 1.0.
 */
export function useScrollProgress(offset = 0.35) {
  const ref = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number>(0)
  const prevProgress = useRef(0)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const windowH = window.innerHeight

    // Element's vertical midpoint relative to viewport
    const elementMid = rect.top + rect.height / 2
    // When elementMid is at the bottom of the viewport → 0
    // When elementMid reaches the "offset" zone → 1
    // triggerLine = how far up from the bottom the "1.0" point is
    const triggerLine = windowH * (1 - offset)

    // raw goes from 0 (element mid at bottom) to 1 (element mid at triggerLine)
    const raw = 1 - (elementMid - triggerLine) / (windowH - triggerLine)
    const clamped = Math.max(0, Math.min(1, raw))

    // Apply ease-out for a smooth, unhurried feel
    const eased = 1 - Math.pow(1 - clamped, 1.4)

    // Only update state when change is visually meaningful (> 0.5%)
    // This prevents hundreds of unnecessary re-renders while scrolling
    if (Math.abs(eased - prevProgress.current) > 0.005) {
      prevProgress.current = eased
      setProgress(eased)
    }
  }, [offset])

  useEffect(() => {
    const onScroll = () => {
      // Debounce to rAF for smooth 60fps updates
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(update)
    }

    // Initial calc
    update()

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [update])

  return { ref, progress }
}
