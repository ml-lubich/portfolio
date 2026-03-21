"use client"

import { useEffect, useRef, useState } from "react"

/* ── Cursor.com-style light spectrum ─────────────────────────────────
 *  7 large, heavily-blurred orbs that overlap and blend into a
 *  continuous rainbow spectrum across the viewport. Each orb is big
 *  enough (~55-65 vw) that neighbours merge seamlessly — no polka
 *  dots, just smooth colour fields. Bright modern hues, low enough
 *  opacity to keep text white & readable.
 *
 *  Mobile: same 7 orbs, same proportional sizes (vmax) & opacities
 *  so the look matches desktop exactly. Performance savings come from
 *  lighter blur (7vmax vs 10vmax) and simpler keyframes that skip
 *  the per-frame hue-rotate filter.
 * ─────────────────────────────────────────────────────────────────── */

const ORBS = [
  { x: 10, y: 20, size: 60, hue: 320, dur: 52, dir: 1 },  // hot pink
  { x: 30, y: 65, size: 58, hue: 265, dur: 46, dir: -1 },  // electric violet
  { x: 50, y: 15, size: 62, hue: 210, dur: 56, dir: 1 },  // vivid blue
  { x: 70, y: 55, size: 56, hue: 170, dur: 44, dir: -1 },  // bright teal
  { x: 85, y: 25, size: 58, hue: 45, dur: 50, dir: 1 },  // warm amber
  { x: 20, y: 80, size: 55, hue: 140, dur: 48, dir: 1 },  // neon green
  { x: 75, y: 80, size: 56, hue: 350, dur: 42, dir: -1 },  // bright coral
] as const

const MOBILE_BREAKPOINT = 768
/** Fewer orbs on small screens to reduce composite layers and GPU cost */
const MOBILE_ORB_COUNT = 5

export function BackgroundOrbs() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0,
      rootMargin: "0px",
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    const reducedMotionMql = window.matchMedia("(prefers-reduced-motion: reduce)")
    const setReduced = () => setPrefersReducedMotion(reducedMotionMql.matches)
    checkMobile()
    setReduced()
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", checkMobile)
    reducedMotionMql.addEventListener("change", setReduced)

    return () => {
      mql.removeEventListener("change", checkMobile)
      reducedMotionMql.removeEventListener("change", setReduced)
    }
  }, [])

  /* Transform-only animation (no hue-rotate) for mobile and reduced-motion — much cheaper on GPU */
  const useLightAnimation = isMobile || prefersReducedMotion
  const orbsToRender = isMobile ? ORBS.slice(0, MOBILE_ORB_COUNT) : ORBS

  const playState = inView ? "running" : "paused"

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-0 min-h-full pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {orbsToRender.map((orb, i) => {
        const h = orb.hue
        const h2 = (h + 35) % 360

        const blur = useLightAnimation ? "blur(7vmax)" : "blur(10vmax)"
        const animationName = useLightAnimation
          ? `spectrum-drift-mobile-${orb.dir > 0 ? "a" : "b"}`
          : `spectrum-drift-${orb.dir > 0 ? "a" : "b"}`

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: `${orb.size}vmax`,
              height: `${orb.size}vmax`,
              borderRadius: "50%",
              background: [
                `radial-gradient(circle,`,
                `hsl(${h} 100% 62% / 0.55) 0%,`,
                `hsl(${h} 100% 60% / 0.45) 15%,`,
                `hsl(${h2} 95% 57% / 0.32) 30%,`,
                `hsl(${h2} 90% 55% / 0.18) 45%,`,
                `hsl(${h2} 85% 55% / 0.08) 60%,`,
                `hsl(${h2} 80% 55% / 0) 75%)`,
              ].join(" "),
              filter: blur,
              willChange: useLightAnimation ? "transform" : "filter",
              transform: "translate(-50%, -50%)",
              animationName,
              animationDuration: `${orb.dur}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationPlayState: playState,
            }}
          />
        )
      })}
    </div>
  )
}
