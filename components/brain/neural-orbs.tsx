"use client"

import { useRef, useEffect, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { BrainData } from "./types"
import { ORB_COUNT, CHAIN_BUFFER, CHAIN_TRIM_BEHIND, TRAIL_LENGTH } from "./constants"
import { buildAdjacency, buildInitialChain, extendChain } from "./graph-utils"

/* ──────────────────────────────────────────────────────────────────────
 *  NeuralOrbs — Glowing orbs that continuously travel connected edges,
 *  lighting up an energy trail behind them. Orbs NEVER despawn — when
 *  they near the end of their chain, more edges are appended.
 * ────────────────────────────────────────────────────────────────────── */

export function NeuralOrbs({
  brainData,
  colorAttr,
  orbGeoRef,
}: {
  brainData: BrainData
  colorAttr: THREE.BufferAttribute
  orbGeoRef: React.MutableRefObject<THREE.BufferGeometry>
}) {
  const { edgePairs, edgeCount, vertexPositions } = brainData

  const adjacency = useMemo(
    () => buildAdjacency(edgePairs, edgeCount),
    [edgePairs, edgeCount]
  )

  // Orb pool — all continuously traveling, never despawning
  const orbs = useRef(
    Array.from({ length: ORB_COUNT }, () => {
      const orbState = buildInitialChain(edgePairs, edgeCount, adjacency)
      orbState.progress = Math.random() * 8  // stagger start
      return orbState
    })
  )

  // Orb position + size buffers
  const orbPositions = useMemo(() => new Float32Array(ORB_COUNT * 3), [])
  const orbSizes = useMemo(() => new Float32Array(ORB_COUNT), [])

  // Flicker seeds
  const flickerSeeds = useRef(
    Array.from({ length: ORB_COUNT }, () => Math.random() * 100)
  )

  // Accumulated elapsed time (avoids deprecated THREE.Clock)
  const elapsedRef = useRef(0)

  // Set attributes imperatively
  useEffect(() => {
    if (!orbGeoRef.current) return
    orbGeoRef.current.setAttribute(
      "position", new THREE.BufferAttribute(orbPositions, 3)
    )
    orbGeoRef.current.setAttribute(
      "size", new THREE.BufferAttribute(orbSizes, 1)
    )
  }, [orbGeoRef, orbPositions, orbSizes])

  useFrame((_state, delta) => {
    elapsedRef.current += delta
    const colors = colorAttr.array as Float32Array
    const t = elapsedRef.current

    // Clear only edges used by active orbs (efficient)
    const dirtyEdges = new Set<number>()
    for (const orb of orbs.current) {
      for (const eIdx of orb.chain) dirtyEdges.add(eIdx)
    }
    for (const eIdx of dirtyEdges) {
      const off = eIdx * 6
      colors[off] = 0; colors[off + 1] = 0; colors[off + 2] = 0
      colors[off + 3] = 0; colors[off + 4] = 0; colors[off + 5] = 0
    }

    // Update each orb
    for (let i = 0; i < ORB_COUNT; i++) {
      const orb = orbs.current[i]

      orb.progress += orb.speed * delta

      // Extend chain ahead if needed
      const localProgress = orb.progress - orb.trimmed
      const edgesAhead = orb.chain.length - localProgress
      if (edgesAhead < CHAIN_BUFFER * 0.5) {
        const ext = extendChain(
          orb.chain, orb.chainDirs,
          orb.tipVertex, orb.lastEdge,
          orb.chain.length + CHAIN_BUFFER,
          adjacency, edgePairs
        )
        orb.tipVertex = ext.tipVertex
        orb.lastEdge = ext.lastEdge
      }

      // Trim old edges to keep memory bounded
      const trimCount = Math.floor(localProgress) - CHAIN_TRIM_BEHIND
      if (trimCount > 0) {
        orb.chain.splice(0, trimCount)
        orb.chainDirs.splice(0, trimCount)
        orb.trimmed += trimCount
      }

      // Compute orb 3D position (lerp along current edge)
      const lp = orb.progress - orb.trimmed
      const clampedP = Math.max(0, Math.min(lp, orb.chain.length - 0.001))
      const edgeIdx = Math.min(Math.floor(clampedP), orb.chain.length - 1)
      const frac = clampedP - edgeIdx

      const eIdx = orb.chain[edgeIdx]
      const isForward = orb.chainDirs[edgeIdx]
      const aVert = edgePairs[eIdx * 2]
      const bVert = edgePairs[eIdx * 2 + 1]
      const startV = isForward ? aVert : bVert
      const endV = isForward ? bVert : aVert

      orbPositions[i * 3] = vertexPositions[startV * 3] * (1 - frac) + vertexPositions[endV * 3] * frac
      orbPositions[i * 3 + 1] = vertexPositions[startV * 3 + 1] * (1 - frac) + vertexPositions[endV * 3 + 1] * frac
      orbPositions[i * 3 + 2] = vertexPositions[startV * 3 + 2] * (1 - frac) + vertexPositions[endV * 3 + 2] * frac

      orbSizes[i] = 0.45 + 0.06 * Math.sin(t * 4.0 + i * 2.5)

      // Energy trail on visible chain edges
      const flicker = 0.92 + 0.08 * Math.sin(t * 14 + flickerSeeds.current[i])

      for (let e = 0; e < orb.chain.length; e++) {
        const chainEdge = orb.chain[e]
        const off = chainEdge * 6
        const fwd = orb.chainDirs[e]

        const globalE = e + orb.trimmed
        const posA = fwd ? globalE : globalE + 1
        const posB = fwd ? globalE + 1 : globalE

        const dA = orb.progress - posA
        const dB = orb.progress - posB

        if (dA < -0.5 && dB < -0.5) continue
        if (dA > TRAIL_LENGTH + 1 && dB > TRAIL_LENGTH + 1) continue

        const absA = Math.abs(dA)
        const absB = Math.abs(dB)

        let wA = Math.exp(-absA * absA * 4.0)
        let wB = Math.exp(-absB * absB * 4.0)
        if (dA > 0) wA += Math.exp(-dA * 0.8) * 0.45
        if (dB > 0) wB += Math.exp(-dB * 0.8) * 0.45
        if (dA < 0) wA += Math.exp(-absA * 6.0) * 0.2
        if (dB < 0) wB += Math.exp(-absB * 6.0) * 0.2
        wA = Math.min(1, wA * flicker)
        wB = Math.min(1, wB * flicker)

        if (wA < 0.005 && wB < 0.005) continue

        const hotA = Math.exp(-absA * 3.0)
        const hotB = Math.exp(-absB * 3.0)

        colors[off] = Math.min(1, colors[off] + (0.3 + 0.7 * hotA) * wA)
        colors[off + 1] = Math.min(1, colors[off + 1] + (0.6 + 0.4 * hotA) * wA)
        colors[off + 2] = Math.min(1, colors[off + 2] + 1.0 * wA)
        colors[off + 3] = Math.min(1, colors[off + 3] + (0.3 + 0.7 * hotB) * wB)
        colors[off + 4] = Math.min(1, colors[off + 4] + (0.6 + 0.4 * hotB) * wB)
        colors[off + 5] = Math.min(1, colors[off + 5] + 1.0 * wB)
      }
    }

    colorAttr.needsUpdate = true

    if (orbGeoRef.current) {
      const pa = orbGeoRef.current.getAttribute("position") as THREE.BufferAttribute
      const sa = orbGeoRef.current.getAttribute("size") as THREE.BufferAttribute
      if (pa) pa.needsUpdate = true
      if (sa) sa.needsUpdate = true
    }
  })

  return null
}
