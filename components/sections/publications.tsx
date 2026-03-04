"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { BookOpen, ExternalLink, X, ChevronRight, ArrowRight } from "lucide-react"
import { AnimatedSection } from "../animations/animated-section"
import { ScrollStackSection } from "../layout/scroll-stack-section"
import { papers, gradients, accents } from "@/data/publications"
import type { Paper } from "@/data/publications"

/* ── Research Detail Panel (inline split-view — matches DetailPanel design) ── */

function ResearchDetailPanel({
  paper,
  isOpen,
  onClose,
  gradient,
  accent,
}: {
  paper: Paper | null
  isOpen: boolean
  onClose: () => void
  gradient: string
  accent: string
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [revealedSteps, setRevealedSteps] = useState(0)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handler)
    }
    return () => {
      document.removeEventListener("keydown", handler)
    }
  }, [isOpen, onClose])

  // Scroll panel back to top + reset reveal when data changes
  useEffect(() => {
    if (panelRef.current && paper) {
      panelRef.current.scrollTop = 0
    }
    setRevealedSteps(0)
  }, [paper])

  // Step-by-step reveal animation
  useEffect(() => {
    if (!paper || !isOpen) return
    const total = paper.insights.length
    if (revealedSteps >= total) return

    const timer = setTimeout(() => {
      setRevealedSteps((s) => s + 1)
    }, revealedSteps === 0 ? 400 : 300)

    return () => clearTimeout(timer)
  }, [paper, isOpen, revealedSteps])

  if (!paper) return null

  return (
    <div
      ref={panelRef}
      className="relative w-full rounded-2xl border border-border/30 bg-background/95 backdrop-blur-2xl"
      role="dialog"
      aria-modal="true"
      aria-label={paper.title}
    >
      {/* Gradient accent line */}
      <div className={`absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b ${gradient}`} />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -left-20 top-1/4 h-80 w-80 rounded-full opacity-10 blur-[100px]"
        style={{ background: accent }}
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-1/4 h-60 w-60 rounded-full opacity-8 blur-[80px]"
        style={{ background: accent }}
      />

      {/* Subtle grid pattern */}
      <div className="pointer-events-none absolute inset-0 circuit-grid opacity-30" />

      <div className="relative px-8 py-10 sm:px-10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="group absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-secondary/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-secondary/80 hover:scale-105"
          aria-label="Close panel"
        >
          <X className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
        </button>

        {/* Header */}
        <div className="panel-stagger pr-12">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm ${paper.type === "Journal Article" ? "text-primary" : "text-accent"}`}>
              <BookOpen className="h-3 w-3" />
              {paper.type}
            </span>
            <span className="inline-block rounded-full border border-border/60 bg-secondary/40 px-3 py-1 font-mono text-[11px] text-muted-foreground backdrop-blur-sm">
              {paper.year}
            </span>
          </div>
          <h2 className="mt-4 font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            {paper.title}
          </h2>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-primary">
            {paper.venue}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{paper.detail}</p>
        </div>

        {/* Divider */}
        <div className={`my-8 h-px bg-gradient-to-r ${gradient} opacity-20`} />

        {/* Summary */}
        <div className="panel-stagger" style={{ animationDelay: "100ms" }}>
          <p className="text-sm leading-relaxed text-muted-foreground">{paper.summary}</p>
        </div>

        {/* Step-by-step research insights */}
        <div className="panel-stagger mt-10" style={{ animationDelay: "200ms" }}>
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Research Breakdown
          </h3>

          <div className="relative pl-8">
            {/* Connecting line */}
            <div
              className="absolute left-[13px] top-2 w-[2px] bg-gradient-to-b from-primary via-accent to-primary/20 transition-all duration-700 ease-out"
              style={{
                height: revealedSteps > 0
                  ? `calc(${Math.min(revealedSteps, paper.insights.length) / paper.insights.length * 100}% - 8px)`
                  : "0%",
              }}
            />

            {paper.insights.map((step, i) => {
              const isRevealed = i < revealedSteps
              const Icon = step.icon
              return (
                <div
                  key={step.label}
                  className={`relative pb-5 last:pb-0 ${isRevealed ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
                  style={{
                    transitionProperty: "all",
                    transitionDuration: "500ms",
                    transitionTimingFunction: "ease-out",
                    transitionDelay: `${i * 100}ms`,
                  }}
                >
                  {/* Node dot */}
                  <div
                    className={`absolute -left-8 top-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-500 ${isRevealed ? "border-primary bg-primary/10 scale-100" : "border-border bg-card scale-75"}`}
                  >
                    <Icon className={`h-3.5 w-3.5 transition-colors duration-300 ${isRevealed ? "text-primary" : "text-muted-foreground/50"}`} />
                  </div>

                  {/* Step content */}
                  <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md">
                    <span
                      className="mb-1.5 inline-block font-mono text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: accent }}
                    >
                      {step.label}
                    </span>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.text}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="panel-stagger mt-10" style={{ animationDelay: "400ms" }}>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Research Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {paper.tags.map((tag, i) => (
              <span
                key={tag}
                className="rounded-lg border border-border/50 bg-secondary/30 px-3 py-1.5 font-mono text-xs text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-secondary/60 hover:text-foreground"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* View on Google Scholar CTA */}
        <div className="panel-stagger mt-10" style={{ animationDelay: "500ms" }}>
          <a
            href={paper.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${gradient} px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl`}
          >
            View on Google Scholar
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

/* ── Main Publications Component ─────────────────────────────────────── */

export function Publications() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = papers.find((p) => p.id === selectedId) ?? null

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }, [])

  const handleClose = useCallback(() => setSelectedId(null), [])

  const isOpen = selected !== null
  const selectedIndex = selected ? papers.indexOf(selected) : 0
  const selectedGradient = gradients[selectedIndex % gradients.length]
  const selectedAccent = accents[selectedIndex % accents.length]

  return (
    <ScrollStackSection
      id="research"
      label="Research Publications"
      title={<>Contributing to{" "}<span className="gradient-text">ML &amp; environmental science</span></>}
      subtitle="6 peer-reviewed publications in machine learning for hydrology and environmental science. Click any paper to explore the research."
      maxWidth="max-w-5xl"
      bgEffects={
        <>
          <div className="absolute left-1/3 top-20 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute right-1/3 bottom-20 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />
        </>
      }
      stickyTop={90}
      stackOffset={12}
      scrollPerCard={42}
      perspective={1200}
      activeCardId={selectedId}
      onScrollDismiss={handleClose}
      detailContent={
        <ResearchDetailPanel
          paper={selected}
          isOpen={isOpen}
          onClose={handleClose}
          gradient={selectedGradient}
          accent={selectedAccent}
        />
      }
      cards={papers.map((paper, i) => {
        const gradient = gradients[i % gradients.length]
        const accent = accents[i % accents.length]
        const number = String(i + 1).padStart(2, "0")

        return {
          id: paper.id,
          children: (
            <button
              onClick={() => handleSelect(paper.id)}
              className={`glass-stack-card group relative w-full overflow-hidden rounded-2xl border text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${selectedId === paper.id
                ? "border-primary/40 bg-card shadow-[0_0_40px_-8px] shadow-primary/20"
                : "border-border/40 bg-card hover:border-primary/30"
                }`}
            >
              {/* Top gradient accent strip */}
              <div className={`h-1 w-full bg-gradient-to-r ${gradient} ${selectedId === paper.id ? "opacity-100" : "opacity-60 group-hover:opacity-90"} transition-opacity duration-500`} />

              {/* Ambient glow blobs */}
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-[0.07] blur-3xl transition-opacity duration-700 group-hover:opacity-[0.18]"
                style={{ background: accent }}
              />
              <div
                className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-[0.08]"
                style={{ background: accent }}
              />

              {/* Frosted noise overlay */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

              <div className="relative p-6 sm:p-8">
                {/* Top row: number + type badge + venue */}
                <div className="flex items-start gap-4 sm:gap-5">
                  {/* Large ghost number */}
                  <span
                    className="hidden shrink-0 select-none font-mono text-6xl font-black leading-none tracking-tighter opacity-[0.06] sm:block"
                    style={{ color: accent }}
                  >
                    {number}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm ${paper.type === "Journal Article" ? "text-primary" : "text-accent"}`}>
                        <BookOpen className="h-3 w-3" />
                        {paper.type}
                      </span>
                      <span className="text-xs text-muted-foreground">{paper.venue} · {paper.year}</span>
                    </div>

                    <h3 className="text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-xl">
                      {paper.title}
                    </h3>

                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground/80 sm:text-[15px]">
                      {paper.summary}
                    </p>

                    {/* First 2 insight labels as preview */}
                    <div className="mt-4 space-y-2">
                      {paper.insights.slice(0, 2).map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/50" />
                          <span className="text-xs leading-relaxed text-muted-foreground/60 line-clamp-1 sm:text-[13px]">
                            <strong className="text-muted-foreground/80">{step.label}:</strong> {step.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {paper.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border/50 bg-secondary px-3 py-1 font-mono text-[10px] text-muted-foreground/60 transition-colors group-hover:border-primary/30 group-hover:text-muted-foreground/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Explore CTA */}
                  <div className="hidden shrink-0 items-center gap-1.5 self-start rounded-lg border border-border/50 bg-secondary px-3.5 py-2 text-xs font-medium text-muted-foreground/70 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-primary sm:flex">
                    <span>Explore</span>
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>

              {/* Bottom edge gradient line */}
              <div className={`h-px w-full bg-gradient-to-r ${gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-30`} />
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
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
          >
            View Google Scholar Profile
            <ExternalLink className="h-4 w-4" />
          </a>
        </AnimatedSection>
      </div>
    </ScrollStackSection>
  )
}
