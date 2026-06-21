import { describe, it, expect } from "vitest"
import {
  createVfs,
  cwdString,
  listDir,
  mkdirNode,
  removeNode,
  getNode,
} from "@/lib/virtual-fs"
import { createShellState, runCommand } from "@/lib/shell-interpreter"

describe("virtual-fs", () => {
  it("createVfs() initial cwd is ['home', 'misha']", () => {
    const vfs = createVfs()
    expect(vfs.cwd).toEqual(["home", "misha"])
  })

  it("cwdString returns '~' for /home/misha", () => {
    const vfs = createVfs()
    expect(cwdString(vfs)).toBe("~")
  })

  it("listDir on initial cwd returns entries including 'welcome.txt'", () => {
    const vfs = createVfs()
    const entries = listDir(vfs, ["home", "misha"])
    expect(entries?.some((e) => e.name === "welcome.txt")).toBe(true)
  })

  it("mkdirNode creates a new directory", () => {
    const vfs = createVfs()
    const result = mkdirNode(vfs, ["home", "misha", "newdir"])
    if (typeof result === "string") throw new Error(result)
    const node = getNode(result, ["home", "misha", "newdir"])
    expect(node?.kind).toBe("dir")
  })

  it("removeNode removes a file", () => {
    const vfs = createVfs()
    const result = removeNode(vfs, ["home", "misha", "welcome.txt"], false)
    if (typeof result === "string") throw new Error(result)
    const node = getNode(result, ["home", "misha", "welcome.txt"])
    expect(node).toBeNull()
  })
})

describe("shell-interpreter", () => {
  it("runCommand pwd returns cwd string", () => {
    const state = createShellState()
    const { lines } = runCommand(state, "pwd")
    expect(lines.some((l) => l.text === "~")).toBe(true)
  })

  it("runCommand ls returns file names", () => {
    const state = createShellState()
    const { lines } = runCommand(state, "ls")
    expect(lines.some((l) => l.text === "welcome.txt")).toBe(true)
  })

  it("runCommand whoami returns 'misha'", () => {
    const state = createShellState()
    const { lines } = runCommand(state, "whoami")
    expect(lines.some((l) => l.text === "misha")).toBe(true)
  })

  it("runCommand snake returns action: 'snake'", () => {
    const state = createShellState()
    const { action } = runCommand(state, "snake")
    expect(action).toBe("snake")
  })

  it("runCommand clear returns action: 'clear'", () => {
    const state = createShellState()
    const { action } = runCommand(state, "clear")
    expect(action).toBe("clear")
  })

  it("runCommand with unknown command returns error line", () => {
    const state = createShellState()
    const { lines } = runCommand(state, "notarealcommand")
    expect(lines.some((l) => l.kind === "error")).toBe(true)
  })

  it("runCommand 'echo hello > test.txt' creates the file", () => {
    const state = createShellState()
    const { state: next } = runCommand(state, "echo hello > test.txt")
    const node = getNode(next.vfs, ["home", "misha", "test.txt"])
    expect(node?.content).toBe("hello")
  })

  it("runCommand 'cat test.txt' after echo returns 'hello'", () => {
    const state = createShellState()
    const { state: after } = runCommand(state, "echo hello > test.txt")
    const { lines } = runCommand(after, "cat test.txt")
    expect(lines.some((l) => l.text === "hello")).toBe(true)
  })
})
