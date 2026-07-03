"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion"
import { roles } from "./data"
import { HeroName3D } from "./hero-name-3d"
import { AnimatedText } from "../animations/animated-text"

/* ── Role rotator — framer-motion per-character 3D reveal ─────────── */

/** Hero H1 name timing — shared with brain fade-in in `hero/index.tsx`. */
export const HERO_NAME_REVEAL = { delayMs: 400, durationMs: 700 } as const

const ROLE_ROTATE_INTERVAL = 4500

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.026, delayChildren: 0.05 } },
  exit: { transition: { staggerChildren: 0.012 } },
}

const charVariants: Variants = {
  hidden: { opacity: 0, y: "0.55em", rotateX: 60, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: "0em",
    rotateX: 0,
    filter: "blur(0px)",
    transition: { type: "spring", damping: 22, stiffness: 280 },
  },
  exit: {
    opacity: 0,
    y: "-0.45em",
    filter: "blur(8px)",
    transition: { duration: 0.22, ease: "easeIn" },
  },
}

/** Reduced motion: whole-line crossfade, no per-char stagger or blur. */
const reducedCharVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
}

const accentLineVariants: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 },
  },
  exit: { scaleX: 0, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
}

/** One role line split word→char so mid-word wraps never happen and every
 *  character keeps a stable global stagger index across words. */
function RoleChars({ role, reduce }: { role: string; reduce: boolean }) {
  const variants = reduce ? reducedCharVariants : charVariants
  let charIndex = 0
  return (
    <span className="inline-flex flex-wrap justify-center gap-x-[0.32em]">
      {role.split(" ").map((word, wi) => (
        <span key={`${word}-${wi}`} className="inline-flex whitespace-nowrap" style={{ transformStyle: "preserve-3d" }}>
          {word.split("").map((char) => (
            <motion.span key={charIndex++} variants={variants} className="inline-block will-change-transform">
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  )
}

export function RoleRotator({
  onNameRevealStart,
}: {
  onNameRevealStart?: () => void
} = {}) {
  const [roleIndex, setRoleIndex] = useState(0)
  const reduce = useReducedMotion() ?? false

  useEffect(() => {
    const interval = setInterval(
      () => setRoleIndex((prev) => (prev + 1) % roles.length),
      ROLE_ROTATE_INTERVAL
    )
    return () => clearInterval(interval)
  }, [])

  const role = roles[roleIndex]

  return (
    <h1
      className="animate-fade-in-up-subtle mx-auto w-full max-w-[min(100%,42rem)] px-1 font-display tracking-tight text-foreground"
      style={{ animationDelay: "0.1s", lineHeight: 1.15 }}
    >
      <span className="block text-pretty text-4xl font-semibold sm:text-5xl md:text-6xl lg:text-7xl">
        <HeroName3D delay={HERO_NAME_REVEAL.delayMs} onReveal={onNameRevealStart} />
      </span>
      <span
        className="relative mt-3 flex min-h-[2rem] w-full items-start justify-center sm:min-h-[2.4rem] md:min-h-[3rem] lg:min-h-[3.6rem]"
        style={{ perspective: "900px" }}
      >
        {/* Soft glow pooled behind the rotating role — breathes with each swap. */}
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
          aria-hidden="true"
        />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={role}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative flex items-center justify-center gap-3 sm:gap-4 md:gap-5"
          >
            <motion.span
              variants={accentLineVariants}
              className="hidden h-px w-8 origin-right bg-gradient-to-l from-primary/70 to-transparent sm:block md:w-12"
              aria-hidden="true"
            />
            <span className="gradient-text px-1 text-center text-pretty font-light text-[clamp(0.95rem,4.2vw,1.5rem)] sm:text-3xl md:text-4xl lg:text-5xl">
              <RoleChars role={role} reduce={reduce} />
            </span>
            <motion.span
              variants={accentLineVariants}
              className="hidden h-px w-8 origin-left bg-gradient-to-r from-primary/70 to-transparent sm:block md:w-12"
              aria-hidden="true"
            />
          </motion.span>
        </AnimatePresence>
        <span className="sr-only">{role}</span>
      </span>
    </h1>
  )
}

/* ── Hero subtitle ────────────────────────────────────────────────── */

export function HeroSubtitle() {
  return (
    <p className="hero-subtitle mx-auto mt-5 max-w-3xl text-pretty text-sm leading-relaxed text-white/95 sm:mt-6 sm:text-base md:mt-7 md:text-lg">
      <AnimatedText variant="blur-slide" delay={1200} stagger={30} duration={650}>
        {"Senior Software Engineer specializing in "}
        <span className="font-semibold text-foreground">AI-driven, cloud-native applications</span>
        {". Shipped production AI and large-scale systems at "}
        <span className="font-semibold text-foreground">Apple</span>
        {" and "}
        <span className="font-semibold text-foreground">Walmart</span>
        {"."}
      </AnimatedText>
    </p>
  )
}
