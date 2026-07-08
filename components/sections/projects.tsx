"use client"

import { useState, useCallback, useMemo, type CSSProperties } from "react"
import Image from "next/image"
import { Sparkles, ArrowRight, FlaskConical, Pause, MousePointerClick } from "lucide-react"
import { DetailPanel } from "../detail-panel"
import { SectionHeader } from "../layout/section-header"
import { projects, type Project } from "@/data/projects"

/* ──────────────────────────────────────────────────────────────────────
 *  Projects — a sleek 3-row marquee of project cards.
 *
 *  The old sticky "scroll-stack" was heavy for this many projects; this
 *  presentation lets the breadth of work stream past in three rows that
 *  auto-scroll in alternating directions. A row pauses when you hover it
 *  or click any card in it, and each card's "Explore" button opens the
 *  full architecture detail panel.
 *
 *  Marquee mechanics (auto-scroll, seamless loop, pause, reduced-motion)
 *  live in `.marquee-*` classes in globals.css.
 * ────────────────────────────────────────────────────────────────────── */

/** Split the projects into `count` roughly equal rows, order preserved. */
function splitIntoRows(items: Project[], count: number): Project[][] {
  const rows: Project[][] = Array.from({ length: count }, () => [])
  items.forEach((item, i) => rows[i % count].push(item))
  return rows
}

/** Per-row scroll speeds (seconds) — slightly varied so rows feel organic. */
const ROW_DURATIONS = ["58s", "70s", "64s"] as const

interface MarqueeCardProps {
  project: Project
  onExplore: (id: string) => void
}

function MarqueeCard({ project, onExplore }: MarqueeCardProps) {
  // No backdrop-blur on the card: 38 cards translate continuously, and a live
  // backdrop filter would re-rasterize every frame. A translucent tint over the
  // dark section reads as glass without the per-frame cost.
  return (
    <article
      className="marquee-card group/card relative mr-4 w-[270px] shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] transition-colors duration-500 hover:border-primary/30 hover:bg-white/[0.055] sm:mr-5 sm:w-[320px]"
    >
      {/* Top gradient accent strip */}
      <div className={`h-1 w-full bg-gradient-to-r ${project.gradient} opacity-60 transition-opacity duration-500 group-hover/card:opacity-100`} />

      {/* Cover image, or a gradient header carrying the big ghost number */}
      {project.coverImage != null && project.coverImage !== "" ? (
        <div className="relative h-32 w-full overflow-hidden border-b border-white/[0.08] bg-black/20 sm:h-36">
          <Image
            src={project.coverImage}
            alt={`${project.name} — product preview`}
            width={640}
            height={360}
            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover/card:scale-[1.04]"
            sizes="320px"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="relative flex h-32 w-full items-center justify-center overflow-hidden border-b border-white/[0.08] sm:h-36">
          <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-[0.12]`} />
          <span
            className="select-none font-mono text-6xl font-black leading-none tracking-tighter opacity-20"
            style={{ color: project.accent }}
          >
            {project.number}
          </span>
        </div>
      )}

      {/* Ambient accent glow on hover */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 z-0 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover/card:opacity-[0.14]"
        style={{ background: project.accent }}
      />

      <div className="relative z-[1] p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-foreground transition-colors group-hover/card:text-primary sm:text-lg">
            {project.name}
          </h3>
          {project.prototype && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/[0.08] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-amber-300/90">
              <FlaskConical className="h-2.5 w-2.5" aria-hidden />
              Prototype
            </span>
          )}
        </div>

        <div className="mt-1.5 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate text-xs font-semibold text-primary">{project.metric}</span>
        </div>

        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground/70 sm:text-[13px]">
          {project.summary}
        </p>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/50 bg-secondary px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground/60 transition-colors group-hover/card:border-primary/30"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Explore CTA — stops the click from also toggling the row pause */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onExplore(project.id)
          }}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground/80 transition-all duration-300 hover:border-primary/40 hover:text-primary"
          aria-label={`Explore ${project.name} — architecture and details`}
        >
          Explore
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/card:translate-x-0.5" />
        </button>
      </div>
    </article>
  )
}

interface MarqueeRowProps {
  rowProjects: Project[]
  direction: "ltr" | "rtl"
  duration: string
  onExplore: (id: string) => void
}

function MarqueeRow({ rowProjects, direction, duration, onExplore }: MarqueeRowProps) {
  const [pinned, setPinned] = useState(false)

  // Duplicate the set so the -50% translate loops seamlessly.
  const doubled = useMemo(() => [...rowProjects, ...rowProjects], [rowProjects])

  const togglePinned = useCallback(() => setPinned((v) => !v), [])

  return (
    <div className="marquee-row group/row relative">
      {/* Paused indicator — appears when the row is click-pinned */}
      <div
        className={`pointer-events-none absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/[0.12] bg-black/60 px-2.5 py-1 backdrop-blur-md transition-opacity duration-300 ${
          pinned ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-white/80">
          <Pause className="h-3 w-3" />
          Paused
        </span>
      </div>

      <div className="marquee-viewport">
        {/* Clicking anywhere on the track (i.e. a card) toggles the pin.
            The Explore button stops propagation so it opens the panel instead. */}
        <div
          className={`marquee-track marquee-track--${direction} ${pinned ? "is-paused" : ""} py-2`}
          style={{ "--marquee-duration": duration } as CSSProperties}
          onClick={togglePinned}
          role="presentation"
        >
          {doubled.map((project, i) => (
            <MarqueeCard
              key={`${project.id}-${i}`}
              project={project}
              onExplore={onExplore}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function Projects() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = projects.find((p) => p.id === selectedId) ?? null
  const isOpen = selected !== null

  const rows = useMemo(() => splitIntoRows(projects, 3), [])

  const handleExplore = useCallback((id: string) => setSelectedId(id), [])
  const handleClose = useCallback(() => setSelectedId(null), [])

  return (
    <section id="projects" className="relative scroll-mt-24 py-5 md:py-14 lg:py-20">
      {/* Background FX */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/4 top-20 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-3 md:px-4 lg:px-6">
        <SectionHeader
          className="mb-6 md:mb-10"
          label="Featured Projects"
          title={<>Innovative solutions that{" "}<span className="gradient-text">drive real-world impact</span></>}
          subtitle="A stream of what I've shipped — hover or tap a card to stop the row, then Explore for architecture, tech stack, and animated system diagrams."
        />
      </div>

      {/* Full-bleed 3-row marquee */}
      <div className="relative flex flex-col gap-3 md:gap-4">
        {rows.map((rowProjects, i) => (
          <MarqueeRow
            key={i}
            rowProjects={rowProjects}
            direction={i % 2 === 0 ? "ltr" : "rtl"}
            duration={ROW_DURATIONS[i] ?? "62s"}
            onExplore={handleExplore}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-6xl px-3 md:px-4 lg:px-6">
        {/* Hint: how to stop the marquee */}
        <p className="mx-auto mt-6 flex items-center justify-center gap-1.5 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground/40">
          <MousePointerClick className="h-3.5 w-3.5" aria-hidden />
          Hover or tap a card to pause its row
        </p>

        {/* Prototype disclaimer — clarifies the live Vercel demos are proof-of-concept */}
        <div className="mx-auto mt-6 flex max-w-2xl items-start gap-2.5 rounded-xl border border-amber-400/20 bg-amber-400/[0.04] px-4 py-3 text-left">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-300/80" aria-hidden />
          <p className="text-xs leading-relaxed text-muted-foreground/80 sm:text-[13px]">
            <span className="font-semibold text-amber-200/90">Prototype</span>{" "}
            projects are live demo deployments on Vercel—working proof-of-concept
            builds to show the idea and flow end to end, not full production
            products. Client sites are live, in-production work.
          </p>
        </div>
      </div>

      {/* Detail panel — centered modal overlay opened via a card's Explore button */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close details"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="detail-panel-scroll relative z-[1] max-h-[86vh] w-full max-w-4xl overflow-y-auto">
            <DetailPanel data={selected?.detail ?? null} isOpen={isOpen} onClose={handleClose} />
          </div>
        </div>
      )}
    </section>
  )
}
