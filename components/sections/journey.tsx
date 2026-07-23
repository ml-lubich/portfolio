"use client"

import { useState, useCallback } from "react"
import { Briefcase, ChevronRight, MapPin, ArrowRight } from "lucide-react"
import { DetailPanel } from "../detail-panel"
import { ScrollStackSection } from "../layout/scroll-stack-section"
import { experiences } from "@/data/experiences"

export function Journey() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = experiences.find((e) => e.id === selectedId) ?? null

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }, [])

  const handleClose = useCallback(() => setSelectedId(null), [])

  const isOpen = selected !== null

  return (
    <ScrollStackSection
      id="journey"
      label="Experience"
      title={<>From Berkeley Lab to Apple, delivering{" "}<span className="gradient-text">impactful solutions</span></>}
      subtitle="Click any role to explore architecture details, tech stack, and system diagrams."
      className="scroll-mt-24 pb-4 md:pb-8"
      layout="grid"
      maxWidth="max-w-5xl"
      stickyTop={90}
      stackOffset={14}
      scrollPerCard={34}
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
      cards={experiences.map((exp) => ({
        id: exp.id,
        children: (
          <button
            onClick={() => handleSelect(exp.id)}
            className={`group relative h-full w-full overflow-hidden rounded-xl text-left ring-1 ring-inset transition-colors duration-200 ${selectedId === exp.id
              ? "bg-white/[0.07] ring-white/[0.14]"
              : "bg-white/[0.035] ring-white/[0.055] hover:bg-white/[0.05] hover:ring-white/[0.1]"
              }`}
          >
            <div className="relative p-5 sm:p-6">
              {/* Top row: number, icon, company, period */}
              <div className="flex items-start gap-3 md:gap-4 lg:gap-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-foreground/75">
                  <Briefcase className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70">
                      {exp.company}
                    </p>
                    <span className="font-mono text-[11px] text-muted-foreground/60">
                      {exp.period}
                    </span>
                  </div>
                  <h3 className="mt-1 text-base font-medium leading-snug text-foreground sm:text-lg">
                    {exp.title}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-1.5 text-muted-foreground/50">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">{exp.location}</span>
                  </div>
                </div>

                {/* Explore CTA */}
                <div className="hidden shrink-0 items-center gap-1 self-start text-xs text-muted-foreground/55 transition-colors group-hover:text-foreground sm:flex">
                  <span>Details</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Summary */}
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground/75">
                {exp.summary}
              </p>

              {/* Key highlights (first 3 from detail) */}
              <div className="mt-4 space-y-2 border-t border-white/[0.055] pt-4">
                {exp.detail.highlights.slice(0, 2).map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/50" />
                    <span className="text-xs leading-relaxed text-muted-foreground/60 line-clamp-1 sm:text-[13px]">
                      {h}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5">
                {exp.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] text-muted-foreground/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </button>
        ),
      }))}
    >
      {/* Extra content after cards (if any) */}
    </ScrollStackSection>
  )
}
