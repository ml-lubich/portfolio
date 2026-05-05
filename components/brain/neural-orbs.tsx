"use client"

import { useRef, useEffect, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { BrainData } from "./types"
import {
  ORB_COUNT_CAP,
  CHAIN_BUFFER,
  CHAIN_TRIM_BEHIND,
  TRAIL_LENGTH,
  AMBIENT_RAINBOW,
  WHITE_MIX,
  getBrainOrbViewportTier,
  type BrainOrbViewportTier,
} from "./constants"
import { buildAdjacency, buildInitialChain, extendChain } from "./graph-utils"

function hueToRgb(h: number): [number, number, number] {
  h = ((h % 1) + 1) % 1
  const c = 1
  const x = c * (1 - Math.abs((h * 6) % 2 - 1))
  const m = 0
  let r: number
  let g: number
  let b: number
  if (h < 1 / 6) {
    r = c
    g = x
    b = 0
  } else if (h < 2 / 6) {
    r = x
    g = c
    b = 0
  } else if (h < 3 / 6) {
    r = 0
    g = c
    b = x
  } else if (h < 4 / 6) {
    r = 0
    g = x
    b = c
  } else if (h < 5 / 6) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }
  return [r + m, g + m, b + m]
}

export function NeuralOrbs({
  brainData,
  colorAttr,
  orbGeometry,
  orbPositions,
  orbSizes,
  orbColors,
}: {
  brainData: BrainData
  colorAttr: THREE.BufferAttribute
  orbGeometry: THREE.BufferGeometry
  orbPositions: Float32Array
  orbSizes: Float32Array
  orbColors: Float32Array
}) {
  const { edgePairs, edgeCount, vertexPositions } = brainData

  const vertexHues = useMemo(() => {
    const totalVerts = vertexPositions.length / 3
    const hues = new Float32Array(totalVerts)
    let minY = Infinity
    let maxY = -Infinity
    for (let i = 0; i < totalVerts; i++) {
      const y = vertexPositions[i * 3 + 1]
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
    const rangeY = maxY - minY || 1
    for (let i = 0; i < totalVerts; i++) {
      const y = vertexPositions[i * 3 + 1]
      const x = vertexPositions[i * 3]
      hues[i] = ((y - minY) / rangeY + x * 0.15 + 1) % 1
    }
    return hues
  }, [vertexPositions])

  const adjacency = useMemo(
    () => buildAdjacency(edgePairs, edgeCount),
    [edgePairs, edgeCount]
  )

  const initialTier = getBrainOrbViewportTier(
    typeof window !== "undefined" ? window.innerWidth : 1280
  )
  const tierRef = useRef<BrainOrbViewportTier>(initialTier)

  const orbs = useRef(
    Array.from({ length: ORB_COUNT_CAP }, () => {
      const orbState = buildInitialChain(edgePairs, edgeCount, adjacency)
      orbState.progress = Math.random() * 8
      return orbState
    })
  )

  const flickerSeeds = useRef(
    Array.from({ length: ORB_COUNT_CAP }, () => Math.random() * 100)
  )

  const elapsedRef = useRef(0)

  useEffect(() => {
    const onResize = () => {
      const t = getBrainOrbViewportTier(window.innerWidth)
      tierRef.current = t
      orbGeometry.setDrawRange(0, t.activeOrbCount)
    }
    window.addEventListener("resize", onResize, { passive: true })
    return () => window.removeEventListener("resize", onResize)
  }, [orbGeometry])

  useFrame((_state, delta) => {
    elapsedRef.current += delta
    const colors = colorAttr.array as Float32Array
    const t = elapsedRef.current

    const totalEdges = edgeCount
    const amb = AMBIENT_RAINBOW
    const wm = WHITE_MIX
    const slowDrift = t * 0.03
    for (let eIdx = 0; eIdx < totalEdges; eIdx++) {
      const off = eIdx * 6
      const vA = edgePairs[eIdx * 2]
      const vB = edgePairs[eIdx * 2 + 1]
      const hA = (vertexHues[vA] + slowDrift) % 1
      const hB = (vertexHues[vB] + slowDrift) % 1
      const [rA, gA, bA] = hueToRgb(hA)
      const [rB, gB, bB] = hueToRgb(hB)
      colors[off] = (rA * (1 - wm) + wm) * amb
      colors[off + 1] = (gA * (1 - wm) + wm) * amb
      colors[off + 2] = (bA * (1 - wm) + wm) * amb
      colors[off + 3] = (rB * (1 - wm) + wm) * amb
      colors[off + 4] = (gB * (1 - wm) + wm) * amb
      colors[off + 5] = (bB * (1 - wm) + wm) * amb
    }

    const { sizeBase, sizeAmp, trailGlowMul } = tierRef.current
    const nActive = tierRef.current.activeOrbCount

    for (let i = 0; i < nActive; i++) {
      const orb = orbs.current[i]

      orb.progress += orb.speed * delta

      const localProgress = orb.progress - orb.trimmed
      const edgesAhead = orb.chain.length - localProgress
      if (edgesAhead < CHAIN_BUFFER * 0.5) {
        const ext = extendChain(
          orb.chain,
          orb.chainDirs,
          orb.tipVertex,
          orb.lastEdge,
          orb.chain.length + CHAIN_BUFFER,
          adjacency,
          edgePairs
        )
        orb.tipVertex = ext.tipVertex
        orb.lastEdge = ext.lastEdge
      }

      const trimCount = Math.floor(localProgress) - CHAIN_TRIM_BEHIND
      if (trimCount > 0) {
        orb.chain.splice(0, trimCount)
        orb.chainDirs.splice(0, trimCount)
        orb.trimmed += trimCount
      }

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

      orbPositions[i * 3] =
        vertexPositions[startV * 3] * (1 - frac) +
        vertexPositions[endV * 3] * frac
      orbPositions[i * 3 + 1] =
        vertexPositions[startV * 3 + 1] * (1 - frac) +
        vertexPositions[endV * 3 + 1] * frac
      orbPositions[i * 3 + 2] =
        vertexPositions[startV * 3 + 2] * (1 - frac) +
        vertexPositions[endV * 3 + 2] * frac

      orbSizes[i] = sizeBase + sizeAmp * Math.sin(t * 4.0 + i * 2.5)

      const phase = t * 0.3 + i * 1.7
      const base = 0.5 + 0.1 * Math.sin(phase)
      orbColors[i * 3] = base * 0.4
      orbColors[i * 3 + 1] = base * 0.75
      orbColors[i * 3 + 2] = base + 0.25

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

        const g = trailGlowMul
        colors[off] = Math.min(1, colors[off] + g * (0.3 + 0.7 * hotA) * wA)
        colors[off + 1] = Math.min(
          1,
          colors[off + 1] + g * (0.6 + 0.4 * hotA) * wA
        )
        colors[off + 2] = Math.min(1, colors[off + 2] + g * 1.0 * wA)
        colors[off + 3] = Math.min(1, colors[off + 3] + g * (0.3 + 0.7 * hotB) * wB)
        colors[off + 4] = Math.min(
          1,
          colors[off + 4] + g * (0.6 + 0.4 * hotB) * wB
        )
        colors[off + 5] = Math.min(1, colors[off + 5] + g * 1.0 * wB)
      }
    }

    colorAttr.needsUpdate = true

    const pa = orbGeometry.getAttribute("position") as THREE.BufferAttribute
    const sa = orbGeometry.getAttribute("size") as THREE.BufferAttribute
    const ca = orbGeometry.getAttribute("color") as THREE.BufferAttribute
    if (pa) pa.needsUpdate = true
    if (sa) sa.needsUpdate = true
    if (ca) ca.needsUpdate = true
  })

  return null
}
