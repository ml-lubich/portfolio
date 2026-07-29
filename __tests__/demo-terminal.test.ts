/**
 * Pure scheduler for the OSS showcase's `DemoTerminal` primitive.
 *
 * Mirrors the existing live-terminal engine's rule: `cmd`/`code` lines type
 * character-by-character, `out`/`hdr`/`gap` lines render instantly the
 * moment the sequence reaches them.
 */

import { describe, it, expect } from "vitest"
import type { Line } from "@/components/terminal/types"
import {
  computeDemoTerminalFrame,
  getDemoTerminalTypedLength,
  getDemoTerminalFullText,
} from "@/lib/demo-terminal"

const sampleLines: Line[] = [
  { t: "hdr", s: "# oss demo" },
  { t: "cmd", s: "imsg search 'hello'" },
  { t: "out", s: "3 matches found" },
  { t: "gap", s: "" },
  { t: "code", s: "const x = 1" },
]

describe("computeDemoTerminalFrame", () => {
  it("shows instant line types (hdr/out/gap) fully at step 0, typed lines not yet started", () => {
    const frame = computeDemoTerminalFrame(sampleLines, 0)
    expect(frame.displayLines[0]).toEqual({ index: 0, text: "# oss demo", done: true })
    expect(frame.displayLines[1]).toEqual({ index: 1, text: "", done: false })
    expect(frame.displayLines).toHaveLength(2)
    expect(frame.done).toBe(false)
  })

  it("reveals typed lines progressively, character by character", () => {
    const cmd = sampleLines[1].s
    const partial = computeDemoTerminalFrame(sampleLines, 5)
    expect(partial.displayLines[1]).toEqual({ index: 1, text: cmd.slice(0, 5), done: false })

    const fullCmd = computeDemoTerminalFrame(sampleLines, cmd.length)
    expect(fullCmd.displayLines[1]).toEqual({ index: 1, text: cmd, done: true })
    // sequence continues into the following instant lines once the cmd finishes
    expect(fullCmd.displayLines[2]).toEqual({ index: 2, text: "3 matches found", done: true })
    expect(fullCmd.displayLines[3]).toEqual({ index: 3, text: "", done: true })
    // next typed line ("code") hasn't started yet
    expect(fullCmd.displayLines[4]).toEqual({ index: 4, text: "", done: false })
  })

  it("reaches the exact final text once fully revealed, matching the concatenated script", () => {
    const total = getDemoTerminalTypedLength(sampleLines)
    const final = computeDemoTerminalFrame(sampleLines, total)
    expect(final.done).toBe(true)
    expect(final.displayLines.map((d) => d.text).join("\n")).toBe(getDemoTerminalFullText(sampleLines))
  })

  it("clamps beyond-final reveal counts to the same finished frame", () => {
    const total = getDemoTerminalTypedLength(sampleLines)
    const overshoot = computeDemoTerminalFrame(sampleLines, total + 1000)
    expect(overshoot).toEqual(computeDemoTerminalFrame(sampleLines, total))
  })
})
