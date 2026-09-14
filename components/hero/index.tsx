"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { ArrowDown } from "lucide-react"
import { BackgroundOrbs } from "@/components/background-orbs"
import { ParticleCanvas } from "./particle-canvas"
import { RoleRotator, HeroTagline, HeroSubtitle, HERO_NAME_REVEAL } from "./role-rotator"
import { HeroCTAs, SocialLinks } from "./hero-actions"
import { heroOverlay, heroContentScrim } from "@/lib/theme"
import { navigateTo } from "@/components/nav/woosh-scroll"
import { RotatingStats } from "./rotating-stats"
import { heroBeatDelay } from "./data"
import { TokscaleHeroBadge } from "@/components/sections/tokscale-stats"
import { HeroScrollLayer } from "./hero-scroll-release"

const MOBILE_PERFORMANCE_QUERY = "(max-width: 767px), (pointer: coarse), (hover: none)"

import { CircuitField } from "@/components/circuit-field"

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

/** Defer the 3D brain (and Three.js) past LCP, then get it on screen quickly.
 *
 *  Two separate concerns, previously conflated into one 5s idle timeout:
 *
 *  1. *Downloading* the chunk and brain.bin costs no main-thread time, so it
 *     starts immediately and overlaps first paint instead of queuing behind it.
 *  2. *Mounting* Three.js is what competes with LCP, so that still waits for an
 *     idle slot — but the ceiling on that wait is short.
 *
 *  The ceiling used to be 5s, on the reasoning that it protected LCP. It did
 *  not: on both viewports the idle callback never found a slot, so the ceiling
 *  — not idleness — decided when the brain appeared. The phone showed it first
 *  (five seconds of empty hero on a handset, where the mesh *is* the hero), and
 *  desktop turned out to have the same bug: measured at 1440×900 on a
 *  production build, first telemetry landed 6.8s after navigation while LCP had
 *  already finished at 0.34s. Five seconds of empty hero protecting a paint
 *  that happened in a third of a second.
 *
 *  1200ms on every viewport — josephheupler.com's number, and this brain is
 *  modelled on that one down to the load. Prefetching (above) means the mount
 *  is warm when the gate opens, so the shorter ceiling never drags the chunk
 *  onto the critical path, and LCP does not move: 344ms before, 232ms after,
 *  median of 3 production loads at 1440×900 — i.e. unchanged within the noise
 *  of this machine, certainly not a regression. Time to first brain over the
 *  same runs: 6.8s → 3.5s. */
const BRAIN_IDLE_TIMEOUT_MS = 1200

function useDeferBrain() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    // Warm the network immediately; neither of these blocks the main thread.
    void import("../brain")
    void import("../brain/use-brain-data").then((m) => m.getBrainBinPromise()).catch(() => {})

    const cb = () => setShow(true)
    const id =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback(cb, { timeout: BRAIN_IDLE_TIMEOUT_MS })
        : window.setTimeout(cb, BRAIN_IDLE_TIMEOUT_MS - 500)
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
      /* Top padding clears the fixed nav shell — the name block must never sit
         tight against it.
         Phones: one screenful with the content centred in it, the
         josephheupler.com hero measured at 390×844 / 430×932 (section
         `min-h-[100svh] justify-center pt-24 pb-16`, pt-32 here because
         our floating nav pill ends 22px lower than his header; see
         __tests__/hero-mobile-layout.test.ts). Before, the 9.5rem pad left a
         210px empty band under the nav and the section ran to 150% of the
         viewport with the stat row a full screen down. */
      /* md:pt-28, not pt-36: the hero is three stacked bands now (brain, CTAs,
         stats) rather than one centred stack, so the 144px pad was 32px the
         CTA row could not spare — it pushed the row down onto the scroll cue
         at 1440×900. */
      className="relative flex min-h-[90svh] flex-col items-center justify-center overflow-hidden pb-16 max-sm:min-h-[100svh] max-sm:justify-center max-sm:pt-32 sm:pt-28 md:min-h-screen md:pb-24 md:pt-28"
    >
      {/* Spectrum lives only in this section (not fixed to viewport) — avoids mobile scroll seam / mask repaint */}
      <BackgroundOrbs />
      {!mobilePerformanceMode && <ParticleCanvas className="z-[1]" />}

      {/* Circuit backdrop — behind the brain and every content layer. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[100svh]" aria-hidden>
        <CircuitField />
      </div>

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        aria-hidden="true"
        style={{
          background: heroOverlay,
        }}
      />

      {/* Content scrim — subtle center gradient */}
      <div
        className="pointer-events-none absolute inset-0 z-[4]"
        aria-hidden="true"
        style={{ background: heroContentScrim }}
      />

      {/* One-shot loading hairline (josephheupler.com's `.scanline`) — sweeps
          the hero once while the WebGL brain compiles. Above the copy rather
          than under it: at z-[5] the brain's own canvas hid it. */}
      <div className="hero-scanline z-20" aria-hidden="true" style={{ top: 0 }} />

      {/* Brain stage — 1:1 with josephheupler.com's `.brain-stage`:
          absolute inset-0, box `h-[min(92vh,860px)] w-[min(120%,980px)]`.
          Phone size is the CSS override on `.hero-brain-underlay`
          (54svh / 420px). Copy and CTAs overlay the mesh the way his do. */}
      <div
        className="hero-brain-stage pointer-events-none absolute inset-0 z-[1] flex items-center justify-center"
        aria-hidden
      >
        <HeroScrollLayer
          layer="brain"
          className="pointer-events-none flex h-full w-full items-center justify-center"
        >
          <div className="hero-brain-underlay h-[min(92vh,860px)] w-[min(120%,980px)] shrink-0">
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
        </HeroScrollLayer>
      </div>

      {/* Centre wash — light, because type carries its own ink halo. */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{ background: "var(--hero-stage-scrim)" }}
        aria-hidden="true"
      />

      {/* Copy + CTAs + stats sit over the mesh, josephheupler.com's read. */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-3 text-center pointer-events-none md:px-6">
        <div className="hero-copy-halo relative z-[3] w-full">
          <HeroTagline />
          <RoleRotator />
          <HeroSubtitle />
        </div>
        <div className="relative z-[3] w-full">
          <HeroCTAs />
        </div>

        <HeroScrollLayer layer="stats" className="relative z-[3]">
          <TokscaleHeroBadge />
          <SocialLinks />
          <RotatingStats />
        </HeroScrollLayer>
      </div>

      {/* Scroll indicator — flex centering avoids transform clash with animate-fade-in-up-subtle (which overwrites translate-x) */}
      <div className="pointer-events-none absolute bottom-5 left-0 right-0 z-10 flex justify-center sm:bottom-10">
        <div
          className="pointer-events-auto animate-fade-in-up-subtle"
          style={{ animationDelay: heroBeatDelay("scrollCue") }}
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
