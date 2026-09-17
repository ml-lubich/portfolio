/**
 * Hero motion guardrails — tokscale live-activity panel and the role rotator.
 *
 * The hero name/role line intentionally uses the original AnimatedName
 * treatment (per-char 3D was reverted: it broke kerning and layout). These
 * tests pin the kept behaviors: tokscale scan bar (no LIVE chip), anti-jitter
 * spring tilt, and a fixed-height role rotator that never shifts layout.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"
import { createElement } from "react"
import { renderToString } from "react-dom/server"

const ROOT = path.resolve(__dirname, "..")
const css = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8")

describe("Tokscale hero panel — live token activity", () => {
  it("renders a green token progress bar inside the panel (SSR)", async () => {
    const { TokscaleHeroBadge } = await import("@/components/sections/tokscale-stats")
    const html = renderToString(createElement(TokscaleHeroBadge))
    expect(html).toContain("data-tokscale-scan")
  })

  it("has no LIVE chip overlaying the panel corner", async () => {
    const { TokscaleHeroBadge } = await import("@/components/sections/tokscale-stats")
    const html = renderToString(createElement(TokscaleHeroBadge))
    expect(html).not.toMatch(/>\s*Live\s*</i)
  })

  it("scan animation is defined and gated behind prefers-reduced-motion", () => {
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: no-preference\)[\s\S]*?@keyframes tokscale-scan/
    )
    expect(css).toMatch(/animation:\s*tokscale-scan/)
  })

  it("keeps spring tilt measured from the static scene wrapper (anti-jitter regression)", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "components/sections/tokscale-stats.tsx"),
      "utf8"
    )
    expect(src).toMatch(/useSpring/)
    expect(src).toMatch(/sceneRef\.current\?\.getBoundingClientRect/)
  })
})

describe("Hero heading — stable layout", () => {
  it("uses the original AnimatedName treatment (3D per-char name was reverted)", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "components/hero/role-rotator.tsx"),
      "utf8"
    )
    expect(src).toMatch(/AnimatedName/)
    expect(fs.existsSync(path.join(ROOT, "components/hero/hero-name-3d.tsx"))).toBe(false)
  })

  /* The slot used to hold every role at once as stacked absolutely-positioned
     spans, cross-faded by opacity, plus an sr-only twin — which is exactly how
     two or three ended up legible on top of each other mid-swap. It is a single
     slot now (josephheupler.com's), so the fixed height is what does the
     no-layout-push job the absolute positioning used to. */
  it("one role line at a time, in a fixed-height slot — no layout push, no stacking", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "components/hero/role-rotator.tsx"),
      "utf8"
    )
    expect(src).toMatch(/min-h-\[/)
    expect(src, "every role rendered at once is the stacking bug").not.toMatch(/roles\.map/)
    expect(src, "a duplicated copy is why a role could be read twice").not.toMatch(/className="[^"]*sr-only/)
    expect(src, "crossfade keeps at most two lines during a swap").toMatch(/prevIndex/)
    expect(src, "holds each role long enough to read").toMatch(/ROLE_HOLD_MS/)
    expect(src, "aria-live replaces the sr-only twin").toMatch(/aria-live="polite"/)
  })

  it("role text keeps one non-wrapping line — text-pretty resets text-wrap-mode and silently defeats whitespace-nowrap", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "components/hero/role-rotator.tsx"),
      "utf8"
    )
    const roleSpan = src.match(/gradient-text[^"]*/)?.[0] ?? ""
    expect(roleSpan).toContain("whitespace-nowrap")
    expect(roleSpan).not.toContain("text-pretty")
  })

  it("hero SSR output is deterministic across two passes", async () => {
    const { RoleRotator } = await import("@/components/hero/role-rotator")
    const a = renderToString(createElement(RoleRotator))
    const b = renderToString(createElement(RoleRotator))
    expect(a).toBe(b)
  })
})
