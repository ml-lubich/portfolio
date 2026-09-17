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
