"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { ArrowDown } from "lucide-react"
import { BackgroundOrbs } from "@/components/background-orbs"
import { ParticleCanvas } from "./particle-canvas"
import { RoleRotator, HeroSubtitle } from "./role-rotator"
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

export function Hero() {
  const showBrain = useDeferBrain()

  return (
    <section id="hero" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pb-24 pt-24 [clip-path:inset(0)]">
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
            <div className="h-full w-full animate-fade-in">
              <Brain3D className="h-full w-full pointer-events-auto" />
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
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center sm:px-6 pointer-events-none">
        <RoleRotator />
        <HeroSubtitle />
        <HeroCTAs />
        <SocialLinks />
        <RotatingStats />
      </div>

      {/* Scroll indicator — positioned in reserved bottom band so it never overlaps nav tabs (z-10 < nav z-50) */}
      <div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-fade-in pointer-events-auto sm:bottom-10"
        style={{ animationDelay: "0.7s", opacity: 0 }}
      >
        <button
          type="button"
          onClick={() => {
            navigateTo("#ai-expertise")
          }}
          className="group flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-2 py-3 px-4 text-muted-foreground transition-colors hover:text-primary cursor-pointer rounded-lg"
          aria-label="Scroll down"
        >
          <span className="font-mono text-xs">Explore</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </button>
      </div>
    </section>
  )
}
