"use client"

import * as React from 'react'

const MOBILE_BREAKPOINT = 768
/** Viewports up to this width use reduced stack effects (phones + small tablets). */
const STACK_REDUCED_NARROW_PX = 1023
/** iPad / large tablets in landscape stay under this width; touch devices get flat 2D stack. */
const STACK_REDUCED_TOUCH_MAX_PX = 1366

/**
 * True for phones, iPads, and other tablets where 3D stack + hover tilt + heavy glass hurt scroll perf.
 * Laptops and desktop browsers keep full 3D / tilt (no coarse pointer, width above touch-tablet cap).
 */
export function useReducedStackEffects() {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const compute = () => {
      const w = window.innerWidth
      const narrow = w <= STACK_REDUCED_NARROW_PX
      const coarsePointer = window.matchMedia("(pointer: coarse)").matches
      const touchTablet =
        w > STACK_REDUCED_NARROW_PX &&
        w <= STACK_REDUCED_TOUCH_MAX_PX &&
        navigator.maxTouchPoints > 0
      setReduced(narrow || coarsePointer || touchTablet)
    }

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
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}
