export type TetrisStatus = "idle" | "running" | "paused" | "lost"
export type PieceType = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface FallingPiece {
  type: PieceType
  rotation: number
  px: number
  py: number
  lockTimer: number
}

export interface TetrisState {
  status: TetrisStatus
  board: readonly (readonly number[])[]
  current: FallingPiece
  next: PieceType
  score: number
  lines: number
  level: number
  tick: number
  gravityTimer: number
}

export const BOARD_COLS = 10
export const BOARD_ROWS = 20

export const PIECE_COLORS: Record<number, string> = {
  1: "#22d3ee",
  2: "#eab308",
  3: "#a855f7",
  4: "#22c55e",
  5: "#ef4444",
  6: "#3b82f6",
  7: "#f97316",
}

export const PIECE_LABELS: Record<number, string> = {
  1: "CTX", 2: "EMB", 3: "ATT", 4: "SFX", 5: "DRP", 6: "TFR", 7: "TKN",
}

// [col, row] offsets; index 0 = piece type 1
export const PIECE_CELLS: readonly (readonly (readonly [number, number][])[])[] = [
  // 1: I (4×4 box)
  [
    [[0,1],[1,1],[2,1],[3,1]],
    [[2,0],[2,1],[2,2],[2,3]],
    [[0,2],[1,2],[2,2],[3,2]],
    [[1,0],[1,1],[1,2],[1,3]],
  ],
  // 2: O
  [
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
  ],
  // 3: T
  [
    [[1,0],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[2,1],[1,2]],
    [[0,1],[1,1],[2,1],[1,2]],
    [[1,0],[0,1],[1,1],[1,2]],
  ],
  // 4: S
  [
    [[1,0],[2,0],[0,1],[1,1]],
    [[1,0],[1,1],[2,1],[2,2]],
    [[1,1],[2,1],[0,2],[1,2]],
    [[0,0],[0,1],[1,1],[1,2]],
  ],
  // 5: Z
  [
    [[0,0],[1,0],[1,1],[2,1]],
    [[2,0],[1,1],[2,1],[1,2]],
    [[0,1],[1,1],[1,2],[2,2]],
    [[1,0],[0,1],[1,1],[0,2]],
  ],
  // 6: J
  [
    [[0,0],[0,1],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[1,2]],
    [[0,1],[1,1],[2,1],[2,2]],
    [[1,0],[1,1],[0,2],[1,2]],
  ],
  // 7: L
  [
    [[2,0],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[1,2],[2,2]],
    [[0,1],[1,1],[2,1],[0,2]],
    [[0,0],[1,0],[1,1],[1,2]],
  ],
]

const GRAVITY = [48,43,38,33,28,23,18,13,8,6,5,5,5,4,4,4,3,3,3,2,2,2,2,2,2,2,2,2,2,1]
const LINE_SCORES = [0, 100, 300, 500, 800]
const LOCK_DELAY = 30
const SPAWN_PX = 3
const SPAWN_PY = -1

function _emptyBoard(): readonly (readonly number[])[] {
  return Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(0))
}

function _gravityFor(level: number): number {
  return GRAVITY[Math.min(level, GRAVITY.length - 1)] ?? 1
}

function _randPiece(rng: () => number): PieceType {
  return (Math.floor(rng() * 7) + 1) as PieceType
}

export function getCells(piece: FallingPiece): [number, number][] {
  const defs = PIECE_CELLS[piece.type - 1]
  if (!defs) return []
  const rot = defs[piece.rotation % defs.length]
  if (!rot) return []
  return rot.map(([dc, dr]) => [piece.px + dc, piece.py + dr])
}

function _isValid(board: readonly (readonly number[])[], piece: FallingPiece): boolean {
  for (const [c, r] of getCells(piece)) {
    if (c < 0 || c >= BOARD_COLS) return false
    if (r >= BOARD_ROWS) return false
    if (r < 0) continue
    if ((board[r]?.[c] ?? 0) !== 0) return false
  }
  return true
}

export function getGhostPiece(board: readonly (readonly number[])[], piece: FallingPiece): FallingPiece {
  let ghost = { ...piece }
  while (_isValid(board, { ...ghost, py: ghost.py + 1 })) {
    ghost = { ...ghost, py: ghost.py + 1 }
  }
  return ghost
}

function _lockPiece(board: readonly (readonly number[])[], piece: FallingPiece): readonly (readonly number[])[] {
  const next = board.map((row) => [...row])
  for (const [c, r] of getCells(piece)) {
    if (r >= 0 && r < BOARD_ROWS) {
      const row = next[r]
      if (row) row[c] = piece.type
    }
  }
  return next
}

function _clearLines(board: readonly (readonly number[])[]): { board: readonly (readonly number[])[]; cleared: number } {
  const kept = board.filter((row) => row.some((v) => v === 0))
  const cleared = BOARD_ROWS - kept.length
  const empty = Array.from({ length: cleared }, () => Array(BOARD_COLS).fill(0))
  return { board: [...empty, ...kept], cleared }
}

function _mkPiece(type: PieceType): FallingPiece {
  return { type, rotation: 0, px: SPAWN_PX, py: SPAWN_PY, lockTimer: 0 }
}

function _lockAndSpawn(state: TetrisState, rng: () => number): TetrisState {
  const locked = _lockPiece(state.board, state.current)
  const { board, cleared } = _clearLines(locked)
  const scoreAdd = (LINE_SCORES[cleared] ?? 0) * (state.level + 1)
  const newLines = state.lines + cleared
  const newLevel = Math.floor(newLines / 10)
  const nextPiece = _mkPiece(state.next)
  const newNext = _randPiece(rng)
  const lost = !_isValid(board, nextPiece)
  return {
    ...state,
    board,
    current: nextPiece,
    next: newNext,
    score: state.score + scoreAdd,
    lines: newLines,
    level: newLevel,
    gravityTimer: _gravityFor(newLevel),
    status: lost ? "lost" : state.status,
  }
}

export function createTetrisState(rng: () => number = Math.random): TetrisState {
  return {
    status: "idle",
    board: _emptyBoard(),
    current: _mkPiece(_randPiece(rng)),
    next: _randPiece(rng),
    score: 0,
    lines: 0,
    level: 0,
    tick: 0,
    gravityTimer: GRAVITY[0] ?? 48,
  }
}

export function startTetris(state: TetrisState): TetrisState {
  if (state.status !== "idle" && state.status !== "paused") return state
  return { ...state, status: "running" }
}

export function pauseTetris(state: TetrisState): TetrisState {
  if (state.status === "running") return { ...state, status: "paused" }
  if (state.status === "paused") return { ...state, status: "running" }
  return state
}

function _tryMove(state: TetrisState, next: FallingPiece): TetrisState {
  if (!_isValid(state.board, next)) return state
  return { ...state, current: { ...next, lockTimer: 0 } }
}

export function moveTetrisLeft(state: TetrisState): TetrisState {
  if (state.status !== "running") return state
  return _tryMove(state, { ...state.current, px: state.current.px - 1 })
}

export function moveTetrisRight(state: TetrisState): TetrisState {
  if (state.status !== "running") return state
  return _tryMove(state, { ...state.current, px: state.current.px + 1 })
}

export function rotateTetris(state: TetrisState): TetrisState {
  if (state.status !== "running") return state
  const defs = PIECE_CELLS[state.current.type - 1]
  if (!defs) return state
  const nextRot = (state.current.rotation + 1) % defs.length
  const rotated = { ...state.current, rotation: nextRot }
  for (const dx of [0, -1, 1, -2, 2]) {
    const kicked = { ...rotated, px: rotated.px + dx }
    if (_isValid(state.board, kicked)) {
      return { ...state, current: { ...kicked, lockTimer: 0 } }
    }
  }
  return state
}

export function softDropTetris(state: TetrisState): TetrisState {
  if (state.status !== "running") return state
  const moved = { ...state.current, py: state.current.py + 1 }
  if (!_isValid(state.board, moved)) return state
  return { ...state, current: { ...moved, lockTimer: 0 }, score: state.score + 1 }
}

export function hardDropTetris(state: TetrisState, rng: () => number): TetrisState {
  if (state.status !== "running") return state
  const ghost = getGhostPiece(state.board, state.current)
  const dropped = ghost.py - state.current.py
  const withDrop = { ...state, current: ghost, score: state.score + dropped * 2 }
  return _lockAndSpawn(withDrop, rng)
}

function _tickGravity(state: TetrisState, rng: () => number): TetrisState {
  if (state.gravityTimer > 1) return { ...state, gravityTimer: state.gravityTimer - 1 }
  const moved = { ...state.current, py: state.current.py + 1 }
  if (_isValid(state.board, moved)) {
    return { ...state, current: moved, gravityTimer: _gravityFor(state.level) }
  }
  return { ...state, gravityTimer: _gravityFor(state.level) }
}

function _tickLock(state: TetrisState, rng: () => number): TetrisState {
  const onGround = !_isValid(state.board, { ...state.current, py: state.current.py + 1 })
  if (!onGround) return { ...state, current: { ...state.current, lockTimer: 0 } }
  const nextTimer = state.current.lockTimer + 1
  if (nextTimer < LOCK_DELAY) return { ...state, current: { ...state.current, lockTimer: nextTimer } }
  return _lockAndSpawn(state, rng)
}

export function tickTetris(state: TetrisState, rng: () => number): TetrisState {
  if (state.status !== "running") return state
  const s1 = _tickGravity(state, rng)
  const s2 = _tickLock(s1, rng)
  return { ...s2, tick: s2.tick + 1 }
}
