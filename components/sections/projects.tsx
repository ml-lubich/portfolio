"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { Sparkles, ChevronRight, ArrowRight } from "lucide-react"
import { DetailPanel } from "../detail-panel"
import { ScrollStackSection } from "../layout/scroll-stack-section"
import { projects } from "@/data/projects"

export function Projects() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = projects.find((p) => p.id === selectedId) ?? null

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }, [])

  const handleClose = useCallback(() => setSelectedId(null), [])

  const isOpen = selected !== null

  return (
    <ScrollStackSection
      id="projects"
      label="Featured Projects"
      title={<>Innovative solutions that{" "}<span className="gradient-text">drive real-world impact</span></>}
      subtitle="Click any project to explore architecture, tech stack, and animated system diagrams."
      className="scroll-mt-24"
      bgEffects={
        <>
          <div className="absolute left-1/4 top-20 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px]" />
          <div className="absolute right-1/4 bottom-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
        </>
      }
      stickyTop={90}
      stackOffset={16}
      scrollPerCard={36}
      perspective={1200}
      activeCardId={selectedId}
      onScrollDismiss={handleClose}
      detailContent={
        <DetailPanel
          data={selected?.detail ?? null}
          isOpen={isOpen}
          onClose={handleClose}
        />
      }
      cards={projects.map((project) => ({
        id: project.id,
        children: (
          <button
            onClick={() => handleSelect(project.id)}
            className={`glass-stack-card group relative w-full overflow-hidden rounded-2xl border text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] md:duration-500 ${selectedId === project.id
              ? "border-primary/40 shadow-[0_0_40px_-8px] shadow-primary/20"
              : "border-white/[0.08] hover:border-primary/30"
              }`}
          >
            {/* Top gradient accent strip */}
            <div className={`h-1 w-full bg-gradient-to-r ${project.gradient} ${selectedId === project.id ? "opacity-100" : "opacity-60 group-hover:opacity-90"} transition-opacity duration-200 md:duration-500`} />

            {project.coverImage != null && project.coverImage !== "" && (
              <div className="relative z-[1] w-full overflow-hidden border-b border-white/[0.08] bg-black/20">
                <Image
                  src={project.coverImage}
                  alt={`${project.name} — product preview`}
                  width={1600}
                  height={900}
                  className="max-h-[200px] w-full object-cover object-top md:max-h-[240px]"
                  sizes="(max-width: 768px) 100vw, 672px"
                  loading="lazy"
                />
              </div>
            )}

            {/* Ambient glow blobs */}
            <div
              className="pointer-events-none absolute -right-24 -top-24 z-0 h-72 w-72 rounded-full opacity-[0.07] blur-3xl transition-opacity duration-300 md:duration-700 group-hover:opacity-[0.18]"
              style={{ background: project.accent }}
            />
            <div
              className="pointer-events-none absolute -left-16 bottom-0 z-0 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-300 md:duration-700 group-hover:opacity-[0.08]"
              style={{ background: project.accent }}
            />

            {/* Frosted noise overlay */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

            <div className="relative z-[2] p-4 md:p-6 lg:p-8">
              {/* Top row: number + name + metric */}
              <div className="flex items-start gap-3 md:gap-4 lg:gap-5">
                {/* Large ghost number */}
                <span
                  className="hidden shrink-0 select-none font-mono text-6xl font-black leading-none tracking-tighter opacity-[0.06] sm:block"
                  style={{ color: project.accent }}
                >
                  {project.number}
                </span>

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary sm:text-xl">
                    {project.name}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary">{project.metric}</span>
                  </div>
                </div>

                {/* Explore CTA */}
                <div className="hidden shrink-0 items-center gap-1.5 self-start rounded-lg border border-border/50 bg-secondary px-3.5 py-2 text-xs font-medium text-muted-foreground/70 transition-all duration-300 group-hover:text-primary sm:flex">
                  <span className="group-hover:hidden">Explore</span>
                  <span className="hidden group-hover:inline">Click to Explore</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Summary */}
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground/80 sm:mt-4 sm:text-[15px]">
                {project.summary}
              </p>

              {/* Key highlights (first 3 from detail) */}
              <div className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
                {project.detail.highlights.slice(0, 3).map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/50" />
                    <span className="text-xs leading-relaxed text-muted-foreground/60 line-clamp-1 sm:text-[13px]">
                      {h}
                    </span>
                  </div>
                ))}
              </div>

              {/* Metrics row */}
              {project.detail.metrics && (
                <div className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-3 md:gap-4">
                  {project.detail.metrics.map((m) => (
                    <div key={m.label} className="rounded-lg border border-border/50 bg-secondary px-3 py-2">
                      <p className="text-xs text-muted-foreground/50">{m.label}</p>
                      <p className="mt-0.5 text-sm font-bold text-primary">{m.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/50 bg-secondary px-3 py-1 font-mono text-[10px] text-muted-foreground/60 transition-colors group-hover:border-primary/30 group-hover:text-muted-foreground/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom edge gradient line */}
            <div className={`h-px w-full bg-gradient-to-r ${project.gradient} opacity-0 transition-opacity duration-200 md:duration-500 group-hover:opacity-30`} />
          </button>
        ),
      }))}
    >
      {/* Extra content after cards (if any) */}
    </ScrollStackSection>
  )
}
