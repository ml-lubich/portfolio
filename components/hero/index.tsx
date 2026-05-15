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

const MOBILE_PERFORMANCE_QUERY = "(max-width: 767px), (pointer: coarse), (hover: none)"

const Brain3D = dynamic(
  () => import("../brain").then((mod) => mod.Brain3D),
  { ssr: false }
)

function useMobilePerformanceMode() {
  const [mobilePerformanceMode, setMobilePerformanceMode] = useState(true)

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_PERFORMANCE_QUERY)
    const syncMode = () => setMobilePerformanceMode(mediaQuery.matches)
    syncMode()
    mediaQuery.addEventListener("change", syncMode)
    return () => mediaQuery.removeEventListener("change", syncMode)
  }, [])

  return mobilePerformanceMode
}

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
  const mobilePerformanceMode = useMobilePerformanceMode()
  const idleBrain = useDeferBrain()
  const [nameRevealStarted, setNameRevealStarted] = useState(false)
  const showBrain = !mobilePerformanceMode && (idleBrain || nameRevealStarted)
  /** Prefer syncing with the name; fall back to idle so the brain never stays stuck if IO never fires. */
  const brainRevealGate = nameRevealStarted || idleBrain

  return (
    <section
      id="hero"
      className="relative flex min-h-[90dvh] flex-col items-center justify-center overflow-hidden pb-16 max-sm:pt-[8.75rem] sm:pt-16 md:min-h-screen md:pb-24 md:pt-24"
    >
      {/* Spectrum lives only in this section (not fixed to viewport) — avoids mobile scroll seam / mask repaint */}
      <BackgroundOrbs />
      {!mobilePerformanceMode && <ParticleCanvas className="z-[1]" />}

      {/* 3D Brain — deferred for LCP; fades in via CSS (opacity-only, compositor) for performance */}
      <div
        className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center max-sm:items-start max-sm:justify-center max-sm:pt-[min(12vh,5.25rem)] sm:pt-0"
        aria-hidden="true"
      >
        {/* Mobile: large square viewport (was ~94vw/440px cap — too small on phones); sm+ fills layer. */}
        <div className="aspect-square shrink-0 max-sm:size-[min(96vw,36rem)] max-sm:translate-y-[min(9vh,3.25rem)] sm:h-full sm:w-full sm:translate-y-0">
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
      <div className="pointer-events-none absolute bottom-5 left-0 right-0 z-10 flex justify-center sm:bottom-10">
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
