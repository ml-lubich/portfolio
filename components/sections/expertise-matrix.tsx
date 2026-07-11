"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { proficiencyBars } from "@/data/skills"

/* ─────────────────────────────────────────────────────────────────────
 *  ExpertiseMatrix — replaces the old "Overall Proficiency" percentage
 *  bars with a constellation-styled competency panel.
 *
 *  Six interactive domain tiles: name + tier pill + a 5-node
 *  constellation meter (lit count derived from depth — no self-graded
 *  percentages on screen). Hovering / tapping a tile reveals that
 *  domain's proof bullets in a shared drawer beneath the grid.
 * ───────────────────────────────────────────────────────────────────── */

/* Per-domain accent hues — desaturated to sit inside the metallic
 * palette. Raw HSL triples (never the 217-hue tech blue). */
const DOMAIN_ACCENTS: Record<string, string> = {
  "Python": "180 55% 55%",
  "Java / Spring Boot": "300 45% 62%",
  "TypeScript / JavaScript": "195 55% 55%",
  "AI/ML & LLM Systems": "280 50% 62%",
  "Cloud & Infrastructure": "150 40% 55%",
  "Rust / Go / C++": "35 60% 58%",
}
const FALLBACK_ACCENT = "0 0% 85%"

const NODE_COUNT = 5

interface ConstellationMeterProps {
  /** number of lit nodes, 0–5 */
  lit: number
  /** raw HSL triple */
  accent: string
  /** whether the scroll-in animation has fired */
  active: boolean
  /** stagger offset in ms for this tile */
  delay: number
}

/** Decorative 5-node meter: a faint connecting line with glowing nodes
 *  that light up in sequence once scrolled into view. */
function ConstellationMeter({ lit, accent, active, delay }: ConstellationMeterProps) {
  return (
    <svg
      viewBox="0 0 120 16"
      className="h-4 w-full max-w-[8.5rem]"
      aria-hidden="true"
    >
      {/* connecting line — draws in behind the nodes */}
      <line
        x1="8" y1="8" x2="112" y2="8"
        stroke="hsl(0 0% 100% / 0.10)"
        strokeWidth="1"
        strokeDasharray="104"
        strokeDashoffset={active ? 0 : 104}
        style={{ transition: `stroke-dashoffset 900ms ease-out ${delay}ms` }}
      />
      {Array.from({ length: NODE_COUNT }, (_, i) => {
        const cx = 8 + i * 26
        const isLit = i < lit
        const nodeDelay = delay + 150 + i * 110
        return (
          <g key={i}>
            {/* halo behind lit nodes */}
            {isLit && (
              <circle
                cx={cx} cy="8" r="6"
                fill={`hsl(${accent} / 0.22)`}
                opacity={active ? 1 : 0}
                style={{
                  transition: `opacity 500ms ease-out ${nodeDelay}ms`,
                  // CSS (not SMIL) so the global reduced-motion override applies
                  animation:
                    i === lit - 1
                      ? "constellation-node-pulse 2.6s ease-in-out infinite"
                      : undefined,
                }}
              />
            )}
            <circle
              cx={cx} cy="8"
              r={isLit ? 3 : 2.2}
              fill={isLit ? `hsl(${accent})` : "hsl(0 0% 100% / 0.14)"}
              opacity={active ? 1 : 0}
              style={{
                transition: `opacity 400ms ease-out ${nodeDelay}ms`,
              }}
            />
          </g>
        )
      })}
    </svg>
  )
}

/** Proof bullets for one domain — used by the shared drawer (≥sm) and
 *  the inline mobile expansion. */
function DetailList({ details, accent }: { details: string[]; accent: string }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {details.map((detail, idx) => (
        <div
          key={idx}
          className="flex items-start gap-2.5"
          style={{ animation: `panel-slide-up 0.45s ease-out ${idx * 60}ms both` }}
        >
          <span
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
            style={{
              background: `hsl(${accent})`,
              boxShadow: `0 0 8px hsl(${accent} / 0.6)`,
            }}
          />
          <p className="text-xs leading-relaxed text-muted-foreground md:text-[13px]">
            {detail}
          </p>
        </div>
      ))}
    </div>
  )
}

export function ExpertiseMatrix() {
  const panelRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [selected, setSelected] = useState(0)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* trigger the meters once the panel scrolls into view */
  useEffect(() => {
    const el = panelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleEnter = useCallback((i: number) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => setSelected(i), 120)
  }, [])

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  const domain = proficiencyBars[selected]
  const accent = DOMAIN_ACCENTS[domain?.label ?? ""] ?? FALLBACK_ACCENT

  return (
    <div
      ref={panelRef}
      className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-card/25 p-6 backdrop-blur-xl frosted-panel md:p-9"
    >
      {/* top hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-foreground md:text-xl">
          Core Expertise
        </h3>
        <span className="text-xs text-muted-foreground/70">
          Proof over percentages — pick a domain for the receipts
        </span>
      </div>

      {/* domain tiles */}
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        role="tablist"
        aria-label="Expertise domains"
      >
        {proficiencyBars.map((bar, i) => {
          const tileAccent = DOMAIN_ACCENTS[bar.label] ?? FALLBACK_ACCENT
          const lit = Math.min(NODE_COUNT, Math.round(bar.value / (100 / NODE_COUNT)))
          const isSelected = selected === i
          const isExpert = bar.display === "Expert"

          return (
            <div
              key={bar.label}
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(14px)",
                transition: `opacity 600ms ease-out ${i * 70}ms, transform 600ms ease-out ${i * 70}ms`,
              }}
            >
            <button
              type="button"
              role="tab"
              id={`expertise-tab-${i}`}
              aria-selected={isSelected}
              aria-controls="expertise-detail"
              onMouseEnter={() => handleEnter(i)}
              onFocus={() => setSelected(i)}
              onClick={() => setSelected(i)}
              className="group relative h-full w-full overflow-hidden rounded-xl border p-4 text-left transition-all duration-300"
              style={{
                borderColor: isSelected
                  ? `hsl(${tileAccent} / 0.35)`
                  : "hsl(0 0% 100% / 0.06)",
                background: isSelected
                  ? `linear-gradient(135deg, hsl(${tileAccent} / 0.08), hsl(0 0% 100% / 0.02))`
                  : "hsl(0 0% 100% / 0.02)",
                boxShadow: isSelected
                  ? `0 0 28px -8px hsl(${tileAccent} / 0.35)`
                  : "none",
              }}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {bar.label}
                </span>
                {/* tier pill */}
                <span
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                  style={{
                    borderColor: isExpert
                      ? `hsl(${tileAccent} / 0.4)`
                      : "hsl(0 0% 100% / 0.12)",
                    color: isExpert
                      ? `hsl(${tileAccent})`
                      : "hsl(0 0% 100% / 0.55)",
                    background: isExpert
                      ? `hsl(${tileAccent} / 0.08)`
                      : "hsl(0 0% 100% / 0.03)",
                  }}
                >
                  <span
                    className="h-1 w-1 rounded-full"
                    style={{
                      background: isExpert
                        ? `hsl(${tileAccent})`
                        : "hsl(0 0% 100% / 0.4)",
                      boxShadow: isExpert
                        ? `0 0 6px hsl(${tileAccent} / 0.8)`
                        : "none",
                    }}
                  />
                  {bar.display}
                </span>
              </div>

              <ConstellationMeter
                lit={lit}
                accent={tileAccent}
                active={inView}
                delay={i * 70}
              />
            </button>

            {/* inline proof expansion — phones only, where the shared
               drawer below the 1-column grid would land offscreen */}
            {isSelected && (
              <div className="mt-2 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 sm:hidden">
                <DetailList details={bar.details ?? []} accent={tileAccent} />
              </div>
            )}
            </div>
          )
        })}
      </div>

      {/* shared proof drawer — hidden on phones (inline expansion instead) */}
      <div
        id="expertise-detail"
        role="tabpanel"
        aria-labelledby={`expertise-tab-${selected}`}
        className="mt-5 hidden rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 sm:block md:p-5"
      >
        <div key={domain?.label}>
          <DetailList details={domain?.details ?? []} accent={accent} />
        </div>
      </div>
    </div>
  )
}
