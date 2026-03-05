"use client"

import { useEffect, useRef } from "react"
import { X, ArrowRight, ExternalLink } from "lucide-react"
import type { DetailPanelData } from "./types"
import { iconMap } from "./types"
import { ArchitectureDiagram } from "./architecture-diagram"

interface DetailPanelProps {
  data: DetailPanelData | null
  isOpen: boolean
  onClose: () => void
}

export function DetailPanel({ data, isOpen, onClose }: DetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

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

  // Scroll panel back to top when data changes
  useEffect(() => {
    if (panelRef.current && data) {
      // Scroll both the panel and its parent scroll container back to top
      panelRef.current.scrollTop = 0
      const scrollParent = panelRef.current.closest('.detail-panel-scroll')
      if (scrollParent) {
        scrollParent.scrollTop = 0
      }
    }
  }, [data])

  if (!data) return null

  return (
    <div
      ref={panelRef}
      className="relative flex h-full max-h-full w-full flex-col rounded-[28px] border border-white/[0.12] bg-background/70 shadow-2xl shadow-black/20 backdrop-blur-3xl ring-1 ring-white/[0.06] ring-inset"
      style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06), 0 25px 50px -12px rgba(0,0,0,0.25)' }}
      role="dialog"
      aria-modal="true"
      aria-label={data.title}
    >
      {/* Liquid glass inner highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />

      {/* Gradient accent line */}
      <div className={`absolute left-0 top-0 h-full w-[3px] rounded-l-[28px] bg-gradient-to-b ${data.gradient}`} />

      {/* Close button — pinned outside scroll area */}
      <button
        onClick={onClose}
        className="group absolute right-6 top-6 z-20 flex h-9 w-9 items-center justify-center rounded-[14px] border border-white/[0.10] bg-white/[0.05] backdrop-blur-xl transition-all duration-200 hover:border-white/[0.18] hover:bg-white/[0.10] shadow-sm shadow-black/10"
        aria-label="Close panel"
      >
        <X className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
      </button>

      <div className="detail-panel-scroll relative flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8 sm:py-7" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}>
        {/* Header */}
        <div className="panel-stagger pr-12">
          {data.period && (
            <span className="inline-block rounded-[10px] border border-white/[0.06] bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-muted-foreground backdrop-blur-sm">
              {data.period}
            </span>
          )}
          <h2 className="mt-3 font-display text-xl font-medium tracking-tight text-foreground sm:text-2xl">
            {data.title}
          </h2>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-primary">
            {data.subtitle}
          </p>
          {data.location && (
            <p className="mt-1 text-xs text-muted-foreground">{data.location}</p>
          )}

          {/* Clickable project / company link */}
          {data.link && (
            <a
              href={data.link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-[12px] border border-white/[0.10] bg-white/[0.05] px-3.5 py-2 text-sm font-medium text-primary backdrop-blur-md transition-all duration-200 hover:border-white/[0.18] hover:bg-white/[0.10] hover:text-primary shadow-sm shadow-black/10"
            >
              {data.link.label}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {/* Divider */}
        <div className={`my-5 h-px bg-gradient-to-r ${data.gradient} opacity-20`} />

        {/* Description */}
        <div className="panel-stagger" style={{ animationDelay: "100ms" }}>
          <p className="text-sm leading-relaxed text-muted-foreground">{data.description}</p>
        </div>

        {/* Metrics */}
        {data.metrics && data.metrics.length > 0 && (
          <div
            className="panel-stagger mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3"
            style={{ animationDelay: "150ms" }}
          >
            {data.metrics.map((m) => (
              <div
                key={m.label}
                className="group/metric overflow-hidden rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 backdrop-blur-md transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.07] shadow-sm shadow-black/5"
              >
                <p className="font-mono text-base font-bold text-foreground transition-colors group-hover/metric:text-primary">
                  {m.value}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Key highlights */}
        <div className="panel-stagger mt-5" style={{ animationDelay: "200ms" }}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Key Highlights
          </h3>
          <ul className="space-y-2">
            {data.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-3">
                <ArrowRight
                  className={`mt-0.5 h-3.5 w-3.5 shrink-0 text-primary`}
                  style={{ animationDelay: `${i * 80}ms` }}
                />
                <span className="text-sm leading-relaxed text-foreground/80">{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Architecture nodes */}
        {data.architecture && data.architecture.length > 0 && (
          <div className="panel-stagger mt-6" style={{ animationDelay: "300ms" }}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Architecture
            </h3>
            <div className="relative space-y-2">
              {/* Connecting line */}
              <div className="absolute left-5 top-8 bottom-8 w-px bg-gradient-to-b from-primary/30 via-accent/20 to-transparent" />
              {data.architecture.map((node, i) => {
                const Icon = iconMap[node.icon]
                return (
                  <div
                    key={i}
                    className="group/node relative flex items-start gap-4 rounded-[16px] border border-transparent p-3 transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.04]"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-primary shadow-lg shadow-black/20 transition-transform duration-200 group-hover/node:scale-105`}
                    >
                      <Icon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{node.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{node.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Animated diagram */}
        {data.diagramType && (
          <div className="panel-stagger mt-6" style={{ animationDelay: "400ms" }}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              System Diagram
            </h3>
            <ArchitectureDiagram type={data.diagramType} gradient={data.gradient} accent={data.accent} />
          </div>
        )}

        {/* Tech stack */}
        <div className="panel-stagger mt-6" style={{ animationDelay: "500ms" }}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Tech Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.techStack.map((tech, i) => (
              <span
                key={tech}
                className="rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-muted-foreground backdrop-blur-md transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.08] hover:text-foreground shadow-sm shadow-black/5"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade to hint scrollability */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 rounded-b-[28px] bg-gradient-to-t from-background/60 to-transparent" />
    </div>
  )
}
