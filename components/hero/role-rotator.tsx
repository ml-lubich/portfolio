"use client"

import { useState, useRef, useEffect } from "react"
import { roles } from "./data"
import { AnimatedName } from "../animations/animated-name"
import { AnimatedText } from "../animations/animated-text"

/* ── Role rotator with smooth slide transitions ───────────────────── */

/** Hero H1 name timing — shared with brain fade-in in `hero/index.tsx`. */
export const HERO_NAME_REVEAL = { delayMs: 400, durationMs: 700 } as const

export function RoleRotator({
  onNameRevealStart,
}: {
  onNameRevealStart?: () => void
} = {}) {
  const [roleIndex, setRoleIndex] = useState(0)
  const [prevRoleIndex, setPrevRoleIndex] = useState(-1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => {
        setPrevRoleIndex(prev)
        setIsTransitioning(true)
        if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
        transitionTimeout.current = setTimeout(() => setIsTransitioning(false), 1000)
        return (prev + 1) % roles.length
      })
    }, 4500)
    return () => {
      clearInterval(interval)
      if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
    }
  }, [])

  return (
    <h1
      className="animate-fade-in-up-subtle mx-auto w-full max-w-[min(100%,42rem)] px-1 font-display tracking-tight text-foreground"
      style={{ animationDelay: "0.1s", lineHeight: 1.15 }}
    >
      <span className="block text-pretty text-4xl font-semibold sm:text-5xl md:text-6xl lg:text-7xl">
        <AnimatedName
          name="Misha Lubich"
          trigger="mount"
          delay={HERO_NAME_REVEAL.delayMs}
          duration={HERO_NAME_REVEAL.durationMs}
          metallic
          onReveal={onNameRevealStart}
        />
      </span>
      <span className="relative mt-2 block min-h-[4.25rem] w-full overflow-hidden sm:min-h-[2.4rem] md:min-h-[3rem] lg:min-h-[3.6rem]">
        {roles.map((role, i) => {
          const isActive = i === roleIndex
          const isLeaving = i === prevRoleIndex && isTransitioning

          let translateY = "60px"
          let opacity = 0
          let scale = "scale(0.96)"

          if (isActive) {
            translateY = "0px"
            opacity = 1
            scale = "scale(1)"
          } else if (isLeaving) {
            translateY = "-50px"
            opacity = 0
            scale = "scale(0.97)"
          }

          return (
            <span
              key={role}
              className="absolute inset-x-0 top-0 flex items-start justify-center"
              style={{
                opacity,
                transform: `translateY(${translateY}) ${scale}`,
                transition: isActive || isLeaving
                  ? "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                  : "none",
              }}
              aria-hidden={!isActive}
            >
              <span className="gradient-text mx-auto max-w-[min(calc(100vw-1.5rem),36rem)] px-2 text-center text-pretty text-2xl font-light whitespace-normal sm:text-3xl md:text-4xl lg:text-5xl">
                {role}
              </span>
            </span>
          )
        })}
        <span className="sr-only">{roles[roleIndex]}</span>
      </span>
    </h1>
  )
}

/* ── Hero subtitle ────────────────────────────────────────────────── */

export function HeroSubtitle() {
  return (
    <p className="mx-auto mt-5 max-w-3xl text-pretty text-sm leading-relaxed text-white/95 sm:mt-6 sm:text-base md:mt-7 md:text-lg">
      <AnimatedText variant="blur-slide" delay={1200} stagger={30} duration={650}>
        {"Senior Software Engineer specializing in "}
        <span className="font-semibold text-foreground">AI-driven, cloud-native applications</span>
        {". Led the design and deployment of a production AI platform with multi-agent orchestration at "}
        <span className="font-semibold text-foreground">Braintrust Data</span>
        {", "}
        <span className="font-semibold text-foreground">Apple</span>
        {", and "}
        <span className="font-semibold text-foreground">Walmart</span>
        {"."}
      </AnimatedText>
    </p>
  )
}
