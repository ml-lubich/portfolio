"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { ArrowDown } from "lucide-react"
import { BackgroundOrbs } from "@/components/background-orbs"
import { ParticleCanvas } from "./particle-canvas"
import { RoleRotator, HeroSubtitle, HERO_NAME_REVEAL } from "./role-rotator"
import { HeroCTAs, HeroProof, SocialLinks } from "./hero-actions"
import { heroOverlay } from "@/lib/theme"
import { navigateTo } from "@/components/nav/woosh-scroll"
import { RotatingStats } from "./rotating-stats"
import { TokscaleHeroBadge } from "@/components/sections/tokscale-stats"

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

/** Defer 3D brain (and Three.js) until well after LCP on every viewport.
 *  The brain is essential to the experience but should never compete with first paint —
 *  the page renders fully, then the brain chunk loads on its own and fades in.
 *  Same long timeout on desktop and mobile so behavior is consistent. */
function useDeferBrain() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const cb = () => setShow(true)
    const id =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback(cb, { timeout: 5000 })
        : window.setTimeout(cb, 4500)
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
  /** Brain mounts only after the idle/timeout signal — never tied to name reveal —
   *  so the rest of the hero is fully painted and interactive before Three.js loads. */
  const showBrain = idleBrain
  const brainRevealGate = idleBrain

  return (
    <section
      id="hero"
      className="relative flex min-h-[90svh] flex-col items-center justify-center overflow-hidden pb-16 max-sm:pt-[8.75rem] sm:pt-16 md:min-h-screen md:pb-24 md:pt-24"
    >
      {/* Spectrum lives only in this section (not fixed to viewport) — avoids mobile scroll seam / mask repaint */}
      <BackgroundOrbs />
      {!mobilePerformanceMode && <ParticleCanvas className="z-[1]" />}

      {/* 3D Brain — large hero underlay (pre–Jul 15 sizing). Sits behind glass
          actions/stats; top fade keeps it out of the name and rotating role. */}
      <div
        className="hero-brain-underlay pointer-events-none absolute inset-x-0 -bottom-[14%] top-[32%] z-[3] flex items-center justify-center sm:-bottom-[18%] sm:top-[28%]"
        aria-hidden="true"
      >
        {/* Mobile keeps a large square viewport; larger screens fill the lower underlay. */}
        <div className="aspect-square shrink-0 max-sm:size-[min(120vw,42rem)] sm:h-full sm:w-full">
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
        <RoleRotator />
        <HeroSubtitle />
        <HeroCTAs />
        <HeroProof />
        <SocialLinks />
        <TokscaleHeroBadge />
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
