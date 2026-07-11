"use client"

import { useEffect, useMemo, useRef } from "react"
import { getSkillIcon } from "./skill-icons"
import { skillCategories } from "@/data/skills"

/**
 * ─── Skill Storm ──────────────────────────────────────────────────────
 * Desktop-only (lg+) 3D carousel: every skill is an opaque glass pill riding
 * one of several concentric rings tilted nearly edge-on to the viewer. One
 * shared angle (`--storm-angle`) drives the whole field; each pill derives
 * its spot from it via CSS trig — cos() sweeps it across the page while
 * sin() carries it INTO the page (far: smaller, dimmer, behind the centre
 * title) and back OUT toward the viewer (near: bigger, brighter, in front).
 * Pills only translate — never rotate — so labels stay upright for free, and
 * `perspective` + `preserve-3d` handle depth scaling and paint order.
 *
 * Interaction: grab-and-spin either direction. A pointer drag revolves the
 * carousel with the cursor (near-side pills track it 1:1 in direction);
 * releasing keeps the fling velocity, which decays by friction back toward a
 * gentle idle drift. Hovering a pill pauses the drift so it can be
 * read/clicked; a real drag suppresses the click so spinning never opens a
 * modal. `prefers-reduced-motion` drops the idle drift (drag still works).
 * One rAF loop updates a single CSS variable per frame — cheap,
 * transform-only, no layout thrash — and is cancelled on unmount.
 */

/* Edge-on cross-section: the rings revolve around the page's VERTICAL axis,
   so a pill's travel is almost entirely across the page (cos) and into/out
   of it (sin → translateZ) — barely any vertical rise. Each ring sits on its
   own tier (RingSpec.y) so the flattened orbits read as a stack of storm
   bands instead of collapsing into one line. Keep RING_SQUASH in sync with
   the 0.1px factor on .skill-orbit-item in globals.css. */
const RING_SQUASH = 0.1
const PILL_SPACING = 104 // px of perimeter budgeted per pill → ring capacity

/** Idle drift, drag feel, and how a fling bleeds off. */
const IDLE_DRIFT = 0.03 // deg/frame gentle churn when untouched
const DRAG_SENSITIVITY = 0.32 // deg of spin per px of horizontal drag
const FLING_FRICTION = 0.95 // per-frame decay of fling velocity toward idle
const DRAG_CLICK_THRESHOLD = 6 // px moved before a press counts as a drag, not a click

interface RingSpec {
  /** Horizontal radius in px. */
  rx: number
  /** Depth cue: outer rings sit slightly smaller (no alpha — pills stay opaque). */
  scale: number
  /** Vertical tier (px from centre) — spreads the edge-on rings into bands. */
  y: number
}

/* Radii are sized so the widest pill on the outer ring (plus its perspective
   bulge) stays INSIDE the storm's border box — the vignette mask hard-clips
   anything past that box, so overshooting radii literally cut pills in half.
   A viewport factor (--storm-k in globals.css) shrinks the field further on
   narrower screens for the same reason. Tiers alternate above/below the
   centre title so the stack stays balanced. */
const RINGS: RingSpec[] = [
  { rx: 132, scale: 1.0, y: -48 },
  { rx: 232, scale: 0.97, y: 62 },
  { rx: 320, scale: 0.93, y: -96 },
  { rx: 400, scale: 0.89, y: 126 },
  { rx: 468, scale: 0.85, y: -150 },
  { rx: 524, scale: 0.82, y: 184 },
]

/* Particle-cloud scatter: each pill drifts off its tier by a stable ±px so
   the bands dissolve into a cloud and pills rarely sit on top of each other. */
const SCATTER_Y = 84

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
  /** Starting angle (deg) along the ring; --storm-angle advances it. */
  phase: number
  /** Static vertical offset (px): ring tier + per-pill cloud scatter. */
  offsetY: number
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
        phase: (angle * 180) / Math.PI,
        offsetY: ring.y + jitter(seed * 3 + 7) * SCATTER_Y,
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

  const rotatorRef = useRef<HTMLDivElement>(null)
  const angleRef = useRef(0)
  const velocityRef = useRef(0) // deg/frame fling velocity, decays to idle
  const draggingRef = useRef(false)
  const pausedRef = useRef(false) // hover-to-read pause
  const lastXRef = useRef(0)
  const movedRef = useRef(0) // total px moved this press → drag-vs-click guard
  const dirRef = useRef(1) // last spin direction: idle drift follows it

  // Single rAF loop: apply velocity, decay it toward idle, write one CSS var.
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

    let raf = 0
    const tick = () => {
      if (!draggingRef.current) {
        const idle = reduce ? 0 : IDLE_DRIFT * dirRef.current
        // Fling velocity bleeds off toward the idle drift baseline.
        velocityRef.current = idle + (velocityRef.current - idle) * FLING_FRICTION
        if (!pausedRef.current) angleRef.current += velocityRef.current
      }
      rotatorRef.current?.style.setProperty("--storm-angle", `${angleRef.current}deg`)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true
    lastXRef.current = e.clientX
    movedRef.current = 0
    velocityRef.current = 0
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    const dx = e.clientX - lastXRef.current
    lastXRef.current = e.clientX
    movedRef.current += Math.abs(dx)
    // Capture lazily, only once the press becomes a real drag: capturing on
    // pointerdown retargets pointerup to the container, which swallows the
    // pill's click — so a plain press could never open the skill modal.
    if (movedRef.current > DRAG_CLICK_THRESHOLD && !e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    // Negative: near-side (out-of-page) pills track the cursor's direction.
    const delta = -dx * DRAG_SENSITIVITY
    angleRef.current += delta
    velocityRef.current = delta // becomes the fling velocity on release
    if (dx !== 0) dirRef.current = Math.sign(delta)
  }

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  // A press that moved past the threshold is a spin, not a selection.
  const handleSelect = (name: string) => {
    if (movedRef.current > DRAG_CLICK_THRESHOLD) return
    onSelect(name)
  }

  return (
    <div
      className="skill-storm relative mx-auto h-[38rem] w-full max-w-6xl cursor-grab select-none active:cursor-grabbing xl:h-[42rem] xl:max-w-7xl"
      role="group"
      aria-label="Interactive storm of skills — drag to spin"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* Central vortex glow + orbit guide-paths */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.05] blur-[80px]" />
        {RINGS.map((ring) => (
          <div
            key={ring.rx}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/[0.035]"
            style={{ width: ring.rx * 2, height: ring.rx * 2 * RING_SQUASH, marginTop: ring.y }}
          />
        ))}
      </div>

      {/* 3D scene: JS writes --storm-angle here each frame; every pill derives
          its own tilted-ring position from it via CSS trig. preserve-3d
          depth-sorts pills against each other AND the centre title (at z=0),
          so receding pills pass behind the title and approaching ones over it. */}
      <div ref={rotatorRef} className="skill-storm-3d">
        {/* Center label — literally: A Storm of Skills. translateZ(0) plants it
            mid-depth in the carousel so the orbit threads around it. */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 text-center"
          style={{ transform: "translate(-50%, -50%) translateZ(0px)" }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground/70">A Storm of</p>
          <p className="gradient-text bg-clip-text text-3xl font-bold tracking-tight xl:text-4xl">Skills</p>
          <p className="mt-2 text-[11px] text-muted-foreground/50">drag to spin · hover to pause · click to explore</p>
        </div>

        {pills.map((p) => (
          <div
            key={p.name}
            className="skill-orbit-item"
            style={
              {
                "--phase": `${p.phase}deg`,
                "--rx": p.ring.rx,
                "--rs": p.ring.scale,
                "--ry": `${p.offsetY}px`,
              } as React.CSSProperties
            }
          >
            <SkillPill name={p.name} onSelect={handleSelect} onHoverChange={(h) => (pausedRef.current = h)} />
          </div>
        ))}
      </div>
    </div>
  )
}

function SkillPill({
  name,
  onSelect,
  onHoverChange,
}: {
  name: string
  onSelect: (skill: string) => void
  onHoverChange: (hovering: boolean) => void
}) {
  const icon = getSkillIcon(name)
  return (
    <button
      type="button"
      aria-hidden="true"
      tabIndex={-1}
      onClick={() => onSelect(name)}
      onPointerEnter={() => onHoverChange(true)}
      onPointerLeave={() => onHoverChange(false)}
      className="skill-pill group/pill inline-flex origin-center items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-[color,border-color,box-shadow] duration-200 hover:border-primary/60 hover:text-foreground hover:shadow-[0_0_26px_-4px_hsl(var(--primary)/0.55)]"
    >
      {icon && <span className="opacity-70 transition-opacity group-hover/pill:opacity-100">{icon}</span>}
      {name}
    </button>
  )
}
