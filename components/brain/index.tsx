"use client"

import React, { Suspense, Component } from "react"
import type { ReactNode } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { BrainWireframe } from "./brain-wireframe"
import { getBrainBinPromise } from "./use-brain-data"

/* ── Error boundary — keeps WebGL crashes from nuking the page ────── */

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

/* ── Camera set once on mount so the brain doesn’t shrink on mobile when resize fires during touch/rotate ─────── */

function getInitialCam() {
  const w = typeof window !== "undefined" ? window.innerWidth : 1200
  if (w < 480) return { z: 1.8, fov: 42 }
  if (w < 640) return { z: 1.9, fov: 42 }
  if (w < 1024) return { z: 2.0, fov: 44 }
  return { z: 1.85, fov: 42 }
}

function InitialCamera() {
  const { camera } = useThree()
  React.useEffect(() => {
    const { z, fov } = getInitialCam()
    ;(camera as THREE.PerspectiveCamera).fov = fov
    camera.position.z = z
    ;(camera as THREE.PerspectiveCamera).updateProjectionMatrix()
  }, [camera])
  return null
}

/* ── Exported wrapper ─────────────────────────────────────────────── */

type Brain3DProps = {
  className?: string
  /** When false, opacity stays 0 until true (e.g. hero name reveal). Default: no gate. */
  revealGate?: boolean
  /** Opacity transition length in ms (match hero `AnimatedName` duration / easing). */
  fadeDurationMs?: number
}

export function Brain3D({
  className = "",
  revealGate = true,
  fadeDurationMs = 2350,
}: Brain3DProps) {
  const initCam = React.useMemo(() => getInitialCam(), [])
  const [geometryCommitted, setGeometryCommitted] = React.useState(false)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    let raf0: number | undefined
    let raf1: number | undefined

    getBrainBinPromise()
      .then(() => {
        if (cancelled) return
        raf0 = requestAnimationFrame(() => {
          if (cancelled) return
          raf1 = requestAnimationFrame(() => {
            if (!cancelled) setGeometryCommitted(true)
          })
        })
      })
      .catch(() => {
        /* load failure: stay hidden; wireframe never mounts content */
      })

    return () => {
      cancelled = true
      if (raf0 !== undefined) cancelAnimationFrame(raf0)
      if (raf1 !== undefined) cancelAnimationFrame(raf1)
    }
  }, [])

  React.useEffect(() => {
    if (geometryCommitted && revealGate) setVisible(true)
  }, [geometryCommitted, revealGate])

  return (
    <WebGLErrorBoundary>
      <div
        className={`w-full h-full cursor-grab active:cursor-grabbing ${className}`}
        style={{
          opacity: visible ? 1 : 0,
          transition: `opacity ${fadeDurationMs}ms cubic-bezier(0.16, 1, 0.3, 1)`,
          willChange: visible ? "auto" : "opacity",
        }}
      >
        <Canvas
          camera={{ position: [0, 0, initCam.z], fov: initCam.fov }}
          dpr={[1, 1.5]}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: "high-performance",
          }}
          style={{ background: "transparent" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
            const canvas = gl.domElement
            canvas.addEventListener('webglcontextlost', (e) => e.preventDefault(), false)
          }}
        >
          <InitialCamera />
          <Suspense fallback={null}>
            <BrainWireframe />
            <OrbitControls
              makeDefault
              autoRotate
              autoRotateSpeed={0.8}
              enableZoom={false}
              enablePan={false}
              enableDamping
              dampingFactor={0.12}
              rotateSpeed={0.6}
            />
          </Suspense>
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  )
}
