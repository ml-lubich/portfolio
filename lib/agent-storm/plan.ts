import { mulberry32, pick, shuffle } from "./prng"
import type { AgentStatus } from "./machine"

export const ARTIFACT_KINDS = [
  "generative-art", "snake", "clock", "terminal", "fireworks", "sorting",
  "pomodoro", "palette", "bar-dashboard", "loaders", "synth", "pixel-editor",
] as const
export type ArtifactKind = (typeof ARTIFACT_KINDS)[number]

export type PlannedAgent = { name: string; role: string; kind: ArtifactKind; seed: number }

const ROLES = ["planner", "scout", "builder", "reviewer", "ux-agent", "scout", "builder", "tester", "scribe", "builder", "scout", "critic"]

/** Deterministic fleet: n agents, unique names, unique kinds until the pool runs out. */
export function planStorm(seed: number, n: number): PlannedAgent[] {
  if (n <= 0) return []
  const rnd = mulberry32(seed)
  const roles = shuffle(ROLES, rnd)
  const uses = new Map<string, number>()
  const total = new Map<string, number>()
  for (let i = 0; i < n; i++) {
    const r = roles[i % roles.length]
    total.set(r, (total.get(r) ?? 0) + 1)
  }
  let kinds: ArtifactKind[] = []
  const out: PlannedAgent[] = []
  for (let i = 0; i < n; i++) {
    if (kinds.length === 0) kinds = shuffle(ARTIFACT_KINDS, rnd)
    const role = roles[i % roles.length]
    const k = (uses.get(role) ?? 0) + 1
    uses.set(role, k)
    // Repeated roles get a numeric suffix; names stay unique even past one lap of ROLES.
    const name = total.get(role)! > 1 || i >= roles.length ? `${role}-${k}` : role
    out.push({ name, role, kind: kinds.pop()!, seed: Math.floor(rnd() * 0xffffffff) + i })
  }
  return out
}

const FILES = ["index.html", "style.css", "main.js", "palette.json", "README.md", "sprites.txt", "tokens.css"]
const CMDS = ["bun run lint", "bun test", "ls -la", "git status", "grep -rn TODO .", "node build.js", "cat notes.md"]
const THOUGHTS = ["picking a shape", "avoiding a framework", "keeping it under 12kb", "deciding how fancy", "naming things is hard", "opening with the fun part"]
const EDITS = ["fix off-by-one", "make it 12% more fun", "add the part I forgot", "delete 40 lines", "rename tmp2 to tmp"]
const WRITES = ["wiring up the loop", "painting pixels", "adding a tiny bug on purpose, then removing it", "polishing easing", "one more div won't hurt"]

/** One plausible, deterministic log line for an agent at a status and step. */
export function logLine(a: PlannedAgent, status: AgentStatus, step: number): string {
  const rnd = mulberry32(a.seed + step * 7919 + status.length * 104729)
  switch (status) {
    case "queued":
      return `${a.name} waiting for a slot`
    case "thinking":
      return `thinking: ${pick(THOUGHTS, rnd)}`
    case "tool_call": {
      const tool = pick(["Read", "Write", "Bash", "Edit", "Grep"] as const, rnd)
      if (tool === "Bash") return `Bash("${pick(CMDS, rnd)}")`
      if (tool === "Edit") return `Edit("${pick(FILES, rnd)}", "${pick(EDITS, rnd)}")`
      return `${tool}("${pick(FILES, rnd)}")`
    }
    case "writing":
      return `writing ${a.kind}: ${pick(WRITES, rnd)}`
    case "shipped":
      return `shipped ${a.kind}`
  }
}
