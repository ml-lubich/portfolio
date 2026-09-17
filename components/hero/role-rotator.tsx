"use client"

import { useState, useEffect } from "react"
import { roles, HERO_BEAT, heroBeatDelay } from "./data"
import { AnimatedName } from "../animations/animated-name"
import { AnimatedText } from "../animations/animated-text"

/* ── Role rotator with smooth crossfade ───────────────────────────── */

/** Hero H1 name timing — shared with brain fade-in in `hero/index.tsx`. */
export const HERO_NAME_REVEAL = { delayMs: 400, durationMs: 700 } as const

/** Hold each role on screen — long enough to read, not a constant flicker. */
export const ROLE_HOLD_MS = 7600
/** Outgoing + incoming overlap — gradual, not a hard cut. */
export const ROLE_CROSSFADE_MS = 1050

export function RoleRotator({
  onNameRevealStart,
}: {
  onNameRevealStart?: () => void
} = {}) {
  const [roleIndex, setRoleIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState<number | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  useEffect(() => {
    const hold = reducedMotion ? ROLE_HOLD_MS + ROLE_CROSSFADE_MS : ROLE_HOLD_MS
    const id = setTimeout(() => {
      setPrevIndex(roleIndex)
      setRoleIndex((prev) => (prev + 1) % roles.length)
    }, hold)
    return () => clearTimeout(id)
  }, [roleIndex, reducedMotion])

  useEffect(() => {
    if (prevIndex === null) return
    if (reducedMotion) {
      setPrevIndex(null)
      return
    }
    const id = setTimeout(() => setPrevIndex(null), ROLE_CROSSFADE_MS)
    return () => clearTimeout(id)
  }, [prevIndex, roleIndex, reducedMotion])

  const transitioning = prevIndex !== null && !reducedMotion

  return (
    <h1
      className="animate-fade-in-up-subtle mx-auto w-full max-w-[min(100%,42rem)] px-1 font-display tracking-tight text-foreground"
      style={{ animationDelay: "0.1s", lineHeight: 1.15 }}
    >
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
      <span
        className="relative mt-2 flex min-h-[2.15rem] w-full items-start justify-center overflow-hidden sm:min-h-[2.6rem] md:min-h-[3.15rem] lg:min-h-[3.6rem]"
        data-testid="role-rotator"
      >
        {transitioning && (
          <span
            className="role-line role-line--out hero-metallic gradient-text pointer-events-none absolute inset-x-0 top-0 mx-auto px-2 pb-[0.18em] text-center font-semibold whitespace-nowrap text-[clamp(0.95rem,4.2vw,1.5rem)] sm:text-3xl md:text-4xl lg:text-[2.6rem]"
            aria-hidden
          >
            {roles[prevIndex!]}
          </span>
        )}
        <span
          className={`role-line hero-metallic gradient-text mx-auto px-2 pb-[0.18em] text-center font-semibold whitespace-nowrap text-[clamp(0.95rem,4.2vw,1.5rem)] sm:text-3xl md:text-4xl lg:text-[2.6rem] ${
            transitioning ? "role-line--in" : ""
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
      className="animate-fade-in-up-subtle mx-auto mb-4 max-w-2xl text-balance text-center font-medium uppercase tracking-[0.18em] text-foreground/90 text-[clamp(0.62rem,2.6vw,0.8rem)] sm:mb-5 sm:tracking-[0.22em] sm:text-sm"
      style={{ animationDelay: heroBeatDelay("tagline") }}
    >
      AI Software Engineering, Consulting &amp; Solutions
    </p>
  )
}

/* ── Hero subtitle ────────────────────────────────────────────────── */

export function HeroSubtitle() {
  return (
    <p className="hero-subtitle mx-auto mt-5 max-w-3xl text-pretty text-sm leading-relaxed text-foreground/92 sm:mt-6 sm:text-base md:mt-7 md:text-lg">
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
