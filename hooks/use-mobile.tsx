"use client"

import * as React from "react"
import {
  MOBILE_SCROLL_STACK_BREAKPOINT_PX,
  shouldUseCompactScrollStackViewport,
  type ScrollStackViewportSignals,
} from "@/lib/scroll-stack-layout"

const MOBILE_BREAKPOINT = MOBILE_SCROLL_STACK_BREAKPOINT_PX

function readScrollStackViewportSignals(): ScrollStackViewportSignals {
  return {
    innerWidth: window.innerWidth,
    pointerCoarse: window.matchMedia("(pointer: coarse)").matches,
    hoverNone: window.matchMedia("(hover: none)").matches,
    maxTouchPoints: navigator.maxTouchPoints,
    prefersReducedMotion: window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches,
    hardwareConcurrency: navigator.hardwareConcurrency,
  }
}

/**
 * True when scroll-stack sections should use the vertical column (no sticky runway / rAF stack).
 * Subscribes to resize + relevant media queries so iPad / tablet class devices stay off the heavy path.
 */
export function useScrollStackCompactViewport(): boolean {
  return React.useSyncExternalStore(
    (onStoreChange) => {
      const onChange = () => onStoreChange()
      const mqlCoarse = window.matchMedia("(pointer: coarse)")
      const mqlHover = window.matchMedia("(hover: none)")
      const mqlMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
      mqlCoarse.addEventListener("change", onChange)
      mqlHover.addEventListener("change", onChange)
      mqlMotion.addEventListener("change", onChange)
      window.addEventListener("resize", onChange, { passive: true })
      return () => {
        mqlCoarse.removeEventListener("change", onChange)
        mqlHover.removeEventListener("change", onChange)
        mqlMotion.removeEventListener("change", onChange)
        window.removeEventListener("resize", onChange)
      }
    },
    () => shouldUseCompactScrollStackViewport(readScrollStackViewportSignals()),
    () => false,
  )
}

function computeReducedStackEffects(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(pointer: coarse)").matches
}

/**
 * True when the desktop stack should use softer 2D motion (coarse pointer / touchpad edge cases).
 * Narrow tablets route to `useScrollStackCompactViewport` instead of the desktop stack.
 */
export function useReducedStackEffects() {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const compute = () => setReduced(computeReducedStackEffects())

    compute()
    const mqlCoarse = window.matchMedia("(pointer: coarse)")
    mqlCoarse.addEventListener("change", compute)
    window.addEventListener("resize", compute, { passive: true })
    return () => {
      mqlCoarse.removeEventListener("change", compute)
      window.removeEventListener("resize", compute)
    }
  }, [])

  return reduced
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useLayoutEffect(() => {
    const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
    const mql = window.matchMedia(query)
    const syncMobile = () => setIsMobile(mql.matches)
    syncMobile()
    mql.addEventListener("change", syncMobile)
    return () => mql.removeEventListener("change", syncMobile)
  }, [])

  return isMobile
}
