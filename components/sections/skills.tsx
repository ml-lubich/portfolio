"use client"

import { useState, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { AnimatedSection } from "../animations/animated-section"
import { AnimatedBars } from "../animations/animated-bars"
import { getSkillIcon } from "./skill-icons"
import { SectionHeader } from "../layout/section-header"
import { skillCategories, proficiencyBars } from "@/data/skills"
import { hex } from "@/lib/theme"
import { SkillDetailModal } from "./skill-detail-modal"

const ParticleField = dynamic(
  () => import("../three/scene-backgrounds").then((mod) => mod.ParticleField),
  { ssr: false }
)

/* ── Tilt + horizontal glass-shine card wrapper ── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [shine, setShine] = useState({ x: 50, opacity: 0 })

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    setTilt({ x: (y - 0.5) * -10, y: (x - 0.5) * 10 })
    setShine({ x: x * 100, opacity: 1 })
  }, [])

  const handleLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 })
    setShine({ x: 50, opacity: 0 })
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.x || tilt.y ? 1.04 : 1})`,
        transition: "transform 0.15s ease-out",
        willChange: "transform",
      }}
    >
      {children}
      {/* Horizontal glass shine band — tracks mouse X */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-2xl"
        style={{
          background: `linear-gradient(105deg, transparent ${shine.x - 18}%, hsla(0,0%,100%,0.02) ${shine.x - 8}%, hsla(0,0%,100%,0.12) ${shine.x - 1}%, hsla(0,0%,100%,0.12) ${shine.x + 1}%, hsla(0,0%,100%,0.02) ${shine.x + 8}%, transparent ${shine.x + 18}%)`,
          opacity: shine.opacity,
          transition: "opacity 0.25s ease-out",
        }}
      />
    </div>
  )
}

export function Skills() {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleSelectSkill = useCallback((skill: string) => {
    setSelectedSkill(skill)
    setModalOpen(true)
  }, [])

  return (
    <AnimatedSection id="skills" className="relative py-14 sm:py-20 overflow-hidden">
      {/* Ambient background orbs — constant, overlapping, smoothly drifting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-20 top-1/4 h-[32rem] w-[32rem] rounded-full bg-primary/[0.06] blur-[80px] translucent-glow" style={{ animationDelay: "-4s" }} />
        <div className="absolute -right-20 bottom-1/4 h-[32rem] w-[32rem] rounded-full bg-accent/[0.06] blur-[80px] translucent-glow-alt" style={{ animationDelay: "-11s" }} />
        <div className="absolute left-1/3 top-1/2 -translate-y-1/2 h-[28rem] w-[28rem] rounded-full bg-primary/[0.03] blur-[90px] translucent-glow" style={{ animationDelay: "-7s" }} />
      </div>

      {/* 3D particle field background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-15" aria-hidden="true">
        <ParticleField color={hex.primary} speed={0.1} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          label="Technical Skills"
          title={<>Comprehensive expertise across the{" "}<span className="gradient-text">full technology stack</span></>}
          subtitle="Deep proficiency in modern AI/ML frameworks, cloud infrastructure, and full-stack development with a focus on building production-grade scalable systems."
        />

        {/* Proficiency bars */}
        <AnimatedSection delay={100}>
          <div className="mb-12 rounded-2xl border border-white/[0.04] bg-card/25 p-8 backdrop-blur-xl frosted-panel">
            <h3 className="mb-6 text-lg font-bold text-foreground">Overall Proficiency</h3>
            <AnimatedBars bars={proficiencyBars} duration={1600} stagger={120} />
          </div>
        </AnimatedSection>

        {/* Skills grid — pop-out tilt + liquid glass on hover */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skillCategories.map((cat, i) => (
            <AnimatedSection key={cat.category} delay={i * 80}>
              <TiltCard className="relative h-full">
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-card/25 backdrop-blur-xl p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/15">
                  {/* Top edge reflection */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-accent/0 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:from-primary/5 group-hover:via-accent/5 group-hover:to-primary/5 group-hover:opacity-100" />
                  {/* Animated corner glow */}
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150" />

                  <div className="relative">
                    <h3 className="mb-5 text-base font-bold text-foreground transition-colors group-hover:text-primary sm:text-lg">
                      {cat.category}
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((item, idx) => {
                        const icon = getSkillIcon(item)
                        return (
                          <span
                            key={item}
                            className="group/tag relative inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:bg-secondary hover:text-foreground hover:scale-105 hover:shadow-md hover:shadow-primary/10 cursor-default"
                            style={{ animationDelay: `${idx * 40}ms` }}
                          >
                            {icon && <span className="opacity-60 group-hover/tag:opacity-100 transition-opacity">{icon}</span>}
                            {item}
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  {/* Shimmer */}
                  <div className="absolute inset-0 shimmer opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
              </TiltCard>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {/* Skill detail modal — shows linked experiences/projects/publications */}
      <SkillDetailModal
        skill={selectedSkill}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setSelectedSkill(null)
        }}
      />
    </AnimatedSection>
  )
}
