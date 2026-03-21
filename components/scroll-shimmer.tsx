"use client"

import { useEffect } from "react"

const MOBILE_MAX = 768

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
    function update() {
      document.documentElement.style.setProperty(
        "--scroll-y",
        String(window.scrollY),
      )
    }

    update()

    const mobileMql = window.matchMedia(`(max-width: ${MOBILE_MAX - 1}px)`)
    if (mobileMql.matches) {
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
