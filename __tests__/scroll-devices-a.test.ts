/**
 * Scroll devices A — About parallax depth + Open-source progress rail.
 *
 * Compact / SSR / reduced-motion must paint exactly the pre-change markup
 * (file snapshots captured BEFORE the devices were written), and the pure
 * math must clamp and cap.
 */
import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { About } from "@/components/sections/about"
import { OpenSourceShowcase } from "@/components/sections/open-source-showcase"
import { depthOffset, railFill, DEPTH_CAP_PX } from "@/lib/scroll-depth"

const ROOT = path.resolve(__dirname, "..")
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8")

describe("SSR / compact markup is unchanged", () => {
  it("About renders exactly today's markup", async () => {
    await expect(renderToStaticMarkup(createElement(About))).toMatchFileSnapshot(
      "__snapshots__/about-baseline.html",
    )
  })
  it("OpenSourceShowcase renders exactly today's markup", async () => {
    await expect(renderToStaticMarkup(createElement(OpenSourceShowcase))).toMatchFileSnapshot(
      "__snapshots__/open-source-baseline.html",
    )
  })
})

describe("depthOffset (pure)", () => {
  it("is 0 at mid-travel and ±rate*cap at the ends", () => {
    expect(depthOffset(0.5, 1)).toBeCloseTo(0, 6)
    expect(depthOffset(0, 1)).toBe(DEPTH_CAP_PX)
    expect(depthOffset(1, 1)).toBe(-DEPTH_CAP_PX)
    expect(depthOffset(0, -0.5)).toBe(-DEPTH_CAP_PX / 2)
  })
  it("clamps out-of-range progress and caps the rate", () => {
    expect(depthOffset(-3, 1)).toBe(DEPTH_CAP_PX)
    expect(depthOffset(9, 1)).toBe(-DEPTH_CAP_PX)
    expect(depthOffset(0, 5)).toBe(DEPTH_CAP_PX)
    expect(depthOffset(1, -5)).toBe(DEPTH_CAP_PX)
  })
  it("never leaves the 40px cap and treats NaN/Infinity as rest", () => {
    expect(DEPTH_CAP_PX).toBe(40)
    expect(depthOffset(Number.NaN, 1)).toBe(0)
    expect(depthOffset(0.3, Number.NaN)).toBe(0)
    expect(Math.abs(depthOffset(Number.POSITIVE_INFINITY, 1))).toBeLessThanOrEqual(40)
  })
})

describe("railFill (pure)", () => {
  it("is linear and clamped to 0..1", () => {
    expect(railFill(0.25)).toBe(0.25)
    expect(railFill(-1)).toBe(0)
    expect(railFill(2)).toBe(1)
  })
  it("NaN fills nothing", () => {
    expect(railFill(Number.NaN)).toBe(0)
  })
})

describe("component contracts", () => {
  const about = read("components/sections/about.tsx")
  const oss = read("components/sections/open-source-showcase.tsx")

  it("About: parallax via useSectionProgress, translateY only, state published", () => {
    expect(about).toContain("useSectionProgress(")
    expect(about).toContain("depthOffset(")
    expect(about).toMatch(/translate3d\(0,\s*\$\{[^}]+\}px,\s*0\)/)
    expect(about).not.toMatch(/translateX|rotate\(|scale\(/)
    expect(about).toContain("dataset.scVerifyState = `depth:")
  })
  it("Open source: aria-hidden absolute rail, scaleY only, state published", () => {
    expect(oss).toContain("useSectionProgress(")
    expect(oss).toContain("railFill(")
    expect(oss).toContain("scaleY(")
    expect(oss).toContain("dataset.scVerifyState = `rail:")
    expect(oss).toMatch(/aria-hidden[\s\S]{0,200}data-sc-verify-state="rail:0"|data-sc-verify-state="rail:0"[\s\S]{0,300}aria-hidden/)
  })
  it("rail only mounts where scroll motion is welcome", () => {
    expect(oss).toContain("isStaticScrollViewport()")
  })
})
