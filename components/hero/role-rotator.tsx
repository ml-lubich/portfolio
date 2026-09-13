"use client"

import { useState, useEffect } from "react"
import { roles, HERO_BEAT, heroBeatDelay } from "./data"
import { AnimatedName } from "../animations/animated-name"
import { AnimatedText } from "../animations/animated-text"

/* ── Role rotator with smooth slide transitions ───────────────────── */

/** Hero H1 name timing — shared with brain fade-in in `hero/index.tsx`. */
export const HERO_NAME_REVEAL = { delayMs: 400, durationMs: 700 } as const

/** Hold, then animate out before the next role mounts — 4.5s per role total. */
const ROLE_HOLD_MS = 4120
const ROLE_OUT_MS = 380

export function RoleRotator({
  onNameRevealStart,
}: {
  onNameRevealStart?: () => void
} = {}) {
  const [roleIndex, setRoleIndex] = useState(0)
  const [phase, setPhase] = useState<"in" | "out">("in")
  /* Set in an effect, not in the initializer: the server has no matchMedia,
     and a different first client render would be a hydration mismatch
     (__tests__/hero-ssr-consistency.test.ts). */
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  /* Single slot, josephheupler.com's: the line animates out, THEN the next
     one mounts. Every role used to be rendered at once as stacked absolute
     spans cross-fading by opacity, plus an sr-only twin — 10 elements, and
     up to three legible simultaneously mid-swap, which is what read as a
     ghosting, broken hero. One element at a time cannot overlap itself. */
  useEffect(() => {
    /* Reduced motion never enters the out phase at all. Suppressing the
       animation in CSS was not enough: the `--out` class still applied, and
       the line still measured opacity 0 partway through every cycle even with
       `animation: none !important` winning. The phase is the thing that should
       not exist here — so the word just changes, with no exit. */
    if (reducedMotion) {
      const swap = setTimeout(
        () => setRoleIndex((prev) => (prev + 1) % roles.length),
        ROLE_HOLD_MS + ROLE_OUT_MS,
      )
      return () => clearTimeout(swap)
    }
    const hold = setTimeout(() => setPhase("out"), ROLE_HOLD_MS)
    return () => clearTimeout(hold)
  }, [roleIndex, reducedMotion])

  useEffect(() => {
    if (phase !== "out") return
    const swap = setTimeout(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length)
      setPhase("in")
    }, ROLE_OUT_MS)
    return () => clearTimeout(swap)
  }, [phase])

  return (
    <h1
      className="animate-fade-in-up-subtle mx-auto w-full max-w-[min(100%,42rem)] px-1 font-display tracking-tight text-foreground"
      style={{ animationDelay: "0.1s", lineHeight: 1.15 }}
    >
      {/* no-metallic: opt this bold wrapper out of the global `background-clip: text`
          sheen. On the wrapper it clipped the child letters' glyphs into a stale
          silver ghost that overlapped the real name — the AnimatedName chars carry
          their own color instead. */}
      <span className="no-metallic block text-pretty text-4xl font-semibold sm:text-5xl md:text-6xl lg:text-7xl">
        <AnimatedName
          name="Misha Lubich"
          trigger="mount"
          delay={HERO_NAME_REVEAL.delayMs}
          duration={HERO_NAME_REVEAL.durationMs}
          metallic
          onReveal={onNameRevealStart}
        />
      </span>
      {/* min-h is sized to fit the role's line box *plus* the pb-[0.18em] the
          gradient span needs for its descenders (see below) — otherwise this
          overflow-hidden slot re-clips exactly what that padding buys back. */}
      {/* min-h is sized to fit the role's line box *plus* the pb-[0.18em] the
          gradient span needs for its descenders (see below) — otherwise this
          overflow-hidden slot re-clips exactly what that padding buys back.
          The fixed height is also what keeps the swap from reflowing the hero
          now that only one line is mounted at a time. */}
      <span
        className="relative mt-2 flex min-h-[2.15rem] w-full items-start justify-center overflow-hidden sm:min-h-[2.6rem] md:min-h-[3.15rem] lg:min-h-[3.6rem]"
        data-testid="role-rotator"
      >
        {/* No text-pretty here: it resets text-wrap-mode to wrap, silently
            defeating whitespace-nowrap and clipping long roles in the fixed-
            height slot. lg size caps at 2.6rem so the longest role
            ("AI & Machine Learning Engineer") stays on one line. */}
        {/* pb-[0.18em]: the metallic sheen class below paints its glyphs with
            `background-clip: text`, so the letters only exist where the
            element's own box gets painted. The h1's line-height of 1.15
            leaves Instrument Serif's descenders sitting within a hair of that
            box's bottom edge, so the closed loop of every `g` ("Learning",
            "Engineer", "Engineering Lead") rendered sliced flat. The padding
            grows the paint box only. */}
        {/* aria-live replaces the sr-only twin: a duplicated copy is why the
            same role could be read twice in the DOM at once. */}
        <span
          key={`${roleIndex}-${phase}`}
          className={`role-line gradient-text mx-auto px-2 pb-[0.18em] text-center font-light whitespace-nowrap text-[clamp(0.95rem,4.2vw,1.5rem)] sm:text-3xl md:text-4xl lg:text-[2.6rem] ${
            phase === "in" ? "role-line--in" : "role-line--out"
          }`}
          aria-live="polite"
        >
          {roles[roleIndex]}
        </span>
      </span>
    </h1>
  )
}

/* ── Hero tagline — positioning statement under the rotating role ──── */

export function HeroTagline() {
  return (
    <p
      className="animate-fade-in-up-subtle mx-auto mb-4 max-w-2xl text-balance text-center font-medium uppercase tracking-[0.18em] text-foreground/70 text-[clamp(0.62rem,2.6vw,0.8rem)] sm:mb-5 sm:tracking-[0.22em] sm:text-sm"
      /* No `opacity: 0` here: `fade-in-up-subtle` is transform-only by design
         (it keeps hero text eligible for LCP), so an inline opacity would
         never be animated back. */
      style={{ animationDelay: heroBeatDelay("tagline") }}
    >
      AI Software Engineering, Consulting &amp; Solutions
    </p>
  )
}

/* ── Hero subtitle ────────────────────────────────────────────────── */

export function HeroSubtitle() {
  return (
    <p className="hero-subtitle mx-auto mt-5 max-w-3xl text-pretty text-sm leading-relaxed text-foreground/95 sm:mt-6 sm:text-base md:mt-7 md:text-lg">
      <AnimatedText variant="blur-slide" delay={HERO_BEAT.subtitle} stagger={30} duration={650}>
        {"Staff AI Engineer at "}
        <span className="font-semibold text-foreground">EchoStar</span>
        {", building "}
        <span className="font-semibold text-foreground">AI pipelines</span>
        {" for consumer-scale telecom. Previously shipped production AI and large-scale systems at "}
        <span className="font-semibold text-foreground">Apple</span>
        {" and "}
        <span className="font-semibold text-foreground">Walmart</span>
        {"."}
      </AnimatedText>
    </p>
  )
}
