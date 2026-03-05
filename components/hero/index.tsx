"use client"

import dynamic from "next/dynamic"
import { ArrowDown } from "lucide-react"
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

export function Hero() {
  return (
    <section id="hero" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pb-16 pt-24 [clip-path:inset(0)]">
      <ParticleCanvas />

      {/* 3D Brain */}
      <div
        className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="h-[115vw] w-[115vw] -translate-y-[45%] sm:translate-y-0 sm:h-full sm:w-full">
          <Brain3D className="h-full w-full pointer-events-auto" />
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

      {/* Scroll indicator */}
      <div
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-fade-in pointer-events-auto"
        style={{ animationDelay: "2.6s", opacity: 0 }}
      >
        <button
          type="button"
          onClick={() => {
            navigateTo("#ai-expertise")
          }}
          className="group flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-primary cursor-pointer"
          aria-label="Scroll down"
        >
          <span className="font-mono text-xs">Explore</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </button>
      </div>
    </section>
  )
}
