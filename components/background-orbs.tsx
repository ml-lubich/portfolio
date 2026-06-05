"use client"

import type { CSSProperties } from "react"
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
type Orb = (typeof ORBS)[number]
type OrbStyle = CSSProperties & {
  "--orb-mobile-animation": string
  "--orb-mobile-duration": string
}

function _get_playState(inView: boolean): "running" | "paused" {
  return inView ? "running" : "paused"
}

function _get_orbAnimationName(orb: Orb, prefix = "spectrum-drift") {
  return `${prefix}-${orb.dir > 0 ? "a" : "b"}`
}

function _fmt_orbClass(index: number) {
  return index >= MOBILE_ORB_COUNT ? "hidden md:block" : ""
}

function _fmt_orbBackground(orb: Orb) {
  const h2 = (orb.hue + 35) % 360
  return [
    `radial-gradient(circle,`,
    `hsl(${orb.hue} 100% 62% / 0.55) 0%,`,
    `hsl(${orb.hue} 100% 60% / 0.45) 15%,`,
    `hsl(${h2} 95% 57% / 0.32) 30%,`,
    `hsl(${h2} 90% 55% / 0.18) 45%,`,
    `hsl(${h2} 85% 55% / 0.08) 60%,`,
    `hsl(${h2} 80% 55% / 0) 75%)`,
  ].join(" ")
}

function _fmt_orbStyle(orb: Orb, playState: "running" | "paused"): OrbStyle {
  return {
    "--orb-mobile-animation": _get_orbAnimationName(orb, "spectrum-drift-mobile"),
    "--orb-mobile-duration": `${orb.dur * 0.55}s`,
    position: "absolute",
    left: `${orb.x}%`,
    top: `${orb.y}%`,
    width: `${orb.size}vmax`,
    height: `${orb.size}vmax`,
    borderRadius: "50%",
    background: _fmt_orbBackground(orb),
    filter: "blur(10vmax)",
    willChange: "transform",
    transform: "translate(-50%, -50%)",
    animationName: _get_orbAnimationName(orb),
    animationDuration: `${orb.dur}s`,
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
    animationPlayState: playState,
  }
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

  const playState = _get_playState(inView)

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-0 min-h-full pointer-events-none overflow-hidden isolate"
      style={{ transform: "translateZ(0)" }}
      aria-hidden="true"
    >
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className={_fmt_orbClass(i)}
          data-ambient-orb="true"
          style={_fmt_orbStyle(orb, playState)}
        />
      ))}
    </div>
  )
}
