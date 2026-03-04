"use client"

import React, { useRef, Suspense, Component, useMemo, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { hex } from "@/lib/theme"

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
  componentDidCatch() {
    // Swallowed — hasError state handles the fallback UI
  }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

/* ── Shape types ─────────────────────────────────────────────────── */
type ShapeType = "torus" | "icosahedron" | "octahedron" | "torusKnot" | "dodecahedron"

interface FloatingShapeProps {
  shape: ShapeType
  color: string
  glowColor: string
  speed?: number
  scale?: number
  position?: [number, number, number]
  wireframe?: boolean
}

function FloatingShape({
  shape,
  color,
  glowColor,
  speed = 0.3,
  scale = 1,
  position = [0, 0, 0],
  wireframe = true,
}: FloatingShapeProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const glowRef = useRef<THREE.Group>(null!)

  const geometry = useMemo(() => {
    switch (shape) {
      case "torus":
        return new THREE.TorusGeometry(1, 0.35, 24, 48)
      case "icosahedron":
        return new THREE.IcosahedronGeometry(1, 1)
      case "octahedron":
        return new THREE.OctahedronGeometry(1, 0)
      case "torusKnot":
        return new THREE.TorusKnotGeometry(0.8, 0.25, 128, 16)
      case "dodecahedron":
        return new THREE.DodecahedronGeometry(1, 0)
      default:
        return new THREE.IcosahedronGeometry(1, 1)
    }
  }, [shape])

  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry])

  const mainMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      }),
    [color],
  )

  const glowMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(glowColor),
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
      }),
    [glowColor],
  )

  const solidMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.03,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [color],
  )

  const elapsedRef = useRef(0)

  useFrame((_state, delta) => {
    elapsedRef.current += delta
    const t = elapsedRef.current
    if (groupRef.current) {
      groupRef.current.rotation.x = t * speed * 0.7
      groupRef.current.rotation.y = t * speed
      groupRef.current.rotation.z = t * speed * 0.3
      // Gentle float
      groupRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.15
    }
    if (glowRef.current) {
      glowRef.current.rotation.copy(groupRef.current.rotation)
      glowRef.current.position.copy(groupRef.current.position)
    }
  })

  return (
    <>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Solid transparent fill */}
        <mesh geometry={geometry} material={solidMaterial} />
        {/* Main wireframe edges */}
        <lineSegments geometry={edgesGeometry} material={mainMaterial} />
      </group>
      {/* Glow wireframe (slightly larger, separate group for copy) */}
      <group ref={glowRef} position={position} scale={scale * 1.04}>
        <lineSegments geometry={edgesGeometry} material={glowMaterial} />
      </group>
    </>
  )
}

/* ── Multi-shape scene ────────────────────────────────────────────── */
interface SceneProps {
  shapes: FloatingShapeProps[]
}

function Scene({ shapes }: SceneProps) {
  return (
    <>
      {shapes.map((s, i) => (
        <FloatingShape key={i} {...s} />
      ))}
    </>
  )
}

/* ── Exported wrapper ─────────────────────────────────────────────── */
export interface FloatingGeometryProps {
  className?: string
  /** Predefined shape configurations */
  variant?: "skills" | "research" | "contact" | "custom"
  /** Custom shapes (used when variant="custom") */
  shapes?: FloatingShapeProps[]
}

const presets: Record<string, FloatingShapeProps[]> = {
  skills: [
    { shape: "icosahedron", color: hex.primary, glowColor: hex.primaryLight, speed: 0.2, scale: 1.2, position: [-1.5, 0.5, 0] },
    { shape: "octahedron", color: hex.accent, glowColor: hex.accentLight, speed: 0.15, scale: 0.7, position: [1.8, -0.3, -1] },
    { shape: "torus", color: hex.cyan, glowColor: hex.cyanLight, speed: 0.25, scale: 0.5, position: [0.5, 1.2, -0.5] },
  ],
  research: [
    { shape: "dodecahedron", color: hex.primary, glowColor: hex.primaryPale, speed: 0.12, scale: 1.4, position: [0, 0, 0] },
    { shape: "torusKnot", color: hex.accent, glowColor: hex.accentPale, speed: 0.08, scale: 0.5, position: [2, 1, -1] },
  ],
  contact: [
    { shape: "torusKnot", color: hex.primary, glowColor: hex.primaryLight, speed: 0.1, scale: 1.0, position: [0, 0, 0] },
    { shape: "icosahedron", color: hex.accent, glowColor: hex.accentLight, speed: 0.18, scale: 0.4, position: [-1.5, 1, -0.5] },
  ],
}

export function FloatingGeometry({
  className = "",
  variant = "skills",
  shapes: customShapes,
}: FloatingGeometryProps) {
  const shapes = customShapes ?? presets[variant] ?? presets.skills
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
    <WebGLErrorBoundary>
      <div ref={wrapperRef} className={`pointer-events-none w-full h-full ${className}`}>
          <Canvas
            frameloop={visible ? "always" : "never"}
            camera={{ position: [0, 0, 4.5], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{
              antialias: false,
              alpha: true,
              powerPreference: "high-performance",
            }}
            style={{ background: "transparent", visibility: visible ? "visible" : "hidden" }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0)
              const canvas = gl.domElement
              canvas.addEventListener('webglcontextlost', (e) => e.preventDefault(), false)
            }}
          >
            <Suspense fallback={null}>
              <Scene shapes={shapes} />
            </Suspense>
          </Canvas>
      </div>
    </WebGLErrorBoundary>
  )
}
