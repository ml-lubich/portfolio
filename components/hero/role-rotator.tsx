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
      className="animate-fade-in-up-subtle font-display tracking-tight text-foreground"
      style={{ animationDelay: "0.1s", lineHeight: 1.1 }}
    >
      <span className="block text-balance text-4xl font-semibold sm:text-5xl md:text-6xl lg:text-7xl">
        <AnimatedName
          name="Misha Lubich"
          trigger="mount"
          delay={HERO_NAME_REVEAL.delayMs}
          duration={HERO_NAME_REVEAL.durationMs}
          metallic
          onReveal={onNameRevealStart}
        />
      </span>
      <span className="relative mt-3 block h-[2rem] sm:h-[2.4rem] md:h-[3rem] lg:h-[3.6rem] overflow-hidden">
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
              <span className="gradient-text whitespace-nowrap text-2xl font-light sm:text-3xl md:text-4xl lg:text-5xl">
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
    <p className="mx-auto mt-14 max-w-3xl text-sm leading-relaxed text-white/95 sm:text-base md:text-lg">
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
