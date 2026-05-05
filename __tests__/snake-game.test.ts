import { describe, expect, it } from "vitest"
import {
  advanceSnakeGame,
  changeSnakeDirection,
  createSnakeGameState,
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
