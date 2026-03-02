import type { OrbState } from "./types"
import { ORB_SPEED, CHAIN_BUFFER } from "./constants"

/* ── Build adjacency: vertex → list of edge indices ─────────────────── */

export function buildAdjacency(edgePairs: Uint32Array, edgeCount: number) {
  const adj: Map<number, number[]> = new Map()
  for (let i = 0; i < edgeCount; i++) {
    const a = edgePairs[i * 2]
    const b = edgePairs[i * 2 + 1]
    if (!adj.has(a)) adj.set(a, [])
    if (!adj.has(b)) adj.set(b, [])
    adj.get(a)!.push(i)
    adj.get(b)!.push(i)
  }
  return adj
}

/* ── Pick a random neighboring edge (avoid backtracking) ──────────── */

export function pickNeighborEdge(
  adjacency: Map<number, number[]>,
  edgePairs: Uint32Array,
  atVertex: number,
  fromEdge: number
): number {
  const edges = adjacency.get(atVertex) || []
  const candidates = edges.filter((e) => e !== fromEdge)
  if (candidates.length > 0)
    return candidates[Math.floor(Math.random() * candidates.length)]
  if (edges.length > 0)
    return edges[Math.floor(Math.random() * edges.length)]
  return -1
}

/* ── Extend a chain by appending more connected edges ─────────────── */

export function extendChain(
  chain: number[],
  chainDirs: boolean[],
  tipVertex: number,
  lastEdge: number,
  target: number,
  adjacency: Map<number, number[]>,
  edgePairs: Uint32Array,
): { tipVertex: number; lastEdge: number } {
  let tip = tipVertex
  let prev = lastEdge

  while (chain.length < target) {
    const nextEdge = pickNeighborEdge(adjacency, edgePairs, tip, prev)
    if (nextEdge < 0) {
      // Dead end — pick any random edge to teleport (rare on brain mesh)
      const randomEdge = Math.floor(Math.random() * (edgePairs.length / 2))
      chain.push(randomEdge)
      const goFwd = Math.random() > 0.5
      chainDirs.push(goFwd)
      tip = goFwd ? edgePairs[randomEdge * 2 + 1] : edgePairs[randomEdge * 2]
      prev = randomEdge
      continue
    }
    chain.push(nextEdge)
    const a = edgePairs[nextEdge * 2]
    const dir = a === tip
    chainDirs.push(dir)
    tip = dir ? edgePairs[nextEdge * 2 + 1] : edgePairs[nextEdge * 2]
    prev = nextEdge
  }

  return { tipVertex: tip, lastEdge: prev }
}

/* ── Build an initial chain from a random start edge ──────────────── */

export function buildInitialChain(
  edgePairs: Uint32Array,
  edgeCount: number,
  adjacency: Map<number, number[]>,
): OrbState {
  const chain: number[] = []
  const chainDirs: boolean[] = []

  const startEdge = Math.floor(Math.random() * edgeCount)
  chain.push(startEdge)
  const goForward = Math.random() > 0.5
  chainDirs.push(goForward)

  let tipVertex = goForward
    ? edgePairs[startEdge * 2 + 1]
    : edgePairs[startEdge * 2]
  let lastEdge = startEdge

  const ext = extendChain(chain, chainDirs, tipVertex, lastEdge, CHAIN_BUFFER, adjacency, edgePairs)

  return {
    chain,
    chainDirs,
    tipVertex: ext.tipVertex,
    lastEdge: ext.lastEdge,
    progress: 0,
    speed: ORB_SPEED * (0.7 + Math.random() * 0.6),
    trimmed: 0,
  }
}
