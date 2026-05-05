"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react"
import {
  advanceSnakeGame,
  changeSnakeDirection,
  createSnakeGameState,
  getSnakeDirectionFromKey,
  setSnakeGameStatus,
  toSnakePointKey,
  type SnakeDirection,
  type SnakeGameState,
  type SnakeGameStatus,
} from "@/lib/snake-game"
import { cn } from "@/lib/utils"

type SnakeCellKind = "empty" | "head" | "body" | "food"

interface SnakeCell {
  key: string
  kind: SnakeCellKind
}

const SNAKE_STATUS_LABEL: Record<SnakeGameStatus, string> = {
  idle: "READY",
  running: "RUNNING",
  paused: "PAUSED",
  lost: "CRASHED",
  won: "CLEARED",
}

const SNAKE_STATUS_CLASS: Record<SnakeGameStatus, string> = {
  idle: "border-sky-400/30 text-sky-300/80 bg-sky-400/10",
  running: "border-emerald-400/30 text-emerald-300/80 bg-emerald-400/10",
  paused: "border-yellow-400/30 text-yellow-300/80 bg-yellow-400/10",
  lost: "border-rose-400/30 text-rose-300/80 bg-rose-400/10",
  won: "border-violet-400/30 text-violet-300/80 bg-violet-400/10",
}

const TICK_MS = 130

export function SnakeTerminal() {
  const [game, setGame] = useState<SnakeGameState>(() => createSnakeGameState())
  const [highScore, setHighScore] = useState(0)
  const boardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHighScore((currentHighScore) => Math.max(currentHighScore, game.score))
  }, [game.score])

  useEffect(() => {
    if (game.status !== "running") {
      return
    }

    const timer = window.setInterval(() => {
      setGame((currentGame) => advanceSnakeGame(currentGame))
    }, TICK_MS)

    return () => window.clearInterval(timer)
  }, [game.status])

  const focusBoard = useCallback(() => {
    window.requestAnimationFrame(() => boardRef.current?.focus())
  }, [])

  const resetGame = useCallback(() => {
    setGame(createSnakeGameState())
    focusBoard()
  }, [focusBoard])

  const toggleRunState = useCallback(() => {
    setGame((currentGame) => {
      if (currentGame.status === "lost" || currentGame.status === "won") {
        return setSnakeGameStatus(createSnakeGameState({ boardSize: currentGame.boardSize }), "running")
      }

      return setSnakeGameStatus(
        currentGame,
        currentGame.status === "running" ? "paused" : "running",
      )
    })
    focusBoard()
  }, [focusBoard])

  const steer = useCallback((direction: SnakeDirection) => {
    setGame((currentGame) => changeSnakeDirection(currentGame, direction))
    focusBoard()
  }, [focusBoard])

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const direction = getSnakeDirectionFromKey(event.key)
    if (direction !== null) {
      event.preventDefault()
      setGame((currentGame) => changeSnakeDirection(currentGame, direction))
      return
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault()
      toggleRunState()
      return
    }

    if (event.key.toLowerCase() === "r") {
      event.preventDefault()
      resetGame()
    }
  }, [resetGame, toggleRunState])

  const cells = useMemo(() => getSnakeCells(game), [game])
  const isRunning = game.status === "running"

  return (
    <div className="flex h-full flex-col gap-3 sm:flex-row sm:items-stretch">
      <div className="flex flex-1 items-center justify-center rounded-lg border border-white/[0.05] bg-black/20 p-2 sm:p-3">
        <div
          ref={boardRef}
          role="application"
          tabIndex={0}
          aria-label="Playable terminal snake game. Use arrow keys or W A S D to steer, space to pause or resume, and R to restart."
          onKeyDown={handleKeyDown}
          className="grid aspect-square w-full max-w-[252px] grid-cols-[repeat(16,minmax(0,1fr))] rounded-lg border border-white/[0.08] bg-[#080d10] p-1 shadow-inner shadow-black/60 outline-none ring-0 transition focus-visible:ring-2 focus-visible:ring-emerald-400/50 sm:max-w-[292px] md:max-w-[316px]"
        >
          {cells.map((cell) => (
            <span
              key={cell.key}
              aria-hidden="true"
              className={cn(
                "aspect-square rounded-[2px] border border-black/20 transition-colors",
                cell.kind === "empty" && "bg-white/[0.025]",
                cell.kind === "body" && "bg-emerald-500/70 shadow-[0_0_8px_rgba(16,185,129,0.18)]",
                cell.kind === "head" && "bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.45)]",
                cell.kind === "food" && "bg-rose-400 shadow-[0_0_14px_rgba(251,113,133,0.45)]",
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col justify-between gap-3 sm:w-52">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-1">
          <Metric label="SCORE" value={game.score.toString()} />
          <Metric label="BEST" value={highScore.toString()} />
          <div className={cn("rounded-md border px-2 py-2 font-mono text-[10px]", SNAKE_STATUS_CLASS[game.status])}>
            <span>{SNAKE_STATUS_LABEL[game.status]}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={toggleRunState}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-emerald-400/25 bg-emerald-400/10 px-2 text-xs font-medium text-emerald-200 transition hover:bg-emerald-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
          >
            {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={resetGame}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-white/[0.1] bg-white/[0.05] px-2 text-xs font-medium text-foreground/75 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5 self-center sm:self-stretch" aria-label="Snake direction controls">
          <span />
          <DirectionButton label="Turn up" direction="up" onSelect={steer}>
            <ArrowUp className="h-4 w-4" />
          </DirectionButton>
          <span />
          <DirectionButton label="Turn left" direction="left" onSelect={steer}>
            <ArrowLeft className="h-4 w-4" />
          </DirectionButton>
          <DirectionButton label="Turn down" direction="down" onSelect={steer}>
            <ArrowDown className="h-4 w-4" />
          </DirectionButton>
          <DirectionButton label="Turn right" direction="right" onSelect={steer}>
            <ArrowRight className="h-4 w-4" />
          </DirectionButton>
        </div>
      </div>
    </div>
  )
}

interface MetricProps {
  label: string
  value: string
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-white/[0.035] px-2 py-2 font-mono">
      <div className="text-[9px] text-muted-foreground/40">{label}</div>
      <div className="text-sm text-foreground/80">{value}</div>
    </div>
  )
}

interface DirectionButtonProps {
  label: string
  direction: SnakeDirection
  onSelect: (direction: SnakeDirection) => void
  children: ReactNode
}

function DirectionButton({ label, direction, onSelect, children }: DirectionButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={() => onSelect(direction)}
      className="flex h-10 w-10 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04] text-foreground/70 transition hover:border-cyan-300/25 hover:bg-cyan-300/10 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/35 sm:h-11 sm:w-full"
    >
      {children}
    </button>
  )
}

function getSnakeCells(game: SnakeGameState): SnakeCell[] {
  const snakeCells = new Map<string, SnakeCellKind>()
  game.snake.forEach((point, index) => {
    snakeCells.set(toSnakePointKey(point), index === 0 ? "head" : "body")
  })

  const cells: SnakeCell[] = []
  for (let row = 0; row < game.boardSize; row += 1) {
    for (let col = 0; col < game.boardSize; col += 1) {
      const key = `${row}:${col}`
      const snakeKind = snakeCells.get(key)
      const isFood = game.food !== null && game.food.row === row && game.food.col === col
      cells.push({ key, kind: snakeKind ?? (isFood ? "food" : "empty") })
    }
  }

  return cells
}
