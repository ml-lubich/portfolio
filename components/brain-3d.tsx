"use client"

import React, { useRef, useState, useEffect, Suspense, Component } from "react"
import type { ReactNode } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

/* ── Error boundary — keeps WebGL crashes from nuking the page ───── */
class WebGLErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error) {
    console.warn("[Brain3D] WebGL error caught:", error.message)
  }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

/* ──────────────────────────────────────────────────────────────────────
 *  Real brain wireframe loaded from /brain.bin (extracted from
 *  brain-andre.obj via scripts/pack-brain.js).
 *
 *  Binary format:
 *    [4B] uint32 vertexCount
 *    [4B] uint32 edgeCount
 *    [vertexCount*3*4B] float32 positions (centered, normalized)
 *    [edgeCount*2*4B]   uint32  edge index pairs
 *
 *  Rendered as THREE.LineSegments — clean wireframe, slowly rotating.
 * ────────────────────────────────────────────────────────────────────── */

interface BrainData {
  positions: Float32Array
  indices: Uint32Array
}

/* ── Fetch + parse brain.bin ───────────────────────────────────────── */
async function loadBrainBin(): Promise<BrainData> {
  const resp = await fetch("/brain.bin")
  const buf = await resp.arrayBuffer()
  const view = new DataView(buf)

  const vertCount = view.getUint32(0, true)
  const edgeCount = view.getUint32(4, true)

  const posOff = 8
  const positions = new Float32Array(buf, posOff, vertCount * 3)

  // LineSegments needs 2 vertices per edge (6 floats).
  // We expand the indexed edges into a flat position buffer.
  const edgeOff = posOff + vertCount * 3 * 4
  const linePositions = new Float32Array(edgeCount * 2 * 3)

  for (let i = 0; i < edgeCount; i++) {
    const a = view.getUint32(edgeOff + i * 8, true)
    const b = view.getUint32(edgeOff + i * 8 + 4, true)
    linePositions[i * 6] = positions[a * 3]
    linePositions[i * 6 + 1] = positions[a * 3 + 1]
    linePositions[i * 6 + 2] = positions[a * 3 + 2]
    linePositions[i * 6 + 3] = positions[b * 3]
    linePositions[i * 6 + 4] = positions[b * 3 + 1]
    linePositions[i * 6 + 5] = positions[b * 3 + 2]
  }

  return { positions: linePositions, indices: new Uint32Array(0) }
}

/* ── React hook to load data ───────────────────────────────────────── */
function useBrainData() {
  const [geo, setGeo] = useState<THREE.BufferGeometry | null>(null)

  useEffect(() => {
    let cancelled = false
    loadBrainBin().then((data) => {
      if (cancelled) return
      const g = new THREE.BufferGeometry()
      g.setAttribute("position", new THREE.BufferAttribute(data.positions, 3))
      setGeo(g)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return geo
}

/* ── Rotating wireframe brain ──────────────────────────────────────── */
function BrainWireframe() {
  const groupRef = useRef<THREE.Group>(null!)
  const geo = useBrainData()

  const material = React.useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: 0x3baaff,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      }),
    []
  )

  const glowMaterial = React.useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: 0x6dcfff,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      }),
    []
  )

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15
    }
  })

  if (!geo) return null

  return (
    <group ref={groupRef} scale={0.8}>
      <group rotation={[-Math.PI * 0.35, 0, 0]}>
        <lineSegments geometry={geo} material={material} />
        <lineSegments geometry={geo} material={glowMaterial} scale={1.02} />
      </group>
    </group>
  )
}

/* ── Exported wrapper with error boundary ──────────────────────────── */
export function Brain3D({ className = "" }: { className?: string }) {
  return (
    <WebGLErrorBoundary>
      <div className={`pointer-events-none w-full h-full ${className}`}>
        <Canvas
          camera={{ position: [0, 0, 3.5], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          style={{ background: "transparent" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
          }}
        >
          <Suspense fallback={null}>
            <BrainWireframe />
          </Suspense>
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  )
}
