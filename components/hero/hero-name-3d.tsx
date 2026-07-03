"use client"

import { useEffect, useRef } from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion"

/* ── Hero name — letters suspended in 3D space ────────────────────── */

const NAME = "Misha Lubich"

/** Deterministic per-letter depth field (translateZ, px). Fixed values — never
 *  randomness — so SSR renders identically across passes. Alternating signs keep
 *  neighbouring letters on different planes for a real parallax spread. */
const DEPTHS = [21, -14, 17, -20, 12, 4, -17, 23, -11, 19, -22, 13]

/** Max plane tilt (deg) as the cursor crosses the viewport. The whole name
 *  rotates as one rigid plane — letters never displace individually, so the
 *  word always stays intact; their z-depths give the parallax inside the tilt. */
const TILT_X = -7
const TILT_Y = 10

/** Lazy spring so the name drifts after the cursor rather than tracking it. */
const TILT_SPRING = { stiffness: 55, damping: 18 }

const ENTRANCE_SPRING = { type: "spring" as const, stiffness: 210, damping: 22 }

function FloatingChar({
  char,
  index,
  depth,
  reduce,
  delayMs,
}: {
  char: string
  index: number
  depth: number
  reduce: boolean
  delayMs: number
}) {
  const delay = delayMs / 1000 + index * 0.045

  return (
    <motion.span
      data-hero-3d-char
      className="inline-block"
      style={{ z: reduce ? 0 : depth, transformStyle: "preserve-3d" }}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 38, rotateX: 50, filter: "blur(12px)" }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
      transition={{
        opacity: { duration: 0.5, delay },
        filter: { duration: 0.55, delay },
        y: { ...ENTRANCE_SPRING, delay },
        rotateX: { ...ENTRANCE_SPRING, delay },
      }}
    >
      {/* Idle float lives in CSS (compositor-only, infinite). Uniform amplitude
          with tiny phase offsets: the word breathes together instead of letters
          wandering apart. */}
      <span
        className="hero-name-3d-bob inline-block"
        style={
          {
            "--bob-amp": "2.4px",
            "--bob-dur": `${(5.2 + (index % 3) * 0.4).toFixed(2)}s`,
            "--bob-delay": `${((index % 5) * -0.5).toFixed(2)}s`,
          } as React.CSSProperties
        }
      >
        <span className="hero-name-3d-char inline-block">{char}</span>
      </span>
    </motion.span>
  )
}

/** "Misha Lubich" as individually depth-placed letters inside a perspective
 *  scene: staggered 3D entrance, compositor CSS idle float, and a cursor-driven
 *  tilt of the whole name plane on fine pointers only (phones stay light).
 *  The tilt rotates the word as one rigid unit — the brain-like drift comes
 *  from letter depths, not from letters moving away from each other. */
export function HeroName3D({
  delay = 0,
  onReveal,
}: {
  /** ms before the entrance starts — mirrors the old AnimatedName contract. */
  delay?: number
  /** Fires once when the reveal begins (brain fade-in is keyed off this). */
  onReveal?: () => void
}) {
  const reduce = useReducedMotion() ?? false
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const mx = useSpring(mouseX, TILT_SPRING)
  const my = useSpring(mouseY, TILT_SPRING)
  const rotateY = useTransform(mx, (v) => (reduce ? 0 : v * TILT_Y))
  const rotateX = useTransform(my, (v) => (reduce ? 0 : v * TILT_X))
  const onRevealRef = useRef(onReveal)
  onRevealRef.current = onReveal

  useEffect(() => {
    const t = setTimeout(() => onRevealRef.current?.(), delay)
    return () => clearTimeout(t)
  }, [delay])

  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return
    const onMove = (e: PointerEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5)
      mouseY.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [reduce, mouseX, mouseY])

  let charIndex = 0
  return (
    <span className="relative inline-block max-w-full" style={{ perspective: "1200px" }}>
      <span className="sr-only">{NAME}</span>
      <motion.span
        aria-hidden="true"
        className="flex flex-wrap justify-center gap-x-[0.35em] gap-y-1.5 px-1 sm:gap-y-1"
        style={{ transformStyle: "preserve-3d", rotateX, rotateY }}
      >
        {NAME.split(" ").map((word, wi) => (
          <span
            key={`${word}-${wi}`}
            className="inline-flex"
            style={{ transformStyle: "preserve-3d" }}
          >
            {word.split("").map((char) => {
              const i = charIndex++
              return (
                <FloatingChar
                  key={i}
                  char={char}
                  index={i}
                  depth={DEPTHS[i % DEPTHS.length]}
                  reduce={reduce}
                  delayMs={delay}
                />
              )
            })}
          </span>
        ))}
      </motion.span>
    </span>
  )
}
