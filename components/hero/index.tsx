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
      className="relative flex min-h-[90svh] flex-col items-center overflow-hidden pb-16 max-sm:min-h-[100svh] max-sm:justify-center max-sm:pt-32 sm:pt-28 md:min-h-screen md:pb-24 md:pt-36"
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

      {/* Content — two stacked blocks:
          1. the stage, one screenful, where the big brain sits behind the copy
             and CTAs (modelled on josephheupler.com: full-bleed mesh, strong
             centre wash so the type stays readable over it);
          2. everything else, which sits *below* the mesh instead of across it —
             the Tokscale card and stat row used to land mid-brain. */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-3 text-center pointer-events-none md:px-6">
        {/* Phones: no forced screenful — the stage is the copy's own height so
            the Tokscale badge / social row / stats sit inside the first screen
            (where the reference keeps its portrait). */}
        <div className="relative flex min-h-[calc(100svh-13rem)] w-full flex-col items-center justify-center max-sm:min-h-0">
          {/* Brain stage — anchored to the viewport height (svh), never to the
              hero's own height. On sm+ it is a landscape 6:5 box a full
              viewport-plus tall ("Joseph-sized"): the mesh reads as the
              dominant object with the name across its centre, the landscape
              aspect gives the auto-rotating long axis horizontal headroom so
              the tighter desktop camera never slices it, and the section's
              top padding + the underlay mask keep the crown clear of the nav.
              Phones keep their own tier (mobile perf decision).
              HeroScrollLayer adds the scroll-out "release" (desktop only). */}
          <HeroScrollLayer
            layer="brain"
            /* Phones: the layer is centred on the copy, but the reference
               hangs its brain ~100px lower than its text block's centre, so
               the name clears the crown and the CTAs ride the lower half.
               Our copy is taller (role slot, 2-row CTAs), so 48px lands the
               mesh centre the same 230px under the name and on the CTA row —
               measured at 390×844 and 430×932. HeroScrollLayer never attaches
               its scroll transform on phones, so nothing overwrites this. */
            className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center max-sm:translate-y-12"
            aria-hidden
          >
            {/* The mask lives on the box, not the underlay: a mask clips to its
                own border box, and the underlay is only the stage's height —
                on the underlay it silently sliced the crown and foot off any
                box taller than the stage.

                Sized from the viewport's SHORT side and never taller than one
                viewport: a box taller than the section runs past its bottom
                edge and gets hard-clipped by overflow-hidden before the mask's
                foot fade finishes (shipped like that once; the fit guard in
                e2e/hero-brain-fit.spec.ts now fails on it), and a box bound
                only by svh runs off the sides on wide monitors. The mesh's
                share of the box is the camera's job (components/brain).

                Phones: josephheupler.com's canvas verbatim — full width, a
                fixed 420px tall, mesh ~300px inside it (camera tiers in
                components/brain/index.tsx). Fixed px, not vw/svh: his mesh is
                the same 300px on a 390 and a 430 wide phone, and a height-
                framed camera makes ours the same. */}
            <div className="hero-brain-underlay shrink-0 max-sm:h-[420px] max-sm:w-full sm:aspect-[6/5] sm:h-[min(100svh,70vw)]">
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

          {/* Centre wash — the mesh is dense enough to swallow body copy, so the
              middle of the stage is dimmed before the type is drawn over it.
              Phones: shifted with the brain layer above, or it dims the crown
              and leaves the foot (under the CTAs) raw; and run out to the
              screen edges (the wrapper's px-3), or the ellipse clips into a
              visible vertical seam at the stage's sides. */}
          <div
            className="pointer-events-none absolute inset-0 z-[1] max-sm:-inset-x-3 max-sm:translate-y-12"
            style={{ background: "var(--hero-stage-scrim)" }}
            aria-hidden="true"
          />

          <div className="relative z-[2] w-full">
            <RoleRotator />
            <HeroTagline />
            <HeroSubtitle />
            <HeroCTAs />
          </div>
        </div>

        {/* Below the brain — lags the page slightly on desktop (parallax). */}
        <HeroScrollLayer layer="stats" className="relative z-[2]">
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
