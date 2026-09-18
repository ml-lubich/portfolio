/** Predetermined agent-build sequences. Order/timing are shuffled at trigger. */

export type BuildPiece = {
  id: string
  label: string
  agent: string
  /** Viewport % for the finished piece (0–100). */
  x: number
  y: number
}

export const BUILD_SEQUENCES: readonly BuildPiece[][] = [
  [
    { id: "nav-pill", label: "Nav pill", agent: "agent-nav", x: 12, y: 8 },
    { id: "cta-row", label: "CTA row", agent: "agent-cta", x: 48, y: 72 },
    { id: "stat-tile", label: "Stat tile", agent: "agent-stats", x: 78, y: 18 },
  ],
  [
    { id: "card-shell", label: "Card shell", agent: "agent-ui", x: 22, y: 40 },
    { id: "metric", label: "Metric", agent: "agent-data", x: 55, y: 36 },
    { id: "chip", label: "Tag chip", agent: "agent-ui", x: 70, y: 48 },
  ],
  [
    { id: "orbit", label: "Tech orbit", agent: "agent-3d", x: 85, y: 55 },
    { id: "terminal", label: "Terminal", agent: "agent-cli", x: 18, y: 62 },
    { id: "badge", label: "Role badge", agent: "agent-copy", x: 42, y: 14 },
  ],
  [
    { id: "marquee", label: "Logo rail", agent: "agent-motion", x: 50, y: 88 },
    { id: "portrait", label: "Portrait frame", agent: "agent-media", x: 30, y: 28 },
    { id: "rule", label: "Accent rule", agent: "agent-ui", x: 60, y: 24 },
  ],
]

export function shuffleOrder<T>(items: readonly T[], seed: number): T[] {
  const out = [...items]
  let s = seed >>> 0
  for (let i = out.length - 1; i > 0; i -= 1) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    const j = s % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function flatBuildQueue(seed: number): BuildPiece[] {
  const seqs = shuffleOrder(BUILD_SEQUENCES, seed)
  return seqs.flatMap((seq, i) => shuffleOrder(seq, seed + i * 17))
}

export const AGENTS_TRIGGER = "agents"

/* ── Agent storm ──────────────────────────────────────────────────
   The bigger sibling of the build egg: a whole fleet lands at once and keeps
   spawning. Typed anywhere ("storm"), via #storm, or from MLBot ("agent
   storm"), which fires AGENT_STORM_EVENT on window. */
export const STORM_TRIGGER = "storm"
export const AGENT_STORM_EVENT = "mlubich:agent-storm"
export const STORM_AGENT_COUNT = 28

export function isAgentStormAsk(text: string): boolean {
  return /^\s*(?:unleash\s+|start\s+|run\s+)?(?:an?\s+)?agent[\s-]*storm\s*[!.?]*\s*$/i.test(text)
}

const STORM_AGENTS = [
  "agent-nav", "agent-cta", "agent-stats", "agent-ui", "agent-data", "agent-3d",
  "agent-cli", "agent-copy", "agent-motion", "agent-media", "agent-eval", "agent-rag",
  "agent-infra", "agent-tests", "agent-a11y", "agent-seo", "agent-perf", "agent-ship",
] as const

const STORM_LABELS = [
  "Nav pill", "CTA row", "Stat tile", "Card shell", "Metric", "Tag chip", "Tech orbit",
  "Terminal", "Role badge", "Logo rail", "Portrait frame", "Accent rule", "Eval harness",
  "Vector index", "MCP server", "Retry policy", "Rate limiter", "Trace span", "Cron job",
  "Webhook", "Prompt cache", "Type guard", "Skeleton loader", "Focus ring", "Sitemap",
  "OG image", "Deploy gate", "Feature flag",
] as const

/** A shuffled fleet: every label once, agents cycling, positions spread over
 *  the viewport with a margin so nothing lands under the nav or the chat FAB. */
export function stormQueue(seed: number, count = STORM_AGENT_COUNT): BuildPiece[] {
  let s = seed >>> 0
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0x1_0000_0000
  }
  const labels = shuffleOrder(STORM_LABELS, seed)
  return Array.from({ length: Math.min(count, labels.length) }, (_, i) => ({
    id: `storm-${i}-${labels[i].toLowerCase().replace(/\s+/g, "-")}`,
    label: labels[i],
    agent: STORM_AGENTS[(i + (seed % STORM_AGENTS.length)) % STORM_AGENTS.length],
    x: 8 + Math.round(rnd() * 84),
    y: 14 + Math.round(rnd() * 70),
  }))
}
