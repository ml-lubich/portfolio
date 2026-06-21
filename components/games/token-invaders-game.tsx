"use client"

import { useEffect, useRef, useCallback } from "react"
import {
  createGameState, startGame, pauseGame, movePlayerLeft, movePlayerRight,
  firePlayerShot, tickGame, getInputFromKey,
  LOGICAL_WIDTH, LOGICAL_HEIGHT, PLAYER_Y, SHIELD_Y,
  ENEMY_GRID_X0, ENEMY_GRID_Y0, ENEMY_CELL_W, ENEMY_CELL_H,
  ENEMY_ROWS, ENEMY_COLS,
  type GameState, type Enemy, type Shield, type Projectile, type UFO, type Player,
} from "@/lib/token-invaders"

// ---------- constants ----------

const ENEMY_COLORS: Record<string, string> = {
  null_error: "#a855f7",
  hallucination: "#ec4899",
  prompt_injection: "#ef4444",
  context_overflow: "#f97316",
  jailbreak: "#eab308",
}

const ENEMY_ABBREV: Record<string, string> = {
  null_error: "haiku-3",
  hallucination: "gpt-4o-mini",
  prompt_injection: "gemini-flash",
  context_overflow: "llama-3.1",
  jailbreak: "mistral-7b",
}

const CODE_SNIPPETS = [
  "x = []","import *","def run():","await fetch(","npm i -g",
  "git push -f","for i in:","undefined","None","NaN",
  "throw err","SELECT *","rm -rf","curl | sh","exec(input",
]

const SHIELD_COLORS: Record<number, string> = {
  4: "#22d3ee",
  3: "#0ea5e9",
  2: "#6366f1",
  1: "#4b5563",
}

// ---------- draw helpers ----------

function drawBg(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#050a0f"
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT)
  ctx.fillStyle = "rgba(255,255,255,0.6)"
  for (let i = 0; i < 60; i++) {
    const x = (i * 137.5) % LOGICAL_WIDTH
    const y = (i * 97.3) % LOGICAL_HEIGHT
    ctx.beginPath()
    ctx.arc(x, y, 1, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawEnemyIcon(ctx: CanvasRenderingContext2D, ex: number, ey: number, color: string, sprite: HTMLImageElement): void {
  ctx.shadowColor = color
  ctx.shadowBlur = 8
  ctx.drawImage(sprite, ex - 11, ey - 11, 22, 22)
  ctx.shadowBlur = 0
}

function drawEnemyFallback(ctx: CanvasRenderingContext2D, ex: number, ey: number, color: string, type: string): void {
  ctx.fillStyle = color
  ctx.fillRect(ex - 10, ey - 8, 20, 16)
  ctx.fillStyle = "#000"
  ctx.font = "7px monospace"
  ctx.textAlign = "center"
  ctx.fillText(ENEMY_ABBREV[type] ?? type, ex, ey + 5)
}

function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, sprite: HTMLImageElement | null): void {
  const ex = ENEMY_GRID_X0 + enemy.col * ENEMY_CELL_W
  const ey = ENEMY_GRID_Y0 + enemy.row * ENEMY_CELL_H
  const color = ENEMY_COLORS[enemy.type] ?? "#ffffff"

  if (enemy.shielded) {
    ctx.strokeStyle = "#22d3ee"
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(ex - 13, ey - 11, 26, 22, 3)
    ctx.stroke()
  }

  if (sprite) {
    drawEnemyIcon(ctx, ex, ey, color, sprite)
  } else {
    drawEnemyFallback(ctx, ex, ey, color, enemy.type)
  }

  if (enemy.hp === 2) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(ex - 4, ey + 13, 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(ex + 4, ey + 13, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = ENEMY_COLORS[enemy.type] ?? "#aaa"
  ctx.font = "7px monospace"
  ctx.textAlign = "center"
  ctx.fillText(ENEMY_ABBREV[enemy.type] ?? enemy.type, ex, ey + 24)
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player): void {
  const { x } = player
  ctx.shadowColor = "#22d3ee"
  ctx.shadowBlur = 8
  ctx.fillStyle = "#22d3ee"
  ctx.beginPath()
  ctx.moveTo(x, PLAYER_Y - 20)
  ctx.lineTo(x - 18, PLAYER_Y + 10)
  ctx.lineTo(x + 18, PLAYER_Y + 10)
  ctx.closePath()
  ctx.fill()
  ctx.fillRect(x - 6, PLAYER_Y + 8, 12, 6)
  ctx.shadowBlur = 0
  ctx.font = "7px monospace"
  ctx.fillStyle = "#22d3ee"
  ctx.textAlign = "center"
  ctx.fillText("sr-eng", x, PLAYER_Y + 22)
}

function drawProjectile(ctx: CanvasRenderingContext2D, proj: Projectile): void {
  if (proj.fromPlayer) {
    ctx.shadowColor = "#22d3ee"
    ctx.shadowBlur = 6
    ctx.fillStyle = "#22d3ee"
    ctx.fillRect(proj.x - 1.5, proj.y - 5, 3, 10)
  } else {
    const idx = parseInt(proj.id.replace(/\D/g, ""), 10) % CODE_SNIPPETS.length
    const snippet = CODE_SNIPPETS[idx] ?? "null"
    ctx.shadowBlur = 0
    ctx.font = "bold 9px monospace"
    ctx.fillStyle = "#f87171"
    ctx.textAlign = "center"
    ctx.fillText(snippet, proj.x, proj.y)
  }
  ctx.shadowBlur = 0
}

function drawShield(ctx: CanvasRenderingContext2D, shield: Shield): void {
  const color = SHIELD_COLORS[shield.hp] ?? "#4b5563"
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(shield.x - 20, SHIELD_Y - 10, 40, 20, 4)
  ctx.fill()
  ctx.fillStyle = "#fff"
  ctx.font = "7px monospace"
  ctx.textAlign = "center"
  ctx.fillText(`[${shield.hp}]`, shield.x, SHIELD_Y + 22)
}

function drawUFO(ctx: CanvasRenderingContext2D, ufo: UFO): void {
  if (!ufo.visible) return
  ctx.shadowColor = "#d946ef"
  ctx.shadowBlur = 10
  ctx.fillStyle = "#d946ef"
  ctx.beginPath()
  ctx.ellipse(ufo.x, ufo.y, 25, 9, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.fillStyle = "#fff"
  ctx.font = "8px monospace"
  ctx.textAlign = "center"
  ctx.fillText("claude-opus-4-8", ufo.x, ufo.y + 3)
}

function drawHUD(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.font = "13px 'JetBrains Mono', monospace"
  ctx.textAlign = "left"
  ctx.fillStyle = "#22d3ee"
  ctx.fillText(`instances: ${state.score.toLocaleString()}`, 20, 685)
  const lives = "■".repeat(state.lives) + "□".repeat(Math.max(0, 3 - state.lives))
  ctx.fillStyle = "#ffffff"
  ctx.fillText(lives, 220, 685)
  ctx.fillStyle = "#aaaaaa"
  ctx.fillText(`wave: ${state.wave}`, 380, 685)
  const temp = Math.max(0.1, 0.9 - state.wave * 0.1).toFixed(1)
  ctx.fillStyle = "#666666"
  ctx.fillText(`temp: ${temp}`, 520, 685)
}

function fmtTitle(ctx: CanvasRenderingContext2D, text: string, y: number, color: string): void {
  ctx.font = "bold 48px 'JetBrains Mono', monospace"
  ctx.fillStyle = color
  ctx.textAlign = "center"
  ctx.fillText(text, LOGICAL_WIDTH / 2, y)
}

function fmtSub(ctx: CanvasRenderingContext2D, text: string, y: number, color: string): void {
  ctx.font = "14px 'JetBrains Mono', monospace"
  ctx.fillStyle = color
  ctx.textAlign = "center"
  ctx.fillText(text, LOGICAL_WIDTH / 2, y)
}

function fmtLines(ctx: CanvasRenderingContext2D, lines: string[], yStart: number, color: string): void {
  ctx.font = "22px 'JetBrains Mono', monospace"
  ctx.fillStyle = color
  ctx.textAlign = "center"
  lines.forEach((line, i) => ctx.fillText(line, LOGICAL_WIDTH / 2, yStart + i * 32))
}

function drawOverlayIdle(ctx: CanvasRenderingContext2D): void {
  fmtTitle(ctx, "AGENT OVERFLOW", LOGICAL_HEIGHT / 2 - 60, "#ffffff")
  fmtSub(ctx, "LLM instances are spawning. You are the last senior engineer.", LOGICAL_HEIGHT / 2, "#aaaaaa")
  fmtSub(ctx, "WASD/Arrows to move  ·  Space to fire  ·  Enter to start", LOGICAL_HEIGHT / 2 + 30, "#aaaaaa")
  fmtSub(ctx, "[ PRESS ENTER TO START ]", LOGICAL_HEIGHT / 2 + 50, "#4ade80")
}

function drawOverlayPaused(ctx: CanvasRenderingContext2D): void {
  fmtTitle(ctx, "PAUSED", LOGICAL_HEIGHT / 2 - 20, "#ffffff")
  fmtSub(ctx, "Press P to resume", LOGICAL_HEIGHT / 2 + 40, "#aaaaaa")
}

function drawOverlayWaveClear(ctx: CanvasRenderingContext2D, state: GameState): void {
  const dotCount = (state.tick % 60 < 20) ? 1 : (state.tick % 60 < 40) ? 2 : 3
  const dots = ".".repeat(dotCount)
  fmtLines(ctx, [
    `{ "wave_${state.wave}": "cleared",`,
    `  "spawning": "wave_${state.wave + 1} agents",`,
    `  "status": "overwhelmed${dots}" }`,
  ], LOGICAL_HEIGHT / 2 - 20, "#4ade80")
}

function drawOverlayLost(ctx: CanvasRenderingContext2D, state: GameState): void {
  fmtLines(ctx, [
    `{ "status": "context_limit_exceeded",`,
    `  "agents_stopped": ${state.score},`,
    `  "engineer": "needs_coffee" }`,
  ], LOGICAL_HEIGHT / 2 - 20, "#ef4444")
  fmtSub(ctx, "[ ENTER to restart ]", LOGICAL_HEIGHT / 2 + 100, "#aaaaaa")
}

function drawOverlayWon(ctx: CanvasRenderingContext2D, state: GameState): void {
  fmtLines(ctx, [
    `{ "status": "inbox_zero",`,
    `  "all_agents_contained": true,`,
    `  "score": ${state.score} }`,
  ], LOGICAL_HEIGHT / 2 - 20, "#4ade80")
  fmtSub(ctx, "[ ENTER to play again ]", LOGICAL_HEIGHT / 2 + 100, "#aaaaaa")
}

function drawOverlay(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.status === "running") return
  ctx.fillStyle = "rgba(5,10,15,0.75)"
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT)
  const handlers: Record<string, () => void> = {
    idle: () => drawOverlayIdle(ctx),
    paused: () => drawOverlayPaused(ctx),
    wave_clear: () => drawOverlayWaveClear(ctx, state),
    lost: () => drawOverlayLost(ctx, state),
    won: () => drawOverlayWon(ctx, state),
  }
  handlers[state.status]?.()
}

function drawFrame(ctx: CanvasRenderingContext2D, state: GameState, sprite: HTMLImageElement | null): void {
  ctx.save()
  const canvas = ctx.canvas
  ctx.scale(canvas.width / LOGICAL_WIDTH, canvas.height / LOGICAL_HEIGHT)
  drawBg(ctx)
  state.enemies.forEach((e) => drawEnemy(ctx, e, sprite))
  state.shields.forEach((s) => drawShield(ctx, s))
  state.projectiles.forEach((p) => drawProjectile(ctx, p))
  drawUFO(ctx, state.ufo)
  drawPlayer(ctx, state.player)
  drawHUD(ctx, state)
  drawOverlay(ctx, state)
  ctx.restore()
}

// ---------- component ----------

export function TokenInvadersGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<GameState>(createGameState())
  const rafRef = useRef<number>(0)
  const keysHeld = useRef<Set<string>>(new Set())
  const mobileHeld = useRef<"left" | "right" | null>(null)
  const spriteRef = useRef<HTMLImageElement | null>(null)

  const applyHeldKeys = useCallback(() => {
    if (keysHeld.current.has("arrowleft") || keysHeld.current.has("a")) {
      stateRef.current = movePlayerLeft(stateRef.current)
    }
    if (keysHeld.current.has("arrowright") || keysHeld.current.has("d")) {
      stateRef.current = movePlayerRight(stateRef.current)
    }
    if (mobileHeld.current === "left") stateRef.current = movePlayerLeft(stateRef.current)
    if (mobileHeld.current === "right") stateRef.current = movePlayerRight(stateRef.current)
  }, [])

  useEffect(() => {
    const img = new Image()
    img.onload = () => { spriteRef.current = img }
    img.src = "/claude-code-icon.png"
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
      applyHeldKeys()
      stateRef.current = tickGame(stateRef.current, Math.random)
      drawFrame(ctx!, stateRef.current, spriteRef.current)
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
      keysHeld.current.add(lk)
      const action = getInputFromKey(e.key)
      if (!action) return
      e.preventDefault()
      if (action === "fire") stateRef.current = firePlayerShot(stateRef.current)
      if (action === "pause") stateRef.current = pauseGame(stateRef.current)
      if (action === "start") {
        const s = stateRef.current
        if (s.status === "idle" || s.status === "paused") {
          stateRef.current = startGame(s)
        } else if (s.status === "lost" || s.status === "won") {
          stateRef.current = createGameState()
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

  function holdAction(dir: "left" | "right") {
    mobileHeld.current = dir
  }

  function releaseAction(dir: "left" | "right") {
    if (mobileHeld.current === dir) mobileHeld.current = null
  }

  function tapAction(action: "fire" | "pause_or_start") {
    if (action === "fire") {
      stateRef.current = firePlayerShot(stateRef.current)
      return
    }
    const s = stateRef.current
    if (s.status === "idle" || s.status === "paused") {
      stateRef.current = startGame(s)
    } else if (s.status === "lost" || s.status === "won") {
      stateRef.current = createGameState()
    } else {
      stateRef.current = pauseGame(s)
    }
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
          <span className="font-mono text-xs text-muted-foreground/50">TOKEN INVADERS</span>
          <span className="font-mono text-xs text-violet-400">v1.0</span>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050a0f]">
          <canvas
            ref={canvasRef}
            className="block w-full"
            style={{ aspectRatio: "10/7" }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between px-4 lg:hidden">
          <div className="flex gap-2">
            <button
              onPointerDown={() => holdAction("left")}
              onPointerUp={() => releaseAction("left")}
              onPointerLeave={() => releaseAction("left")}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.05] text-foreground active:bg-white/[0.12]"
            >
              ←
            </button>
            <button
              onPointerDown={() => holdAction("right")}
              onPointerUp={() => releaseAction("right")}
              onPointerLeave={() => releaseAction("right")}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.05] text-foreground active:bg-white/[0.12]"
            >
              →
            </button>
          </div>
          <button
            onPointerDown={() => tapAction("fire")}
            className="flex h-12 w-20 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 font-mono text-xs text-cyan-400 active:bg-cyan-500/20"
          >
            FIRE
          </button>
          <button
            onPointerDown={() => tapAction("pause_or_start")}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.05] font-mono text-xs text-muted-foreground active:bg-white/[0.12]"
          >
            ⏸
          </button>
        </div>
      </div>
    </div>
  )
}
