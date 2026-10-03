export const STATUSES = ["queued", "thinking", "tool_call", "writing", "shipped"] as const
export type AgentStatus = (typeof STATUSES)[number]
export type AgentState = { readonly status: AgentStatus; readonly step: number }

/** Ticks spent in each status before moving on (shipped is terminal). */
export const STEPS: Record<AgentStatus, number> = { queued: 1, thinking: 3, tool_call: 4, writing: 8, shipped: 0 }
const TOTAL = STEPS.queued + STEPS.thinking + STEPS.tool_call + STEPS.writing

export const initialAgent = (): AgentState => ({ status: "queued", step: 0 })

/** Pure: advance one tick. Never skips or regresses; shipped is a fixed point. */
export function tick(a: AgentState): AgentState {
  if (a.status === "shipped") return a
  if (a.step + 1 < STEPS[a.status]) return { status: a.status, step: a.step + 1 }
  return { status: STATUSES[STATUSES.indexOf(a.status) + 1], step: 0 }
}

/** 0..1 across the whole lifecycle. */
export function progress(a: AgentState): number {
  if (a.status === "shipped") return 1
  let done = a.step
  for (const s of STATUSES) {
    if (s === a.status) break
    done += STEPS[s]
  }
  return done / TOTAL
}
