/**
 * Pure, DOM-free logic behind the AI lab visuals: seeded generators, timelines
 * and layout math. Every function is a deterministic function of its inputs
 * (usually the clock `t` in seconds) so SSR and the first client render match,
 * and so __tests__/ai-viz-model.test.ts can pin the behaviour. All data here is
 * ILLUSTRATIVE and simulated; none of it is a measurement of a real system.
 */

/** Seeded PRNG (mulberry32): identical output on server and client. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** One decimal, stable string for SVG coordinates (avoids float-print drift). */
export const r1 = (n: number) => Math.round(n * 10) / 10
export const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k
export const ease = (k: number) => {
  const c = clamp01(k)
  return c * c * (3 - 2 * c)
}
/** Fraction of [a,b] elapsed at p, clamped to 0..1. */
export const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))

/* ───────────────────────── Terminal (looping typing) ───────────────────── */

export const TYPE_STEP = 2 // chars per tick
export const HOLD_TICKS = 90 // ~2.3s at 26ms/tick
/** Chars shown at `tick`: type -> hold the finished frame -> restart, forever. */
export function typedLength(tick: number, total: number): number {
  const typeTicks = Math.ceil(total / TYPE_STEP)
  const at = ((tick % (typeTicks + HOLD_TICKS)) + typeTicks + HOLD_TICKS) % (typeTicks + HOLD_TICKS)
  return Math.min(total, at * TYPE_STEP)
}

/* ───────────────── Multi-agent orchestration + approval gate ───────────── */

export type Gate = 'auto' | 'approve' | 'deny'
export interface Worker { name: string; tool: string; gate: Gate }
export const WORKERS: Worker[] = [
  { name: 'Retriever', tool: 'search_docs()', gate: 'auto' },
  { name: 'Analyst', tool: 'query_metrics()', gate: 'auto' },
  { name: 'Coder', tool: 'apply_patch()', gate: 'approve' },
  { name: 'Critic', tool: 'run_evals()', gate: 'auto' },
  { name: 'Notifier', tool: 'post_update()', gate: 'deny' },
]
export const AGENT_STEP = 4
export type AgentPhase = 'plan' | 'delegate' | 'tool' | 'gate' | 'merge'
export function agentState(t: number) {
  const step = Math.floor(t / AGENT_STEP)
  const p = (t % AGENT_STEP) / AGENT_STEP
  const active = ((step % WORKERS.length) + WORKERS.length) % WORKERS.length
  const phase: AgentPhase = p < 0.12 ? 'plan' : p < 0.34 ? 'delegate' : p < 0.52 ? 'tool' : p < 0.8 ? 'gate' : 'merge'
  // 0 = at orchestrator, 1 = at worker
  const packet = phase === 'delegate' ? span(p, 0.12, 0.34) : phase === 'tool' || phase === 'gate' ? 1 : phase === 'merge' ? 1 - span(p, 0.8, 1) : 0
  const w = WORKERS[active]
  const gp = span(p, 0.52, 0.8)
  const decided = w.gate === 'auto' ? gp > 0.05 : gp > 0.55
  const verdict: 'waiting' | 'approved' | 'denied' = !decided ? 'waiting' : w.gate === 'deny' ? 'denied' : 'approved'
  return { step, p, active, phase, packet, verdict, worker: w }
}

/* ───────────────────────────── Eval harness ────────────────────────────── */

export const EVAL_CASES = 24
export const EVAL_RATE = 3.5 // cases per second
export const EVAL_GATE = 0.85
export const EVAL_HOLD = 3.6
export const EVAL_CYCLE = EVAL_CASES / EVAL_RATE + 1.2 + EVAL_HOLD
export const EVAL_SUITES = [
  { name: 'tool use', target: 0.95 },
  { name: 'grounding', target: 0.9 },
  { name: 'refusals', target: 0.78 },
  { name: 'regressions', target: 0.92 },
]
/** matrix[suite][case] = judge verdict. Fail count is exact, positions are seeded. */
export function evalMatrix(seed = 11): boolean[][] {
  const rand = rng(seed)
  return EVAL_SUITES.map((s) => {
    const fails = Math.round((1 - s.target) * EVAL_CASES)
    const order = Array.from({ length: EVAL_CASES }, (_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    const failing = new Set(order.slice(0, fails))
    return Array.from({ length: EVAL_CASES }, (_, c) => !failing.has(c))
  })
}
export const EVAL_MATRIX = evalMatrix()
/** Cases judged so far in suite `row` at cycle-local time `lt` (suites stagger by 0.35s). */
export function casesDone(lt: number, row: number): number {
  return Math.min(EVAL_CASES, Math.max(0, Math.floor((lt - 0.2 - row * 0.35) * EVAL_RATE)))
}
export function suiteRate(matrix: boolean[][], row: number, n: number): number {
  if (n <= 0) return 0
  return matrix[row].slice(0, n).filter(Boolean).length / n
}
export function evalGate(matrix: boolean[][], threshold = EVAL_GATE) {
  const rates = matrix.map((_, i) => suiteRate(matrix, i, EVAL_CASES))
  const worst = rates.indexOf(Math.min(...rates))
  return { ok: rates.every((r) => r >= threshold), worst, worstRate: rates[worst] }
}

/* ───────────────────────── Token streaming waterfall ───────────────────── */

export interface Span { id: string; label: string; start: number; end: number }
export const SPANS: Span[] = [
  { id: 'guard-in', label: 'input guard', start: 0, end: 60 },
  { id: 'retrieve', label: 'retrieval', start: 60, end: 260 },
  { id: 'prompt', label: 'prompt build', start: 260, end: 310 },
  { id: 'prefill', label: 'queue + prefill', start: 310, end: 720 },
  { id: 'decode', label: 'decode (streaming)', start: 720, end: 2520 },
  { id: 'guard-out', label: 'output guard', start: 760, end: 2560 },
]
export const TOTAL_MS = 2560
export const TTFT_MS = 720
export const TOKENS = 72
export const PLAY_MS_PER_S = 500 // slow motion: 2.56s of "real" time plays over ~5.1s
export const WATERFALL_CYCLE = TOTAL_MS / PLAY_MS_PER_S + 3
export function playheadMs(t: number): number {
  const lt = ((t % WATERFALL_CYCLE) + WATERFALL_CYCLE) % WATERFALL_CYCLE
  return Math.min(TOTAL_MS, lt * PLAY_MS_PER_S)
}
export const spanFill = (s: Span, ms: number) => clamp01((ms - s.start) / (s.end - s.start))
export function tokensAt(ms: number): number {
  const d = SPANS[4]
  return Math.floor(spanFill(d, ms) * TOKENS)
}
export const tokensPerSecond = () => Math.round(TOKENS / ((SPANS[4].end - SPANS[4].start) / 1000))

/* ─────────────────────────── Model routing cascade ─────────────────────── */

export const TIERS = [
  { name: 'small', cost: 1 },
  { name: 'mid', cost: 6 },
  { name: 'frontier', cost: 30 },
]
export const ROUTE_THRESHOLD = 0.8
export interface RouteReq { q: string; conf: number[] }
export const ROUTE_REQS: RouteReq[] = [
  { q: 'classify intent', conf: [0.93] },
  { q: 'summarize thread', conf: [0.62, 0.88] },
  { q: 'multi-step plan', conf: [0.41, 0.58, 0.92] },
  { q: 'extract fields', conf: [0.95] },
  { q: 'draft reply', conf: [0.7, 0.9] },
]
/** Index of the tier that answers: first confidence >= threshold (or the last tier). */
export const stopTier = (r: RouteReq) => {
  const i = r.conf.findIndex((c) => c >= ROUTE_THRESHOLD)
  return i === -1 ? r.conf.length - 1 : i
}
/** A cascade pays for every tier it tries. */
export const cascadeCost = (r: RouteReq) => TIERS.slice(0, stopTier(r) + 1).reduce((a, t) => a + t.cost, 0)
export const ATTEMPT_S = 1
const route_lead = 0.4
const route_tail = 0.9
export const routeDuration = (r: RouteReq) => route_lead + (stopTier(r) + 1) * ATTEMPT_S + route_tail
export const ROUTE_CYCLE = ROUTE_REQS.reduce((a, r) => a + routeDuration(r), 0)
export function routeAt(t: number) {
  let lt = ((t % ROUTE_CYCLE) + ROUTE_CYCLE) % ROUTE_CYCLE
  let index = 0
  while (lt >= routeDuration(ROUTE_REQS[index])) { lt -= routeDuration(ROUTE_REQS[index]); index++ }
  const req = ROUTE_REQS[index]
  const stop = stopTier(req)
  const k = Math.min(stop, Math.max(-1, Math.floor((lt - route_lead) / ATTEMPT_S)))
  const attempt = lt < route_lead ? -1 : k
  const filled = lt < route_lead ? 0 : clamp01(((lt - route_lead) - attempt * ATTEMPT_S) / (ATTEMPT_S * 0.7))
  const settled = lt >= route_lead + (stop + 1) * ATTEMPT_S
  return { index, req, stop, attempt: Math.max(0, attempt), arrived: lt >= route_lead, filled: settled ? 1 : filled, settled }
}
/** Average cost of the first n requests vs always calling the biggest tier. */
export function routeSavings(n: number) {
  const list = ROUTE_REQS.slice(0, Math.max(1, n))
  const avg = list.reduce((a, r) => a + cascadeCost(r), 0) / list.length
  return { avg, flat: TIERS[TIERS.length - 1].cost }
}

/* ───────────────────────────── Guardrail pipeline ──────────────────────── */

export const GUARD_STAGES = ['input filter', 'policy', 'model', 'output check']
export const GATE_X = [150, 255, 360, 465]
export const TRACK_X0 = 30
export const TRACK_X1 = 570
export const GUARD_SPEED = 92
export const GUARD_SPAWN = 1.25
export type Fate = 'pass' | 'block' | 'redact'
export interface GuardReq { text: string; fate: Fate; at: number; why: string }
export const GUARD_REQS: GuardReq[] = [
  { text: 'reset my password', fate: 'pass', at: -1, why: 'passed' },
  { text: 'ignore prior rules', fate: 'block', at: 0, why: 'blocked: prompt injection' },
  { text: 'my email is a@b.co', fate: 'redact', at: 0, why: 'redacted: email address' },
  { text: 'write me a script', fate: 'block', at: 1, why: 'refused: out of scope (code)' },
  { text: 'summarize the policy', fate: 'pass', at: -1, why: 'passed' },
  { text: 'claim with no source', fate: 'block', at: 3, why: 'blocked: not grounded in sources' },
]
export const guardReq = (i: number) => GUARD_REQS[((i % GUARD_REQS.length) + GUARD_REQS.length) % GUARD_REQS.length]
export function guardPos(i: number, t: number) {
  const r = guardReq(i)
  const age = t - i * GUARD_SPAWN
  if (age < 0) return null
  const stopX = r.fate === 'block' ? GATE_X[r.at] - 10 : TRACK_X1
  const x = Math.min(stopX, TRACK_X0 + age * GUARD_SPEED)
  const arrive = (stopX - TRACK_X0) / GUARD_SPEED
  const since = age - arrive
  if (since > 1.1) return null
  const done = since >= 0
  return { x, done, fade: done ? 1 - clamp01(since / 1.1) : 1, req: r, lane: ((i % 3) + 3) % 3 }
}
/** Outcome tallies over the last GUARD_REQS.length requests that have finished. */
export function guardTally(t: number) {
  const cur = Math.floor(t / GUARD_SPAWN)
  const tally = { pass: 0, block: 0, redact: 0 }
  for (let i = cur - GUARD_REQS.length * 2; i <= cur; i++) {
    if (i < 0) continue
    const r = guardReq(i)
    const stopX = r.fate === 'block' ? GATE_X[r.at] - 10 : TRACK_X1
    if (t - i * GUARD_SPAWN >= (stopX - TRACK_X0) / GUARD_SPEED && i > cur - GUARD_REQS.length - 1) tally[r.fate]++
  }
  return tally
}

/* ───────────────────────────── RAG retrieval trace ─────────────────────── */

export const TRACE_QUERY = 'How do I rotate an API key?'
export const CHUNKS = [
  { id: 'keys.md §2', sim: 0.71, rerank: 0.93 },
  { id: 'faq.md §7', sim: 0.78, rerank: 0.41 },
  { id: 'rotate.md §1', sim: 0.74, rerank: 0.88 },
  { id: 'billing.md §4', sim: 0.66, rerank: 0.12 },
  { id: 'intro.md §1', sim: 0.62, rerank: 0.2 },
]
/** Rank of chunk i after reranking (0 = best). */
export const rerankRank = (i: number) => [...CHUNKS].sort((a, b) => b.rerank - a.rerank).indexOf(CHUNKS[i])
export const ANSWER_LINES = ['Create a new key, switch', 'your clients to it [1], then', 'revoke the old key [2].']
export const ANSWER_LEN = ANSWER_LINES.join('').length
export const TRACE_CYCLE = 11
export function traceState(t: number) {
  const lt = ((t % TRACE_CYCLE) + TRACE_CYCLE) % TRACE_CYCLE
  return {
    typed: Math.floor(span(lt, 0, 1.6) * TRACE_QUERY.length),
    bars: ease(span(lt, 1.8, 3.4)),
    rerank: ease(span(lt, 4, 5)),
    chars: Math.floor(span(lt, 5.4, 8.6) * ANSWER_LEN),
  }
}

/* ───────────────────────────── Training curve ──────────────────────────── */

export const EPOCHS = 50
export const EPOCHS_PER_S = 4
export const CURVE_CYCLE = EPOCHS / EPOCHS_PER_S + 3
export const CURVE = (() => {
  const rand = rng(7)
  return Array.from({ length: EPOCHS + 1 }, (_, e) => {
    const base = 1.9 * Math.exp(-e / 9) + 0.08
    return {
      train: base * (1 + (rand() - 0.5) * 0.12),
      val: base * 1.06 + 0.04 + (rand() - 0.5) * 0.05 + (e > 35 ? (e - 35) * 0.002 : 0),
      acc: Math.min(0.99, 0.97 - 0.5 * Math.exp(-e / 10) + (rand() - 0.5) * 0.02),
      lr: 3e-4 * 0.5 * (1 + Math.cos((Math.PI * e) / EPOCHS)) + 1e-6,
    }
  })
})()
export const epochAt = (t: number) => Math.min(EPOCHS, Math.floor(Math.max(0, (t % CURVE_CYCLE) * EPOCHS_PER_S)))
