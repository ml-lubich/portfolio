"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { BookOpen, ExternalLink, X, Brain } from "lucide-react"
import type { Paper } from "./data"
import { papers, gradients, accents } from "./data"

export function InsightPanel({
  paper,
  onClose,
}: {
  paper: Paper | null
  onClose: () => void
}) {
  const [visible, setVisible] = useState(false)
  const [revealedSteps, setRevealedSteps] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)

  // Slide in on mount
  useEffect(() => {
    if (paper) {
      requestAnimationFrame(() => setVisible(true))
      setRevealedSteps(0)
    } else {
      setVisible(false)
    }
  }, [paper])

  // Step-by-step reveal animation
  useEffect(() => {
    if (!paper || !visible) return
    const total = paper.insights.length
    if (revealedSteps >= total) return

    const timer = setTimeout(() => {
      setRevealedSteps((s) => s + 1)
    }, revealedSteps === 0 ? 400 : 300)

    return () => clearTimeout(timer)
  }, [paper, visible, revealedSteps])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  // Click outside to close
  useEffect(() => {
    if (!visible) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handler)
    }, 100)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", handler)
    }
  }, [visible, onClose])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 350)
  }, [onClose])

  if (!paper) return null

  const gradient = gradients[papers.indexOf(paper)] ?? gradients[0]
  const accent = accents[papers.indexOf(paper)] ?? accents[0]

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Research insights: ${paper.title}`}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-border bg-card/95 backdrop-blur-xl shadow-2xl transition-[transform,visibility] duration-350 ease-out ${visible ? "translate-x-0 visible" : "translate-x-full invisible"}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-md p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-primary shrink-0" />
                <span className="font-mono text-xs uppercase tracking-widest text-primary">
                  Research Insights
                </span>
              </div>
              <h3 className="text-base font-display font-medium leading-snug text-foreground">
                {paper.title}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">{paper.venue}</span>
                <span className="text-border">·</span>
                <span>{paper.year}</span>
                <span className="text-border">·</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${paper.type === "Journal Article" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                  <BookOpen className="h-2.5 w-2.5" />
                  {paper.type}
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="shrink-0 rounded-lg border border-border bg-secondary/50 p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 space-y-6">
          {/* Summary */}
          <div
            className={`rounded-xl border border-border/60 bg-secondary/30 p-4 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <p className="text-sm leading-relaxed text-muted-foreground">{paper.summary}</p>
          </div>

          {/* Step-by-step insights */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`h-px flex-1 bg-gradient-to-r ${gradient} opacity-30`} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Step-by-step breakdown
              </span>
              <div className={`h-px flex-1 bg-gradient-to-l ${gradient} opacity-30`} />
            </div>

            {/* Vertical timeline */}
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
                    <div
                      className={`absolute -left-8 top-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-500 ${isRevealed ? "border-primary bg-primary/10 scale-100" : "border-border bg-card scale-75"}`}
                    >
                      <Icon className={`h-3.5 w-3.5 transition-colors duration-300 ${isRevealed ? "text-primary" : "text-muted-foreground/50"}`} />
                    </div>

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
          <div className="flex flex-wrap gap-2 pt-2">
            {paper.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/60 bg-secondary/40 px-3 py-1 font-mono text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* View on Google Scholar */}
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
    </>
  )
}
