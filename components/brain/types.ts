import * as THREE from "three"

/* ── Brain data types ─────────────────────────────────────────────── */

export interface BrainData {
  positions: Float32Array      // flat line-segment positions for wireframe
  indices: Uint32Array
  vertexPositions: Float32Array // original per-vertex positions (x,y,z)
  edgePairs: Uint32Array        // original edge index pairs [a0,b0,a1,b1,...]
  edgeCount: number
}

/* ── Pull-to-deform uniforms ──────────────────────────────────────── */

export interface PullUniforms {
  uPullPoint: { value: THREE.Vector3 }
  uPullStrength: { value: number }
  uPullRadius: { value: number }
}

/* ── Neural orb state ─────────────────────────────────────────────── */

export interface OrbState {
  chain: number[]         // edge indices forming the path
  chainDirs: boolean[]    // direction per edge in chain
  tipVertex: number       // current vertex at the end of the chain
  lastEdge: number        // last edge in chain (for neighbor selection)
  progress: number        // fractional position along chain (0 = start of chain[0])
  speed: number
  trimmed: number         // how many edges have been trimmed from the start (offset)
}
