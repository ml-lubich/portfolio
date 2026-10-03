import { describe, expect, it } from "vitest"
import { mulberry32, shuffle } from "@/lib/agent-storm/prng"
import { ARTIFACT_KINDS, planStorm, logLine } from "@/lib/agent-storm/plan"
import { STATUSES, initialAgent, tick, progress, type AgentState } from "@/lib/agent-storm/machine"
import { generateArtifact } from "@/lib/agent-storm/artifacts"
import { createTrigger } from "@/lib/agent-storm/trigger"
import { revealSlice } from "@/lib/agent-storm/reveal"

describe("prng", () => {
  it("is deterministic per seed and differs across seeds", () => {
    const a = mulberry32(42), b = mulberry32(42), c = mulberry32(43)
    const sa = Array.from({ length: 8 }, a), sb = Array.from({ length: 8 }, b), sc = Array.from({ length: 8 }, c)
    expect(sa).toEqual(sb)
    expect(sa).not.toEqual(sc)
    expect(sa.every((x) => x >= 0 && x < 1)).toBe(true)
  })
  it("shuffle is a deterministic permutation and does not mutate", () => {
    const src = [1, 2, 3, 4, 5, 6, 7, 8]
    const out = shuffle(src, mulberry32(9))
    expect([...out].sort()).toEqual(src)
    expect(src).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(shuffle(src, mulberry32(9))).toEqual(out)
  })
})

describe("planStorm", () => {
  it("has the full artifact pool", () => {
    expect(ARTIFACT_KINDS.length).toBe(12)
    expect(new Set(ARTIFACT_KINDS).size).toBe(12)
  })
  it.each([6, 9, 12])("returns %i agents with unique names and unique kinds", (n) => {
    const plan = planStorm(1234, n)
    expect(plan).toHaveLength(n)
    expect(new Set(plan.map((p) => p.name)).size).toBe(n)
    expect(new Set(plan.map((p) => p.kind)).size).toBe(n)
    expect(new Set(plan.map((p) => p.seed)).size).toBe(n)
    for (const p of plan) {
      expect(ARTIFACT_KINDS).toContain(p.kind)
      expect(p.name).toMatch(/^[a-z]+(-[a-z]+)?(-\d+)?$/)
    }
  })
  it("is deterministic per seed and varies across seeds", () => {
    expect(planStorm(5, 8)).toEqual(planStorm(5, 8))
    expect(planStorm(5, 8)).not.toEqual(planStorm(6, 8))
  })
  it("repeats kinds only after the pool is exhausted, names stay unique", () => {
    const plan = planStorm(3, 15)
    expect(plan).toHaveLength(15)
    expect(new Set(plan.map((p) => p.name)).size).toBe(15)
    expect(new Set(plan.slice(0, 12).map((p) => p.kind)).size).toBe(12)
  })
  it("handles zero and negative counts", () => {
    expect(planStorm(1, 0)).toEqual([])
    expect(planStorm(1, -3)).toEqual([])
  })
  it("log lines are deterministic and tool-shaped while calling tools", () => {
    const plan = planStorm(7, 6)
    const l1 = logLine(plan[0], "tool_call", 2)
    expect(l1).toBe(logLine(plan[0], "tool_call", 2))
    expect(l1).toMatch(/^(Read|Write|Bash|Edit|Grep)\(/)
    for (const s of STATUSES) expect(logLine(plan[1], s, 0).length).toBeGreaterThan(0)
  })
})

describe("agent state machine", () => {
  const run = (): AgentState[] => {
    const seen: AgentState[] = [initialAgent()]
    for (let i = 0; i < 200; i++) seen.push(tick(seen[seen.length - 1]))
    return seen
  }
  it("starts queued", () => expect(initialAgent().status).toBe("queued"))
  it("walks queued, thinking, tool_call, writing, shipped without skipping or regressing", () => {
    const order = run().map((s) => s.status).filter((s, i, a) => i === 0 || s !== a[i - 1])
    expect(order).toEqual([...STATUSES])
    expect(STATUSES).toEqual(["queued", "thinking", "tool_call", "writing", "shipped"])
  })
  it("shipped is terminal", () => {
    const end = run().at(-1)!
    expect(end.status).toBe("shipped")
    expect(tick(end)).toEqual(end)
  })
  it("tick is pure", () => {
    const s = initialAgent()
    const frozen = JSON.stringify(s)
    const a = tick(s), b = tick(s)
    expect(JSON.stringify(s)).toBe(frozen)
    expect(a).toEqual(b)
    expect(a).not.toBe(s)
  })
  it("progress is monotonic from 0 to 1", () => {
    const ps = run().map(progress)
    expect(ps[0]).toBe(0)
    expect(ps.at(-1)).toBe(1)
    for (let i = 1; i < ps.length; i++) expect(ps[i]).toBeGreaterThanOrEqual(ps[i - 1])
  })
})

describe("generateArtifact", () => {
  describe.each(ARTIFACT_KINDS)("%s", (kind) => {
    const html = generateArtifact(kind, 11)
    it("is a full document", () => {
      expect(html).toMatch(/^<!doctype html>/i)
      expect(html).toContain("<html")
      expect(html).toContain("<body")
      expect(html.trimEnd()).toMatch(/<\/html>$/)
    })
    it("has no network, escape or sound hooks", () => {
      for (const bad of [/https?:\/\//i, /fetch\(/, /XMLHttpRequest/, /import\(/, /<script[^>]*\ssrc/i, /\bparent\./, /\btop\./, /document\.cookie/, /localStorage/, /window\.open/, /AudioContext/i, /WebSocket/, /<link[^>]*href/i, /url\(/i]) {
        expect(html, String(bad)).not.toMatch(bad)
      }
    })
    it("is under 12 KB", () => expect(Buffer.byteLength(html)).toBeLessThan(12 * 1024))
    it("is deterministic per seed and varies with seed", () => {
      expect(generateArtifact(kind, 11)).toBe(html)
      expect(generateArtifact(kind, 12)).not.toBe(html)
    })
  })
})

const keyPress = (t: ReturnType<typeof createTrigger>, keys: string[], target?: unknown) =>
  keys.map((k) => t.press(k, target as never)).some(Boolean)

describe("createTrigger", () => {
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]
  const mk = () => {
    let n = 0
    return { t: createTrigger({ keyword: "agents", onFire: () => void n++ }), count: () => n }
  }
  it("fires on the Konami code", () => {
    const { t, count } = mk()
    keyPress(t, KONAMI)
    expect(count()).toBe(1)
  })
  it("a wrong key resets the Konami sequence", () => {
    const { t, count } = mk()
    keyPress(t, [...KONAMI.slice(0, 6), "x", ...KONAMI.slice(6)])
    expect(count()).toBe(0)
  })
  it("restarts when the wrong key begins a new sequence", () => {
    const { t, count } = mk()
    keyPress(t, ["ArrowUp", ...KONAMI])
    expect(count()).toBe(1)
  })
  it("fires on 'agents', case-insensitive", () => {
    const { t, count } = mk()
    keyPress(t, [..."AgEnTs"])
    expect(count()).toBe(1)
  })
  it("a wrong key resets the keyword", () => {
    const { t, count } = mk()
    keyPress(t, [..."agexnts"])
    expect(count()).toBe(0)
    keyPress(t, [..."agents"])
    expect(count()).toBe(1)
  })
  it("ignores keystrokes inside inputs, textareas and contenteditable", () => {
    const { t, count } = mk()
    for (const target of [{ tagName: "INPUT" }, { tagName: "TEXTAREA" }, { tagName: "DIV", isContentEditable: true }]) {
      keyPress(t, [..."agents"], target)
    }
    expect(count()).toBe(0)
  })
  it("modifier keys neither fire nor reset", () => {
    const { t, count } = mk()
    keyPress(t, ["a", "g", "Shift", "e", "n", "t", "s"])
    expect(count()).toBe(1)
  })
  it("returns true exactly on the firing key", () => {
    const { t } = mk()
    expect([..."agent"].map((k) => t.press(k))).toEqual([false, false, false, false, false])
    expect(t.press("s")).toBe(true)
  })
})

describe("revealSlice", () => {
  const html = generateArtifact("bar-dashboard", 3)
  const open = (s: string, tag: string) => (s.match(new RegExp(`<${tag}[\\s>]`, "g")) ?? []).length
  const close = (s: string, tag: string) => (s.match(new RegExp(`</${tag}>`, "g")) ?? []).length
  it("boundaries: 0 is empty, 1 is everything", () => {
    expect(revealSlice(html, 0)).toBe("")
    expect(revealSlice(html, 1)).toBe(html)
    expect(revealSlice(html, 7)).toBe(html)
    expect(revealSlice(html, -1)).toBe("")
  })
  it("never cuts mid-tag or mid script/style, and is always a prefix", () => {
    let prev = 0
    for (let f = 0; f <= 1.0001; f += 0.01) {
      const s = revealSlice(html, f)
      expect(html.startsWith(s)).toBe(true)
      expect(s.lastIndexOf("<")).toBeLessThanOrEqual(s.lastIndexOf(">") === -1 ? -1 : s.lastIndexOf(">") + 0)
      if (s.length) expect(s.lastIndexOf("<") < s.lastIndexOf(">") || !s.includes("<")).toBe(true)
      expect(open(s, "script")).toBe(close(s, "script"))
      expect(open(s, "style")).toBe(close(s, "style"))
      expect(s.length).toBeGreaterThanOrEqual(prev)
      prev = s.length
    }
  })
  it("works for every kind", () => {
    for (const k of ARTIFACT_KINDS) {
      const h = generateArtifact(k, 5)
      for (const f of [0.1, 0.33, 0.5, 0.77]) {
        const s = revealSlice(h, f)
        expect(open(s, "script")).toBe(close(s, "script"))
        expect(open(s, "style")).toBe(close(s, "style"))
        expect(!s.includes("<") || s.lastIndexOf("<") < s.lastIndexOf(">")).toBe(true)
      }
    }
  })
})
