/**
 * Hero 3D motion guardrails — tokscale "in progress" activity bar and the
 * 3D-suspended hero name letters.
 *
 * Written TDD-first: SSR markup contracts (scan bar present, one 3D char per
 * letter, deterministic output) plus source/CSS checks for the performance
 * gates (fine-pointer-only parallax, reduced-motion-gated animations).
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

describe("Hero name — letters suspended in 3D space", () => {
  it("renders every letter of the name as an individually suspended 3D char (SSR)", async () => {
    const { RoleRotator } = await import("@/components/hero/role-rotator")
    const html = renderToString(createElement(RoleRotator))
    const chars = html.match(/data-hero-3d-char/g)
    expect(chars?.length).toBe("MishaLubich".length)
  })

  it("SSR output is deterministic across two passes (no render-time randomness)", async () => {
    const { RoleRotator } = await import("@/components/hero/role-rotator")
    const a = renderToString(createElement(RoleRotator))
    const b = renderToString(createElement(RoleRotator))
    expect(a).toBe(b)
  })

  it("mouse parallax attaches only on fine pointers and respects reduced motion", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "components/hero/hero-name-3d.tsx"),
      "utf8"
    )
    expect(src).toMatch(/pointer:\s*fine/)
    expect(src).toMatch(/useReducedMotion/)
  })

  it("cursor motion rotates the whole name as one rigid plane — never displaces letters individually", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "components/hero/hero-name-3d.tsx"),
      "utf8"
    )
    expect(src).not.toMatch(/depth\s*\*\s*PARALLAX/)
    expect(src).toMatch(/rotateY/)
    expect(src).toMatch(/rotateX/)
  })

  it("role line paints its gradient per character — parent-level background-clip:text with transformed char children renders invisible text", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "components/hero/role-rotator.tsx"),
      "utf8"
    )
    expect(src).not.toMatch(/gradient-text/)
    expect(src).toMatch(/role-char-3d/)
    expect(css).toMatch(/\.role-char-3d[\s\S]{0,600}background-clip:\s*text/)
  })

  it("idle letter float runs as a compositor CSS animation gated behind reduced motion", () => {
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: no-preference\)[\s\S]*?@keyframes hero-name-bob/
    )
    expect(css).toMatch(/animation:\s*hero-name-bob/)
  })
})
