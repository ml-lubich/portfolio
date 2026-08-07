"use client"

/**
 * OssDemoCard — one Open Source showcase entry: glass card matching
 * MarqueeCard's visual language (border/bg/gradient-strip/accent-glow),
 * wrapping a DemoTerminal with header (repo link + install copy) and
 * footer (stats + tech tags). Looks up gradient/accent/tags on `projects`
 * by `demo.id` — oss-demos.ts intentionally doesn't duplicate them.
 */

import { useCallback, useState } from "react"
import { ArrowRight, Check, Copy, Github } from "lucide-react"
import { DemoTerminal } from "@/components/terminal/demo-terminal"
import { AnimatedCounter } from "@/components/animations"
import { terminalChrome } from "@/lib/theme"
import { projects } from "@/data/projects"
import type { OssDemo } from "@/data/oss-demos"

interface OssDemoCardProps {
  demo: OssDemo
  /** Gates DemoTerminal's typing loop; container passes true for only one card at a time. */
  active?: boolean
  onExplore?: (projectId: string) => void
}

/** AnimatedCounter mis-renders values with no digit (e.g. "PyPI") — only animate numeric stats. */
const isAnimatable = (value: string) => /\d/.test(value)

export function OssDemoCard({ demo, active = true, onExplore }: OssDemoCardProps) {
  const project = projects.find((p) => p.id === demo.id)
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (!demo.install) return
    navigator.clipboard.writeText(demo.install).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }, [demo.install])

  if (!project) return null

  return (
    <article className="group/demo relative overflow-hidden rounded-2xl border border-white/20 bg-card/60 backdrop-blur-2xl transition-all duration-500 hover:border-primary/40 hover:bg-card/85 hover:shadow-2xl hover:shadow-primary/20">
      <div className={`h-1 w-full bg-gradient-to-r ${project.gradient} opacity-80 transition-opacity duration-500 group-hover/demo:opacity-100`} />

      <div
        className="pointer-events-none absolute -right-16 -top-16 z-0 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover/demo:opacity-[0.20]"
        style={{ background: project.accent }}
        aria-hidden
      />

      <div className="relative z-[1] p-4 sm:p-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-foreground sm:text-lg">{project.name}</h3>
              {demo.badge && (
                <span className="inline-flex items-center rounded-full border border-white/15 bg-black/25 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-white/70">
                  {demo.badge}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground/70 sm:text-[13px]">{demo.tagline}</p>
          </div>

          <a
            href={demo.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.name} on GitHub`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border/50 bg-secondary px-2.5 py-1 text-xs text-muted-foreground/80 transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60"
          >
            <Github className="h-3.5 w-3.5" aria-hidden />
            GitHub
          </a>
        </div>

        {demo.install && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy install command: ${demo.install}`}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-black/20 px-2.5 py-1 font-mono text-[11px] text-muted-foreground/70 transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
            {copied ? "Copied" : demo.install}
          </button>
        )}

        {/* Terminal — mac-window chrome reused from lib/theme (matches components/terminal) */}
        <div
          className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] shadow-xl shadow-black/30"
          style={{ background: terminalChrome.bg }}
        >
          <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-2" style={{ background: terminalChrome.headerBg }}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: terminalChrome.dotClose }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: terminalChrome.dotMinimize }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: terminalChrome.dotExpand }} />
          </div>
          <div className="p-3 sm:p-4">
            <DemoTerminal lines={demo.demo} active={active} />
          </div>
        </div>

        {/* Footer: stats + tech tags */}
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap gap-4">
            {demo.stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-mono text-sm font-semibold text-foreground">
                  {active && isAnimatable(stat.value) ? <AnimatedCounter value={stat.value} /> : stat.value}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/50 bg-secondary px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground/60 transition-colors group-hover/demo:border-primary/30"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {onExplore && (
          <button
            type="button"
            onClick={() => onExplore(project.id)}
            aria-label={`Explore ${project.name} — architecture and details`}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground/80 transition-all duration-300 hover:border-primary/40 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60"
          >
            Explore architecture
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/demo:translate-x-0.5" aria-hidden />
          </button>
        )}
      </div>
    </article>
  )
}
