export type EnemyType = "null_error" | "hallucination" | "prompt_injection" | "context_overflow" | "jailbreak"
export type GameStatus = "idle" | "running" | "paused" | "wave_clear" | "lost" | "won"
export type PlayerDir = "left" | "right" | "none"

export interface Enemy {
  id: string
  type: EnemyType
  row: number
  col: number
  hp: number
  shielded: boolean
  shieldCooldown: number
}

export interface Projectile {
  id: string
  x: number
  y: number
  fromPlayer: boolean
  vx: number
  vy: number
}

export interface Shield {
  id: string
  x: number
  y: number
  hp: number
}

export interface UFO {
  x: number
  y: number
  direction: 1 | -1
  visible: boolean
  spawnCooldown: number
}

export interface Player {
  x: number
  y: number
  shotCooldown: number
}

export interface GameState {
  status: GameStatus
  enemies: readonly Enemy[]
  projectiles: readonly Projectile[]
  shields: readonly Shield[]
  ufo: UFO
  player: Player
  score: number
  wave: number
  lives: number
  tick: number
  enemyDir: 1 | -1
  enemyMoveTimer: number
  waveTimer: number
}

export const LOGICAL_WIDTH = 1000
export const LOGICAL_HEIGHT = 700
export const ENEMY_ROWS = 5
export const ENEMY_COLS = 11
export const ENEMY_CELL_W = 56
export const ENEMY_CELL_H = 52
export const ENEMY_GRID_X0 = 140
export const ENEMY_GRID_Y0 = 90
export const PLAYER_Y = 640
export const SHIELD_Y = 560
export const SHOT_COOLDOWN = 24
export const UFO_SPEED = 3
export const UFO_SPAWN_MIN = 600
export const UFO_SPAWN_MAX = 1200
export const WAVE_CLEAR_TICKS = 120

export const ENEMY_POINTS: Record<EnemyType, number> = {
  null_error: 10,
  hallucination: 20,
  prompt_injection: 30,
  context_overflow: 40,
  jailbreak: 50,
}

export const ENEMY_HP: Record<EnemyType, number> = {
  null_error: 1,
  hallucination: 1,
  prompt_injection: 1,
  context_overflow: 2,
  jailbreak: 1,
}

export const ROW_TO_ENEMY_TYPE: Record<number, EnemyType> = {
  0: "null_error",
  1: "hallucination",
  2: "prompt_injection",
  3: "context_overflow",
  4: "jailbreak",
}

// --- private helpers ---

let _nextId = 1
function _genId(prefix: string): string {
  return `${prefix}_${_nextId++}`
}

function _mkEnemy(row: number, col: number): Enemy {
  const type = ROW_TO_ENEMY_TYPE[row] ?? "null_error"
  return {
    id: _genId("e"),
    type,
    row,
    col,
    hp: ENEMY_HP[type],
    shielded: false,
    shieldCooldown: 0,
  }
}

function _mkShield(x: number): Shield {
  return { id: _genId("s"), x, y: SHIELD_Y, hp: 4 }
}

function _mkUFO(random: () => number): UFO {
  return {
    x: -40,
    y: 40,
    direction: 1,
    visible: false,
    spawnCooldown: Math.floor(random() * (UFO_SPAWN_MAX - UFO_SPAWN_MIN) + UFO_SPAWN_MIN),
  }
}

function _mkInitialEnemies(): readonly Enemy[] {
  const enemies: Enemy[] = []
  for (let row = 0; row < ENEMY_ROWS; row++) {
    for (let col = 0; col < ENEMY_COLS; col++) {
      enemies.push(_mkEnemy(row, col))
    }
  }
  return enemies
}

function _mkInitialShields(): readonly Shield[] {
  const count = 4
  const spacing = LOGICAL_WIDTH / (count + 1)
  return Array.from({ length: count }, (_, i) => _mkShield(spacing * (i + 1)))
}

function _clampPlayer(x: number): number {
  return Math.max(30, Math.min(LOGICAL_WIDTH - 30, x))
}

function _tickCooldowns(state: GameState): GameState {
  return {
    ...state,
    player: { ...state.player, shotCooldown: Math.max(0, state.player.shotCooldown - 1) },
    ufo: { ...state.ufo, spawnCooldown: Math.max(0, state.ufo.spawnCooldown - 1) },
    enemies: state.enemies.map((e) =>
      e.shieldCooldown > 0
        ? { ...e, shieldCooldown: e.shieldCooldown - 1, shielded: e.shieldCooldown > 1 }
        : e,
    ),
  }
}

function _mvProj(p: Projectile): Projectile {
  return { ...p, x: p.x + p.vx, y: p.y + p.vy }
}

function _isInBounds(p: Projectile): boolean {
  return p.y >= 0 && p.y <= LOGICAL_HEIGHT && p.x >= 0 && p.x <= LOGICAL_WIDTH
}

function _moveProjectiles(state: GameState): GameState {
  return {
    ...state,
    projectiles: state.projectiles.map(_mvProj).filter(_isInBounds),
  }
}

function _calcMoveInterval(enemies: readonly Enemy[], wave: number): number {
  const jailbreakCount = enemies.filter((e) => e.type === "jailbreak").length
  const effectiveCount = enemies.length + jailbreakCount
  const base = Math.max(4, 55 - wave * 5 - (55 - effectiveCount))
  return enemies.length <= 5 ? 4 : base
}

function _enemyPixelX(col: number): number {
  return ENEMY_GRID_X0 + col * ENEMY_CELL_W
}

function _enemyPixelY(row: number): number {
  return ENEMY_GRID_Y0 + row * ENEMY_CELL_H
}

function _stepEnemyGrid(state: GameState): GameState {
  const interval = _calcMoveInterval(state.enemies, state.wave)
  if (state.enemyMoveTimer > 0) {
    return { ...state, enemyMoveTimer: state.enemyMoveTimer - 1 }
  }
  const maxCol = Math.max(...state.enemies.map((e) => e.col))
  const minCol = Math.min(...state.enemies.map((e) => e.col))
  const hitWall =
    (state.enemyDir === 1 && _enemyPixelX(maxCol) + ENEMY_CELL_W > LOGICAL_WIDTH - 40) ||
    (state.enemyDir === -1 && _enemyPixelX(minCol) < 40)
  const nextDir: 1 | -1 = hitWall ? (state.enemyDir === 1 ? -1 : 1) : state.enemyDir
  const rowShift = hitWall ? 1 : 0
  return {
    ...state,
    enemyDir: nextDir,
    enemyMoveTimer: interval,
    enemies: state.enemies.map((e) => ({ ...e, col: e.col + (hitWall ? 0 : nextDir), row: e.row + rowShift })),
  }
}

function _botEnemyPerCol(enemies: readonly Enemy[]): readonly Enemy[] {
  const colMap = new Map<number, Enemy>()
  for (const e of enemies) {
    const cur = colMap.get(e.col)
    if (!cur || e.row > cur.row) colMap.set(e.col, e)
  }
  return Array.from(colMap.values())
}

function _mkEnemyShot(e: Enemy, playerX: number): Projectile {
  const ex = _enemyPixelX(e.col)
  const ey = _enemyPixelY(e.row)
  const vx = Math.max(-2, Math.min(2, (playerX - ex) / 400))
  return { id: _genId("p"), x: ex, y: ey + 20, fromPlayer: false, vx, vy: 7 }
}

function _fireEnemyShots(state: GameState, random: () => number): GameState {
  if (state.tick % 45 !== 0) return state
  const candidates = _botEnemyPerCol(state.enemies)
  if (candidates.length === 0) return state
  const shooter = candidates[Math.floor(random() * candidates.length)]
  if (!shooter) return state
  return {
    ...state,
    projectiles: [...state.projectiles, _mkEnemyShot(shooter, state.player.x)],
  }
}

function _hitEnemy(state: GameState): GameState {
  const playerShots = state.projectiles.filter((p) => p.fromPlayer)
  const otherShots = state.projectiles.filter((p) => !p.fromPlayer)
  let score = state.score
  let remainingShots = [...playerShots]
  const updatedEnemies: Enemy[] = []

  for (const enemy of state.enemies) {
    const ex = _enemyPixelX(enemy.col)
    const ey = _enemyPixelY(enemy.row)
    const hit = remainingShots.findIndex((p) => Math.abs(p.x - ex) < 24 && Math.abs(p.y - ey) < 22)
    if (hit === -1) { updatedEnemies.push(enemy); continue }
    remainingShots = remainingShots.filter((_, i) => i !== hit)
    if (enemy.shielded) { updatedEnemies.push({ ...enemy, shielded: false, shieldCooldown: 0 }); continue }
    const nextHp = enemy.hp - 1
    if (nextHp > 0) { updatedEnemies.push({ ...enemy, hp: nextHp }); continue }
    score += ENEMY_POINTS[enemy.type]
  }

  return { ...state, enemies: updatedEnemies, score, projectiles: [...remainingShots, ...otherShots] }
}

function _hitShield(state: GameState): GameState {
  const enemyShots = state.projectiles.filter((p) => !p.fromPlayer)
  const playerShots = state.projectiles.filter((p) => p.fromPlayer)
  let remainingShots = [...enemyShots]
  const updatedShields: Shield[] = []

  for (const shield of state.shields) {
    const hit = remainingShots.findIndex(
      (p) => Math.sqrt((p.x - shield.x) ** 2 + (p.y - shield.y) ** 2) < 28,
    )
    if (hit === -1) { updatedShields.push(shield); continue }
    remainingShots = remainingShots.filter((_, i) => i !== hit)
    const nextHp = shield.hp - 1
    if (nextHp > 0) updatedShields.push({ ...shield, hp: nextHp })
  }

  return { ...state, shields: updatedShields, projectiles: [...playerShots, ...remainingShots] }
}

function _hitPlayer(state: GameState): GameState {
  const enemyShots = state.projectiles.filter((p) => !p.fromPlayer)
  const playerShots = state.projectiles.filter((p) => p.fromPlayer)
  const hit = enemyShots.findIndex(
    (p) => Math.abs(p.x - state.player.x) < 24 && Math.abs(p.y - PLAYER_Y) < 20,
  )
  if (hit === -1) return state
  const remaining = enemyShots.filter((_, i) => i !== hit)
  return {
    ...state,
    lives: state.lives - 1,
    player: { ...state.player, x: LOGICAL_WIDTH / 2, shotCooldown: SHOT_COOLDOWN },
    projectiles: [...playerShots, ...remaining],
  }
}

function _calcUFOPoints(tick: number): number {
  const tier = tick % 4
  const tiers: Record<number, number> = { 0: 50, 1: 100, 2: 150, 3: 200 }
  return tiers[tier] ?? 50
}

function _tickUFO(state: GameState, random: () => number): GameState {
  const { ufo, projectiles, score } = state

  if (ufo.visible) {
    const nextX = ufo.x + UFO_SPEED * ufo.direction
    const exited = nextX < -60 || nextX > LOGICAL_WIDTH + 60
    if (exited) {
      return { ...state, ufo: { ...ufo, visible: false, spawnCooldown: Math.floor(random() * (UFO_SPAWN_MAX - UFO_SPAWN_MIN) + UFO_SPAWN_MIN) } }
    }
    const hit = projectiles.findIndex((p) => p.fromPlayer && Math.abs(p.x - nextX) < 30 && Math.abs(p.y - ufo.y) < 20)
    if (hit !== -1) {
      return {
        ...state,
        score: score + _calcUFOPoints(state.tick),
        ufo: { ...ufo, visible: false, spawnCooldown: Math.floor(random() * (UFO_SPAWN_MAX - UFO_SPAWN_MIN) + UFO_SPAWN_MIN) },
        projectiles: projectiles.filter((_, i) => i !== hit),
      }
    }
    return { ...state, ufo: { ...ufo, x: nextX } }
  }

  if (ufo.spawnCooldown <= 0) {
    const dir: 1 | -1 = random() > 0.5 ? 1 : -1
    const startX = dir === 1 ? -40 : LOGICAL_WIDTH + 40
    return { ...state, ufo: { ...ufo, x: startX, direction: dir, visible: true } }
  }

  return state
}

function _chkWin(state: GameState): GameState {
  if (state.enemies.length > 0) return state
  const nextStatus: GameStatus = state.wave >= 5 ? "won" : "wave_clear"
  return { ...state, status: nextStatus, waveTimer: WAVE_CLEAR_TICKS }
}

function _chkLose(state: GameState): GameState {
  if (state.lives <= 0) return { ...state, status: "lost" }
  const invaded = state.enemies.some((e) => _enemyPixelY(e.row) >= PLAYER_Y - 20)
  return invaded ? { ...state, status: "lost" } : state
}

function _advWave(state: GameState): GameState {
  if (state.status !== "wave_clear") return state
  if (state.waveTimer > 0) return { ...state, waveTimer: state.waveTimer - 1 }
  return createGameState(state.wave + 1, state.score, state.lives)
}

// --- public API ---

export function createGameState(wave = 1, score = 0, lives = 3): GameState {
  return {
    status: "idle",
    enemies: _mkInitialEnemies(),
    projectiles: [],
    shields: _mkInitialShields(),
    ufo: _mkUFO(Math.random),
    player: { x: LOGICAL_WIDTH / 2, y: PLAYER_Y, shotCooldown: 0 },
    score,
    wave,
    lives,
    tick: 0,
    enemyDir: 1,
    enemyMoveTimer: 55,
    waveTimer: 0,
  }
}

export function startGame(state: GameState): GameState {
  if (state.status !== "idle" && state.status !== "paused") return state
  return { ...state, status: "running" }
}

export function pauseGame(state: GameState): GameState {
  if (state.status === "running") return { ...state, status: "paused" }
  if (state.status === "paused") return { ...state, status: "running" }
  return state
}

export function movePlayerLeft(state: GameState): GameState {
  if (state.status !== "running") return state
  return { ...state, player: { ...state.player, x: _clampPlayer(state.player.x - 8) } }
}

export function movePlayerRight(state: GameState): GameState {
  if (state.status !== "running") return state
  return { ...state, player: { ...state.player, x: _clampPlayer(state.player.x + 8) } }
}

export function firePlayerShot(state: GameState): GameState {
  if (state.status !== "running" || state.player.shotCooldown > 0) return state
  const shot: Projectile = {
    id: _genId("p"),
    x: state.player.x,
    y: PLAYER_Y - 20,
    fromPlayer: true,
    vx: 0,
    vy: -12,
  }
  return {
    ...state,
    projectiles: [...state.projectiles, shot],
    player: { ...state.player, shotCooldown: SHOT_COOLDOWN },
  }
}

export function tickGame(state: GameState, random: () => number): GameState {
  if (state.status !== "running") return _advWave(state)

  const s1 = _tickCooldowns(state)
  const s2 = _moveProjectiles(s1)
  const s3 = _stepEnemyGrid(s2)
  const s4 = _fireEnemyShots(s3, random)
  const s5 = _hitEnemy(s4)
  const s6 = _hitShield(s5)
  const s7 = _hitPlayer(s6)
  const s8 = _tickUFO(s7, random)
  const s9 = _chkWin(s8)
  const s10 = _chkLose(s9)
  return { ...s10, tick: s10.tick + 1 }
}

const KEY_MAP: Record<string, "left" | "right" | "fire" | "pause" | "start"> = {
  arrowleft: "left",
  a: "left",
  arrowright: "right",
  d: "right",
  " ": "fire",
  p: "pause",
  escape: "pause",
  enter: "start",
}

export function getInputFromKey(key: string): "left" | "right" | "fire" | "pause" | "start" | null {
  return KEY_MAP[key.toLowerCase()] ?? null
}
