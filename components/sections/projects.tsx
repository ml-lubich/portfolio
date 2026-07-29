"use client"

import { memo, useState, useCallback, useEffect, useMemo, useRef, type CSSProperties } from "react"
import Image from "next/image"
import {
  Sparkles,
  ArrowRight,
  FlaskConical,
  MousePointerClick,
  Workflow,
  Layers,
  Brain,
  Boxes,
  Bot,
  GitBranch,
  type LucideIcon,
} from "lucide-react"
import { DetailPanel } from "../detail-panel"
import { SectionHeader } from "../layout/section-header"
import { OpenSourceShowcase } from "./open-source-showcase"
import { projects, type Project } from "@/data/projects"

/* ── Designed cover for projects with no public screenshot ────────────
 *  Internal / course / proprietary work has no live site or repo to
 *  capture, so instead of a faint ghost number we render a branded poster:
 *  the project's gradient + a domain icon + category label keyed off its
 *  architecture diagramType, with the headline metric on top. Every card
 *  gets a real cover, no binary assets required. */
type DiagramType = NonNullable<Project["detail"]["diagramType"]>

const POSTER_THEME: Record<DiagramType, { icon: LucideIcon; label: string }> = {
  pipeline: { icon: Workflow, label: "Data pipeline" },
  "ml-pipeline": { icon: Brain, label: "ML pipeline" },
  fullstack: { icon: Layers, label: "Full-stack" },
  microservices: { icon: Boxes, label: "Systems" },
  agents: { icon: Bot, label: "Agentic AI" },
  cicd: { icon: GitBranch, label: "CI / CD" },
}
const POSTER_FALLBACK = { icon: Workflow, label: "Engineering" }

/** Subtle dot-grid texture reused across posters. */
const POSTER_DOTS = "radial-gradient(circle, rgba(255,255,255,0.5) 0.5px, transparent 0.5px)"

function ProjectPoster({ project }: { project: Project }) {
  const theme = POSTER_THEME[project.detail.diagramType ?? ("" as DiagramType)] ?? POSTER_FALLBACK
  const Icon = theme.icon
  return (
    <div className="relative flex h-32 w-full flex-col justify-between overflow-hidden border-b border-white/[0.08] bg-black/30 sm:h-36">
      {/* Full brand-gradient wash + depth */}
      <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-30`} />
      <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: POSTER_DOTS, backgroundSize: "14px 14px" }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,transparent_10%,rgba(0,0,0,0.55))]" />

      {/* Oversized watermark icon */}
      <Icon
        className="pointer-events-none absolute -bottom-4 -right-3 h-28 w-28 transition-transform duration-700 group-hover/card:scale-110"
        style={{ color: project.accent, opacity: 0.16 }}
        aria-hidden
      />

      {/* Top row: category label + ghost number chip */}
      <div className="relative flex items-center justify-between p-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-white/75 backdrop-blur-sm"
          style={{ borderColor: `color-mix(in srgb, ${project.accent} 40%, transparent)` }}
        >
          <Icon className="h-3 w-3" style={{ color: project.accent }} aria-hidden />
          {theme.label}
        </span>
        <span className="select-none font-mono text-2xl font-black leading-none tracking-tighter text-white/15">
          {project.number}
        </span>
      </div>

      {/* Bottom: headline metric */}
      <div className="relative px-3 pb-3">
        <p className="truncate text-sm font-bold text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] sm:text-[15px]">
          {project.metric}
        </p>
      </div>
    </div>
  )
}

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

// Memoized: 76 card instances live across the 3 rows — without memo, any
// state change in Projects (e.g. opening the detail modal) re-renders and
// re-commits every card, which reads as a visible flicker of the marquee.
const MarqueeCard = memo(function MarqueeCard({ project, onExplore }: MarqueeCardProps) {
  // The whole card opens the detail panel — not just the Explore CTA.
  // Hovering (or tabbing into) the card already pauses its row via CSS.
  const handleCardClick = () => onExplore(project.id)

  // No backdrop-blur on the card: 38 cards translate continuously, and a live
  // backdrop filter would re-rasterize every frame. A translucent tint over the
  // dark section reads as glass without the per-frame cost.
  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${project.name} — open architecture and details`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleCardClick()
        }
      }}
      className="marquee-card group/card relative mr-4 w-[270px] shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] transition-colors duration-500 hover:border-primary/30 hover:bg-white/[0.055] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60 sm:mr-5 sm:w-[320px]"
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
        <ProjectPoster project={project} />
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

        {/* Explore CTA — same action as the card itself, kept as a visual
            affordance; stopPropagation avoids double-firing via the card */}
        <button
          type="button"
          tabIndex={-1}
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
})

interface MarqueeRowProps {
  rowProjects: Project[]
  direction: "ltr" | "rtl"
  duration: string
  onExplore: (id: string) => void
}

const MarqueeRow = memo(function MarqueeRow({ rowProjects, direction, duration, onExplore }: MarqueeRowProps) {
  // The -50% translate loop is seamless only while HALF the track covers the
  // visible strip; one duplicated set stops covering it on wide monitors (or
  // zoomed-out browsers), letting a blank gap sweep across the row. Measure
  // one set and repeat it until half the track spans the viewport. Copy
  // counts stay even so -50% always lands on a set boundary.
  const [copies, setCopies] = useState(2)
  const firstSetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => {
      const setWidth = firstSetRef.current?.scrollWidth ?? 0
      if (setWidth === 0) return
      setCopies(Math.max(2, 2 * Math.ceil(window.innerWidth / setWidth)))
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [rowProjects])

  return (
    <div className="marquee-row group/row relative">
      <div className="marquee-viewport">
        {/* Hover / focus-within pauses the row (CSS); clicking a card opens
            its detail panel — the card itself is the button. */}
        <div
          className={`marquee-track marquee-track--${direction} py-2`}
          style={{ "--marquee-duration": duration } as CSSProperties}
        >
          {Array.from({ length: copies }, (_, set) => (
            <div
              key={set}
              ref={set === 0 ? firstSetRef : undefined}
              className="flex shrink-0"
              aria-hidden={set > 0 || undefined}
              inert={set > 0 || undefined}
            >
              {rowProjects.map((project) => (
                <MarqueeCard
                  key={`${project.id}-${set}`}
                  project={project}
                  onExplore={onExplore}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

export function Projects() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = projects.find((p) => p.id === selectedId) ?? null
  const isOpen = selected !== null

  const rows = useMemo(() => splitIntoRows(projects, 3), [])

  const handleExplore = useCallback((id: string) => setSelectedId(id), [])
  const handleClose = useCallback(() => setSelectedId(null), [])

  return (
    <section id="projects" className="relative scroll-mt-24 py-5 md:py-14 lg:py-20">
      {/* Tier 1: curated open-source demos — self-contained section, own header/FX/modal */}
      <OpenSourceShowcase />

      {/* Tier 2: the marquee — everything else I've shipped, breadth over depth */}
      {/* Background FX */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/4 top-20 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-3 md:px-4 lg:px-6">
        <SectionHeader
          className="mb-6 md:mb-10"
          label="Selected Work"
          title={<>Innovative solutions that{" "}<span className="gradient-text">drive real-world impact</span></>}
          subtitle="Beyond the live demos above: the full breadth of what I've shipped. Hover pauses a row — click any card for architecture, tech stack, and animated system diagrams."
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
        {/* Hint: whole card is clickable */}
        <p className="mx-auto mt-6 flex items-center justify-center gap-1.5 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground/40">
          <MousePointerClick className="h-3.5 w-3.5" aria-hidden />
          Click any card for the full story
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
          <div className="relative z-[1] flex max-h-[86vh] w-full max-w-4xl flex-col">
            <DetailPanel data={selected?.detail ?? null} isOpen={isOpen} onClose={handleClose} />
          </div>
        </div>
      )}
    </section>
  )
}
