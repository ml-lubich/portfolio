"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { ArrowDown } from "lucide-react"
import { ParticleCanvas } from "./particle-canvas"
import { RoleRotator, HeroSubtitle } from "./role-rotator"
import { HeroCTAs, SocialLinks } from "./hero-actions"
import { RotatingStats } from "./rotating-stats"

const Brain3D = dynamic(
  () => import("../brain").then((mod) => mod.Brain3D),
  { ssr: false }
)

export function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      setMousePosition({ x, y })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section id="hero" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pb-16 pt-24 [clip-path:inset(0)]">
      <ParticleCanvas />

      {/* Gradient orbs with parallax */}
      <div
        className="pointer-events-none absolute -left-40 top-20 h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-3xl animate-float"
        aria-hidden="true"
        style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-20 h-[32rem] w-[32rem] rounded-full bg-accent/10 blur-3xl animate-float"
        style={{ animationDelay: "3s", transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)` }}
        aria-hidden="true"
      />

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
          background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(10,12,20,0.55) 0%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center sm:px-6 pointer-events-none">
        {/* Badge */}
        <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 backdrop-blur-sm">
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
        <a
          href="#ai-expertise"
          className="group flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          aria-label="Scroll down"
        >
          <span className="font-mono text-xs">Explore</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </a>
      </div>
    </section>
  )
}
