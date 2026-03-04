"use client"

import React, { Suspense, Component } from "react"
import type { ReactNode } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { BrainWireframe } from "./brain-wireframe"

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

/* ── Responsive camera helper ─────────────────────────────────────── */

function getResponsiveCam() {
  const w = typeof window !== "undefined" ? window.innerWidth : 1200
  if (w < 640) return { z: 3.4, fov: 50 }
  if (w < 1024) return { z: 3.0, fov: 47 }
  return { z: 2.7, fov: 44 }
}

function ResponsiveCamera() {
  const { camera } = useThree()
  React.useEffect(() => {
    const update = () => {
      const { z, fov } = getResponsiveCam()
        ; (camera as THREE.PerspectiveCamera).fov = fov
      camera.position.z = z
        ; (camera as THREE.PerspectiveCamera).updateProjectionMatrix()
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [camera])
  return null
}

/* ── Exported wrapper ─────────────────────────────────────────────── */

export function Brain3D({ className = "" }: { className?: string }) {
  const initCam = React.useMemo(() => getResponsiveCam(), [])
  return (
    <WebGLErrorBoundary>
      <div className={`w-full h-full cursor-grab active:cursor-grabbing ${className}`}>
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
          <ResponsiveCamera />
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
