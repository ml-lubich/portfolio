"use client"

import { useEffect, useRef, type RefObject } from "react"
import { shouldUseCompactScrollStackViewport } from "@/lib/scroll-stack-layout"

/**
 * Scroll as a timeline, per section.
 *
 * scroll-craft's first rule is that a page uses several device families and
 * never the same one twice in a row. Below the hero this site had one:
 * fade-on-enter. Everything between reveals was dead scroll — wheel turning,
 * nothing given. The three devices built on this hook (scrubbing the skill
 * map, a rail that pans with the wheel, a ground that shifts colour as you
 * pass through) each need the same primitive: "how far through the viewport
 * is this section", delivered at most once per frame, and only on viewports
 * where scroll-linked motion is welcome.
 *
 * Routing is the scroll-stack skill's table, verbatim: phones, tablets,
 * coarse pointers, touch slates, reduced motion and ≤4-core machines never
 * get a listener attached. On those the section renders exactly as before.
 *
 * Consumers publish what they actually paint as `data-sc-verify-state`, the
 * scroll-craft verification convention, so the e2e gate asserts rendered
 * state — not raw progress — changes with scroll and holds under reduce.
 */

/**
 * 0 when the element's top reaches the viewport's bottom edge, 1 when its
 * bottom edge leaves the viewport's top. Pure; unit-tested.
 */
export function sectionProgress(top: number, height: number, viewportHeight: number): number {
  const span = viewportHeight + height
  if (span <= 0) return 0
  const p = (viewportHeight - top) / span
  return p < 0 ? 0 : p > 1 ? 1 : p
}

/** True where scroll-linked motion must stay off (SSR counts as static). */
export function isStaticScrollViewport(): boolean {
  if (typeof window === "undefined") return true
  return shouldUseCompactScrollStackViewport({
    innerWidth: window.innerWidth,
    pointerCoarse: window.matchMedia("(pointer: coarse)").matches,
    hoverNone: window.matchMedia("(hover: none)").matches,
    maxTouchPoints: navigator.maxTouchPoints,
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    hardwareConcurrency: navigator.hardwareConcurrency,
  })
}

export function useSectionProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onProgress: (progress: number, el: T) => void,
): void {
  const callback = useRef(onProgress)
  useEffect(() => {
    callback.current = onProgress
  })

  useEffect(() => {
    const el = ref.current
    if (!el || isStaticScrollViewport()) return

    let raf = 0
    const apply = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      callback.current(sectionProgress(r.top, r.height, window.innerHeight), el)
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply)
    }

    apply()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [ref])
}
