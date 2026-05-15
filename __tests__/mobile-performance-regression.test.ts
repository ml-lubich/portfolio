import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, "..")

function source(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf8")
}

describe("mobile performance guardrails", () => {
  it("keeps blog route components off Framer Motion", () => {
    expect(source("app/blog/blog-page-client.tsx")).not.toContain("framer-motion")
    expect(source("app/blog/[slug]/blog-post-view.tsx")).not.toContain("framer-motion")
  })

  it("keeps touch navigation from prefetching blog cards during tap", () => {
    expect(source("components/blog/blog-card.tsx")).not.toContain("onTouchStart: warmRoute")
  })

  it("keeps decorative homepage work deferred on mobile", () => {
    const heroSource = source("components/hero/index.tsx")
    expect(heroSource).toContain("MOBILE_PERFORMANCE_QUERY")
    // Brain defers on every viewport (desktop matches mobile) — never tied to name reveal,
    // so the page paints first and Three.js loads on its own afterwards.
    expect(heroSource).toContain("const showBrain = idleBrain")
    expect(heroSource).toContain("const brainRevealGate = idleBrain")
    expect(heroSource).not.toContain("nameRevealStarted")
    expect(heroSource).toContain("!mobilePerformanceMode && <ParticleCanvas")
    expect(source("components/hero/role-rotator.tsx")).toContain("hero-subtitle")
    expect(source("app/globals.css")).toContain(".hero-subtitle .animated-text-word")
    expect(source("components/background-orbs.tsx")).toContain("MOBILE_ORB_COUNT = 4")
    expect(source("components/background-orbs.tsx")).toContain("blur(36px)")

    expect(source("components/layout/lazy-section.tsx")).toContain("120px")
  })
})
