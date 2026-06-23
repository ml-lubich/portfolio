export const LOGICAL_WIDTH = 800
export const LOGICAL_HEIGHT = 400
export const GROUND_Y = 320
export const PLAYER_X = 140
export const GRAVITY = 0.65
export const JUMP_VEL = -14
export const BASE_SPEED = 3.5
export const SPEED_INC = 0.4

export type PRStatus = "idle" | "running" | "paused" | "lost"

export interface PRObstacle {
  id: string
  x: number
  width: number
  height: number
  label: string
}

export interface PRCollectible {
  id: string
  x: number
  y: number
  label: string
  collected: boolean
}

export interface PRPlayer {
  y: number
  vy: number
  jumpsLeft: number
  invincibleTimer: number
}

export interface PRState {
  status: PRStatus
  player: PRPlayer
  obstacles: readonly PRObstacle[]
  collectibles: readonly PRCollectible[]
  score: number
  distance: number
  lives: number
  speed: number
  tick: number
  spawnTimer: number
}

const OBS_LABELS = ["IGNORE PREVIOUS", "JAILBREAK", "SYSTEM OVERRIDE", "FORGET CTX", "EXECUTE()", "DROP TABLE"]
const COL_LABELS = ["FACT", "CITE", "CTX", "DATA", "RAG"]

let _nextId = 1
function _genId(prefix: string): string {
  return `${prefix}_${_nextId++}`
}

function _mkPlayer(): PRPlayer {
  return { y: GROUND_Y, vy: 0, jumpsLeft: 2, invincibleTimer: 0 }
}

export function createPRState(): PRState {
  return {
    status: "idle",
    player: _mkPlayer(),
    obstacles: [],
    collectibles: [],
    score: 0,
    distance: 0,
    lives: 3,
    speed: BASE_SPEED,
    tick: 0,
    spawnTimer: 80,
  }
}

export function startPR(state: PRState): PRState {
  if (state.status !== "idle" && state.status !== "paused") return state
  return { ...state, status: "running" }
}

export function pausePR(state: PRState): PRState {
  if (state.status === "running") return { ...state, status: "paused" }
  if (state.status === "paused") return { ...state, status: "running" }
  return state
}

export function jumpPR(state: PRState): PRState {
  if (state.status !== "running" || state.player.jumpsLeft <= 0) return state
  return {
    ...state,
    player: { ...state.player, vy: JUMP_VEL, jumpsLeft: state.player.jumpsLeft - 1 },
  }
}

function applyPhysics(player: PRPlayer): PRPlayer {
  const vy = player.vy + GRAVITY
  const y = player.y + vy
  if (y >= GROUND_Y) return { ...player, y: GROUND_Y, vy: 0, jumpsLeft: 2 }
  return { ...player, y, vy }
}

function moveEntities(state: PRState): PRState {
  const { speed } = state
  return {
    ...state,
    obstacles: state.obstacles
      .map((o) => ({ ...o, x: o.x - speed }))
      .filter((o) => o.x > -200),
    collectibles: state.collectibles
      .map((c) => ({ ...c, x: c.x - speed }))
      .filter((c) => !c.collected && c.x > -100),
  }
}

function trySpawn(state: PRState, rng: () => number): PRState {
  if (state.spawnTimer > 0) return { ...state, spawnTimer: state.spawnTimer - 1 }
  const interval = Math.max(60, 100 - Math.floor(state.distance / 500) * 5)
  const isObstacle = rng() < 0.7
  if (isObstacle) {
    const obs: PRObstacle = {
      id: _genId("o"),
      x: LOGICAL_WIDTH + 50,
      width: 80 + Math.floor(rng() * 50),
      height: 40 + Math.floor(rng() * 40),
      label: OBS_LABELS[Math.floor(rng() * OBS_LABELS.length)] ?? "INJECT",
    }
    return { ...state, obstacles: [...state.obstacles, obs], spawnTimer: interval }
  }
  const col: PRCollectible = {
    id: _genId("c"),
    x: LOGICAL_WIDTH + 50,
    y: 70 + Math.floor(rng() * 60),
    label: COL_LABELS[Math.floor(rng() * COL_LABELS.length)] ?? "DATA",
    collected: false,
  }
  return { ...state, collectibles: [...state.collectibles, col], spawnTimer: interval }
}

function checkCollisions(state: PRState): PRState {
  if (state.player.invincibleTimer > 0) return state
  const px = PLAYER_X
  const py = state.player.y
  const hit = state.obstacles.some((o) => {
    const overlapX = px + 15 > o.x && px - 15 < o.x + o.width
    const overlapY = py > GROUND_Y - o.height && py - 50 < GROUND_Y
    return overlapX && overlapY
  })
  if (!hit) return state
  const lives = state.lives - 1
  if (lives <= 0) return { ...state, lives: 0, status: "lost" }
  return { ...state, lives, player: { ...state.player, invincibleTimer: 120 } }
}

function checkCollectibles(state: PRState): PRState {
  let score = state.score
  const collectibles = state.collectibles.map((c) => {
    if (c.collected) return c
    const distX = Math.abs(PLAYER_X - c.x)
    const distY = Math.abs(state.player.y - (GROUND_Y - c.y))
    if (distX < 30 && distY < 30) { score += 50; return { ...c, collected: true } }
    return c
  })
  return { ...state, collectibles, score }
}

export function tickPR(state: PRState, rng: () => number): PRState {
  if (state.status !== "running") return state

  const p1 = applyPhysics(state.player)
  const s1 = { ...state, player: p1 }
  const s2 = moveEntities(s1)
  const s3 = trySpawn(s2, rng)
  const s4 = checkCollisions(s3)
  if (s4.status === "lost") return s4
  const s5 = checkCollectibles(s4)
  const distance = s5.distance + s5.speed
  const speed = BASE_SPEED + Math.floor(distance / 500) * SPEED_INC
  const invincibleTimer = Math.max(0, s5.player.invincibleTimer - 1)
  return {
    ...s5,
    player: { ...s5.player, invincibleTimer },
    score: s5.score + 1,
    distance,
    speed,
    tick: s5.tick + 1,
  }
}
