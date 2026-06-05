"use client"

import { useEffect } from "react"

const MOBILE_MAX = 768
const SCROLL_STEP_PX = 32

function shouldBindScrollShimmer(): boolean {
  if (window.matchMedia(`(max-width: ${MOBILE_MAX - 1}px)`).matches) return false
  if (window.matchMedia("(pointer: coarse)").matches) return false
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * ScrollShimmer — sets a CSS custom property `--scroll-y` on <html>
 * so that `.gradient-text` elements can tie their metallic-shine
 * sweep to the current scroll position rather than a looping animation.
 *
 * On viewports &lt; MOBILE_MAX px we **do not** bind scroll: updating `--scroll-y`
 * invalidates many gradient layers and makes touch scrolling feel janky.
 * Gradient text still uses the CSS idle shimmer from globals.css.
 */
export function ScrollShimmer() {
  useEffect(() => {
    let lastBucket = -1

    function update() {
      const bucket = Math.round(window.scrollY / SCROLL_STEP_PX)
      if (bucket === lastBucket) return
      lastBucket = bucket
      document.documentElement.style.setProperty(
        "--scroll-y",
        String(bucket * SCROLL_STEP_PX),
      )
    }

    update()

    if (!shouldBindScrollShimmer()) {
      return
    }

    let ticking = false
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          update()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return null
}
