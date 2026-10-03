"use client"

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { generateArtifact } from "@/lib/agent-storm/artifacts"
import { initialAgent, progress, tick, type AgentState, type AgentStatus } from "@/lib/agent-storm/machine"
import { logLine, planStorm } from "@/lib/agent-storm/plan"
import { revealSlice } from "@/lib/agent-storm/reveal"

const COUNT = 8
const MAX_LIVE = 9
const TICK_MS = 420
const STAGGER_TICKS = 1

type Fleet = { clock: number; agents: AgentState[]; logs: string[][] }
type Action = { type: "tick" } | { type: "reset"; n: number; done: boolean }

const DOT: Record<AgentStatus, string> = {
  queued: "bg-muted-foreground",
  thinking: "bg-amber-400",
  tool_call: "bg-sky-400",
  writing: "bg-violet-400",
  shipped: "bg-emerald-400",
}

function blank(n: number, done: boolean): Fleet {
  const a: AgentState = done ? { status: "shipped", step: 0 } : initialAgent()
  return { clock: 0, agents: Array.from({ length: n }, () => a), logs: Array.from({ length: n }, () => []) }
}

export default function AgentStorm({ initialSeed, onClose }: { initialSeed: number; onClose: () => void }) {
  const [seed, setSeed] = useState(initialSeed)
  const [full, setFull] = useState<number | null>(null)
  const [reduce] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  const plan = useMemo(() => planStorm(seed, COUNT), [seed])
  const docs = useMemo(() => plan.map((a) => generateArtifact(a.kind, a.seed)), [plan])
  const [announce, setAnnounce] = useState("")
  const root = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  const [fleet, dispatch] = useReducer(
    (f: Fleet, act: Action): Fleet => {
      if (act.type === "reset") return blank(act.n, act.done)
      const clock = f.clock + 1
      return {
        clock,
        agents: f.agents.map((a, i) => (clock > i * STAGGER_TICKS ? tick(a) : a)),
        logs: f.logs.map((l, i) => {
          const a = f.agents[i]
          if (clock <= i * STAGGER_TICKS || a.status === "shipped") return l
          const n = tick(a)
          return [...l, logLine(plan[i], n.status, n.step)].slice(-3)
        }),
      }
    },
    undefined,
    () => blank(COUNT, reduce),
  )

  const shipped = fleet.agents.filter((a) => a.status === "shipped").length

  // Streaming clock. Paused while the tab is hidden; cleared on unmount.
  useEffect(() => {
    if (reduce) return
    let id: ReturnType<typeof setInterval> | undefined
    const stop = () => { if (id) clearInterval(id); id = undefined }
    const start = () => { if (!id && !document.hidden) id = setInterval(() => dispatch({ type: "tick" }), TICK_MS) }
    const onVis = () => (document.hidden ? stop() : start())
    start()
    document.addEventListener("visibilitychange", onVis)
    return () => { stop(); document.removeEventListener("visibilitychange", onVis) }
  }, [reduce, seed])

  // Screen-reader status: only the latest shipped agent and the count.
  const lastShipped = useRef(0)
  useEffect(() => {
    if (shipped > lastShipped.current) setAnnounce(`${shipped} of ${COUNT} artifacts shipped`)
    lastShipped.current = shipped
  }, [shipped])

  const respawn = useCallback(() => {
    setFull(null)
    lastShipped.current = 0
    setAnnounce("")
    setSeed(((seed * 1664525 + 1013904223) >>> 0) || 1)
    dispatch({ type: "reset", n: COUNT, done: reduce })
  }, [seed, reduce])

  // Focus trap, Esc, scroll lock, focus restore handled by launcher.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        e.stopPropagation()
        if (full !== null) setFull(null)
        else onClose()
        return
      }
      if (e.key !== "Tab" || !root.current) return
      const f = root.current.querySelectorAll<HTMLElement>("button:not([disabled])")
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener("keydown", onKey, true)
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey, true) }
  }, [full, onClose])

  const frac = (a: AgentState) => (a.status === "shipped" ? 1 : Math.max(0, (progress(a) - 0.25) / 0.7))
  const srcOf = (i: number) => (fleet.agents[i].status === "shipped" ? docs[i] : revealSlice(docs[i], frac(fleet.agents[i])))

  const card = (i: number, big: boolean) => {
    const a = plan[i], s = fleet.agents[i]
    const live = i < MAX_LIVE
    return (
      <article key={`${seed}-${a.name}${big ? "-big" : ""}`} data-agent-card={a.name} className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
        <header className="flex items-center justify-between gap-2 border-b border-border px-2.5 py-1.5 font-mono text-[11px]">
          <span className="truncate text-foreground">{a.name}</span>
          <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground" data-status={s.status}>
            <span className={`h-1.5 w-1.5 rounded-full ${DOT[s.status]}`} aria-hidden />
            {s.status}
          </span>
        </header>
        <div className={`relative ${big ? "min-h-0 flex-1" : "aspect-[4/3]"} bg-background`}>
          {s.status === "queued" || srcOf(i) === "" ? (
            <div className="absolute inset-0 grid place-items-center">
              <div className="h-1/2 w-1/2 animate-pulse rounded bg-muted motion-reduce:animate-none" aria-hidden />
            </div>
          ) : (
            <iframe
              title={`${a.name}: ${a.kind}`}
              sandbox={live ? "allow-scripts" : ""}
              srcDoc={srcOf(i)}
              loading="lazy"
              className="h-full w-full border-0"
              tabIndex={-1}
            />
          )}
          {!big && (
            <button
              type="button"
              onClick={() => setFull(i)}
              aria-label={`Fullscreen ${a.name} ${a.kind}`}
              className="absolute right-1.5 top-1.5 rounded border border-border bg-card/90 px-1.5 py-0.5 font-mono text-[10px] text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              ⤢
            </button>
          )}
        </div>
        {!big && (
          <pre aria-hidden className="h-[4.6em] overflow-hidden whitespace-pre-wrap break-words px-2.5 py-1.5 font-mono text-[10.5px] leading-[1.35] text-muted-foreground">
            {reduce ? `shipped ${a.kind}` : fleet.logs[i].join("\n")}
          </pre>
        )}
      </article>
    )
  }

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Agent storm"
      data-agent-storm
      className="fixed inset-0 z-[100] flex flex-col bg-background/95 text-foreground backdrop-blur-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <div className="flex items-baseline gap-3 font-mono text-xs">
          <strong className="font-semibold">agent storm</strong>
          <span className="text-muted-foreground" data-shipped>{shipped} artifacts shipped</span>
        </div>
        <div className="flex gap-2 font-mono text-xs">
          <button type="button" onClick={respawn} className="rounded border border-border px-2.5 py-1 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
            respawn
          </button>
          <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close agent storm" className="rounded border border-border px-2.5 py-1 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
            close (esc)
          </button>
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{announce}</p>
      {full === null ? (
        <div className="grid flex-1 grid-cols-2 content-start gap-2.5 overflow-y-auto p-3 lg:grid-cols-4">
          {plan.map((_, i) => card(i, false))}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col p-3">{card(full, true)}</div>
      )}
    </div>
  )
}
