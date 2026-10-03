import { describe, expect, it } from "vitest"
import {
  CHUNKS, EVAL_CASES, EVAL_GATE, EVAL_MATRIX, EVAL_SUITES, GATE_X, GUARD_REQS, GUARD_SPAWN, HOLD_TICKS, ROUTE_CYCLE,
  ROUTE_REQS, ROUTE_THRESHOLD, SPANS, TOKENS, TOTAL_MS, TRACK_X1, WORKERS, agentState, cascadeCost, casesDone,
  evalGate, evalMatrix, guardPos, guardTally, playheadMs, rerankRank, rng, routeAt, routeSavings, spanFill, stopTier,
  suiteRate, tokensAt, traceState, typedLength, AGENT_STEP,
} from "@/components/ai-viz/model"

describe("ai-viz seeded generators", () => {
  it("rng is deterministic and in [0,1)", () => {
    const a = rng(7), b = rng(7)
    for (let i = 0; i < 50; i++) {
      const v = a()
      expect(v).toBe(b())
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
  it("eval matrix has the exact fail count per suite and is stable per seed", () => {
    expect(evalMatrix(11)).toEqual(EVAL_MATRIX)
    EVAL_SUITES.forEach((s, i) => {
      expect(EVAL_MATRIX[i]).toHaveLength(EVAL_CASES)
      expect(EVAL_MATRIX[i].filter((x) => !x)).toHaveLength(Math.round((1 - s.target) * EVAL_CASES))
    })
  })
})

describe("terminal loop", () => {
  it("types, holds the full frame, then restarts forever", () => {
    const total = 100
    const typeTicks = Math.ceil(total / 2)
    expect(typedLength(0, total)).toBe(0)
    expect(typedLength(typeTicks, total)).toBe(total)
    expect(typedLength(typeTicks + HOLD_TICKS - 1, total)).toBe(total)
    expect(typedLength(typeTicks + HOLD_TICKS, total)).toBe(0)
    expect(typedLength(10 * (typeTicks + HOLD_TICKS) + 5, total)).toBe(10)
  })
})

describe("agent orchestration", () => {
  it("cycles workers and covers all phases with a valid packet position", () => {
    const seen = new Set<string>()
    for (let t = 0; t < AGENT_STEP * WORKERS.length * 2; t += 0.05) {
      const s = agentState(t)
      seen.add(s.phase)
      expect(s.packet).toBeGreaterThanOrEqual(0)
      expect(s.packet).toBeLessThanOrEqual(1)
      expect(s.active).toBe(Math.floor(t / AGENT_STEP) % WORKERS.length)
    }
    expect([...seen].sort()).toEqual(["delegate", "gate", "merge", "plan", "tool"])
  })
  it("auto tools approve, writes wait then approve, denied tools end denied", () => {
    const at = (i: number, p: number) => agentState(i * AGENT_STEP + p * AGENT_STEP)
    expect(at(0, 0.7).verdict).toBe("approved")
    expect(at(2, 0.55).verdict).toBe("waiting")
    expect(at(2, 0.78).verdict).toBe("approved")
    expect(at(4, 0.55).verdict).toBe("waiting")
    expect(at(4, 0.78).verdict).toBe("denied")
  })
})

describe("eval harness", () => {
  it("progress is monotone, capped, staggered", () => {
    expect(casesDone(0, 0)).toBe(0)
    expect(casesDone(100, 3)).toBe(EVAL_CASES)
    expect(casesDone(2, 0)).toBeGreaterThan(casesDone(2, 3))
    expect(suiteRate(EVAL_MATRIX, 0, 0)).toBe(0)
  })
  it("gate holds on the weakest suite", () => {
    const g = evalGate(EVAL_MATRIX)
    expect(g.ok).toBe(false)
    expect(EVAL_SUITES[g.worst].name).toBe("refusals")
    expect(g.worstRate).toBeLessThan(EVAL_GATE)
    expect(evalGate(EVAL_MATRIX, 0.5).ok).toBe(true)
  })
})

describe("latency waterfall", () => {
  it("playhead loops and stays in range; spans fill monotonically", () => {
    for (let t = 0; t < 40; t += 0.3) {
      const ms = playheadMs(t)
      expect(ms).toBeGreaterThanOrEqual(0)
      expect(ms).toBeLessThanOrEqual(TOTAL_MS)
    }
    expect(spanFill(SPANS[4], 0)).toBe(0)
    expect(spanFill(SPANS[4], TOTAL_MS)).toBe(1)
    expect(tokensAt(0)).toBe(0)
    expect(tokensAt(TOTAL_MS)).toBe(TOKENS)
  })
})

describe("model router", () => {
  it("stops at the first confident tier and falls back to the last", () => {
    expect(stopTier(ROUTE_REQS[0])).toBe(0)
    expect(stopTier(ROUTE_REQS[2])).toBe(2)
    expect(stopTier({ q: "x", conf: [0.1, 0.2, 0.3] })).toBe(2)
  })
  it("cascade pays for every tier tried", () => {
    expect(cascadeCost(ROUTE_REQS[0])).toBe(1)
    expect(cascadeCost(ROUTE_REQS[2])).toBe(37)
    expect(routeSavings(ROUTE_REQS.length).avg).toBeLessThan(routeSavings(1).flat)
  })
  it("timeline covers every request across one cycle and wraps", () => {
    const idx = new Set<number>()
    for (let t = 0; t < ROUTE_CYCLE; t += 0.1) {
      const s = routeAt(t)
      idx.add(s.index)
      expect(s.filled).toBeGreaterThanOrEqual(0)
      expect(s.filled).toBeLessThanOrEqual(1)
      expect(s.req.conf[s.attempt]).toBeDefined()
    }
    expect(idx.size).toBe(ROUTE_REQS.length)
    expect(routeAt(ROUTE_CYCLE + 0.5).index).toBe(routeAt(0.5).index)
    expect(ROUTE_THRESHOLD).toBe(0.8)
  })
})

describe("guardrail pipeline", () => {
  it("blocked requests stop before their gate; passed ones reach the end", () => {
    const iBlock = GUARD_REQS.findIndex((r) => r.fate === "block" && r.at === 1)
    const iPass = GUARD_REQS.findIndex((r) => r.fate === "pass")
    const blocked = guardPos(iBlock, iBlock * GUARD_SPAWN + 20)
    expect(blocked).toBeNull() // long gone
    const mid = guardPos(iBlock, iBlock * GUARD_SPAWN + (GATE_X[1] - 10 - 30) / 92 + 0.2)
    expect(mid?.x).toBe(GATE_X[1] - 10)
    expect(mid?.done).toBe(true)
    const pass = guardPos(iPass, iPass * GUARD_SPAWN + 100)
    expect(pass).toBeNull()
    const end = guardPos(iPass, iPass * GUARD_SPAWN + (TRACK_X1 - 30) / 92 + 0.1)
    expect(end?.x).toBe(TRACK_X1)
  })
  it("not-yet-spawned requests return null and tallies stay bounded", () => {
    expect(guardPos(5, 0)).toBeNull()
    for (let t = 0; t < 60; t += 0.5) {
      const k = guardTally(t)
      expect(k.pass + k.block + k.redact).toBeLessThanOrEqual(GUARD_REQS.length)
    }
  })
})

describe("retrieval trace", () => {
  it("rerank is a permutation and puts the best chunks first", () => {
    const ranks = CHUNKS.map((_, i) => rerankRank(i)).sort()
    expect(ranks).toEqual([0, 1, 2, 3, 4])
    expect(CHUNKS[0].rerank).toBeGreaterThan(CHUNKS[1].rerank)
    expect(rerankRank(0)).toBe(0)
  })
  it("phases advance in order and wrap", () => {
    const a = traceState(0.2), b = traceState(3.5), c = traceState(9)
    expect(a.typed).toBeGreaterThan(0)
    expect(b.bars).toBe(1)
    expect(c.rerank).toBe(1)
    expect(c.chars).toBeGreaterThan(0)
    expect(traceState(11.2).typed).toBe(traceState(0.2).typed)
  })
})
