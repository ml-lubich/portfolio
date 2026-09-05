/**
 * Source-assertion gate for the "Core Proficiency" neural map redesign
 * (components/three/neural-constellation.tsx).
 *
 * Owner feedback on the old WebGL version: a small off-centre pentagon in a
 * tall empty card, an EMPTY grey circle in the side panel until you hovered,
 * a clipped "NEURAL MAP · HOV…" caption, and a few dim dots crawling along
 * edges. Also: it only rendered on ≥768px, non-touch, motion-OK viewports —
 * everyone else got the bar chart.
 *
 * Contract locked in here:
 *  - the map is an SVG + HTML-label piece, not a three.js Canvas, so it renders
 *    on phones and under prefers-reduced-motion (static but complete)
 *  - the side panel is never empty: a default node is selected and it
 *    auto-cycles on a cadence; hover/focus overrides, leaving resumes
 *  - the clipped caption and the "hover to trace" empty-state copy are gone
 *  - nodes are keyboard reachable
 *  - no per-node blue/violet tints — the map is the site's monochrome metal
 */

import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, it, expect } from "vitest"

const ROOT = path.resolve(__dirname, "..")
const read = (p: string) => readFileSync(path.join(ROOT, p), "utf8")

const src = read("components/three/neural-constellation.tsx")
const section = read("components/sections/ai-expertise.tsx")

describe("neural map redesign — rendering surface", () => {
  it("is not a three.js / R3F canvas any more (must run on mobile + reduced motion)", () => {
    expect(src).not.toMatch(/@react-three\/fiber/)
    expect(src).not.toMatch(/@react-three\/drei/)
    expect(src).not.toMatch(/from "three"/)
    expect(src).toMatch(/<svg/)
  })

  it("no longer gates the map on viewport width / pointer / reduced-motion", () => {
    expect(src).not.toMatch(/useEnable3D/)
    expect(src).not.toMatch(/pointer:\s*coarse/)
    expect(src).not.toMatch(/window\.innerWidth\s*>=\s*768/)
  })

  it("respects prefers-reduced-motion via framer-motion's hook", () => {
    expect(src).toMatch(/import \{[^}]*useReducedMotion[^}]*\} from "framer-motion"/)
    expect(src).toMatch(/useReducedMotion\(\)/)
  })

  it("still exports NeuralConstellation and the section still renders it", () => {
    expect(src).toMatch(/export (function|const) NeuralConstellation\b/)
    expect(section).toMatch(/<NeuralConstellation\b/)
  })
})

describe("neural map redesign — the panel is never empty", () => {
  it("has a default selection that auto-cycles on a ~4s cadence", () => {
    expect(src).toMatch(/const CYCLE_MS\s*=\s*4000/)
    expect(src).toMatch(/setInterval\(/)
  })

  it("hover overrides the cycle and leaving resumes it (hovered ?? cycled)", () => {
    expect(src).toMatch(/hovered\s*\?\?\s*\w+/)
  })

  it("removed the old empty-state copy and grey placeholder circle", () => {
    expect(src).not.toMatch(/Hover any node to trace the details/)
    expect(src).not.toMatch(/h-10 w-10 rounded-full border border-primary\/20 bg-primary\/5/)
  })

  it("shows a progress indicator for the auto-cycle", () => {
    expect(src).toMatch(/cycle-progress/)
  })
})

describe("neural map redesign — header, a11y, theming", () => {
  it("dropped the clipped 'neural map · hover a node' caption", () => {
    expect(src).not.toMatch(/neural map · hover a node/i)
  })

  it("nodes are keyboard reachable buttons", () => {
    expect(src).toMatch(/role="button"/)
    expect(src).toMatch(/tabIndex=\{0\}/)
    expect(src).toMatch(/onFocus=/)
  })

  it("uses no per-node RGB tint triples (monochrome metal, tokens only)", () => {
    expect(src).not.toMatch(/color:\s*\[0\.\d+,\s*0\.\d+,\s*[01]\.?\d*\]/)
    expect(src).not.toMatch(/bg-\[#05060c\]/)
    expect(src).toMatch(/currentColor/)
  })

  it("map fills its card: no fixed 380/460px canvas box", () => {
    expect(src).not.toMatch(/h-\[380px\] md:h-\[460px\]/)
  })
})

describe("neural map redesign — glow is a tinted token, never a dark disc", () => {
  /* Owner rejected the first light-mode pass: halos were the foreground
     colour pushed through blur, i.e. black smudges on a pale card. */
  it("halo/glow colour comes from --accent-glow, not white/--white-rgb/foreground", () => {
    expect(src).toMatch(/--nm-glow:\s*var\(--accent-glow\)/)
    expect(src).toMatch(/\.nm-halo\s*\{[^}]*fill:\s*var\(--nm-glow\)/)
    expect(src).not.toMatch(/--nm-glow:\s*(white|#fff|rgb\(var\(--white-rgb|hsl\(var\(--foreground)/)
  })

  it("nothing blurred is filled with currentColor", () => {
    expect(src).not.toMatch(/fill="currentColor"[^>]*filter=|filter=[^>]*fill="currentColor"/)
  })

  it("light mode caps halo alpha at 0.25", () => {
    expect(src).toMatch(/\.light \.nm-halo\s*\{[^}]*min\(var\(--nm-halo\),\s*0?\.25\)/)
  })

  it("node cores are theme-aware (bright in dark, deep accent in light) with a rim", () => {
    expect(src).toMatch(/\.light \.nm-map\s*\{[^}]*--nm-core:\s*var\(--accent-glow\)/)
    expect(src).toMatch(/stroke="var\(--nm-core-edge\)"/)
  })

  it("labels sit above the SVG with a backing so halos can't swallow them", () => {
    const svgEnd = src.indexOf("</svg>")
    const labels = src.indexOf("HTML labels: fixed px type")
    expect(labels).toBeGreaterThan(svgEnd)
    expect(src).toMatch(/bg-background\/60[^"]*backdrop-blur/)
  })

  /* Carried over from the deleted neural-constellation-regression.test.ts:
     that file guarded an R3F useFrame loop against an effect-vs-rAF race on
     BufferGeometry attributes. The stronger invariant now is that no such
     loop exists at all. */
  it("has no frame loop or buffer attributes to race (old WebGL regression is moot)", () => {
    expect(src).not.toMatch(/useFrame|needsUpdate|BufferGeometry|BufferAttribute/)
  })
})
