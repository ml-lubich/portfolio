/**
 * Regression: clicking/tapping a nav link felt slow. Root cause —
 * navigateTo() waits for `waitForStableLayout()` before issuing the scroll,
 * and desktop required 15 unchanged polls × 100ms of the WHOLE document's
 * height: a fixed ~1.5s tax before any motion, and sections below the
 * target (async GitHub stats) kept resetting it.
 *
 * Fix: every pointer tracks the TARGET's own Y (sections below it can't move
 * it) with a short quiet window — after mount-all it settles in ~80ms.
 */

import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"

const src = fs.readFileSync(
  path.resolve(__dirname, "../components/nav/woosh-scroll.ts"),
  "utf8",
)

describe("nav click: pre-scroll stability wait", () => {
  it("stability window is short enough that a click feels instant (<=300ms) on every pointer", () => {
    const pollMs = Number(src.match(/LAYOUT_POLL_MS\s*=\s*(\d+)/)?.[1])
    const polls = Number(src.match(/LAYOUT_STABLE_POLLS\s*=\s*(\d+)/)?.[1])
    expect(pollMs, "LAYOUT_POLL_MS constant not found").toBeGreaterThan(0)
    expect(polls, "LAYOUT_STABLE_POLLS constant not found").toBeGreaterThan(0)
    expect(pollMs * polls).toBeLessThanOrEqual(300)
  })

  it("no pointer-specific slow path remains", () => {
    expect(src).not.toMatch(/LAYOUT_STABLE_POLLS_COARSE|isCoarsePointer/)
  })

  it("waits on the target's own position, not the whole document height", () => {
    expect(src).not.toMatch(/measure\s*=\s*document\.documentElement\.scrollHeight/)
    expect(src).toMatch(/getBoundingClientRect\(\)\.top \+ window\.scrollY/)
  })
})
