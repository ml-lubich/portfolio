"use client"

import { useEffect, useRef, useCallback } from "react"
import {
  createTetrisState, startTetris, pauseTetris,
  moveTetrisLeft, moveTetrisRight, rotateTetris,
  softDropTetris, hardDropTetris, tickTetris,
  getCells, getGhostPiece,
  BOARD_COLS, BOARD_ROWS, PIECE_COLORS, PIECE_LABELS,
  type TetrisState, type FallingPiece,
} from "@/lib/context-tetris"

// ---------- canvas layout ----------

const CW = 420
const CH = 640
const CELL = 30
const PANEL_X = 300

// ---------- draw helpers ----------

function _drawCellFill(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  ctx.fillStyle = color
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2)
}

function _drawCellHighlights(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.fillStyle = "rgba(255,255,255,0.3)"
  ctx.fillRect(x + 1, y + 1, size - 2, 2)
  ctx.fillRect(x + 1, y + 1, 2, size - 2)
  ctx.fillStyle = "rgba(0,0,0,0.4)"
  ctx.fillRect(x + 1, y + size - 3, size - 2, 2)
  ctx.fillRect(x + size - 3, y + 1, 2, size - 2)
}

function drawCell(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  _drawCellFill(ctx, x, y, size, color)
  _drawCellHighlights(ctx, x, y, size)
}

function _drawBoardBg(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#050a0f"
  ctx.fillRect(0, 0, CW, CH)
}

function _drawGridLines(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = "rgba(255,255,255,0.03)"
  ctx.lineWidth = 0.5
  for (let c = 0; c <= BOARD_COLS; c++) {
    ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, BOARD_ROWS * CELL); ctx.stroke()
  }
  for (let r = 0; r <= BOARD_ROWS; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(BOARD_COLS * CELL, r * CELL); ctx.stroke()
  }
}

function _drawBoardCells(ctx: CanvasRenderingContext2D, board: readonly (readonly number[])[]): void {
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const v = board[r]?.[c] ?? 0
      if (v !== 0) drawCell(ctx, c * CELL, r * CELL, CELL, PIECE_COLORS[v] ?? "#fff")
    }
  }
}

function drawBoard(ctx: CanvasRenderingContext2D, board: readonly (readonly number[])[]): void {
  _drawBoardBg(ctx)
  _drawGridLines(ctx)
  _drawBoardCells(ctx, board)
}

function drawFallingPiece(ctx: CanvasRenderingContext2D, piece: FallingPiece, alpha: number): void {
  ctx.globalAlpha = alpha
  const color = PIECE_COLORS[piece.type] ?? "#fff"
  for (const [c, r] of getCells(piece)) {
    if (r >= 0) drawCell(ctx, c * CELL, r * CELL, CELL, color)
  }
  ctx.globalAlpha = 1
}

function drawGhost(ctx: CanvasRenderingContext2D, board: readonly (readonly number[])[], piece: FallingPiece): void {
  const ghost = getGhostPiece(board, piece)
  ctx.strokeStyle = "rgba(34,211,238,0.25)"
  ctx.lineWidth = 1
  for (const [c, r] of getCells(ghost)) {
    if (r >= 0) ctx.strokeRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2)
  }
}

function _drawNextLabel(ctx: CanvasRenderingContext2D): void {
  ctx.font = "9px 'JetBrains Mono', monospace"
  ctx.fillStyle = "rgba(255,255,255,0.4)"
  ctx.textAlign = "center"
  ctx.fillText("NEXT", PANEL_X + 60, 18)
}

function _drawNextCells(ctx: CanvasRenderingContext2D, next: number): void {
  const defs = [[[1,0],[2,0],[1,1],[2,1]],[[0,1],[1,1],[2,1],[3,1]]]
  const piece = { type: next as import("@/lib/context-tetris").PieceType, rotation: 0, px: 0, py: 0, lockTimer: 0 }
  const cells = getCells(piece)
  const color = PIECE_COLORS[next] ?? "#fff"
  const previewSize = 16
  const ox = PANEL_X + 22
  const oy = 24
  for (const [c, r] of cells) {
    ctx.fillStyle = color
    ctx.fillRect(ox + c * previewSize, oy + r * previewSize, previewSize - 1, previewSize - 1)
  }
}

function drawNextPreview(ctx: CanvasRenderingContext2D, next: number): void {
  _drawNextLabel(ctx)
  _drawNextCells(ctx, next)
}

function _drawHUDStats(ctx: CanvasRenderingContext2D, state: TetrisState): void {
  ctx.font = "9px 'JetBrains Mono', monospace"
  ctx.textAlign = "left"
  const labels: [string, string | number][] = [
    ["TOKENS", state.score.toLocaleString()],
    ["LINES", state.lines],
    ["LEVEL", state.level],
  ]
  labels.forEach(([label, value], i) => {
    const y = 110 + i * 36
    ctx.fillStyle = "rgba(255,255,255,0.3)"
    ctx.fillText(label, PANEL_X + 8, y)
    ctx.fillStyle = "#22d3ee"
    ctx.font = "13px 'JetBrains Mono', monospace"
    ctx.fillText(String(value), PANEL_X + 8, y + 16)
    ctx.font = "9px 'JetBrains Mono', monospace"
  })
}

function _drawCtxBar(ctx: CanvasRenderingContext2D, state: TetrisState): void {
  const filled = state.board.reduce((acc, row) => acc + row.filter((v) => v !== 0).length, 0)
  const total = BOARD_ROWS * BOARD_COLS
  const pct = filled / total
  const barH = CH - 340
  const barX = PANEL_X + 8
  const barY = 340
  const barW = CW - PANEL_X - 16

  ctx.font = "9px 'JetBrains Mono', monospace"
  ctx.fillStyle = "rgba(255,255,255,0.3)"
  ctx.textAlign = "left"
  ctx.fillText("CTX", barX, barY - 6)
  ctx.fillStyle = "rgba(255,255,255,0.06)"
  ctx.fillRect(barX, barY, barW, barH)

  const fillH = Math.round(barH * pct)
  const barColor = pct < 0.5 ? "#22c55e" : pct < 0.8 ? "#eab308" : "#ef4444"
  ctx.fillStyle = barColor
  ctx.fillRect(barX, barY + barH - fillH, barW, fillH)

  ctx.fillStyle = "rgba(255,255,255,0.4)"
  ctx.font = "8px 'JetBrains Mono', monospace"
  ctx.textAlign = "center"
  ctx.fillText(`${Math.round(pct * 100)}%`, barX + barW / 2, barY + barH + 12)
}

function drawHUD(ctx: CanvasRenderingContext2D, state: TetrisState): void {
  _drawHUDStats(ctx, state)
  _drawCtxBar(ctx, state)
}

function _drawPanelDivider(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = "rgba(255,255,255,0.06)"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PANEL_X, 0)
  ctx.lineTo(PANEL_X, CH)
  ctx.stroke()
}

function _drawOverlayIdle(ctx: CanvasRenderingContext2D): void {
  ctx.font = "bold 18px 'JetBrains Mono', monospace"
  ctx.fillStyle = "#ffffff"
  ctx.textAlign = "center"
  ctx.fillText("CONTEXT BUFFER EMPTY", CW / 2, CH / 2 - 60)
  const lines = ["← → Move  ↑ Rotate", "↓ Soft Drop  Space Hard Drop", "P Pause"]
  ctx.font = "11px 'JetBrains Mono', monospace"
  ctx.fillStyle = "rgba(255,255,255,0.4)"
  lines.forEach((l, i) => ctx.fillText(l, CW / 2, CH / 2 - 20 + i * 20))
  ctx.fillStyle = "#4ade80"
  ctx.font = "13px 'JetBrains Mono', monospace"
  ctx.fillText("[ ENTER to start ]", CW / 2, CH / 2 + 50)
}

function _drawOverlayPaused(ctx: CanvasRenderingContext2D): void {
  ctx.font = "bold 28px 'JetBrains Mono', monospace"
  ctx.fillStyle = "#ffffff"
  ctx.textAlign = "center"
  ctx.fillText("PAUSED", CW / 2, CH / 2 - 10)
  ctx.font = "11px 'JetBrains Mono', monospace"
  ctx.fillStyle = "rgba(255,255,255,0.4)"
  ctx.fillText("Press P to resume", CW / 2, CH / 2 + 20)
}

function _drawOverlayLost(ctx: CanvasRenderingContext2D, state: TetrisState): void {
  ctx.font = "bold 18px 'JetBrains Mono', monospace"
  ctx.fillStyle = "#ef4444"
  ctx.textAlign = "center"
  ctx.fillText("CONTEXT LIMIT EXCEEDED", CW / 2, CH / 2 - 30)
  ctx.font = "13px 'JetBrains Mono', monospace"
  ctx.fillStyle = "#22d3ee"
  ctx.fillText(`score: ${state.score.toLocaleString()}`, CW / 2, CH / 2 + 10)
  ctx.fillStyle = "rgba(255,255,255,0.4)"
  ctx.font = "11px 'JetBrains Mono', monospace"
  ctx.fillText("[ ENTER to restart ]", CW / 2, CH / 2 + 40)
}

function drawOverlay(ctx: CanvasRenderingContext2D, state: TetrisState): void {
  if (state.status === "running") return
  ctx.fillStyle = "rgba(5,10,15,0.82)"
  ctx.fillRect(0, 0, CW, CH)
  const handlers: Record<string, () => void> = {
    idle: () => _drawOverlayIdle(ctx),
    paused: () => _drawOverlayPaused(ctx),
    lost: () => _drawOverlayLost(ctx, state),
  }
  handlers[state.status]?.()
}

function drawFrame(ctx: CanvasRenderingContext2D, state: TetrisState): void {
  ctx.save()
  const canvas = ctx.canvas
  ctx.scale(canvas.width / CW, canvas.height / CH)
  drawBoard(ctx, state.board)
  if (state.status === "running" || state.status === "paused") {
    drawGhost(ctx, state.board, state.current)
    drawFallingPiece(ctx, state.current, 1)
  }
  _drawPanelDivider(ctx)
  drawNextPreview(ctx, state.next)
  drawHUD(ctx, state)
  drawOverlay(ctx, state)
  ctx.restore()
}

// ---------- component ----------

export function ContextTetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<TetrisState>(createTetrisState())
  const rafRef = useRef<number>(0)
  const keysHeld = useRef<Set<string>>(new Set())
  const mobileHeld = useRef<"left" | "right" | null>(null)
  const frameCounter = useRef<number>(0)

  const applyHeldKeys = useCallback(() => {
    if (frameCounter.current % 6 !== 0) return
    if (keysHeld.current.has("arrowleft") || keysHeld.current.has("a")) {
      stateRef.current = moveTetrisLeft(stateRef.current)
    }
    if (keysHeld.current.has("arrowright") || keysHeld.current.has("d")) {
      stateRef.current = moveTetrisRight(stateRef.current)
    }
    if (mobileHeld.current === "left") stateRef.current = moveTetrisLeft(stateRef.current)
    if (mobileHeld.current === "right") stateRef.current = moveTetrisRight(stateRef.current)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    function syncSize() {
      if (!canvas) return
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
    }
    syncSize()

    function loop() {
      frameCounter.current++
      applyHeldKeys()
      stateRef.current = tickTetris(stateRef.current, Math.random)
      drawFrame(ctx!, stateRef.current)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    const ro = new ResizeObserver(syncSize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [applyHeldKeys])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const lk = e.key.toLowerCase()
      const preventKeys = ["arrowleft","arrowright","arrowup","arrowdown"," "]
      if (preventKeys.includes(lk)) e.preventDefault()

      keysHeld.current.add(lk)

      if (lk === "arrowup")    stateRef.current = rotateTetris(stateRef.current)
      if (lk === "arrowdown")  stateRef.current = softDropTetris(stateRef.current)
      if (lk === " ")          stateRef.current = hardDropTetris(stateRef.current, Math.random)
      if (lk === "p")          stateRef.current = pauseTetris(stateRef.current)
      if (lk === "enter") {
        const s = stateRef.current
        if (s.status === "idle" || s.status === "paused") {
          stateRef.current = startTetris(s)
        } else if (s.status === "lost") {
          stateRef.current = createTetrisState()
        }
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      keysHeld.current.delete(e.key.toLowerCase())
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [])

  function holdMobile(dir: "left" | "right") { mobileHeld.current = dir }
  function releaseMobile(dir: "left" | "right") {
    if (mobileHeld.current === dir) mobileHeld.current = null
  }
  function tapRotate() { stateRef.current = rotateTetris(stateRef.current) }
  function tapDrop()   { stateRef.current = hardDropTetris(stateRef.current, Math.random) }
  function tapStart() {
    const s = stateRef.current
    if (s.status === "idle" || s.status === "paused") {
      stateRef.current = startTetris(s)
    } else if (s.status === "lost") {
      stateRef.current = createTetrisState()
    } else {
      stateRef.current = pauseTetris(s)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full px-4 py-8">
      <div className="w-full max-w-[480px]">
        <div className="mb-2 flex items-center justify-between px-1">
          <a
            href="/games"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Games
          </a>
          <span className="font-mono text-xs text-muted-foreground/50">CONTEXT TETRIS</span>
          <span className="font-mono text-xs text-violet-400">v1.0</span>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050a0f]">
          <canvas
            ref={canvasRef}
            className="block w-full"
            style={{ aspectRatio: "420/640" }}
          />
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2 px-1 lg:hidden">
          <button
            onPointerDown={() => holdMobile("left")}
            onPointerUp={() => releaseMobile("left")}
            onPointerLeave={() => releaseMobile("left")}
            className="flex h-12 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.05] text-foreground active:bg-white/[0.12]"
          >
            ←
          </button>
          <button
            onPointerDown={() => holdMobile("right")}
            onPointerUp={() => releaseMobile("right")}
            onPointerLeave={() => releaseMobile("right")}
            className="flex h-12 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.05] text-foreground active:bg-white/[0.12]"
          >
            →
          </button>
          <button
            onPointerDown={tapRotate}
            className="flex h-12 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 font-mono text-xs text-purple-400 active:bg-purple-500/20"
          >
            ROT
          </button>
          <button
            onPointerDown={tapDrop}
            className="flex h-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 font-mono text-xs text-cyan-400 active:bg-cyan-500/20"
          >
            DROP
          </button>
        </div>

        <div className="mt-2 flex justify-center lg:hidden">
          <button
            onPointerDown={tapStart}
            className="flex h-10 w-32 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.05] font-mono text-xs text-muted-foreground active:bg-white/[0.12]"
          >
            ⏸ PAUSE
          </button>
        </div>
      </div>
    </div>
  )
}
