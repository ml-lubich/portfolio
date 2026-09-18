"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  AGENTS_TRIGGER,
  AGENT_STORM_EVENT,
  STORM_TRIGGER,
  flatBuildQueue,
  stormQueue,
  type BuildPiece,
} from "@/lib/agents-build"

type Spawn = BuildPiece & { born: number; delayMs: number }
type Mode = "build" | "storm"

const GAP_MS = 420
const LIFE_MS = 14_000
/** Storm: agents land four times as fast and stay longer. */
const STORM_GAP_MS = 110
const STORM_LIFE_MS = 22_000

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable
}

function hashSeed(): number {
  return (Date.now() ^ (Math.random() * 0xffff_ffff)) >>> 0
}

function mkSpawns(seed: number, mode: Mode): Spawn[] {
  const queue = mode === "storm" ? stormQueue(seed) : flatBuildQueue(seed)
  const gap = mode === "storm" ? STORM_GAP_MS : GAP_MS
  return queue.map((piece, i) => ({
    ...piece,
    born: Date.now(),
    delayMs: 280 + i * gap + (seed % 180),
  }))
}

function AgentCursor({ spawn, reduce, storm }: { spawn: Spawn; reduce: boolean; storm: boolean }) {
  const style = {
    left: `${spawn.x}%`,
    top: `${spawn.y}%`,
    animationDelay: reduce ? "0ms" : `${spawn.delayMs}ms`,
    "--drift": `${(spawn.delayMs % 7) - 3}px`,
  } as React.CSSProperties
  return (
    <div
      className={`agents-egg-cursor pointer-events-none absolute -translate-x-1/2 -translate-y-1/2${storm ? " agents-egg-cursor--storm" : ""}`}
      style={style}
      data-agent={spawn.agent}
    >
      <span className="agents-egg-dot" aria-hidden />
      <span className="agents-egg-label font-mono text-[10px] tracking-wide text-primary">
        {spawn.agent}
      </span>
      <div className="agents-egg-piece mt-1 rounded-md border border-border bg-card/90 px-2.5 py-1.5 text-[11px] text-foreground shadow-lg backdrop-blur-sm">
        building {spawn.label}…
      </div>
    </div>
  )
}

function useAgentsEgg() {
  const [active, setActive] = useState(false)
  const [mode, setMode] = useState<Mode>("build")
  const [spawns, setSpawns] = useState<Spawn[]>([])
  const buf = useRef("")

  const start = useCallback((next: Mode = "build") => {
    setMode(next)
    setSpawns(mkSpawns(hashSeed(), next))
    setActive(true)
  }, [])

  const stop = useCallback(() => {
    setActive(false)
    setSpawns([])
    buf.current = ""
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const hash = window.location.hash.toLowerCase()
    if (hash === "#agents") start("build")
    if (hash === "#storm" || hash === "#agent-storm") start("storm")
  }, [start])

  // MLBot ("agent storm") and anything else on the page can summon the fleet.
  useEffect(() => {
    const onStorm = () => start("storm")
    window.addEventListener(AGENT_STORM_EVENT, onStorm)
    return () => window.removeEventListener(AGENT_STORM_EVENT, onStorm)
  }, [start])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && active) {
        stop()
        return
      }
      if (active || isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key.length !== 1) return
      const max = Math.max(AGENTS_TRIGGER.length, STORM_TRIGGER.length)
      buf.current = (buf.current + e.key.toLowerCase()).slice(-max)
      if (buf.current.endsWith(STORM_TRIGGER)) start("storm")
      else if (buf.current.endsWith(AGENTS_TRIGGER)) start("build")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active, start, stop])

  useEffect(() => {
    if (!active) return
    const id = window.setTimeout(stop, mode === "storm" ? STORM_LIFE_MS : LIFE_MS)
    return () => window.clearTimeout(id)
  }, [active, mode, stop])

  return { active, mode, spawns, stop }
}

export function AgentsBuildEgg() {
  const { active, mode, spawns, stop } = useAgentsEgg()
  const storm = mode === "storm"
  const [reduce, setReduce] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduce(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  if (!active) return null

  return (
    <div
      className="agents-egg-layer pointer-events-none fixed inset-0 z-[80] overflow-hidden"
      role="status"
      aria-live="polite"
      aria-label={storm ? "Agent storm: a fleet of agents is building across the page. Press Escape to dismiss." : "Agents are building UI pieces across the page. Press Escape to dismiss."}
      data-mode={mode}
    >
      {storm && (
        <div className="agents-egg-banner pointer-events-none absolute left-4 top-4 rounded-full border border-primary/40 bg-card/90 px-3 py-1.5 font-mono text-[11px] text-primary backdrop-blur-sm">
          ⚡ agent storm · {spawns.length} agents
        </div>
      )}
      <button
        type="button"
        className="pointer-events-auto absolute right-4 top-4 rounded-full border border-border bg-card/90 px-3 py-1.5 font-mono text-[11px] text-muted-foreground backdrop-blur-sm hover:text-foreground"
        onClick={stop}
      >
        Esc · dismiss agents
      </button>
      {spawns.map((s) => (
        <AgentCursor key={`${s.id}-${s.born}-${s.delayMs}`} spawn={s} reduce={reduce} storm={storm} />
      ))}
    </div>
  )
}
