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
 *  static blur plus transform-only keyframes. Animating blur/hue filters
 *  causes visible shimmer on top of the WebGL hero.
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

/** Fewer orbs on small screens to reduce composite layers and GPU cost */
const MOBILE_ORB_COUNT = 4

function _fmt_orbClass(index: number) {
  const visibility = index >= MOBILE_ORB_COUNT ? " hidden md:block" : ""
  return `ambient-orb ambient-orb--${index}${visibility}`
}

export function BackgroundOrbs() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)

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

  return (
    <div
      ref={rootRef}
      className="ambient-orbs-root absolute inset-0 z-0 min-h-full pointer-events-none overflow-hidden isolate"
      data-orbs-in-view={inView ? "true" : "false"}
      aria-hidden="true"
    >
      {ORBS.map((_, i) => (
        <div
          key={i}
          className={_fmt_orbClass(i)}
          data-ambient-orb="true"
        />
      ))}
    </div>
  )
}
