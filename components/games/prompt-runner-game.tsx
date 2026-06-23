"use client"

import { useEffect, useRef } from "react"
import {
  createPRState, startPR, pausePR, jumpPR, tickPR,
  LOGICAL_WIDTH, LOGICAL_HEIGHT, GROUND_Y, PLAYER_X,
  type PRState, type PRObstacle, type PRCollectible, type PRPlayer,
} from "@/lib/prompt-runner"

// ---------- draw helpers ----------

function drawBg(ctx: CanvasRenderingContext2D, tick: number): void {
  ctx.fillStyle = "#050a0f"
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT)
  ctx.strokeStyle = "rgba(34,211,238,0.12)"
  ctx.lineWidth = 1
  for (let i = 1; i < 6; i++) {
    const y = GROUND_Y - i * 48
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(LOGICAL_WIDTH, y); ctx.stroke()
  }
  ctx.strokeStyle = "rgba(34,211,238,0.3)"
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(LOGICAL_WIDTH, GROUND_Y); ctx.stroke()
  ctx.fillStyle = "rgba(255,255,255,0.55)"
  for (let i = 0; i < 40; i++) {
    const sx = ((i * 173.5 + tick * 0.3) % (LOGICAL_WIDTH + 20)) - 10
    const sy = (i * 89.3) % (GROUND_Y - 20)
    ctx.beginPath(); ctx.arc(sx, sy, 1, 0, Math.PI * 2); ctx.fill()
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: PRPlayer, tick: number): void {
  if (player.invincibleTimer > 0 && tick % 2 === 1) return
  ctx.save()
  ctx.shadowColor = "#22d3ee"
  ctx.shadowBlur = 8
  ctx.fillStyle = "#22d3ee"
  ctx.fillRect(PLAYER_X - 10, player.y - 40, 20, 40)
  ctx.fillStyle = "#050a0f"
  ctx.font = "bold 11px monospace"
  ctx.textAlign = "center"
  ctx.fillText(">", PLAYER_X, player.y - 16)
  ctx.shadowBlur = 0
  ctx.fillStyle = "rgba(34,211,238,0.5)"
  ctx.font = "8px monospace"
  ctx.fillText("$ run", PLAYER_X, player.y + 12)
  ctx.restore()
}

function drawObstacle(ctx: CanvasRenderingContext2D, obs: PRObstacle): void {
  ctx.save()
  ctx.shadowColor = "#ef4444"
  ctx.shadowBlur = 6
  ctx.fillStyle = "#ef4444"
  ctx.fillRect(obs.x, GROUND_Y - obs.height, obs.width, obs.height)
  ctx.shadowBlur = 0
  ctx.fillStyle = "#ffffff"
  ctx.font = "10px monospace"
  ctx.textAlign = "center"
  const label = obs.label.length > 12 ? obs.label.slice(0, 11) + "…" : obs.label
  ctx.fillText(label, obs.x + obs.width / 2, GROUND_Y - obs.height / 2 + 4)
  ctx.restore()
}

function drawCollectible(ctx: CanvasRenderingContext2D, col: PRCollectible, tick: number): void {
  if (col.collected) return
  ctx.save()
  const bob = Math.sin(tick * 0.08 + col.x * 0.05) * 3
  const cy = GROUND_Y - col.y + bob
  ctx.shadowColor = "#22c55e"
  ctx.shadowBlur = 8
  ctx.fillStyle = "#22c55e"
  ctx.beginPath()
  ctx.roundRect(col.x - 18, cy - 10, 36, 20, 8)
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 9px monospace"
  ctx.textAlign = "center"
  ctx.fillText(col.label, col.x, cy + 4)
  ctx.restore()
}

function drawHUD(ctx: CanvasRenderingContext2D, state: PRState): void {
  ctx.save()
  ctx.font = "13px 'JetBrains Mono', monospace"
  ctx.fillStyle = "#22d3ee"
  ctx.textAlign = "left"
  ctx.fillText(`score: ${state.score}`, 16, 24)
  ctx.fillStyle = "#aaaaaa"
  ctx.textAlign = "center"
  ctx.fillText(`distance: ${Math.floor(state.distance)}m`, LOGICAL_WIDTH / 2, 24)
  const lives = "■".repeat(state.lives) + "□".repeat(Math.max(0, 3 - state.lives))
  ctx.fillStyle = "#ffffff"
  ctx.textAlign = "right"
  ctx.fillText(lives, LOGICAL_WIDTH - 16, 24)
  ctx.fillStyle = "#555555"
  ctx.font = "10px monospace"
  ctx.fillText(`speed: ${state.speed.toFixed(1)}`, LOGICAL_WIDTH - 16, LOGICAL_HEIGHT - 10)
  ctx.restore()
}

function drawOverlayIdle(ctx: CanvasRenderingContext2D): void {
  ctx.font = "bold 36px 'JetBrains Mono', monospace"
  ctx.fillStyle = "#ffffff"
  ctx.textAlign = "center"
  ctx.fillText("PROMPT STREAM ACTIVE", LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2 - 60)
  ctx.font = "13px 'JetBrains Mono', monospace"
  ctx.fillStyle = "#aaaaaa"
  ctx.fillText("Dodge injections. Collect grounding data. Survive.", LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2 - 18)
  ctx.fillText("SPACE/↑ = jump  ·  double jump available  ·  P = pause", LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2 + 12)
  ctx.fillStyle = "#4ade80"
  ctx.fillText("[ ENTER or SPACE to start ]", LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2 + 50)
}

function drawOverlayLost(ctx: CanvasRenderingContext2D, state: PRState): void {
  ctx.font = "bold 40px 'JetBrains Mono', monospace"
  ctx.fillStyle = "#ef4444"
  ctx.textAlign = "center"
  ctx.fillText("CONTEXT CORRUPTED", LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2 - 40)
  ctx.font = "14px 'JetBrains Mono', monospace"
  ctx.fillStyle = "#aaaaaa"
  ctx.fillText(`score: ${state.score}  ·  distance: ${Math.floor(state.distance)}m`, LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2 + 10)
  ctx.fillStyle = "#aaaaaa"
  ctx.fillText("[ ENTER to restart ]", LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2 + 50)
}

function drawOverlayPaused(ctx: CanvasRenderingContext2D): void {
  ctx.font = "bold 40px 'JetBrains Mono', monospace"
  ctx.fillStyle = "#ffffff"
  ctx.textAlign = "center"
  ctx.fillText("PAUSED", LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2 - 10)
  ctx.font = "14px 'JetBrains Mono', monospace"
  ctx.fillStyle = "#aaaaaa"
  ctx.fillText("Press P or SPACE to resume", LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2 + 36)
}

function drawOverlay(ctx: CanvasRenderingContext2D, state: PRState): void {
  if (state.status === "running") return
  ctx.fillStyle = "rgba(5,10,15,0.78)"
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT)
  const handlers: Record<string, () => void> = {
    idle: () => drawOverlayIdle(ctx),
    lost: () => drawOverlayLost(ctx, state),
    paused: () => drawOverlayPaused(ctx),
  }
  handlers[state.status]?.()
}

function drawFrame(ctx: CanvasRenderingContext2D, state: PRState): void {
  ctx.save()
  const canvas = ctx.canvas
  ctx.scale(canvas.width / LOGICAL_WIDTH, canvas.height / LOGICAL_HEIGHT)
  drawBg(ctx, state.tick)
  state.obstacles.forEach((o) => drawObstacle(ctx, o))
  state.collectibles.forEach((c) => drawCollectible(ctx, c, state.tick))
  drawPlayer(ctx, state.player, state.tick)
  drawHUD(ctx, state)
  drawOverlay(ctx, state)
  ctx.restore()
}

// ---------- component ----------

export function PromptRunnerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<PRState>(createPRState())
  const rafRef = useRef<number>(0)

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
      stateRef.current = tickPR(stateRef.current, Math.random)
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
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const s = stateRef.current
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault()
        if (s.status === "idle" || s.status === "paused") stateRef.current = startPR(s)
        else if (s.status === "running") stateRef.current = jumpPR(s)
        else if (s.status === "lost") stateRef.current = createPRState()
      }
      if (e.key === "Enter") {
        if (s.status === "idle" || s.status === "paused") stateRef.current = startPR(s)
        else if (s.status === "lost") stateRef.current = createPRState()
      }
      if (e.key.toLowerCase() === "p") stateRef.current = pausePR(s)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  function handleCanvasTap() {
    const s = stateRef.current
    if (s.status === "idle" || s.status === "paused") stateRef.current = startPR(s)
    else if (s.status === "running") stateRef.current = jumpPR(s)
    else if (s.status === "lost") stateRef.current = createPRState()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full px-4 py-8">
      <div className="w-full max-w-[900px]">
        <div className="mb-2 flex items-center justify-between px-1">
          <a
            href="/games"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Games
          </a>
          <span className="font-mono text-xs text-muted-foreground/50">PROMPT RUNNER</span>
          <span className="font-mono text-xs text-orange-400">v1.0</span>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050a0f]">
          <canvas
            ref={canvasRef}
            className="block w-full cursor-pointer"
            style={{ aspectRatio: "800/400" }}
            onClick={handleCanvasTap}
          />
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 lg:hidden">
          <button
            onPointerDown={handleCanvasTap}
            className="flex h-12 w-32 items-center justify-center rounded-xl border border-orange-500/30 bg-orange-500/10 font-mono text-xs text-orange-400 active:bg-orange-500/20"
          >
            JUMP ↑
          </button>
        </div>
      </div>
    </div>
  )
}
