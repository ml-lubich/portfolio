"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  AGENTS_TRIGGER,
  flatBuildQueue,
  type BuildPiece,
} from "@/lib/agents-build"

type Spawn = BuildPiece & { born: number; delayMs: number }

const GAP_MS = 420
const LIFE_MS = 14_000

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable
}

function hashSeed(): number {
  return (Date.now() ^ (Math.random() * 0xffff_ffff)) >>> 0
}

function mkSpawns(seed: number): Spawn[] {
  return flatBuildQueue(seed).map((piece, i) => ({
    ...piece,
    born: Date.now(),
    delayMs: 280 + i * GAP_MS + (seed % 180),
  }))
}

function AgentCursor({ spawn, reduce }: { spawn: Spawn; reduce: boolean }) {
  const style = {
    left: `${spawn.x}%`,
    top: `${spawn.y}%`,
    animationDelay: reduce ? "0ms" : `${spawn.delayMs}ms`,
  } as const
  return (
    <div
      className="agents-egg-cursor pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
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
  const [spawns, setSpawns] = useState<Spawn[]>([])
  const buf = useRef("")

  const start = useCallback(() => {
    setSpawns(mkSpawns(hashSeed()))
    setActive(true)
  }, [])

  const stop = useCallback(() => {
    setActive(false)
    setSpawns([])
    buf.current = ""
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.location.hash.toLowerCase() === "#agents") start()
  }, [start])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && active) {
        stop()
        return
      }
      if (active || isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key.length !== 1) return
      buf.current = (buf.current + e.key.toLowerCase()).slice(-AGENTS_TRIGGER.length)
      if (buf.current === AGENTS_TRIGGER) start()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active, start, stop])

  useEffect(() => {
    if (!active) return
    const id = window.setTimeout(stop, LIFE_MS)
    return () => window.clearTimeout(id)
  }, [active, stop])

  return { active, spawns, stop }
}

export function AgentsBuildEgg() {
  const { active, spawns, stop } = useAgentsEgg()
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
      aria-label="Agents are building UI pieces across the page. Press Escape to dismiss."
    >
      <button
        type="button"
        className="pointer-events-auto absolute right-4 top-4 rounded-full border border-border bg-card/90 px-3 py-1.5 font-mono text-[11px] text-muted-foreground backdrop-blur-sm hover:text-foreground"
        onClick={stop}
      >
        Esc · dismiss agents
      </button>
      {spawns.map((s) => (
        <AgentCursor key={`${s.id}-${s.born}-${s.delayMs}`} spawn={s} reduce={reduce} />
      ))}
    </div>
  )
}
