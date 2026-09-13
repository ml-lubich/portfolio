"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { shouldUseCompactScrollStackViewport } from "@/lib/scroll-stack-layout"

/* ── Hero scroll craft ──────────────────────────────────────────────────
 *  Two scroll-linked moves, both transform/opacity only so the document
 *  never reflows (the `#contact` anchor-scroll fix depends on that):
 *
 *   brain — identity. It used to scale the mesh down and fade it out; it now
 *           holds steady and the next section simply covers it.
 *   stats — the Tokscale badge / stat row lags the page a touch (capped so
 *           the lagging row stays inside the hero's bottom padding and is
 *           never clipped by the section's overflow-hidden).
 *
 *  Routing: the same pure function the scroll-stack uses. Phones, tablets,
 *  coarse pointers, reduced motion and low-core devices never attach the
 *  scroll listener — the hero is static for them, and nothing here touches
 *  React state, so SSR markup and first paint are identical either way.
 * ────────────────────────────────────────────────────────────────────── */

const STATS_PARALLAX_RATE = 0.12
export const HERO_STATS_PARALLAX_MAX_PX = 48

/**
 * There is no release any more. The brain holds full size AND full opacity all
 * the way down, so the next section arrives over a steady mesh.
 *
 * Misha, 2026-09-13: "i dont want the brain to shrink as i scroll, it needs to
 * stay the same just like joseph heupler thing" — and josephheupler.com has no
 * scroll-linked treatment on its mesh at all. The shrink went first; the fade
 * survived that round and still took the mesh to 0.37 opacity by 600px, which
 * is not "the same" by any reading. Both are gone.
 *
 * Kept as a function returning constants rather than deleted: HeroScrollLayer
 * still writes transform/opacity for the stats lane, and this is the one place
 * that says the brain lane writes identity. Args are ignored by design.
 */
export function heroReleaseAt(_scrollY: number, _viewportHeight: number) {
  return { scale: 1, opacity: 1 }
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
