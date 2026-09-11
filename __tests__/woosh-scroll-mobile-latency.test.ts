/**
 * Regression: tapping a mobile nav link felt delayed. Root cause —
 * navigateTo() always waits for `waitForStableLayout()` before issuing the
 * scroll, and that wait requires LAYOUT_STABLE_POLLS (15) consecutive
 * unchanged polls at LAYOUT_POLL_MS (100ms) from the moment of the tap —
 * a fixed ~1.5s tax before any scroll motion starts, even when the target
 * section needs zero stabilization (nothing above it in the DOM is still
 * mounting). On a real handset the underlying layout churn (WebGL canvases,
 * async data sections) takes even longer to settle, pushing this well past
 * 2s.
 *
 * Fix: gate a materially shorter stability window behind `pointer: coarse`
 * (real touch input) so a handset tap starts scrolling almost immediately,
 * while leaving the desktop/mouse constants — and therefore desktop's
 * measured timing — untouched.
 */

import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"

const src = fs.readFileSync(
  path.resolve(__dirname, "../components/nav/woosh-scroll.ts"),
  "utf8",
)

describe("mobile nav tap: pre-scroll stability wait", () => {
  it("branches the layout-stability wait on pointer: coarse", () => {
    expect(src).toMatch(/pointer:\s*coarse/)
  })

  it("coarse-pointer stability window is short enough that a tap feels instant (<=700ms)", () => {
    const pollMs = Number(src.match(/LAYOUT_POLL_MS\s*=\s*(\d+)/)?.[1])
    const coarsePolls = Number(
      src.match(/LAYOUT_STABLE_POLLS_COARSE\s*=\s*(\d+)/)?.[1],
    )
    expect(pollMs, "LAYOUT_POLL_MS constant not found").toBeGreaterThan(0)
    expect(
      coarsePolls,
      "LAYOUT_STABLE_POLLS_COARSE constant not found",
    ).toBeGreaterThan(0)
    expect(pollMs * coarsePolls).toBeLessThanOrEqual(700)
  })

  it("desktop's stability window is untouched — mouse/trackpad timing must not change", () => {
    const desktopPolls = Number(
      src.match(/LAYOUT_STABLE_POLLS\s*=\s*(\d+)/)?.[1],
    )
    expect(desktopPolls).toBe(15)
  })
})
