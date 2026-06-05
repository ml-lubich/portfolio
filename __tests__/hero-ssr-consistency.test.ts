/**
 * Hero SSR / hydration guardrails — deterministic server markup and no viewport hooks on layout.
 *
 * Catches accidental `Date`/`Math.random` in render and drift where client-only breakpoints
 * drive `className` on the hero shell (classic Next.js hydration mismatch).
 */

import { describe, it, expect, vi } from "vitest"
import fs from "fs"
import path from "path"
import { createElement } from "react"
import { renderToString } from "react-dom/server"

const ROOT = path.resolve(__dirname, "..")

vi.mock("next/dynamic", () => ({
  default: () =>
    function BrainDynamicStub() {
      return null
    },
}))

describe("Hero SSR consistency", () => {
  it("renderToString is identical across two passes (no render-time randomness)", async () => {
    const { Hero } = await import("@/components/hero")
    const a = renderToString(createElement(Hero))
    const b = renderToString(createElement(Hero))
    expect(a).toBe(b)
  })

  it("renders the full ambient orb tree during SSR", async () => {
    const { Hero } = await import("@/components/hero")
    const html = renderToString(createElement(Hero))
    expect(html.match(/data-ambient-orb="true"/g)?.length).toBe(7)
  })

  it("hero shell does not use viewport hooks for className (hydration-safe layout)", () => {
    const src = fs.readFileSync(path.join(ROOT, "components/hero/index.tsx"), "utf8")
    expect(src).not.toMatch(/useIsMobile\s*\(/)
    expect(src).not.toMatch(/useScrollStackCompactViewport\s*\(/)
  })
})
