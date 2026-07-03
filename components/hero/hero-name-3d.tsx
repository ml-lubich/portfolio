"use client"

import { useEffect, useRef } from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"

/* ── Hero name — letters suspended in 3D space ────────────────────── */

const NAME = "Misha Lubich"

/** Deterministic per-letter depth field (translateZ, px). Fixed values — never
 *  randomness — so SSR renders identically across passes. Alternating signs keep
 *  neighbouring letters on different planes for a real parallax spread. */
const DEPTHS = [42, -28, 34, -40, 24, 8, -34, 46, -22, 38, -44, 26]

/** How strongly cursor position displaces a letter, scaled by its depth. */
const PARALLAX_X = 0.9
const PARALLAX_Y = 0.6

/** Lazy spring so the letters drift after the cursor rather than track it. */
const PARALLAX_SPRING = { stiffness: 55, damping: 18 }

const ENTRANCE_SPRING = { type: "spring" as const, stiffness: 210, damping: 22 }

function FloatingChar({
  char,
  index,
  depth,
  mx,
  my,
  reduce,
  delayMs,
}: {
  char: string
  index: number
  depth: number
  mx: MotionValue<number>
  my: MotionValue<number>
  reduce: boolean
  delayMs: number
}) {
  const px = useTransform(mx, (v) => (reduce ? 0 : v * depth * PARALLAX_X))
  const py = useTransform(my, (v) => (reduce ? 0 : v * depth * PARALLAX_Y))
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
      {/* Idle float lives in CSS (compositor-only, infinite) so framer springs
          only ever drive the parallax layer — the two never fight. */}
      <span
        className="hero-name-3d-bob inline-block"
        style={
          {
            "--bob-amp": `${(2.5 + Math.abs(depth) * 0.06).toFixed(2)}px`,
            "--bob-dur": `${(4.6 + (index % 5) * 0.7).toFixed(2)}s`,
            "--bob-delay": `${((index % 7) * -0.6).toFixed(2)}s`,
          } as React.CSSProperties
        }
      >
        <motion.span className="hero-name-3d-char inline-block" style={{ x: px, y: py }}>
          {char}
        </motion.span>
      </span>
    </motion.span>
  )
}

/** "Misha Lubich" as individually depth-placed letters inside a perspective
 *  scene: staggered 3D entrance, compositor CSS idle float, and cursor
 *  parallax on fine pointers only (phones/tablets get the light version). */
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
  const mx = useSpring(mouseX, PARALLAX_SPRING)
  const my = useSpring(mouseY, PARALLAX_SPRING)
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
    <span className="relative inline-block max-w-full" style={{ perspective: "1000px" }}>
      <span className="sr-only">{NAME}</span>
      <span
        aria-hidden="true"
        className="flex flex-wrap justify-center gap-x-[0.35em] gap-y-1.5 px-1 sm:gap-y-1"
        style={{ transformStyle: "preserve-3d" }}
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
                  mx={mx}
                  my={my}
                  reduce={reduce}
                  delayMs={delay}
                />
              )
            })}
          </span>
        ))}
      </span>
    </span>
  )
}
