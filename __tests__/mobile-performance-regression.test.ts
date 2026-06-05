import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, "..")

function source(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf8")
}

function _src_hero(): string {
  return source("components/hero/index.tsx")
}

function _src_brainFiles(): string[] {
  return [
    source("components/brain/brain-wireframe.tsx"),
    source("components/brain/neural-orbs.tsx"),
  ]
}

function _has_all(sourceText: string, needles: string[]): boolean {
  return needles.every((needle) => sourceText.includes(needle))
}

describe("mobile performance guardrails", () => {
  it("keeps blog listing off Framer Motion", () => {
    expect(source("app/blog/blog-page-client.tsx")).not.toContain("framer-motion")
  })

  it("keeps blog articles off Framer Motion", () => {
    expect(source("app/blog/[slug]/blog-post-view.tsx")).not.toContain("framer-motion")
  })

  it("keeps touch navigation from prefetching blog cards during tap", () => {
    expect(source("components/blog/blog-card.tsx")).not.toContain("onTouchStart: warmRoute")
  })

  it("keeps mobile performance mode in the hero", () => {
    expect(_src_hero()).toContain("MOBILE_PERFORMANCE_QUERY")
  })

  it("keeps brain loading deferred until idle", () => {
    expect(_has_all(_src_hero(), ["const showBrain = idleBrain", "const brainRevealGate = idleBrain"])).toBe(true)
  })

  it("keeps brain reveal untied from name animation", () => {
    expect(_src_hero()).not.toContain("nameRevealStarted")
  })

  it("keeps particle canvas skipped during mobile performance mode", () => {
    expect(_src_hero()).toContain("!mobilePerformanceMode && <ParticleCanvas")
  })

  it("keeps the mobile subtitle animation CSS path", () => {
    expect(_has_all(source("app/globals.css"), [".hero-subtitle .animated-text-word"])).toBe(true)
  })

  it("keeps role rotator subtitle markup", () => {
    expect(source("components/hero/role-rotator.tsx")).toContain("hero-subtitle")
  })

  it("keeps lighter mobile ambient orb count", () => {
    expect(source("components/background-orbs.tsx")).toContain("MOBILE_ORB_COUNT = 4")
  })

  it("keeps ambient orbs transform-only", () => {
    expect(source("components/background-orbs.tsx")).toContain('willChange: "transform"')
  })

  it("keeps mobile ambient blur lightweight", () => {
    expect(source("app/globals.css")).toContain("blur(36px)")
  })

  it("keeps hue-rotate out of global animations", () => {
    expect(source("app/globals.css")).not.toContain("hue-rotate(")
  })

  it("keeps lazy sections close to the mobile viewport", () => {
    expect(source("components/layout/lazy-section.tsx")).toContain("120px")
  })

  it("keeps hero sizing stable during mobile browser chrome changes", () => {
    expect(source("components/hero/index.tsx")).not.toContain("90dvh")
  })

  it("keeps ambient hero orbs hydration-stable", () => {
    expect(source("components/background-orbs.tsx")).toContain('data-ambient-orb="true"')
  })

  it("keeps brain resize listeners width-only", () => {
    expect(_src_brainFiles().every((src) => src.includes("subscribeWidthResize"))).toBe(true)
  })
})
