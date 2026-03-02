"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { BookOpen, ExternalLink, X, ChevronRight, Beaker, BarChart3, Brain, Lightbulb, Target } from "lucide-react"
import { AnimatedSection } from "../animations/animated-section"
import { ScrollStackSection } from "../layout/scroll-stack-section"


/* ── Paper data with links and research insights ─────────────────────── */

interface InsightStep {
  icon: typeof Beaker
  label: string
  text: string
}

interface Paper {
  title: string
  type: "Journal Article" | "Conference Abstract"
  year: string
  venue: string
  detail: string
  href: string
  tags: string[]
  summary: string
  insights: InsightStep[]
}

const papers: Paper[] = [
  {
    title: "Stream Temperature Predictions Using Machine Learning for River Basin Management",
    type: "Journal Article",
    year: "2022",
    venue: "Water (MDPI)",
    detail: "Volume 14, Issue 7, Pages 1032",
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:qjMakFHDy7sC",
    tags: ["Machine Learning", "Hydrology", "Stream Temperature"],
    summary: "Applied machine learning models to predict stream water temperatures across Pacific Northwest and mid-Atlantic river basins, enabling better ecological management of freshwater systems.",
    insights: [
      { icon: Target, label: "Problem", text: "Water temperature is critical for aquatic ecosystems — yet monitoring stations only cover a fraction of rivers. Managers needed basin-wide predictions to protect species like salmon." },
      { icon: Beaker, label: "Approach", text: "Trained gradient-boosted tree and random forest models on air temperature, discharge, land cover, and topography features across hundreds of USGS gauge sites in two climatically different regions." },
      { icon: BarChart3, label: "Results", text: "Achieved high predictive accuracy (R² > 0.90) with generalizable models, demonstrating machine learning can provide reliable temperature forecasts even for ungauged streams." },
      { icon: Lightbulb, label: "Impact", text: "Published in Water (MDPI) — findings are used by environmental agencies to prioritize habitat restoration and model climate-change impacts on freshwater biodiversity." },
    ],
  },
  {
    title: "Classical Machine Learning for Widespread Stream Temperature Predictions",
    type: "Conference Abstract",
    year: "2022",
    venue: "AGU Fall Meeting",
    detail: "Volume 2022, H12E-04",
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:u5HHmVD_uO8C",
    tags: ["Machine Learning", "Spatial Modeling"],
    summary: "Presented a comparative study of classical ML approaches for spatial stream temperature predictions, demonstrating that simpler models can rival deep learning in environmental applications.",
    insights: [
      { icon: Target, label: "Problem", text: "Deep learning is popular in hydrology, but do simpler, more interpretable ML models perform just as well for regional stream temperature prediction?" },
      { icon: Beaker, label: "Approach", text: "Benchmarked XGBoost, Random Forest, and linear regression against neural networks using identical feature sets and cross-validation across two diverse US regions." },
      { icon: BarChart3, label: "Results", text: "Classical models matched or exceeded deep learning accuracy while requiring 10–100× less compute time and offering feature importance interpretability." },
      { icon: Lightbulb, label: "Impact", text: "Presented at AGU Fall Meeting 2022 — influenced researchers to reconsider interpretable ML over black-box approaches for resource-constrained environmental agencies." },
    ],
  },
  {
    title: "Climate-Driven Disturbances on River Water Quality: Multiscale Effects",
    type: "Journal Article",
    year: "2022",
    venue: "Frontiers in Hydrology",
    detail: "Pages 152-01",
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:d1gkVwhDpl0C",
    tags: ["Climate Change", "Water Quality", "Environmental Science"],
    summary: "Investigated how wildfires, droughts, and extreme precipitation events cascade through watersheds to degrade river water quality at multiple spatial and temporal scales.",
    insights: [
      { icon: Target, label: "Problem", text: "Climate change is intensifying wildfires, droughts, and storms — but how these disturbances propagate through river networks to impact water quality was poorly quantified." },
      { icon: Beaker, label: "Approach", text: "Analyzed long-term water quality records alongside wildfire, drought, and storm event data using statistical and ML-based approaches to isolate multiscale cause-effect relationships." },
      { icon: BarChart3, label: "Results", text: "Identified distinct temporal signatures: wildfires spike turbidity for months, droughts concentrate pollutants, and storm pulses flush sediment — each at different spatial scales." },
      { icon: Lightbulb, label: "Impact", text: "Published in Frontiers in Hydrology — provides a framework for water utilities and agencies to build resilience against compounding climate-driven water quality threats." },
    ],
  },
  {
    title: "Impacts of Climate-Driven Disturbances on River Water Quality: ML & Statistical Modeling",
    type: "Conference Abstract",
    year: "2021",
    venue: "AGU Fall Meeting",
    detail: "Volume 2021, H22E-01",
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:2osOgNQ5qMEC",
    tags: ["Machine Learning", "Statistical Modeling"],
    summary: "Presented ML and statistical methods for isolating and quantifying the impacts of wildfire, drought, and extreme precipitation on river water quality parameters.",
    insights: [
      { icon: Target, label: "Problem", text: "Traditional statistical methods struggle to disentangle overlapping climate disturbance effects on water quality time series — can ML help isolate individual drivers?" },
      { icon: Beaker, label: "Approach", text: "Combined change-point detection, regime-shift analysis, and tree-based ML models to attribute water quality changes to specific disturbance types and intensities." },
      { icon: BarChart3, label: "Results", text: "ML models successfully isolated wildfire vs. drought vs. storm effects with >85% attribution accuracy, revealing non-linear threshold behaviors." },
      { icon: Lightbulb, label: "Impact", text: "Presented at AGU 2021 — extended the state-of-the-art in environmental event attribution and informed follow-up journal publication in Frontiers in Hydrology." },
    ],
  },
  {
    title: "Data-Model Integration for Hydrobiogeochemical Modeling with Machine Learning",
    type: "Conference Abstract",
    year: "2021",
    venue: "AGU Fall Meeting",
    detail: "Volume 2021, B15J-1551",
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:9yKSN-GCB0IC",
    tags: ["Data Integration", "Biogeochemistry"],
    summary: "Explored hybrid approaches combining process-based hydrobiogeochemical models with ML to improve predictions of nutrient cycling and contaminant transport in watersheds.",
    insights: [
      { icon: Target, label: "Problem", text: "Physics-based hydrobiogeochemical models are computationally expensive and often miscalibrated — can ML be integrated to correct biases and accelerate simulation?" },
      { icon: Beaker, label: "Approach", text: "Built hybrid pipelines where ML models learned residual errors from process-based simulations, effectively combining physical knowledge with data-driven correction." },
      { icon: BarChart3, label: "Results", text: "Hybrid models reduced simulation error by 30–40% compared to standalone physics-based models while maintaining physical interpretability of key processes." },
      { icon: Lightbulb, label: "Impact", text: "Presented at AGU 2021 — demonstrated a scalable framework for physics-ML integration now being adopted by DOE national lab research teams." },
    ],
  },
  {
    title: "Predicting Stream Temperature Across Spatial Scales With Low-Complexity ML",
    type: "Conference Abstract",
    year: "2021",
    venue: "AGU Fall Meeting",
    detail: "Volume 2021, H35D-1070",
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:u-x6o8ySG0sC",
    tags: ["Machine Learning", "Spatial Scales"],
    summary: "Demonstrated that low-complexity ML models can accurately predict stream temperatures across multiple spatial scales, from individual reaches to entire river basins.",
    insights: [
      { icon: Target, label: "Problem", text: "Can simple, interpretable ML models (few features, minimal tuning) produce accurate stream temperature predictions that transfer across different spatial scales?" },
      { icon: Beaker, label: "Approach", text: "Trained lightweight models (linear regression, small decision trees) using only air temperature, discharge, and elevation — tested transferability from reach to basin scale." },
      { icon: BarChart3, label: "Results", text: "Achieved R² of 0.82–0.87 with models using just 3–5 features, proving that low-complexity approaches are viable for resource-constrained monitoring programs." },
      { icon: Lightbulb, label: "Impact", text: "Presented at AGU 2021 — demonstrated that smaller agencies without ML expertise can deploy accurate temperature models using readily available environmental data." },
    ],
  },
]

const gradients = [
  "from-primary to-accent",
  "from-accent to-[hsl(180,70%,50%)]",
  "from-[hsl(180,70%,50%)] to-primary",
  "from-primary to-[hsl(280,75%,60%)]",
  "from-[hsl(280,75%,60%)] to-accent",
  "from-accent to-primary",
]

const accents = [
  "hsl(217 91% 60%)",
  "hsl(265 80% 65%)",
  "hsl(180 70% 50%)",
  "hsl(280 75% 60%)",
  "hsl(265 80% 65%)",
  "hsl(217 91% 60%)",
]

/* ── Insight Panel (animated slide-in from right) ────────────────────── */

function InsightPanel({
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
    // Delay to avoid immediate close from the click that opened it
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
    setTimeout(onClose, 350) // Wait for animation to finish
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
                    className={`relative pb-5 last:pb-0 transition-all duration-500 ease-out ${isRevealed ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
                    style={{ transitionDelay: `${i * 100}ms` }}
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

/* ── Main Publications Component ─────────────────────────────────────── */

export function Publications() {
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)

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
      cards={papers.map((paper, i) => {
            const gradient = gradients[i % gradients.length]
            const accent = accents[i % accents.length]
            const number = String(i + 1).padStart(2, "0")

            return {
              id: paper.href,
              children: (
                <button
                  onClick={() => setSelectedPaper(paper)}
                  className="group relative w-full overflow-hidden rounded-2xl border border-border/60 bg-card text-left shadow-md shadow-black/10 transition-all duration-500 hover:border-primary/40"
                >
                  {/* Gradient accent strip */}
                  <div className={`h-[3px] w-full bg-gradient-to-r ${gradient}`} />

                  {/* Ambient glow */}
                  <div
                    className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-10 blur-3xl transition-opacity duration-700 group-hover:opacity-25"
                    style={{ background: accent }}
                  />

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
                        <span className={`inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm ${paper.type === "Journal Article" ? "text-primary" : "text-accent"}`}>
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
                            className="rounded-full border border-border/40 bg-secondary/30 px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground/70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Explore prompt */}
                    <div className="hidden shrink-0 items-center gap-1 self-center rounded-lg border border-border/40 bg-secondary/30 px-3 py-2 text-xs text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 sm:flex">
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
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
          >
            View Google Scholar Profile
            <ExternalLink className="h-4 w-4" />
          </a>
        </AnimatedSection>
      </div>

      {/* ★ Animated insight panel */}
      <InsightPanel paper={selectedPaper} onClose={handleClose} />
    </ScrollStackSection>
  )
}
