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
 *     idle slot — but the phone gets a much shorter ceiling.
 *
 *  The old 5s applied equally to both viewports, on the reasoning that the two
 *  should behave the same. On a phone that reads as a bug rather than restraint:
 *  the mesh is now most of the hero, and a handset's main thread rarely goes idle
 *  early, so the timeout — not the idle callback — decided when it appeared, and
 *  the hero sat empty for five seconds. Prefetching means the mount is warm when
 *  the gate opens, so the shorter ceiling does not drag the chunk onto the
 *  critical path. */
const BRAIN_IDLE_TIMEOUT_DESKTOP_MS = 5000
const BRAIN_IDLE_TIMEOUT_PHONE_MS = 1200

function useDeferBrain() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    // Warm the network immediately; neither of these blocks the main thread.
    void import("../brain")
    void import("../brain/use-brain-data").then((m) => m.getBrainBinPromise()).catch(() => {})

    const phone = window.matchMedia("(max-width: 639px)").matches
    const timeout = phone ? BRAIN_IDLE_TIMEOUT_PHONE_MS : BRAIN_IDLE_TIMEOUT_DESKTOP_MS
    const cb = () => setShow(true)
    const id =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback(cb, { timeout })
        : window.setTimeout(cb, timeout - 500)
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
         tight against it. */
      className="relative flex min-h-[90svh] flex-col items-center overflow-hidden pb-16 max-sm:pt-[9.5rem] sm:pt-28 md:min-h-screen md:pb-24 md:pt-36"
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
        <div className="relative flex min-h-[calc(100svh-13rem)] w-full flex-col items-center justify-center">
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
            className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
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
                share of the box is the camera's job (components/brain). */}
            <div className="hero-brain-underlay shrink-0 max-sm:aspect-square max-sm:w-[min(120vw,56svh)] sm:aspect-[6/5] sm:h-[min(100svh,70vw)]">
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
              middle of the stage is dimmed before the type is drawn over it. */}
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
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
