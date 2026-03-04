"use client"

import { useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { AnimatedSection } from "../animations/animated-section"
import { AnimatedBars } from "../animations/animated-bars"
import { getSkillIcon } from "./skill-icons"
import { CodeParticles } from "../three/code-particles"
import { SectionHeader } from "../layout/section-header"
import { skillCategories, proficiencyBars } from "@/data/skills"
import { hex } from "@/lib/theme"
import { SkillDetailModal } from "./skill-detail-modal"

const ParticleField = dynamic(
  () => import("../three/scene-backgrounds").then((mod) => mod.ParticleField),
  { ssr: false }
)

function SkillTag({ item, idx, onSelect }: { item: string; idx: number; onSelect: (skill: string) => void }) {
  const [hovered, setHovered] = useState(false)
  const icon = getSkillIcon(item)

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group/tag relative inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition-all duration-300 animate-slide-up cursor-pointer
        ${hovered
          ? "border-primary/60 bg-primary/10 text-foreground shadow-lg shadow-primary/20 scale-110 skill-tag-shine"
          : "border-border bg-secondary/50 text-muted-foreground hover:scale-105 hover:border-primary/40 hover:bg-secondary hover:text-foreground hover:shadow-md hover:shadow-primary/10"
        }`}
      style={{ animationDelay: `${idx * 50}ms`, opacity: 0 }}
    >
      {icon && (
        <span className={`transition-opacity ${hovered ? "opacity-100" : "opacity-60 group-hover/tag:opacity-100"}`}>
          {icon}
        </span>
      )}
      {item}

      {/* Glow ring */}
      {hovered && (
        <span className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-primary/40 animate-pulse" />
      )}

      {/* Code particles */}
      <CodeParticles skill={item} isHovered={hovered} />
    </button>
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
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-primary/8 blur-3xl translucent-glow" />
        <div className="absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-accent/8 blur-3xl translucent-glow" style={{ animationDelay: "2s" }} />
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

        {/* Skills grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skillCategories.map((cat, i) => (
            <AnimatedSection key={cat.category} delay={i * 80}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.04] bg-card/25 backdrop-blur-xl p-6 transition-all duration-500 hover:border-primary/40 hover:bg-card/50 glass-card-3d">
                {/* Top edge reflection */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-accent/0 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:from-primary/5 group-hover:via-accent/5 group-hover:to-primary/5 group-hover:opacity-100" />

                {/* Animated corner accent */}
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150" />

                <div className="relative">
                  <h3 className="mb-5 text-base font-bold text-foreground transition-colors group-hover:text-primary sm:text-lg">
                    {cat.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((item, idx) => (
                      <SkillTag key={item} item={item} idx={idx} onSelect={handleSelectSkill} />
                    ))}
                  </div>
                </div>

                {/* Shimmer effect */}
                <div className="absolute inset-0 shimmer opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
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
