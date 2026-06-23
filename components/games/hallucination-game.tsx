"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import {
  createHDState,
  startHD,
  pauseHD,
  clickCard,
  tickHD,
  type HDState,
  type HDCard,
} from "@/lib/hallucination-detector"

function CardTile({ card, onClickCard }: { card: HDCard; onClickCard: (id: string) => void }) {
  const isActive = card.state === "active"
  const timerPct = (card.timeLeft / card.maxTime) * 100

  const borderCls = {
    active: "border-yellow-500/30 hover:border-yellow-400/60 cursor-pointer",
    correct: "border-green-500/50",
    wrong: "border-red-500/50",
    expired: "border-white/[0.05]",
  }[card.state]

  const bgCls = {
    active: "bg-yellow-500/5 hover:bg-yellow-500/10",
    correct: "bg-green-500/10",
    wrong: "bg-red-500/10",
    expired: "bg-white/[0.02] opacity-40",
  }[card.state]

  return (
    <div
      onClick={() => isActive && onClickCard(card.id)}
      className={`rounded-xl border p-3 transition-all duration-150 select-none ${borderCls} ${bgCls}`}
    >
      <p className="text-xs text-foreground/90 leading-relaxed mb-2 min-h-[3rem]">{card.text}</p>
      {isActive && (
        <div className="h-0.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full"
            style={{ width: `${timerPct}%`, transition: "width 0.1s linear" }}
          />
        </div>
      )}
      {card.state === "correct" && (
        <p className="text-[10px] text-green-400 font-mono mt-1">✓ HALLUCINATION DETECTED</p>
      )}
      {card.state === "wrong" && (
        <p className="text-[10px] text-red-400 font-mono mt-1">✗ THAT WAS REAL</p>
      )}
    </div>
  )
}

function EmptySlot() {
  return <div className="rounded-xl border border-white/[0.03] min-h-[6rem]" />
}

function IdleOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050a0f]/90 rounded-2xl z-10">
      <h2 className="font-mono text-2xl text-yellow-400 mb-3">HALLUCINATION DETECTOR</h2>
      <p className="text-sm text-muted-foreground mb-2 text-center max-w-xs">
        Facts flash on screen. Click the hallucinated ones before they corrupt your context.
      </p>
      <p className="text-xs text-muted-foreground/60 mb-6">
        Don&apos;t click real facts — that costs a life too.
      </p>
      <button
        onClick={onStart}
        className="font-mono text-sm border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 px-6 py-2 rounded-lg hover:bg-yellow-500/20 transition-colors"
      >
        [ START ]
      </button>
      <p className="text-[10px] text-muted-foreground/40 mt-3">or press Enter</p>
    </div>
  )
}

function EndOverlay({ won, score, onRestart }: { won: boolean; score: number; onRestart: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050a0f]/90 rounded-2xl z-10">
      <h2 className={`font-mono text-2xl mb-2 ${won ? "text-green-400" : "text-red-400"}`}>
        {won ? "CONTEXT CLEAN" : "CONTEXT CORRUPTED"}
      </h2>
      <p className="text-sm text-muted-foreground mb-1">
        {won ? "All waves survived." : "Hallucinations overwhelmed your context."}
      </p>
      <p className="font-mono text-yellow-400 text-lg mb-6">score: {score}</p>
      <button
        onClick={onRestart}
        className="font-mono text-sm border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 px-6 py-2 rounded-lg hover:bg-yellow-500/20 transition-colors"
      >
        [ PLAY AGAIN ]
      </button>
      <p className="text-[10px] text-muted-foreground/40 mt-3">or press Enter</p>
    </div>
  )
}

function PauseOverlay({ onResume }: { onResume: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050a0f]/80 rounded-2xl z-10">
      <p className="font-mono text-xl text-yellow-400 mb-4">PAUSED</p>
      <button
        onClick={onResume}
        className="font-mono text-sm border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 px-6 py-2 rounded-lg hover:bg-yellow-500/20 transition-colors"
      >
        [ RESUME ]
      </button>
      <p className="text-[10px] text-muted-foreground/40 mt-3">or press P</p>
    </div>
  )
}

export function HallucinationGame() {
  const stateRef = useRef<HDState>(createHDState())
  const rafRef = useRef<number | null>(null)
  const [tick, setTick] = useState(0)

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const loop = useCallback(() => {
    const next = tickHD(stateRef.current, Math.random)
    stateRef.current = next
    setTick(t => t + 1)
    if (next.status === "running") {
      rafRef.current = requestAnimationFrame(loop)
    }
  }, [])

  const startLoop = useCallback(() => {
    stopLoop()
    rafRef.current = requestAnimationFrame(loop)
  }, [loop, stopLoop])

  const handleStart = useCallback(() => {
    stateRef.current = startHD(stateRef.current)
    startLoop()
  }, [startLoop])

  const handlePause = useCallback(() => {
    stateRef.current = pauseHD(stateRef.current)
    const s = stateRef.current.status
    if (s === "running") startLoop()
    else stopLoop()
    setTick(t => t + 1)
  }, [startLoop, stopLoop])

  const handleClick = useCallback((id: string) => {
    stateRef.current = clickCard(stateRef.current, id)
    setTick(t => t + 1)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current.status
      if (e.key === "Enter") {
        if (s === "idle" || s === "lost" || s === "won") handleStart()
      }
      if (e.key === "p" || e.key === "P") {
        if (s === "running" || s === "paused") handlePause()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      stopLoop()
    }
  }, [handleStart, handlePause, stopLoop])

  const state = stateRef.current
  const slots = Array.from({ length: 12 }, (_, i) => state.cards.find(c => c.slot === i) ?? null)
  const showIdle = state.status === "idle"
  const showEnd = state.status === "lost" || state.status === "won"
  const showPause = state.status === "paused"

  return (
    <div className="min-h-screen bg-[#050a0f] flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-3xl mb-4 flex items-center justify-between px-1">
        <a
          href="/games"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Games
        </a>
        <span className="font-mono text-xs text-muted-foreground/50">HALLUCINATION DETECTOR</span>
        <span className="font-mono text-xs text-yellow-400">wave {state.wave}</span>
      </div>

      {/* HUD */}
      <div className="w-full max-w-3xl mb-4 flex items-center justify-between">
        <div className="font-mono text-xs text-muted-foreground">
          lives:{" "}
          {"🔍".repeat(Math.max(0, state.lives))}
          {"⚫".repeat(Math.max(0, 3 - state.lives))}
        </div>
        <div className="flex items-center gap-4">
          {state.status === "running" && (
            <button
              onClick={handlePause}
              className="font-mono text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              [P] pause
            </button>
          )}
          <div className="font-mono text-xs text-yellow-400">score: {state.score}</div>
        </div>
      </div>

      {/* Card grid */}
      <div className="relative w-full max-w-3xl">
        <div className="grid grid-cols-3 gap-3">
          {slots.map((card, i) =>
            card ? (
              <CardTile key={card.id} card={card} onClickCard={handleClick} />
            ) : (
              <EmptySlot key={i} />
            )
          )}
        </div>

        {showIdle && <IdleOverlay onStart={handleStart} />}
        {showEnd && (
          <EndOverlay
            won={state.status === "won"}
            score={state.score}
            onRestart={handleStart}
          />
        )}
        {showPause && <PauseOverlay onResume={handlePause} />}
      </div>

      {/* Wave progress */}
      {state.status === "running" && (
        <div className="w-full max-w-3xl mt-4 px-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-muted-foreground/50">wave progress</span>
            <span className="font-mono text-[10px] text-muted-foreground/50">
              {state.waveSpawned}/{state.waveTotal}
            </span>
          </div>
          <div className="h-px w-full bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400/30 rounded-full transition-all duration-300"
              style={{ width: `${state.waveTotal > 0 ? (state.waveSpawned / state.waveTotal) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
