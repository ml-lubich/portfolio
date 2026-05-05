export type SnakeDirection = "up" | "down" | "left" | "right"
export type SnakeGameStatus = "idle" | "running" | "paused" | "lost" | "won"

export interface SnakePoint {
  row: number
  col: number
}

export interface SnakeGameState {
  boardSize: number
  snake: readonly SnakePoint[]
  food: SnakePoint | null
  direction: SnakeDirection
  nextDirection: SnakeDirection
  status: SnakeGameStatus
  score: number
  tick: number
}

export interface CreateSnakeGameOptions {
  boardSize?: number
  food?: SnakePoint
}

export const SNAKE_BOARD_SIZE = 16
export const SNAKE_POINTS_PER_FOOD = 10

const MINIMUM_BOARD_SIZE = 6

export function createSnakeGameState(options: CreateSnakeGameOptions = {}): SnakeGameState {
  const boardSize = options.boardSize ?? SNAKE_BOARD_SIZE
  assertValidBoardSize(boardSize)

  const snake = createInitialSnake(boardSize)
  const food = options.food ?? placeSnakeFood(boardSize, snake, Math.random)

  if (!isPointInsideBoard(food, boardSize)) {
    throw new Error("Initial snake food must be inside the board.")
  }

  if (containsSnakePoint(snake, food)) {
    throw new Error("Initial snake food cannot overlap the snake.")
  }

  return {
    boardSize,
    snake,
    food,
    direction: "right",
    nextDirection: "right",
    status: "idle",
    score: 0,
    tick: 0,
  }
}

export function changeSnakeDirection(
  state: SnakeGameState,
  direction: SnakeDirection,
): SnakeGameState {
  if (state.status === "lost" || state.status === "won") {
    return state
  }

  if (isOppositeDirection(state.direction, direction)) {
    return state
  }

  return {
    ...state,
    nextDirection: direction,
    status: state.status === "idle" ? "running" : state.status,
  }
}

export function setSnakeGameStatus(
  state: SnakeGameState,
  status: SnakeGameStatus,
): SnakeGameState {
  if (state.status === "lost" || state.status === "won") {
    return state
  }

  return { ...state, status }
}

export function advanceSnakeGame(
  state: SnakeGameState,
  random: () => number = Math.random,
): SnakeGameState {
  if (state.status !== "running") {
    return state
  }

  const head = state.snake[0]
  if (!head) {
    throw new Error("Cannot advance a snake game without a snake body.")
  }

  const direction = state.nextDirection
  const nextHead = moveSnakeHead(head, direction)
  const willEat = state.food !== null && pointsEqual(nextHead, state.food)
  const collisionBody = willEat ? state.snake : state.snake.slice(0, -1)

  if (!isPointInsideBoard(nextHead, state.boardSize) || containsSnakePoint(collisionBody, nextHead)) {
    return {
      ...state,
      direction,
      nextDirection: direction,
      status: "lost",
      tick: state.tick + 1,
    }
  }

  const nextSnake = willEat
    ? [nextHead, ...state.snake]
    : [nextHead, ...state.snake.slice(0, -1)]

  if (nextSnake.length >= state.boardSize * state.boardSize) {
    return {
      ...state,
      snake: nextSnake,
      food: null,
      direction,
      nextDirection: direction,
      status: "won",
      score: state.score + SNAKE_POINTS_PER_FOOD,
      tick: state.tick + 1,
    }
  }

  return {
    ...state,
    snake: nextSnake,
    food: willEat ? placeSnakeFood(state.boardSize, nextSnake, random) : state.food,
    direction,
    nextDirection: direction,
    score: state.score + (willEat ? SNAKE_POINTS_PER_FOOD : 0),
    tick: state.tick + 1,
  }
}

export function getSnakeDirectionFromKey(key: string): SnakeDirection | null {
  switch (key.toLowerCase()) {
    case "arrowup":
    case "w":
      return "up"
    case "arrowdown":
    case "s":
      return "down"
    case "arrowleft":
    case "a":
      return "left"
    case "arrowright":
    case "d":
      return "right"
    default:
      return null
  }
}

export function toSnakePointKey(point: SnakePoint): string {
  return `${point.row}:${point.col}`
}

export function pointsEqual(left: SnakePoint, right: SnakePoint): boolean {
  return left.row === right.row && left.col === right.col
}

function createInitialSnake(boardSize: number): SnakePoint[] {
  const row = Math.floor(boardSize / 2)
  const headCol = Math.floor(boardSize / 2)

  return [
    { row, col: headCol },
    { row, col: headCol - 1 },
    { row, col: headCol - 2 },
  ]
}

function moveSnakeHead(head: SnakePoint, direction: SnakeDirection): SnakePoint {
  switch (direction) {
    case "up":
      return { row: head.row - 1, col: head.col }
    case "down":
      return { row: head.row + 1, col: head.col }
    case "left":
      return { row: head.row, col: head.col - 1 }
    case "right":
      return { row: head.row, col: head.col + 1 }
  }
}

function placeSnakeFood(
  boardSize: number,
  snake: readonly SnakePoint[],
  random: () => number,
): SnakePoint {
  const emptyCells: SnakePoint[] = []

  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < boardSize; col += 1) {
      const point = { row, col }
      if (!containsSnakePoint(snake, point)) {
        emptyCells.push(point)
      }
    }
  }

  if (emptyCells.length === 0) {
    throw new Error("Cannot place snake food on a full board.")
  }

  const randomIndex = Math.min(
    emptyCells.length - 1,
    Math.max(0, Math.floor(random() * emptyCells.length)),
  )
  const food = emptyCells[randomIndex]

  if (!food) {
    throw new Error("Failed to choose a snake food cell.")
  }

  return food
}

function isPointInsideBoard(point: SnakePoint, boardSize: number): boolean {
  return point.row >= 0 && point.row < boardSize && point.col >= 0 && point.col < boardSize
}

function containsSnakePoint(snake: readonly SnakePoint[], point: SnakePoint): boolean {
  return snake.some((segment) => pointsEqual(segment, point))
}

function isOppositeDirection(left: SnakeDirection, right: SnakeDirection): boolean {
  return (
    (left === "up" && right === "down")
    || (left === "down" && right === "up")
    || (left === "left" && right === "right")
    || (left === "right" && right === "left")
  )
}

function assertValidBoardSize(boardSize: number): void {
  if (!Number.isInteger(boardSize) || boardSize < MINIMUM_BOARD_SIZE) {
    throw new Error(`Snake board size must be an integer of at least ${MINIMUM_BOARD_SIZE}.`)
  }
}
