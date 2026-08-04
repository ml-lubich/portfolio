"use client"

import { useEffect, useRef, useState } from "react"

/* ── Ambient depth field ─────────────────────────────────────────────
 *  Three large, heavily-blurred orbs that lift the near-black page off
 *  flat with a cool wash. Deliberately NOT a rainbow: the palette here
 *  is monochrome (`--primary: 0 0% 100%` on a near-black ground), and a
 *  seven-hue spectrum smeared behind white type read as a template, not
 *  as a portfolio — it also dragged every glass surface on the page to a
 *  different random tint. One cool hue family, low opacity, so this
 *  stays atmosphere and the content stays the subject.
 *
 *  Mobile: same orbs, same proportional sizes (vmax) & opacities so the
 *  look matches desktop exactly. Performance savings come from static
 *  blur plus transform-only keyframes. Animating blur/hue filters causes
 *  visible shimmer on top of the WebGL hero.
 * ─────────────────────────────────────────────────────────────────── */

const ORBS = [
  { x: 18, y: 22, size: 62, hue: 225, dur: 52, dir: 1 },  // cool slate blue
  { x: 72, y: 30, size: 58, hue: 245, dur: 46, dir: -1 }, // deep indigo
  { x: 45, y: 82, size: 60, hue: 210, dur: 56, dir: 1 },  // steel blue
] as const

/** Fewer orbs on small screens to reduce composite layers and GPU cost */
const MOBILE_ORB_COUNT = 2

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
