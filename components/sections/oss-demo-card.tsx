"use client"

/**
 * OssDemoCard — the Open Source showcase's single featured panel.
 *
 * The section used to render nine of these at once, which turned the page into
 * a wall of terminal transcripts. Now one tool is featured at a time: a
 * generated vertex-mesh signature and stat gauges carry the visual weight, and
 * the terminal shows only that tool's demo.
 *
 * Gradient/accent/tags are looked up on `projects` by `demo.id` —
 * oss-demos.ts intentionally doesn't duplicate them.
 */

import { useCallback, useMemo, useState } from "react"
import { ArrowRight, Check, Copy, Github } from "lucide-react"
import { DemoTerminal } from "@/components/terminal/demo-terminal"
import { OssDemoSim } from "./oss-demo-sim"
import { AnimatedCounter } from "@/components/animations"
import { terminalChrome } from "@/lib/theme"
import { projects } from "@/data/projects"
import type { OssDemo } from "@/data/oss-demos"

interface OssDemoCardProps {
  demo: OssDemo
  /** Gates DemoTerminal's typing loop; only the featured tool types. */
  active?: boolean
  onExplore?: (projectId: string) => void
}

/** AnimatedCounter mis-renders values with no digit (e.g. "PyPI") — only animate numeric stats. */
const isAnimatable = (value: string) => /\d/.test(value)

/* ── Vertex-mesh signature ────────────────────────────────────────
 *  A deterministic node/edge graph per tool, echoing the hero brain's
 *  wireframe. Same id always draws the same mesh, so each tool reads as
 *  having its own fingerprint rather than a random shape each render. */

/** Mulberry32 — small deterministic PRNG so a tool id always yields one mesh. */
function seededRandom(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hashId = (id: string) =>
  [...id].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 7)

interface MeshNode {
  x: number
  y: number
  r: number
  delay: number
}

function useMesh(id: string, count = 22) {
  return useMemo(() => {
    const rand = seededRandom(hashId(id))
    const nodes: MeshNode[] = Array.from({ length: count }, (_, i) => {
      // Ring-biased placement keeps the silhouette readable at small sizes
      const angle = (i / count) * Math.PI * 2 + rand() * 0.5
      const radius = 22 + rand() * 26
      return {
        x: 50 + Math.cos(angle) * radius,
        y: 50 + Math.sin(angle) * radius * 0.92,
        r: 0.9 + rand() * 1.5,
        delay: rand() * 4,
      }
    })

    const edges: [MeshNode, MeshNode][] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        if (Math.hypot(dx, dy) < 20) edges.push([nodes[i], nodes[j]])
      }
    }
    return { nodes, edges }
  }, [id, count])
}

function ToolSignature({ id, accent }: { id: string; accent: string }) {
  const { nodes, edges } = useMesh(id)

  return (
    <div className="relative aspect-square w-full max-w-[220px]">
      <div
        className="absolute inset-4 rounded-full opacity-30 blur-2xl"
        style={{ background: accent }}
        aria-hidden
      />
      <svg
        viewBox="0 0 100 100"
        className="relative h-full w-full"
        style={{ animation: "holo-spin 46s linear infinite" }}
        aria-hidden
      >
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="rgba(223,226,236,0.28)"
            strokeWidth={0.3}
          />
        ))}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} fill="rgba(255,255,255,0.85)">
            <animate
              attributeName="opacity"
              values="0.25;1;0.25"
              dur="3.6s"
              begin={`${n.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
    </div>
  )
}

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
    <article className="relative overflow-hidden rounded-3xl border border-white/[0.10] bg-[#0a0c14]/70 backdrop-blur-2xl">
      <div className={`h-[2px] w-full bg-gradient-to-r ${project.gradient} opacity-80`} />

      {/* Corner brackets */}
      <span className="pointer-events-none absolute left-4 top-5 h-5 w-5 border-l border-t border-white/25" aria-hidden />
      <span className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 border-b border-r border-white/25" aria-hidden />

      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-8">
        {/* ── Signature + gauges ── */}
        <div className="flex flex-col items-center gap-5">
          <ToolSignature id={demo.id} accent={project.accent} />

          <div className="grid w-full grid-cols-2 gap-3">
            {demo.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-center"
              >
                <div className="font-mono text-base font-semibold text-foreground">
                  {active && isAnimatable(stat.value) ? <AnimatedCounter value={stat.value} /> : stat.value}
                </div>
                <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground/50">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Identity + terminal ── */}
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-xl font-light text-foreground sm:text-2xl">
                  {project.name}
                </h3>
                {demo.badge && (
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-black/25 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-white/70">
                    {demo.badge}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground/70">{demo.tagline}</p>
            </div>

            <a
              href={demo.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.name} on GitHub`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80 transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60"
            >
              <Github className="h-3.5 w-3.5" aria-hidden />
              GitHub
            </a>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {demo.install && (
              <button
                type="button"
                onClick={handleCopy}
                aria-label={`Copy install command: ${demo.install}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-black/25 px-2.5 py-1 font-mono text-[11px] text-muted-foreground/70 transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
                {copied ? "Copied" : demo.install}
              </button>
            )}
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/55"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Terminal — mac-window chrome reused from lib/theme */}
          <div
            className="mt-4 flex-1 overflow-hidden rounded-xl border border-white/[0.08] shadow-xl shadow-black/30"
            style={{ background: terminalChrome.bg }}
          >
            <div
              className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-2"
              style={{ background: terminalChrome.headerBg }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: terminalChrome.dotClose }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: terminalChrome.dotMinimize }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: terminalChrome.dotExpand }} />
              <span className="ml-2 truncate font-mono text-[10px] text-muted-foreground/40">
                {demo.id}
              </span>
            </div>
            <div className="p-3 sm:p-4">
              <DemoTerminal lines={demo.demo} active={active} />
            </div>
          </div>

          {/* The app the command actually drove — only tools that touch a
              visible app carry a sim; the rest stay terminal-only. */}
          {demo.sim && (
            <div className="mt-3">
              <OssDemoSim sim={demo.sim} active={active} />
            </div>
          )}

          {onExplore && (
            <button
              type="button"
              onClick={() => onExplore(project.id)}
              aria-label={`Explore ${project.name} — architecture and details`}
              className="group/explore mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80 transition-all duration-300 hover:border-primary/40 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60"
            >
              Explore architecture
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/explore:translate-x-0.5" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
