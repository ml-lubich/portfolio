import { describe, expect, it } from "vitest"
import {
  advanceSnakeGame,
  changeSnakeDirection,
  createSnakeGameState,
  getSnakeCells,
  getSnakeDirectionFromKey,
  type SnakeGameState,
} from "@/lib/snake-game"

describe("terminal snake game", () => {
  it("starts with food on the board and away from the snake", () => {
    const game = createSnakeGameState({ boardSize: 8, food: { row: 0, col: 0 } })

    expect(game.boardSize).toBe(8)
    expect(game.food).toEqual({ row: 0, col: 0 })
    expect(game.snake).not.toContainEqual(game.food)
    expect(game.status).toBe("idle")
  })

  it("maps laptop keyboard controls to directions", () => {
    expect(getSnakeDirectionFromKey("ArrowUp")).toBe("up")
    expect(getSnakeDirectionFromKey("w")).toBe("up")
    expect(getSnakeDirectionFromKey("A")).toBe("left")
    expect(getSnakeDirectionFromKey("Enter")).toBeNull()
  })

  it("ignores immediate reversals and starts on a valid turn", () => {
    const game = createSnakeGameState({ boardSize: 8, food: { row: 0, col: 0 } })

    const reversed = changeSnakeDirection(game, "left")
    expect(reversed).toBe(game)

    const turned = changeSnakeDirection(game, "up")
    expect(turned.status).toBe("running")
    expect(turned.nextDirection).toBe("up")
  })

  it("moves, eats food, grows, and increases score", () => {
    const game = createSnakeGameState({ boardSize: 8, food: { row: 4, col: 5 } })
    const running = changeSnakeDirection(game, "right")

    const advanced = advanceSnakeGame(running, () => 0)

    expect(advanced.status).toBe("running")
    expect(advanced.score).toBe(10)
    expect(advanced.snake).toHaveLength(game.snake.length + 1)
    expect(advanced.snake[0]).toEqual({ row: 4, col: 5 })
    expect(advanced.food).not.toEqual({ row: 4, col: 5 })
  })

  it("renders food cell at the correct grid position", () => {
    const game = createSnakeGameState({ boardSize: 6, food: { row: 0, col: 0 } })
    const cells = getSnakeCells(game)

    const foodCell = cells.find((c) => c.kind === "food")
    expect(foodCell).toBeDefined()
    expect(foodCell?.key).toBe("0:0")
  })

  it("renders exactly one food cell per game state", () => {
    const game = createSnakeGameState({ boardSize: 6, food: { row: 2, col: 4 } })
    const cells = getSnakeCells(game)

    expect(cells.filter((c) => c.kind === "food")).toHaveLength(1)
  })

  it("renders food at bottom-right corner", () => {
    const game = createSnakeGameState({ boardSize: 6, food: { row: 5, col: 5 } })
    const cells = getSnakeCells(game)

    const foodCell = cells.find((c) => c.kind === "food")
    expect(foodCell?.key).toBe("5:5")
  })

  it("renders food at new position after eating", () => {
    const game = createSnakeGameState({ boardSize: 8, food: { row: 4, col: 5 } })
    const running = changeSnakeDirection(game, "right")
    const advanced = advanceSnakeGame(running, () => 0)

    const cells = getSnakeCells(advanced)
    const foodCells = cells.filter((c) => c.kind === "food")
    expect(foodCells).toHaveLength(1)
    expect(foodCells[0]?.key).not.toBe("4:5")
  })

  it("produces exactly boardSize*boardSize cells", () => {
    const game = createSnakeGameState({ boardSize: 8, food: { row: 1, col: 1 } })
    const cells = getSnakeCells(game)

    expect(cells).toHaveLength(64)
  })

  it("cell keys are unique across the grid", () => {
    const game = createSnakeGameState({ boardSize: 6, food: { row: 0, col: 5 } })
    const cells = getSnakeCells(game)
    const keys = cells.map((c) => c.key)

    expect(new Set(keys).size).toBe(keys.length)
  })

  it("loses on wall collision", () => {
    const game: SnakeGameState = {
      boardSize: 6,
      snake: [
        { row: 0, col: 5 },
        { row: 0, col: 4 },
        { row: 0, col: 3 },
      ],
      food: { row: 5, col: 5 },
      direction: "right",
      nextDirection: "right",
      status: "running",
      score: 0,
      tick: 0,
    }

    const advanced = advanceSnakeGame(game)

    expect(advanced.status).toBe("lost")
    expect(advanced.tick).toBe(1)
  })
})
