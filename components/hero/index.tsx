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
        className="pointer-events-none absolute inset-x-0 top-0 h-screen z-[3]"
        aria-hidden="true"
      >
        <Brain3D className="h-full w-full pointer-events-auto" />
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
        {/* Badge */}
        <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.05] px-4 py-1.5 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            Available for AI/ML consulting
          </span>
        </div>

        <RoleRotator />
        <HeroSubtitle />
        <HeroCTAs />
        <SocialLinks />
        <RotatingStats />
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-fade-in pointer-events-auto"
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
