"use client"

import { useEffect, useRef } from "react"
import { X, ArrowRight } from "lucide-react"
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
      panelRef.current.scrollTop = 0
    }
  }, [data])

  if (!data) return null

  return (
      <div
        ref={panelRef}
        className="relative w-full rounded-2xl border border-border/30 bg-background/95 backdrop-blur-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={data.title}
      >
        {/* Gradient accent line */}
        <div className={`absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b ${data.gradient}`} />

        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -left-20 top-1/4 h-80 w-80 rounded-full opacity-10 blur-[100px]"
          style={{ background: data.accent }}
        />
        <div
          className="pointer-events-none absolute -right-20 bottom-1/4 h-60 w-60 rounded-full opacity-8 blur-[80px]"
          style={{ background: data.accent }}
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
            {data.period && (
              <span className="inline-block rounded-full border border-border/60 bg-secondary/40 px-3 py-1 font-mono text-[11px] text-muted-foreground backdrop-blur-sm">
                {data.period}
              </span>
            )}
            <h2 className="mt-4 font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              {data.title}
            </h2>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-primary">
              {data.subtitle}
            </p>
            {data.location && (
              <p className="mt-1 text-xs text-muted-foreground">{data.location}</p>
            )}
          </div>

          {/* Divider */}
          <div className={`my-8 h-px bg-gradient-to-r ${data.gradient} opacity-20`} />

          {/* Description */}
          <div className="panel-stagger" style={{ animationDelay: "100ms" }}>
            <p className="text-sm leading-relaxed text-muted-foreground">{data.description}</p>
          </div>

          {/* Metrics */}
          {data.metrics && data.metrics.length > 0 && (
            <div
              className="panel-stagger mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3"
              style={{ animationDelay: "150ms" }}
            >
              {data.metrics.map((m) => (
                <div
                  key={m.label}
                  className="group/metric rounded-xl border border-border/40 bg-secondary/20 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-secondary/40"
                >
                  <p className="font-mono text-xl font-bold text-foreground transition-colors group-hover/metric:text-primary">
                    {m.value}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Key highlights */}
          <div className="panel-stagger mt-8" style={{ animationDelay: "200ms" }}>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Key Highlights
            </h3>
            <ul className="space-y-3">
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
            <div className="panel-stagger mt-10" style={{ animationDelay: "300ms" }}>
              <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Architecture
              </h3>
              <div className="relative space-y-3">
                {/* Connecting line */}
                <div className="absolute left-5 top-8 bottom-8 w-px bg-gradient-to-b from-primary/30 via-accent/20 to-transparent" />
                {data.architecture.map((node, i) => {
                  const Icon = iconMap[node.icon]
                  return (
                    <div
                      key={i}
                      className="group/node relative flex items-start gap-4 rounded-xl border border-transparent p-3 transition-all duration-300 hover:border-border/40 hover:bg-secondary/20"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${data.gradient} shadow-lg shadow-black/20 transition-transform duration-300 group-hover/node:scale-110`}
                      >
                        <Icon className="h-4 w-4 text-white" />
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
            <div className="panel-stagger mt-10" style={{ animationDelay: "400ms" }}>
              <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                System Diagram
              </h3>
              <ArchitectureDiagram type={data.diagramType} gradient={data.gradient} accent={data.accent} />
            </div>
          )}

          {/* Tech stack */}
          <div className="panel-stagger mt-10" style={{ animationDelay: "500ms" }}>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.techStack.map((tech, i) => (
                <span
                  key={tech}
                  className="rounded-lg border border-border/50 bg-secondary/30 px-3 py-1.5 font-mono text-xs text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-secondary/60 hover:text-foreground"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
  )
}
