import { describe, expect, it } from "vitest"
import {
  createGameState,
  startGame,
  pauseGame,
  movePlayerLeft,
  movePlayerRight,
  firePlayerShot,
  tickGame,
  getInputFromKey,
  ENEMY_ROWS,
  ENEMY_COLS,
  ENEMY_GRID_X0,
  ENEMY_GRID_Y0,
  ENEMY_CELL_W,
  ENEMY_CELL_H,
  LOGICAL_WIDTH,
  PLAYER_Y,
  SHOT_COOLDOWN,
  type Enemy,
  type Projectile,
} from "@/lib/token-invaders"

// --- helpers ---

function mkRunning() {
  return startGame(createGameState())
}

function mkRunningWithEnemiesCleared() {
  const s = startGame(createGameState())
  return { ...s, enemies: [] as readonly Enemy[] }
}

function enemyPixelX(col: number) {
  return ENEMY_GRID_X0 + col * ENEMY_CELL_W
}

function enemyPixelY(row: number) {
  return ENEMY_GRID_Y0 + row * ENEMY_CELL_H
}

// Deterministic randoms
const rnd0 = () => 0
const rnd5 = () => 0.5

// --- createGameState ---

describe("createGameState", () => {
  it("creates exactly ENEMY_ROWS * ENEMY_COLS enemies (55)", () => {
    expect(createGameState().enemies.length).toBe(ENEMY_ROWS * ENEMY_COLS)
  })

  it("creates exactly 4 shields", () => {
    expect(createGameState().shields.length).toBe(4)
  })

  it("player starts at LOGICAL_WIDTH / 2 x-position", () => {
    expect(createGameState().player.x).toBe(LOGICAL_WIDTH / 2)
  })

  it("initial status is 'idle'", () => {
    expect(createGameState().status).toBe("idle")
  })

  it("initial score is 0", () => {
    expect(createGameState().score).toBe(0)
  })

  it("initial lives is 3", () => {
    expect(createGameState().lives).toBe(3)
  })

  it("initial wave is 1", () => {
    expect(createGameState().wave).toBe(1)
  })

  it("accepts custom wave number", () => {
    expect(createGameState(3).wave).toBe(3)
  })

  it("accepts custom score", () => {
    expect(createGameState(1, 500).score).toBe(500)
  })

  it("accepts custom lives", () => {
    expect(createGameState(1, 0, 5).lives).toBe(5)
  })
})

// --- startGame ---

describe("startGame", () => {
  it("does nothing when status is 'running'", () => {
    const s = mkRunning()
    expect(startGame(s)).toBe(s)
  })

  it("does nothing when status is 'lost'", () => {
    const s = { ...mkRunning(), status: "lost" as const }
    expect(startGame(s)).toBe(s)
  })

  it("does nothing when status is 'won'", () => {
    const s = { ...mkRunning(), status: "won" as const }
    expect(startGame(s)).toBe(s)
  })

  it("changes status to 'running' when idle", () => {
    expect(startGame(createGameState()).status).toBe("running")
  })

  it("changes status to 'running' when paused", () => {
    const s = { ...mkRunning(), status: "paused" as const }
    expect(startGame(s).status).toBe("running")
  })
})

// --- pauseGame ---

describe("pauseGame", () => {
  it("does nothing when status is 'idle'", () => {
    const s = createGameState()
    expect(pauseGame(s)).toBe(s)
  })

  it("does nothing when status is 'lost'", () => {
    const s = { ...mkRunning(), status: "lost" as const }
    expect(pauseGame(s)).toBe(s)
  })

  it("toggles running → paused", () => {
    expect(pauseGame(mkRunning()).status).toBe("paused")
  })

  it("toggles paused → running", () => {
    const s = { ...mkRunning(), status: "paused" as const }
    expect(pauseGame(s).status).toBe("running")
  })
})

// --- movePlayerLeft ---

describe("movePlayerLeft", () => {
  it("does nothing when status is 'idle'", () => {
    const s = createGameState()
    expect(movePlayerLeft(s)).toBe(s)
  })

  it("decreases player.x by 8", () => {
    const s = mkRunning()
    expect(movePlayerLeft(s).player.x).toBe(s.player.x - 8)
  })

  it("clamps to minimum x (30)", () => {
    const s = { ...mkRunning(), player: { ...mkRunning().player, x: 31 } }
    expect(movePlayerLeft(s).player.x).toBe(30)
  })
})

// --- movePlayerRight ---

describe("movePlayerRight", () => {
  it("does nothing when status is 'idle'", () => {
    const s = createGameState()
    expect(movePlayerRight(s)).toBe(s)
  })

  it("increases player.x by 8", () => {
    const s = mkRunning()
    expect(movePlayerRight(s).player.x).toBe(s.player.x + 8)
  })

  it("clamps to maximum x (LOGICAL_WIDTH - 30)", () => {
    const s = { ...mkRunning(), player: { ...mkRunning().player, x: LOGICAL_WIDTH - 31 } }
    expect(movePlayerRight(s).player.x).toBe(LOGICAL_WIDTH - 30)
  })
})

// --- firePlayerShot ---

describe("firePlayerShot", () => {
  it("does nothing when status is 'idle'", () => {
    const s = createGameState()
    expect(firePlayerShot(s)).toBe(s)
  })

  it("does nothing when shotCooldown > 0", () => {
    const s = { ...mkRunning(), player: { ...mkRunning().player, shotCooldown: 5 } }
    expect(firePlayerShot(s).projectiles.length).toBe(0)
  })

  it("adds exactly one projectile", () => {
    expect(firePlayerShot(mkRunning()).projectiles.length).toBe(1)
  })

  it("new projectile has fromPlayer === true", () => {
    const [shot] = firePlayerShot(mkRunning()).projectiles
    expect(shot.fromPlayer).toBe(true)
  })

  it("new projectile has vy < 0 (moves upward)", () => {
    const [shot] = firePlayerShot(mkRunning()).projectiles
    expect(shot.vy).toBeLessThan(0)
  })

  it("sets player.shotCooldown to SHOT_COOLDOWN", () => {
    expect(firePlayerShot(mkRunning()).player.shotCooldown).toBe(SHOT_COOLDOWN)
  })

  it("does not fire again before cooldown expires", () => {
    const s1 = firePlayerShot(mkRunning())
    const s2 = firePlayerShot(s1)
    expect(s2.projectiles.length).toBe(1)
  })
})

// --- tickGame ---

describe("tickGame", () => {
  it("returns unchanged state when status is 'idle'", () => {
    const s = createGameState()
    expect(tickGame(s, rnd0)).toBe(s)
  })

  it("returns unchanged state when status is 'paused'", () => {
    const s = { ...mkRunning(), status: "paused" as const }
    expect(tickGame(s, rnd0)).toBe(s)
  })

  it("increments tick by 1", () => {
    const s = mkRunning()
    expect(tickGame(s, rnd0).tick).toBe(s.tick + 1)
  })

  it("advances projectile y-position by vy each tick", () => {
    const shot: Projectile = { id: "p_test", x: 500, y: 400, fromPlayer: true, vx: 0, vy: -12 }
    const s = { ...mkRunning(), projectiles: [shot] }
    const after = tickGame(s, rnd0)
    const moved = after.projectiles.find((p) => p.id === "p_test")
    expect(moved?.y).toBe(400 + (-12))
  })

  it("removes projectile that goes above y=0", () => {
    const shot: Projectile = { id: "p_top", x: 500, y: 5, fromPlayer: true, vx: 0, vy: -12 }
    const s = { ...mkRunning(), projectiles: [shot] }
    const after = tickGame(s, rnd0)
    expect(after.projectiles.find((p) => p.id === "p_top")).toBeUndefined()
  })

  it("reduces lives when enemy shot hits player hitbox", () => {
    const s = mkRunning()
    // Place an enemy shot directly on the player
    const hitShot: Projectile = {
      id: "p_enemy_hit",
      x: s.player.x,
      y: PLAYER_Y,
      fromPlayer: false,
      vx: 0,
      vy: 7,
    }
    const s2 = { ...s, projectiles: [hitShot] }
    expect(tickGame(s2, rnd0).lives).toBe(s.lives - 1)
  })

  it("enemy count decreases when player shot hits enemy", () => {
    const s = mkRunning()
    const targetEnemy = s.enemies[0]
    // Place a player shot on the first enemy's pixel position
    const hitShot: Projectile = {
      id: "p_player_hit",
      x: enemyPixelX(targetEnemy.col),
      y: enemyPixelY(targetEnemy.row),
      fromPlayer: true,
      vx: 0,
      vy: -12,
    }
    const s2 = { ...s, projectiles: [hitShot] }
    const after = tickGame(s2, rnd0)
    expect(after.enemies.length).toBeLessThan(s.enemies.length)
  })

  it("score increases when enemy is destroyed", () => {
    const s = mkRunning()
    // Target a row-0 enemy (null_error, hp=1, 10 points)
    const targetEnemy = s.enemies.find((e) => e.row === 0 && e.hp === 1)!
    const hitShot: Projectile = {
      id: "p_score",
      x: enemyPixelX(targetEnemy.col),
      y: enemyPixelY(targetEnemy.row),
      fromPlayer: true,
      vx: 0,
      vy: -12,
    }
    const s2 = { ...s, projectiles: [hitShot] }
    expect(tickGame(s2, rnd0).score).toBeGreaterThan(s.score)
  })

  it("context_overflow enemy survives first hit (hp 2)", () => {
    const s = mkRunning()
    // Row 3 = context_overflow, hp=2
    const targetEnemy = s.enemies.find((e) => e.row === 3)!
    const hitShot: Projectile = {
      id: "p_co",
      x: enemyPixelX(targetEnemy.col),
      y: enemyPixelY(targetEnemy.row),
      fromPlayer: true,
      vx: 0,
      vy: -12,
    }
    const s2 = { ...s, projectiles: [hitShot] }
    const after = tickGame(s2, rnd0)
    expect(after.enemies.find((e) => e.id === targetEnemy.id)).toBeDefined()
  })

  it("status becomes 'wave_clear' when all enemies are destroyed (wave < 5)", () => {
    const s = mkRunningWithEnemiesCleared()
    expect(tickGame(s, rnd0).status).toBe("wave_clear")
  })

  it("status becomes 'won' when all enemies destroyed on wave 5", () => {
    const s = { ...mkRunningWithEnemiesCleared(), wave: 5 }
    expect(tickGame(s, rnd0).status).toBe("won")
  })

  it("status becomes 'lost' when lives reach 0 after being hit", () => {
    const s = { ...mkRunning(), lives: 1 }
    const hitShot: Projectile = {
      id: "p_fatal",
      x: s.player.x,
      y: PLAYER_Y,
      fromPlayer: false,
      vx: 0,
      vy: 7,
    }
    const s2 = { ...s, projectiles: [hitShot] }
    expect(tickGame(s2, rnd0).status).toBe("lost")
  })
})

// --- getInputFromKey ---

describe("getInputFromKey", () => {
  it('"ArrowLeft" returns "left"', () => {
    expect(getInputFromKey("ArrowLeft")).toBe("left")
  })

  it('"a" returns "left"', () => {
    expect(getInputFromKey("a")).toBe("left")
  })

  it('"ArrowRight" returns "right"', () => {
    expect(getInputFromKey("ArrowRight")).toBe("right")
  })

  it('"d" returns "right"', () => {
    expect(getInputFromKey("d")).toBe("right")
  })

  it('" " (space) returns "fire"', () => {
    expect(getInputFromKey(" ")).toBe("fire")
  })

  it('"p" returns "pause"', () => {
    expect(getInputFromKey("p")).toBe("pause")
  })

  it('"Escape" returns "pause"', () => {
    expect(getInputFromKey("Escape")).toBe("pause")
  })

  it('"Enter" returns "start"', () => {
    expect(getInputFromKey("Enter")).toBe("start")
  })

  it('"q" returns null', () => {
    expect(getInputFromKey("q")).toBeNull()
  })

  it('"x" returns null', () => {
    expect(getInputFromKey("x")).toBeNull()
  })
})
