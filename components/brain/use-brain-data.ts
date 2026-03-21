import { useState, useEffect } from "react"
import * as THREE from "three"
import type { BrainData } from "./types"

/* ── Fetch + parse brain.bin ──────────────────────────────────────── */

async function loadBrainBin(): Promise<BrainData> {
  const resp = await fetch("/brain.bin")
  const buf = await resp.arrayBuffer()
  const view = new DataView(buf)

  const vertCount = view.getUint32(0, true)
  const edgeCount = view.getUint32(4, true)

  const posOff = 8
  const positions = new Float32Array(buf, posOff, vertCount * 3)

  const edgeOff = posOff + vertCount * 3 * 4
  const linePositions = new Float32Array(edgeCount * 2 * 3)
  const edgePairs = new Uint32Array(edgeCount * 2)

  for (let i = 0; i < edgeCount; i++) {
    const a = view.getUint32(edgeOff + i * 8, true)
    const b = view.getUint32(edgeOff + i * 8 + 4, true)
    edgePairs[i * 2] = a
    edgePairs[i * 2 + 1] = b
    linePositions[i * 6] = positions[a * 3]
    linePositions[i * 6 + 1] = positions[a * 3 + 1]
    linePositions[i * 6 + 2] = positions[a * 3 + 2]
    linePositions[i * 6 + 3] = positions[b * 3]
    linePositions[i * 6 + 4] = positions[b * 3 + 1]
    linePositions[i * 6 + 5] = positions[b * 3 + 2]
  }

  // Copy vertex positions so we keep them after the ArrayBuffer detaches
  const vertexPositions = new Float32Array(positions.length)
  vertexPositions.set(positions)

  return {
    positions: linePositions,
    indices: new Uint32Array(0),
    vertexPositions,
    edgePairs,
    edgeCount,
  }
}

/** Single in-flight fetch so Canvas shell and wireframe share one network + parse pass. */
let brainBinPromise: Promise<BrainData> | null = null

export function getBrainBinPromise(): Promise<BrainData> {
  if (!brainBinPromise) {
    brainBinPromise = loadBrainBin().catch((err) => {
      brainBinPromise = null
      throw err
    })
  }
  return brainBinPromise
}

/* ── React hook to load brain data ────────────────────────────────── */

export function useBrainData() {
  const [result, setResult] = useState<{
    geo: THREE.BufferGeometry
    brainData: BrainData
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    getBrainBinPromise().then((data) => {
      if (cancelled) return
      const g = new THREE.BufferGeometry()
      g.setAttribute("position", new THREE.BufferAttribute(data.positions, 3))
      setResult({ geo: g, brainData: data })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return result
}
