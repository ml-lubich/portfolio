"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { ArrowDown } from "lucide-react"
import { BackgroundOrbs } from "@/components/background-orbs"
import { ParticleCanvas } from "./particle-canvas"
import { RoleRotator, HeroSubtitle, HERO_NAME_REVEAL } from "./role-rotator"
import { HeroCTAs, SocialLinks } from "./hero-actions"
import { heroOverlay } from "@/lib/theme"
import { navigateTo } from "@/components/nav/woosh-scroll"
import { RotatingStats } from "./rotating-stats"

const Brain3D = dynamic(
  () => import("../brain").then((mod) => mod.Brain3D),
  { ssr: false }
)

/** Defer 3D brain (and Three.js) until well after LCP to reduce TBT and main-thread work. */
function useDeferBrain() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const cb = () => setShow(true)
    const id =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback(cb, { timeout: 2500 })
        : window.setTimeout(cb, 2000)
    return () => {
      if (typeof cancelIdleCallback !== "undefined") cancelIdleCallback(id as number)
      else clearTimeout(id)
    }
  }, [])
  return show
}

/** Brain opacity ramp aligned with `.animated-name-char`: ~0.6× duration + max stagger (~80ms). */
const BRAIN_FADE_MS = Math.round(HERO_NAME_REVEAL.durationMs * 1.12) + 80

export function Hero() {
  const idleBrain = useDeferBrain()
  const [nameRevealStarted, setNameRevealStarted] = useState(false)
  const showBrain = idleBrain || nameRevealStarted
  /** Prefer syncing with the name; fall back to idle so the brain never stays stuck if IO never fires. */
  const brainRevealGate = nameRevealStarted || idleBrain

  return (
    <section id="hero" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pb-16 pt-16 [clip-path:inset(0)] md:pb-24 md:pt-24">
      {/* Spectrum lives only in this section (not fixed to viewport) — avoids mobile scroll seam / mask repaint */}
      <BackgroundOrbs />
      <ParticleCanvas className="z-[1]" />

      {/* 3D Brain — deferred for LCP; fades in via CSS (opacity-only, compositor) for performance */}
      <div
        className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="h-[115vw] w-[115vw] -translate-y-[45%] sm:translate-y-0 sm:h-full sm:w-full">
          {showBrain && (
            <div className="h-full w-full">
              <Brain3D
                className="h-full w-full pointer-events-auto"
                revealGate={brainRevealGate}
                fadeDurationMs={BRAIN_FADE_MS}
              />
            </div>
          )}
        </div>
      </div>

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        aria-hidden="true"
        style={{
          background: heroOverlay,
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-3 text-center pointer-events-none md:px-6">
        <RoleRotator onNameRevealStart={() => setNameRevealStarted(true)} />
        <HeroSubtitle />
        <HeroCTAs />
        <SocialLinks />
        <RotatingStats />
      </div>

      {/* Scroll indicator — flex centering avoids transform clash with animate-fade-in-up-subtle (which overwrites translate-x) */}
      <div className="pointer-events-none absolute bottom-8 left-0 right-0 z-10 flex justify-center sm:bottom-10">
        <div
          className="pointer-events-auto animate-fade-in-up-subtle"
          style={{ animationDelay: "0.55s" }}
        >
          <a
            href="#ai-expertise"
            onClick={(e) => {
              e.preventDefault()
              navigateTo("#ai-expertise")
            }}
            className="group flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-2 px-6 py-4 text-muted-foreground transition-colors hover:text-primary cursor-pointer rounded-lg touch-manipulation"
            aria-label="Scroll down to Explore section"
          >
            <span className="font-mono text-xs">Explore</span>
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  )
}
