import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import {
  AGENTS_TRIGGER,
  BUILD_SEQUENCES,
  flatBuildQueue,
  shuffleOrder,
} from "@/lib/agents-build"

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8")

describe("agents-build sequences", () => {
  it("ships predetermined non-empty build sequences", () => {
    expect(BUILD_SEQUENCES.length).toBeGreaterThanOrEqual(3)
    expect(BUILD_SEQUENCES.every((s) => s.length >= 2)).toBe(true)
  })

  it("shuffles order deterministically for a given seed", () => {
    const a = shuffleOrder([1, 2, 3, 4], 42)
    const b = shuffleOrder([1, 2, 3, 4], 42)
    expect(a).toEqual(b)
    expect(a).not.toEqual([1, 2, 3, 4])
  })

  it("flattens a shuffled queue of pieces", () => {
    const q = flatBuildQueue(7)
    const ids = new Set(BUILD_SEQUENCES.flat().map((p) => p.id))
    expect(q.length).toBe(ids.size)
    expect(q.every((p) => ids.has(p.id))).toBe(true)
  })
})

describe("agents-build egg wiring", () => {
  it("listens for the agents trigger word", () => {
    expect(AGENTS_TRIGGER).toBe("agents")
    expect(read("components/easter/agents-build.tsx")).toContain("AGENTS_TRIGGER")
  })

  it("mounts only as an overlay in the root layout", () => {
    const layout = read("app/layout.tsx")
    expect(layout).toContain("AgentsBuildEgg")
    expect(layout).toMatch(/<AgentsBuildEgg\s*\/>/)
  })

  it("stays pointer-events-none on the layer so layout is untouched when idle", () => {
    const src = read("components/easter/agents-build.tsx")
    expect(src).toContain('if (!active) return null')
    expect(src).toMatch(/agents-egg-layer[\s\S]*pointer-events-none/)
  })
})

describe("resume download CTA", () => {
  it("hero links a real public PDF with a download attribute", () => {
    const src = read("components/hero/hero-actions.tsx")
    expect(src).toMatch(/href="\/resume_mlubich_swe\.pdf"/)
    expect(src).toMatch(/download=/)
    expect(src).toMatch(/Download Resume/)
  })

  it("ships the resume file under public/", () => {
    const pdf = join(process.cwd(), "public", "resume_mlubich_swe.pdf")
    expect(readFileSync(pdf).byteLength).toBeGreaterThan(1000)
  })
})
