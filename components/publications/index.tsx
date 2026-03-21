"use client"

import { useState, useCallback } from "react"
import { BookOpen, ExternalLink, ChevronRight } from "lucide-react"
import { AnimatedSection } from "../animations/animated-section"
import { ScrollStackSection } from "../layout/scroll-stack-section"
import { papers, gradients, accents } from "./data"
import { InsightPanel } from "./insight-panel"

export function Publications() {
  const [selectedPaper, setSelectedPaper] = useState<typeof papers[number] | null>(null)

  const handleClose = useCallback(() => {
    setSelectedPaper(null)
  }, [])

  return (
    <ScrollStackSection
      id="research"
      label="Research Publications"
      title={<>Contributing to{" "}<span className="gradient-text">ML &amp; environmental science</span></>}
      subtitle="6 peer-reviewed publications in machine learning for hydrology and environmental science. Click any paper to explore the research."
      maxWidth="max-w-5xl"
      bgEffects={null}
      stickyTop={90}
      stackOffset={12}
      scrollPerCard={34}
      perspective={1200}
      cards={papers.map((paper, i) => {
        const gradient = gradients[i % gradients.length]
        const accent = accents[i % accents.length]
        const number = String(i + 1).padStart(2, "0")

        return {
          id: paper.href,
          children: (
            <button
              onClick={() => setSelectedPaper(paper)}
              className="group relative w-full overflow-hidden rounded-[18px] border border-white/[0.06] bg-card text-left shadow-sm shadow-black/5 transition-all duration-300 hover:border-white/[0.12]"
            >
              {/* Gradient accent strip */}
              <div className={`h-[3px] w-full bg-gradient-to-r ${gradient}`} />

              <div className="relative flex items-start gap-4 p-5 sm:p-6">
                {/* Number */}
                <span
                  className="hidden shrink-0 font-mono text-4xl font-black tracking-tighter opacity-10 sm:block"
                  style={{ color: accent }}
                >
                  {number}
                </span>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.06] bg-white/[0.04] px-3 py-1 text-[11px] font-semibold backdrop-blur-sm ${paper.type === "Journal Article" ? "text-primary" : "text-accent"}`}>
                      <BookOpen className="h-3 w-3" />
                      {paper.type}
                    </span>
                    <span className="text-xs text-muted-foreground">{paper.venue} · {paper.year}</span>
                  </div>

                  <h3 className="text-base font-display font-medium leading-snug text-foreground transition-colors duration-300 group-hover:text-primary sm:text-lg">
                    {paper.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground/80">
                    {paper.summary}
                  </p>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {paper.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-[8px] border border-white/[0.04] bg-white/[0.03] px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Explore prompt */}
                <div className="hidden shrink-0 items-center gap-1 self-center rounded-[12px] border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 sm:flex">
                  <span>Explore</span>
                  <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Hover gradient overlay */}
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.03]`} />
            </button>
          ),
        }
      })}
    >
      {/* Google Scholar link */}
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <AnimatedSection delay={600} className="mt-10 text-center">
          <a
            href="https://scholar.google.com/citations?hl=en&user=Be6ZA78AAAAJ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[14px] border border-white/[0.06] bg-white/[0.03] px-5 py-3 text-sm font-medium text-foreground transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-primary"
          >
            View Google Scholar Profile
            <ExternalLink className="h-4 w-4" />
          </a>
        </AnimatedSection>
      </div>

      {/* Animated insight panel */}
      <InsightPanel paper={selectedPaper} onClose={handleClose} />
    </ScrollStackSection>
  )
}
