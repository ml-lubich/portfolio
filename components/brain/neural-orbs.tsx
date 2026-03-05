"use client"

import { useRef, useEffect, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { BrainData } from "./types"
import { ORB_COUNT, CHAIN_BUFFER, CHAIN_TRIM_BEHIND, TRAIL_LENGTH, AMBIENT_RAINBOW, WHITE_MIX } from "./constants"
import { buildAdjacency, buildInitialChain, extendChain } from "./graph-utils"

/* ── HSL → RGB (s=1, l=0.5 → pure rainbow) ───────────────────────── */
function hueToRgb(h: number): [number, number, number] {
  h = ((h % 1) + 1) % 1
  const c = 1, x = c * (1 - Math.abs((h * 6) % 2 - 1)), m = 0
  let r: number, g: number, b: number
  if (h < 1 / 6)      { r = c; g = x; b = 0 }
  else if (h < 2 / 6) { r = x; g = c; b = 0 }
  else if (h < 3 / 6) { r = 0; g = c; b = x }
  else if (h < 4 / 6) { r = 0; g = x; b = c }
  else if (h < 5 / 6) { r = x; g = 0; b = c }
  else                 { r = c; g = 0; b = x }
  return [r + m, g + m, b + m]
}

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

  // Pre-compute a per-vertex rainbow hue based on spatial position
  // so the ENTIRE brain always glows as a continuous spectrum
  const vertexHues = useMemo(() => {
    const totalVerts = vertexPositions.length / 3
    const hues = new Float32Array(totalVerts)
    // Find Y bounds for normalisation
    let minY = Infinity, maxY = -Infinity
    for (let i = 0; i < totalVerts; i++) {
      const y = vertexPositions[i * 3 + 1]
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
    const rangeY = maxY - minY || 1
    for (let i = 0; i < totalVerts; i++) {
      const y = vertexPositions[i * 3 + 1]
      const x = vertexPositions[i * 3]
      // Combine Y (main axis) with a bit of X for variety
      hues[i] = ((y - minY) / rangeY + x * 0.15 + 1) % 1
    }
    return hues
  }, [vertexPositions])

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

  // Orb position + size + color buffers
  const orbPositions = useMemo(() => new Float32Array(ORB_COUNT * 3), [])
  const orbSizes = useMemo(() => new Float32Array(ORB_COUNT), [])
  const orbColors = useMemo(() => new Float32Array(ORB_COUNT * 3), [])

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
    orbGeoRef.current.setAttribute(
      "color", new THREE.BufferAttribute(orbColors, 3)
    )
  }, [orbGeoRef, orbPositions, orbSizes, orbColors])

  useFrame((_state, delta) => {
    elapsedRef.current += delta
    const colors = colorAttr.array as Float32Array
    const t = elapsedRef.current

    // Reset ALL edges to a dim mostly-white ambient base with subtle rainbow tint
    const totalEdges = edgeCount
    const amb = AMBIENT_RAINBOW
    const wm = WHITE_MIX
    const slowDrift = t * 0.03  // slow hue drift keeps it alive
    for (let eIdx = 0; eIdx < totalEdges; eIdx++) {
      const off = eIdx * 6
      const vA = edgePairs[eIdx * 2]
      const vB = edgePairs[eIdx * 2 + 1]
      const hA = (vertexHues[vA] + slowDrift) % 1
      const hB = (vertexHues[vB] + slowDrift) % 1
      const [rA, gA, bA] = hueToRgb(hA)
      const [rB, gB, bB] = hueToRgb(hB)
      // Mix rainbow toward white, then apply ambient intensity
      colors[off]     = (rA * (1 - wm) + wm) * amb
      colors[off + 1] = (gA * (1 - wm) + wm) * amb
      colors[off + 2] = (bA * (1 - wm) + wm) * amb
      colors[off + 3] = (rB * (1 - wm) + wm) * amb
      colors[off + 4] = (gB * (1 - wm) + wm) * amb
      colors[off + 5] = (bB * (1 - wm) + wm) * amb
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

      orbSizes[i] = 0.20 + 0.03 * Math.sin(t * 4.0 + i * 2.5)

      // Blue-tinted orb color
      const phase = t * 0.3 + i * 1.7
      const base = 0.50 + 0.10 * Math.sin(phase)
      const cr = base * 0.4               // low red
      const cg = base * 0.75              // medium green
      const cb = base + 0.25              // strong blue
      orbColors[i * 3] = cr
      orbColors[i * 3 + 1] = cg
      orbColors[i * 3 + 2] = cb

      // Energy trail on visible chain edges (continuous glow along wireframe)
      const flicker = 0.96 + 0.04 * Math.sin(t * 3.5 + flickerSeeds.current[i])

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

        // Tight glow around the orb head, minimal trail
        let wA = Math.exp(-absA * absA * 12.0)
        let wB = Math.exp(-absB * absB * 12.0)
        if (dA > 0) wA += Math.exp(-dA * 1.8) * 0.35
        if (dB > 0) wB += Math.exp(-dB * 1.8) * 0.35
        if (dA < 0) wA += Math.exp(-absA * 6.0) * 0.15
        if (dB < 0) wB += Math.exp(-absB * 6.0) * 0.15
        wA = Math.min(1, wA * flicker)
        wB = Math.min(1, wB * flicker)

        if (wA < 0.005 && wB < 0.005) continue

        const hotA = Math.exp(-absA * 3.0)
        const hotB = Math.exp(-absB * 3.0)

        colors[off]     = Math.min(1, colors[off]     + (0.3 + 0.7 * hotA) * wA)
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
      const ca = orbGeoRef.current.getAttribute("color") as THREE.BufferAttribute
      if (pa) pa.needsUpdate = true
      if (sa) sa.needsUpdate = true
      if (ca) ca.needsUpdate = true
    }
  })

  return null
}
