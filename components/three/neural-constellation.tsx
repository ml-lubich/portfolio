"use client"

/* ──────────────────────────────────────────────────────────────────────
 *  NeuralConstellation — the "Core Proficiency" skill map.
 *
 *  SVG geometry + HTML labels, not WebGL: it renders on phones, under
 *  prefers-reduced-motion (static but complete), and in both themes via
 *  currentColor. Five domain nodes sit on a ring around a hub; halo size
 *  and edge weight scale with proficiency. Signal pulses travel hub → node
 *  along the spokes and one orbits the ring. The side panel always shows a
 *  selected domain — it auto-cycles on a cadence; hovering, tapping or
 *  focusing a node overrides it, leaving resumes.
 * ────────────────────────────────────────────────────────────────────── */

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useSectionProgress } from "@/lib/use-section-progress"
import { useReducedMotion } from "framer-motion"
import { type BarItem } from "../animations/animated-bars"
import { AnimatedCounter } from "../animations/animated-counter"

/* ── Public data shapes ───────────────────────────────────────────────── */

export interface ConstellationMetric {
  value: string
  label: string
}

/* Short node labels, in the same order as the `bars` prop. */
const SHORT = ["PyTorch / TF", "LLMs / RAG", "Multi-Agent", "MLOps / AWS", "Guardrails"]

const CYCLE_MS = 4000
const RING_R = 28 // node ring radius, viewBox units (0–100)
const CX = 50
const CY = 50

/* proficiency (0–100) → node radius in viewBox units (88 → ~3.7, 95 → 5) */
function nodeRadius(v: number) {
  const t = Math.max(0, Math.min(1, (v - 85) / 10))
  return 3.2 + t * 1.8
}

interface Node {
  i: number
  x: number
  y: number
  r: number
  value: number
  short: string
  /** HTML label anchor: where the label box attaches relative to its point */
  anchor: string
  lx: number
  ly: number
}

function layout(values: number[]): Node[] {
  const n = values.length
  return values.map((value, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2 // top, then clockwise
    const cos = Math.cos(a)
    const sin = Math.sin(a)
    const r = nodeRadius(value)
    /* side labels hug the node a touch closer so they clear a 390px card */
    const d = RING_R + r + (Math.abs(cos) > 0.3 ? 2 : 4.5)
    const anchor =
      cos > 0.3
        ? "translate(0,-50%)"
        : cos < -0.3
          ? "translate(-100%,-50%)"
          : sin < 0
            ? "translate(-50%,-100%)"
            : "translate(-50%,0)"
    return {
      i,
      x: CX + RING_R * cos,
      y: CY + RING_R * sin,
      r,
      value,
      short: SHORT[i] ?? `Node ${i + 1}`,
      anchor,
      lx: CX + d * cos,
      ly: CY + d * sin,
    }
  })
}

/* Component-scoped keyframes. Everything animated carries .nm-anim so the
   reduced-motion media query can flatten it even before JS hydrates. */
const STYLE = `
@keyframes nm-spin { to { transform: rotate(360deg) } }
@keyframes nm-spin-rev { to { transform: rotate(-360deg) } }
@keyframes nm-breathe { 0%,100% { transform: scale(1) } 50% { transform: scale(1.025) } }
@keyframes nm-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }
@keyframes nm-hub { 0%,100% { opacity: .55; transform: scale(1) } 50% { opacity: 1; transform: scale(1.2) } }
.nm-ring-a { animation: nm-spin 90s linear infinite }
.nm-ring-b { animation: nm-spin-rev 140s linear infinite }
.nm-breathe { animation: nm-breathe 7s ease-in-out infinite }
.nm-active-ring { animation: nm-spin 14s linear infinite }
.nm-hub { animation: nm-hub 3.2s ease-in-out infinite }
.cycle-progress { animation: nm-progress ${CYCLE_MS}ms linear forwards; transform-origin: left }
/* Glow is the site's accent-glow token (blue in both themes), never the
   foreground: a foreground disc through blur is a black smudge in light.
   Cores are bright in dark and a deep accent in light. */
.nm-map { --nm-glow: var(--accent-glow); --nm-core: hsl(var(--foreground)); --nm-core-edge: var(--accent-glow) }
.light .nm-map { --nm-core: var(--accent-glow); --nm-core-edge: hsl(var(--accent)) }
.nm-halo { fill: var(--nm-glow); opacity: var(--nm-halo) }
.light .nm-halo { opacity: min(var(--nm-halo), 0.25) }
@media (prefers-reduced-motion: reduce) { .nm-anim { animation: none !important } }
`

/* ── The map ──────────────────────────────────────────────────────────── */

interface MapProps {
  nodes: Node[]
  active: number
  hovered: number | null
  reduce: boolean
  onEnter: (i: number) => void
  onLeave: () => void
}

function NeuralMap({ nodes, active, hovered, reduce, onEnter, onLeave }: MapProps) {
  const n = nodes.length
  const dim = hovered !== null
  const ringPath = useMemo(
    () => nodes.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ") + " Z",
    [nodes]
  )
  const isAdjacent = (i: number) =>
    i === active || (i + 1) % n === active || (active + 1) % n === i

  return (
    <div className="nm-map relative mx-auto aspect-square w-full max-w-[520px] text-foreground">
      <style>{STYLE}</style>
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <filter id="nm-glow-soft" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <radialGradient id="nm-node">
            <stop offset="0%" style={{ stopColor: "var(--nm-core)" }} />
            <stop offset="65%" style={{ stopColor: "var(--nm-core)", stopOpacity: 0.92 }} />
            <stop offset="100%" style={{ stopColor: "var(--nm-core-edge)" }} />
          </radialGradient>
        </defs>

        {/* outer instrument rings — slow counter-rotation + breathing */}
        {/* CSS transforms replace the SVG transform attribute, so the
            translate lives on its own wrapper and the animation on a child */}
        <g transform={`translate(${CX} ${CY})`}>
        <g className="nm-anim nm-breathe">
          <circle
            r={46.5}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.22}
            strokeDasharray="0.6 2.2"
            opacity={0.32}
            className="nm-anim nm-ring-a"
          />
          <circle
            r={49}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.5}
            strokeDasharray="0.25 6.5"
            opacity={0.22}
            className="nm-anim nm-ring-b"
          />
          <circle r={RING_R} fill="none" stroke="currentColor" strokeWidth={0.12} opacity={0.14} />
        </g>
        </g>

        {/* pentagon ring edges */}
        {nodes.map((p, i) => {
          const q = nodes[(i + 1) % n]
          const lit = isAdjacent(i) && (i === active || (i + 1) % n === active)
          return (
            <line
              key={`ring-${i}`}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              stroke={lit ? "var(--nm-glow)" : "currentColor"}
              strokeWidth={lit ? 0.4 : 0.22}
              opacity={lit ? 0.7 : dim ? 0.07 : 0.16}
              style={{ transition: "opacity .45s, stroke-width .45s" }}
            />
          )
        })}

        {/* spokes hub → node, weighted by proficiency */}
        {nodes.map((p) => {
          const lit = p.i === active
          return (
            <line
              key={`spoke-${p.i}`}
              x1={CX}
              y1={CY}
              x2={p.x}
              y2={p.y}
              stroke={lit ? "var(--nm-glow)" : "currentColor"}
              strokeWidth={lit ? 0.55 : 0.18 + (p.r - 3.2) * 0.12}
              opacity={lit ? 0.9 : dim ? 0.08 : 0.24}
              style={{ transition: "opacity .45s, stroke-width .45s" }}
            />
          )
        })}

        {/* signal pulses — hub → node on each spoke, one orbiting the ring */}
        {!reduce && (
          <g fill="var(--nm-glow)">
            {nodes.map((p) => {
              const lit = p.i === active
              const dur = lit ? "1.5s" : "2.8s"
              /* no SVG filter here: filtered elements under animateMotion
                 paint their filter region as a box in Chromium */
              return (
                <g key={`pulse-${p.i}`}>
                  <animateMotion
                    dur={dur}
                    begin={`${p.i * 0.55}s`}
                    repeatCount="indefinite"
                    path={`M${CX} ${CY} L${p.x} ${p.y}`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.12;0.82;1"
                    dur={dur}
                    begin={`${p.i * 0.55}s`}
                    repeatCount="indefinite"
                  />
                  <circle r={lit ? 2.2 : 1.6} opacity={0.25} />
                  <circle r={lit ? 0.9 : 0.6} />
                </g>
              )
            })}
            <g opacity={0.9}>
              <animateMotion dur="11s" repeatCount="indefinite" path={ringPath} />
              <circle r={1.4} opacity={0.25} />
              <circle r={0.55} />
            </g>
          </g>
        )}

        {/* hub */}
        <g transform={`translate(${CX} ${CY})`}>
          <circle
            r={4.5}
            filter="url(#nm-glow-soft)"
            className="nm-anim nm-hub nm-halo"
            style={{ ["--nm-halo" as string]: 0.3 }}
          />
          <circle r={2.4} fill="url(#nm-node)" />
          <circle r={4.2} fill="none" stroke="var(--nm-glow)" strokeWidth={0.2} opacity={0.6} />
        </g>

        {/* nodes */}
        {nodes.map((p) => {
          const lit = p.i === active
          const faded = dim && !lit
          const haloOpacity = 0.14 + ((p.value - 85) / 10) * 0.22
          return (
            <g
              key={p.i}
              transform={`translate(${p.x} ${p.y})`}
              role="button"
              tabIndex={0}
              aria-label={`${p.short}, ${p.value}%`}
              onPointerEnter={() => onEnter(p.i)}
              onPointerLeave={onLeave}
              onFocus={() => onEnter(p.i)}
              onBlur={onLeave}
              className="cursor-pointer outline-none"
              style={{ opacity: faded ? 0.45 : 1, transition: "opacity .45s" }}
            >
              <circle
                r={p.r * 1.5}
                filter="url(#nm-glow-soft)"
                className="nm-halo"
                style={{
                  ["--nm-halo" as string]: lit ? haloOpacity + 0.3 : haloOpacity,
                  transform: `scale(${lit ? 1.25 : 1})`,
                  transition: "opacity .45s, transform .6s cubic-bezier(.16,1,.3,1)",
                }}
              />
              <circle
                r={p.r}
                fill="url(#nm-node)"
                stroke="var(--nm-core-edge)"
                strokeWidth={0.25}
                style={{
                  transform: `scale(${lit ? 1.18 : 1})`,
                  transition: "transform .6s cubic-bezier(.16,1,.3,1)",
                }}
              />
              <circle
                r={p.r + 2.6}
                fill="none"
                stroke="var(--nm-glow)"
                strokeWidth={0.28}
                strokeDasharray="1.2 1.4"
                className="nm-anim nm-active-ring"
                style={{ opacity: lit ? 0.7 : 0, transition: "opacity .45s" }}
              />
              {/* generous invisible hit target */}
              <circle r={p.r + 6} fill="transparent" />
            </g>
          )
        })}
      </svg>

      {/* HTML labels: fixed px type regardless of map size */}
      {nodes.map((p) => {
        const lit = p.i === active
        const faded = dim && !lit
        return (
          <div
            key={p.i}
            aria-hidden="true"
            className="pointer-events-none absolute whitespace-nowrap rounded-md bg-background/60 px-1 py-0.5 text-center leading-tight backdrop-blur-[2px]"
            style={{
              left: `${p.lx}%`,
              top: `${p.ly}%`,
              transform: p.anchor,
              opacity: faded ? 0.4 : 1,
              transition: "opacity .45s",
            }}
          >
            <div
              className={`text-[11px] tracking-wide transition-colors duration-300 md:text-xs ${
                lit ? "font-semibold text-foreground" : "font-medium text-foreground/80"
              }`}
            >
              {p.short}
            </div>
            <div className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {p.value}%
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Public component ─────────────────────────────────────────────────── */

interface NeuralConstellationProps {
  bars: BarItem[]
  metrics: ConstellationMetric[]
}

export function NeuralConstellation({ bars, metrics }: NeuralConstellationProps) {
  const nodeBars = bars.slice(0, SHORT.length)
  const nodes = useMemo(() => layout(bars.slice(0, SHORT.length).map((b) => b.value)), [bars])
  const n = nodeBars.length
  const topIndex = nodeBars.reduce((best, b, i) => (b.value > nodeBars[best].value ? i : best), 0)

  const reduce = useReducedMotion() ?? false
  const [hovered, setHovered] = useState<number | null>(null)
  const [cycled, setCycled] = useState(topIndex)
  /* bumping this restarts both the interval and the progress bar together */
  const [epoch, setEpoch] = useState(0)

  /* Scroll scrubs the map (desktop only). scroll-craft: the wheel is a
     scrubber, so on a wide, motion-ok viewport the section's travel through
     the viewport selects the node — top node as it enters, bottom node as it
     leaves — and the timer cycle stands down. The middle 70% of the travel is
     the scrub band so the first and last nodes hold at the edges instead of
     flickering at the boundaries. Hover still overrides. On phones, tablets,
     coarse pointers and reduced motion the hook never attaches, so the timer
     cycle (or, under reduce, the static top node) is exactly what it was. */
  const rootRef = useRef<HTMLDivElement>(null)
  const [scrubbing, setScrubbing] = useState(false)
  useSectionProgress(rootRef, (p, el) => {
    const band = Math.min(1, Math.max(0, (p - 0.15) / 0.7))
    const i = Math.min(n - 1, Math.floor(band * n))
    setScrubbing(true)
    setCycled(i)
    el.dataset.scVerifyState = `node:${i}`
  })

  useEffect(() => {
    if (reduce || hovered !== null || scrubbing) return
    const id = setInterval(() => setCycled((c) => (c + 1) % n), CYCLE_MS)
    return () => clearInterval(id)
  }, [reduce, hovered, scrubbing, epoch, n])

  const active = hovered ?? cycled
  const bar = nodeBars[active]

  const onEnter = (i: number) => setHovered(i)
  const onLeave = () => {
    setHovered(null)
    setEpoch((e) => e + 1)
  }
  const select = (i: number) => {
    setCycled(i)
    setEpoch((e) => e + 1)
  }

  return (
    <div ref={rootRef}>
      {/* Telemetry readouts — the headline metrics reframed as HUD counters */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:mb-6 md:grid-cols-4 md:gap-4">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 backdrop-blur-md transition-colors duration-500 hover:border-primary/25"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-60" />
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              <span
                className="h-1 w-1 rounded-full bg-primary/70"
                style={{
                  animation: "bar-breathe 3s ease-in-out infinite",
                  animationDelay: `${i * 400}ms`,
                }}
              />
              {m.label}
            </div>
            <AnimatedCounter
              value={m.value}
              duration={2000}
              className="mt-1 block font-display text-2xl font-light text-foreground md:text-3xl"
            />
          </div>
        ))}
      </div>

      {/* The map */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-xl frosted-panel">
        <div className="absolute inset-0 dot-pattern opacity-20" aria-hidden="true" />

        <div className="relative z-10 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pt-5 md:px-8 md:pt-6">
          <h3 className="text-lg font-bold text-foreground">Core Proficiency</h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            hover or tap a node
          </span>
        </div>

        <div className="relative grid lg:grid-cols-[1.35fr_1fr]">
          <div className="p-4 pt-2 md:p-6 md:pt-3">
            <NeuralMap
              nodes={nodes}
              active={active}
              hovered={hovered}
              reduce={reduce}
              onEnter={onEnter}
              onLeave={onLeave}
            />
          </div>

          {/* detail panel — always populated */}
          <aside
            className="relative z-10 flex flex-col border-t border-white/[0.06] p-5 lg:border-l lg:border-t-0 md:p-6"
            aria-live="polite"
          >
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>{hovered !== null ? "Selected" : scrubbing ? "Scroll to trace" : "Now tracing"}</span>
              <span className="tabular-nums">
                {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
              </span>
            </div>

            <div key={active} className="mt-3 flex flex-1 flex-col">
              <h4 className="font-display text-2xl font-light leading-tight text-foreground">
                {bar.label}
              </h4>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-display text-4xl font-light tabular-nums text-foreground">
                  {bar.value}
                  <span className="text-xl text-muted-foreground">%</span>
                </span>
                {bar.display && (
                  <span className="rounded-full border border-white/[0.12] bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/80">
                    {bar.display}
                  </span>
                )}
              </div>
              <div className="mt-2 h-px w-full overflow-hidden bg-white/[0.08]">
                <div
                  className="h-full bg-foreground/70"
                  style={{
                    width: `${bar.value}%`,
                    transition: "width .7s cubic-bezier(.16,1,.3,1)",
                  }}
                />
              </div>

              <ul className="mt-4 space-y-2">
                {bar.details?.map((d, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2"
                    style={{
                      animation: reduce ? undefined : "panel-slide-up 0.35s ease-out both",
                      animationDelay: `${idx * 50}ms`,
                    }}
                  >
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-foreground/60" aria-hidden />
                    <p className="text-xs leading-relaxed text-muted-foreground">{d}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* node selector + cycle progress */}
            <div className="mt-5 flex items-center gap-2">
              {nodeBars.map((b, i) => (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => select(i)}
                  aria-label={`Show ${b.label}`}
                  aria-current={i === active}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? "w-7 bg-foreground/80" : "w-1.5 bg-white/25 hover:bg-white/50"
                  }`}
                />
              ))}
              {!reduce && !scrubbing && (
                <div className="ml-auto h-px w-16 overflow-hidden bg-white/[0.08]" aria-hidden="true">
                  <div
                    key={`${cycled}-${epoch}`}
                    className="cycle-progress nm-anim h-full w-full bg-foreground/50"
                    style={{ animationPlayState: hovered !== null ? "paused" : "running" }}
                  />
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Screen-reader equivalent of the whole graph */}
        <ul className="sr-only">
          {nodeBars.map((b) => (
            <li key={b.label}>
              {b.label}: {b.value}% {b.display ?? ""}. {b.details?.join(" ")}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
