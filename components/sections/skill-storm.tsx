"use client"

import { useMemo } from "react"
import { getSkillIcon } from "./skill-icons"
import { skillCategories } from "@/data/skills"

/**
 * ─── Skill Storm ──────────────────────────────────────────────────────
 * Desktop-only (lg+) orbital constellation: every skill becomes a glass
 * pill riding one of several concentric rings that slowly churn in
 * alternating directions — a calm "storm" of skills.
 *
 * Performance: there is **no** per-frame JS. Each ring is a single CSS
 * `rotate` animation on the compositor; each pill counter-rotates with an
 * equal-and-opposite CSS animation so its label stays upright. Hovering
 * any pill freezes the entire field via `:has()` so it can be read/clicked.
 * Under `prefers-reduced-motion` the global rule freezes it into a static
 * constellation. Reduced-motion + hover-to-pause keep it comfortable.
 */

/* Compressed ellipse (a storm seen from a shallow angle), not a flat circle. */
const RING_SQUASH = 0.62
const PILL_SPACING = 108 // px of perimeter budgeted per pill → ring capacity

interface RingSpec {
  /** Horizontal radius in px. */
  rx: number
  /** Seconds per revolution. */
  duration: number
  /** Reverse this ring's spin (adjacent rings counter-rotate). */
  reverse: boolean
  /** Depth cues: outer rings sit slightly smaller + dimmer. */
  scale: number
  opacity: number
}

const RINGS: RingSpec[] = [
  { rx: 112, duration: 66, reverse: false, scale: 1.0, opacity: 1 },
  { rx: 202, duration: 82, reverse: true, scale: 0.96, opacity: 0.92 },
  { rx: 294, duration: 104, reverse: false, scale: 0.9, opacity: 0.82 },
  { rx: 388, duration: 130, reverse: true, scale: 0.85, opacity: 0.72 },
  { rx: 482, duration: 158, reverse: false, scale: 0.8, opacity: 0.6 },
]

/** Ramanujan ellipse-perimeter approximation → how many pills a ring fits. */
function ringCapacity(rx: number): number {
  const a = rx
  const b = rx * RING_SQUASH
  const h = ((a - b) * (a - b)) / ((a + b) * (a + b))
  const perim = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)))
  return Math.max(3, Math.floor(perim / PILL_SPACING))
}

/** Stable per-index jitter in [-0.5, 0.5] — no Math.random, SSR-safe. */
function jitter(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return (x - Math.floor(x)) - 0.5
}

interface PlacedPill {
  name: string
  ring: RingSpec
  x: number
  y: number
}

function buildLayout(skills: string[]): PlacedPill[] {
  // Fill rings inner→outer up to capacity; any overflow lands on the outer ring.
  const buckets: string[][] = RINGS.map(() => [])
  let cursor = 0
  for (let r = 0; r < RINGS.length; r++) {
    const cap = r === RINGS.length - 1 ? Infinity : ringCapacity(RINGS[r].rx)
    while (buckets[r].length < cap && cursor < skills.length) {
      buckets[r].push(skills[cursor++])
    }
    if (cursor >= skills.length) break
  }

  const placed: PlacedPill[] = []
  buckets.forEach((names, r) => {
    const ring = RINGS[r]
    const n = names.length
    names.forEach((name, i) => {
      const seed = r * 97 + i * 13 + 1
      // Even spread + gentle jitter so it churns like weather, not a clock face.
      const angle = (i / n) * Math.PI * 2 + r * 0.618 + jitter(seed) * (Math.PI / n) * 0.9
      placed.push({
        name,
        ring,
        x: Math.cos(angle) * ring.rx,
        y: Math.sin(angle) * ring.rx * RING_SQUASH,
      })
    })
  })
  return placed
}

export function SkillStorm({ onSelect }: { onSelect: (skill: string) => void }) {
  const pills = useMemo(() => {
    const all = skillCategories.flatMap((c) => c.items)
    const unique = Array.from(new Set(all))
    return buildLayout(unique)
  }, [])

  return (
    <div className="skill-storm relative mx-auto h-[42rem] w-full max-w-5xl xl:h-[46rem]" aria-hidden="true">
      {/* Central vortex glow + orbit guide-paths */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.05] blur-[70px]" />
        {RINGS.map((ring) => (
          <div
            key={ring.rx}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/[0.035]"
            style={{ width: ring.rx * 2, height: ring.rx * 2 * RING_SQUASH }}
          />
        ))}
      </div>

      {/* Center label — literally: A Storm of Skills */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground/70">A Storm of</p>
        <p className="gradient-text bg-clip-text text-3xl font-bold tracking-tight xl:text-4xl">Skills</p>
        <p className="mt-2 text-[11px] text-muted-foreground/50">hover to pause · click to explore</p>
      </div>

      {/* One rotating ring per depth; each carries its pills. */}
      {RINGS.map((ring) => (
        <div
          key={ring.rx}
          className="skill-ring"
          style={{
            animationDuration: `${ring.duration}s`,
            animationDirection: ring.reverse ? "reverse" : "normal",
          }}
        >
          {pills
            .filter((p) => p.ring === ring)
            .map((p) => (
              <div
                key={p.name}
                className="skill-orbit-item transition-opacity"
                style={{
                  // Placement + depth scale live here so the pill's own
                  // transform stays free for the hover-grow.
                  transform: `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(${ring.scale})`,
                  opacity: ring.opacity,
                }}
              >
                <div
                  className="skill-pill-spin"
                  style={{
                    animationDuration: `${ring.duration}s`,
                    // Counter the parent ring so labels never turn upside-down.
                    animationDirection: ring.reverse ? "normal" : "reverse",
                  }}
                >
                  <SkillPill name={p.name} onSelect={onSelect} />
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  )
}

function SkillPill({ name, onSelect }: { name: string; onSelect: (skill: string) => void }) {
  const icon = getSkillIcon(name)
  return (
    <button
      type="button"
      aria-hidden="true"
      tabIndex={-1}
      onClick={() => onSelect(name)}
      className="skill-pill group/pill inline-flex origin-center items-center gap-1.5 whitespace-nowrap rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 font-mono text-xs text-muted-foreground backdrop-blur-md transition-[color,border-color,background-color,box-shadow,transform] duration-200 hover:border-primary/40 hover:bg-white/[0.08] hover:text-foreground hover:shadow-[0_0_20px_-4px_hsl(var(--primary)/0.35)]"
    >
      {icon && <span className="opacity-60 transition-opacity group-hover/pill:opacity-100">{icon}</span>}
      {name}
    </button>
  )
}
