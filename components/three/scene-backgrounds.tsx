"use client"

import React, { useRef, Suspense, Component, useMemo, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

/* ══════════════════════════════════════════════════════════════════════
 *  Reusable 3D background animations for portfolio sections.
 *
 *  All share:
 *    - Transparent backgrounds (overlay on top of section content)
 *    - pointer-events-none so they don't block clicks
 *    - WebGL error boundary for graceful fallback
 *    - Theme-consistent colors (primary blue, accent purple)
 *
 *  Components:
 *    <ParticleField />  — Drifting particles with connecting lines
 *    <GridWave />       — Perspective grid with animated wave
 * ══════════════════════════════════════════════════════════════════════ */

/* ── Shared error boundary ─────────────────────────────────────────── */
class SceneBoundary extends Component<
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
  componentDidCatch() {
    // Swallowed — hasError state handles the fallback UI
  }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

/* ── Shared Canvas wrapper — pauses render loop when off-screen ───── */
function SceneCanvas({
  children,
  className = "",
  camera,
}: {
  children: ReactNode
  className?: string
  camera?: { position: [number, number, number]; fov: number }
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "100px" },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <SceneBoundary>
      <div ref={wrapperRef} className={`pointer-events-none absolute inset-0 ${className}`}>
        {visible && (
          <Canvas
            camera={camera ?? { position: [0, 0, 5], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{
              antialias: false,
              alpha: true,
              powerPreference: "high-performance",
            }}
            style={{ background: "transparent" }}
            onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          >
            <Suspense fallback={null}>{children}</Suspense>
          </Canvas>
        )}
      </div>
    </SceneBoundary>
  )
}

/* ══════════════════════════════════════════════════════════════════════
 *  1. ParticleField — Drifting particles with glowing connections
 *     Perfect for: About, Journey sections
 * ══════════════════════════════════════════════════════════════════════ */

const PARTICLE_COUNT = 60
const CONNECTION_DIST = 1.8

function ParticleFieldScene({
  color = "#3b82f6",
  speed = 0.15,
}: {
  color?: string
  speed?: number
}) {
  const pointsRef = useRef<THREE.Points>(null!)
  const linesRef = useRef<THREE.LineSegments>(null!)

  // Initial particle positions + velocities
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    const vel = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4
      vel[i * 3] = (Math.random() - 0.5) * speed
      vel[i * 3 + 1] = (Math.random() - 0.5) * speed
      vel[i * 3 + 2] = (Math.random() - 0.5) * speed * 0.5
    }
    return { positions: pos, velocities: vel }
  }, [speed])

  // Pre-allocate line buffer (max connections)
  const maxLines = PARTICLE_COUNT * 6
  const linePositions = useMemo(() => new Float32Array(maxLines * 6), [maxLines])
  const lineColors = useMemo(() => new Float32Array(maxLines * 6), [maxLines])

  const pointGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(linePositions, 3))
    g.setAttribute("color", new THREE.BufferAttribute(lineColors, 3))
    g.setDrawRange(0, 0)
    return g
  }, [linePositions, lineColors])

  const col = useMemo(() => new THREE.Color(color), [color])

  const pointMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: col,
        size: 0.06,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [col],
  )

  const lineMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  useFrame((_, delta) => {
    // Move particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = 0; j < 3; j++) {
        positions[i * 3 + j] += velocities[i * 3 + j] * delta
      }
      // Wrap around
      if (positions[i * 3] > 4) positions[i * 3] = -4
      if (positions[i * 3] < -4) positions[i * 3] = 4
      if (positions[i * 3 + 1] > 2.5) positions[i * 3 + 1] = -2.5
      if (positions[i * 3 + 1] < -2.5) positions[i * 3 + 1] = 2.5
      if (positions[i * 3 + 2] > 2) positions[i * 3 + 2] = -2
      if (positions[i * 3 + 2] < -2) positions[i * 3 + 2] = 2
    }

    // Build connections
    let lineIdx = 0
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let k = i + 1; k < PARTICLE_COUNT; k++) {
        const dx = positions[i * 3] - positions[k * 3]
        const dy = positions[i * 3 + 1] - positions[k * 3 + 1]
        const dz = positions[i * 3 + 2] - positions[k * 3 + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < CONNECTION_DIST && lineIdx < maxLines) {
          const alpha = 1 - dist / CONNECTION_DIST
          const off = lineIdx * 6
          linePositions[off] = positions[i * 3]
          linePositions[off + 1] = positions[i * 3 + 1]
          linePositions[off + 2] = positions[i * 3 + 2]
          linePositions[off + 3] = positions[k * 3]
          linePositions[off + 4] = positions[k * 3 + 1]
          linePositions[off + 5] = positions[k * 3 + 2]
          lineColors[off] = col.r * alpha
          lineColors[off + 1] = col.g * alpha
          lineColors[off + 2] = col.b * alpha
          lineColors[off + 3] = col.r * alpha
          lineColors[off + 4] = col.g * alpha
          lineColors[off + 5] = col.b * alpha
          lineIdx++
        }
      }
    }

    lineGeo.setDrawRange(0, lineIdx * 2)
      ; (lineGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true
      ; (lineGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true
      ; (pointGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true
  })

  return (
    <>
      <points ref={pointsRef} geometry={pointGeo} material={pointMat} />
      <lineSegments ref={linesRef} geometry={lineGeo} material={lineMat} />
    </>
  )
}

export function ParticleField({
  className = "",
  color = "#3b82f6",
  speed = 0.15,
}: {
  className?: string
  color?: string
  speed?: number
}) {
  return (
    <SceneCanvas className={className}>
      <ParticleFieldScene color={color} speed={speed} />
    </SceneCanvas>
  )
}

/* ══════════════════════════════════════════════════════════════════════
 *  2. GridWave — Perspective grid plane with sine-wave distortion
 *     Perfect for: Projects section (techy / cyberpunk feel)
 * ══════════════════════════════════════════════════════════════════════ */

function GridWaveScene({
  color = "#3b82f6",
  accentColor = "#8b5cf6",
}: {
  color?: string
  accentColor?: string
}) {
  const meshRef = useRef<THREE.Mesh>(null!)

  const { geometry, colorAttr } = useMemo(() => {
    const segsX = 48
    const segsZ = 48
    const geo = new THREE.PlaneGeometry(12, 12, segsX, segsZ)
    geo.rotateX(-Math.PI * 0.45)
    // Color buffer
    const count = geo.attributes.position.count
    const colors = new Float32Array(count * 3)
    const cAttr = new THREE.BufferAttribute(colors, 3)
    geo.setAttribute("color", cAttr)
    return { geometry: geo, colorAttr: cAttr }
  }, [])

  const col1 = useMemo(() => new THREE.Color(color), [color])
  const col2 = useMemo(() => new THREE.Color(accentColor), [accentColor])

  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const pos = geometry.attributes.position as THREE.BufferAttribute
    const colors = colorAttr.array as Float32Array
    const count = pos.count

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)

      // Multi-wave distortion
      const wave =
        Math.sin(x * 0.8 + t * 0.6) * 0.3 +
        Math.sin(z * 0.6 + t * 0.4) * 0.25 +
        Math.sin((x + z) * 0.5 + t * 0.8) * 0.15

      pos.setY(i, wave)

      // Color: blend primary→accent based on height
      const blend = (wave + 0.7) / 1.4
      const r = col1.r * (1 - blend) + col2.r * blend
      const g = col1.g * (1 - blend) + col2.g * blend
      const b = col1.b * (1 - blend) + col2.b * blend
      colors[i * 3] = r
      colors[i * 3 + 1] = g
      colors[i * 3 + 2] = b
    }

    pos.needsUpdate = true
    colorAttr.needsUpdate = true
  })

  return <mesh ref={meshRef} geometry={geometry} material={mat} position={[0, -1, 0]} />
}

export function GridWave({
  className = "",
  color = "#3b82f6",
  accentColor = "#8b5cf6",
}: {
  className?: string
  color?: string
  accentColor?: string
}) {
  return (
    <SceneCanvas className={className} camera={{ position: [0, 2, 6], fov: 50 }}>
      <GridWaveScene color={color} accentColor={accentColor} />
    </SceneCanvas>
  )
}


