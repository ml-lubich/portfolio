"use client"

import { useEffect } from "react"

/**
 * ScrollShimmer — sets a CSS custom property `--scroll-y` on <html>
 * so that `.gradient-text` elements can tie their metallic-shine
 * sweep to the current scroll position rather than a looping animation.
 *
 * Drop this once into the root layout alongside <BackgroundOrbs />.
 */
export function ScrollShimmer() {
  useEffect(() => {
    let ticking = false

    function update() {
      document.documentElement.style.setProperty(
        "--scroll-y",
        String(window.scrollY),
      )
      ticking = false
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update)
        ticking = true
      }
    }

    // Set initial value
    update()

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return null
}
