"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { shouldUseCompactScrollStackViewport } from "@/lib/scroll-stack-layout"

/* ── Hero scroll craft ──────────────────────────────────────────────────
 *  Two scroll-linked moves, both transform/opacity only so the document
 *  never reflows (the `#contact` anchor-scroll fix depends on that):
 *
 *   brain — the "release": scrolling out of the hero scales the mesh down
 *           and fades it, instead of the next section simply covering it.
 *   stats — the Tokscale badge / stat row lags the page a touch (capped so
 *           the lagging row stays inside the hero's bottom padding and is
 *           never clipped by the section's overflow-hidden).
 *
 *  Routing: the same pure function the scroll-stack uses. Phones, tablets,
 *  coarse pointers, reduced motion and low-core devices never attach the
 *  scroll listener — the hero is static for them, and nothing here touches
 *  React state, so SSR markup and first paint are identical either way.
 * ────────────────────────────────────────────────────────────────────── */

/** Scroll distance (as a fraction of the viewport) over which the brain fully recedes. */
const RELEASE_SPAN_VH = 0.9
const RELEASE_MIN_SCALE = 0.78
const STATS_PARALLAX_RATE = 0.12
export const HERO_STATS_PARALLAX_MAX_PX = 48

export function heroReleaseAt(scrollY: number, viewportHeight: number) {
  const p = Math.min(Math.max(scrollY / (viewportHeight * RELEASE_SPAN_VH), 0), 1)
  const eased = p * p
  return {
    scale: 1 - (1 - RELEASE_MIN_SCALE) * p,
    opacity: 1 - Math.min(1, eased * 1.15),
  }
}

export function heroStatsParallaxAt(scrollY: number): number {
  return Math.min(Math.max(scrollY, 0) * STATS_PARALLAX_RATE, HERO_STATS_PARALLAX_MAX_PX)
}

function isStaticHero(): boolean {
  return shouldUseCompactScrollStackViewport({
    innerWidth: window.innerWidth,
    pointerCoarse: window.matchMedia("(pointer: coarse)").matches,
    hoverNone: window.matchMedia("(hover: none)").matches,
    maxTouchPoints: navigator.maxTouchPoints,
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    hardwareConcurrency: navigator.hardwareConcurrency,
  })
}

type HeroScrollLayerProps = {
  layer: "brain" | "stats"
  className?: string
  children: ReactNode
  "aria-hidden"?: boolean
}

export function HeroScrollLayer({ layer, className, children, ...rest }: HeroScrollLayerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || isStaticHero()) return

    let raf = 0
    const apply = () => {
      raf = 0
      const y = window.scrollY
      if (layer === "brain") {
        const { scale, opacity } = heroReleaseAt(y, window.innerHeight)
        el.style.transform = `scale(${scale.toFixed(4)})`
        el.style.opacity = opacity.toFixed(3)
      } else {
        el.style.transform = `translate3d(0, ${heroStatsParallaxAt(y).toFixed(1)}px, 0)`
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply)
    }

    el.style.willChange = "transform, opacity"
    apply()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (raf) cancelAnimationFrame(raf)
      el.style.transform = ""
      el.style.opacity = ""
      el.style.willChange = ""
    }
  }, [layer])

  return (
    <div ref={ref} className={className} data-hero-scroll-layer={layer} {...rest}>
      {children}
    </div>
  )
}
