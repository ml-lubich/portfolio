"use client"

import React, { Suspense, Component } from "react"
import type { ReactNode } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
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
  /* Tighter z + slightly wider FOV on phones so the mesh fills the hero square. */
  if (w < 480) return { z: 1.15, fov: 46 }
  if (w < 640) return { z: 1.22, fov: 45 }
  if (w < 1024) return { z: 1.58, fov: 44 }
  /* Desktop: the box is one viewport tall (components/hero/index.tsx), so the
     mesh's share of the viewport is set here. Target: the projected mesh
     spans 82–88% of the viewport height at 1440×900 and 1920×1080 — the
     josephheupler.com read — and stays inside the box on every side while
     it auto-rotates (the 6:5 landscape box gives the long axis its room).
     The narrower FOV at this distance keeps the near side from ballooning
     the way a close camera at 42° did. Measured, not guessed: BrainTelemetry
     writes the projected extent to the canvas and e2e/hero-brain-fit.spec.ts
     asserts it at four viewports. */
  return { z: 1.9, fov: 38 }
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function coarsePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
}

/* ── Telemetry — the fit/motion e2e guards read this off the canvas ─── */

/** Vertices sampled for the silhouette — enough to hug the outline, cheap at 6 Hz. */
const TELEMETRY_SAMPLES = 1500

/**
 * Every 10th frame: project a fixed subsample of the mesh's own vertices
 * through the camera and write the screen-space extent (page px) plus the
 * camera's azimuth onto the <canvas> as data attributes. Real vertices, not
 * bounding-box corners — perspective inflates the near corners of a box so
 * badly that it reported the mesh taller than the viewport. ~1500 vector
 * projections at 6 Hz is cheap enough to leave on in production, which is
 * the build the push gate actually tests.
 */
function BrainTelemetry() {
  const { scene, camera, gl } = useThree()
  const frame = React.useRef(0)
  const v = React.useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    if (++frame.current % 10) return
    const mesh = scene.getObjectByName("brain-mesh") as THREE.LineSegments | undefined
    const pos = mesh?.geometry.getAttribute("position") as THREE.BufferAttribute | undefined
    if (!mesh || !pos) return
    const stride = Math.max(1, Math.floor(pos.count / TELEMETRY_SAMPLES))
    const rect = gl.domElement.getBoundingClientRect()
    let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity
    for (let i = 0; i < pos.count; i += stride) {
      v.fromBufferAttribute(pos, i)
      mesh.localToWorld(v).project(camera)
      const x = rect.left + ((v.x + 1) / 2) * rect.width
      const y = rect.top + ((1 - v.y) / 2) * rect.height
      if (x < l) l = x
      if (x > r) r = x
      if (y < t) t = y
      if (y > b) b = y
    }
    gl.domElement.dataset.brainBbox = `${l.toFixed(0)},${t.toFixed(0)},${r.toFixed(0)},${b.toFixed(0)}`
    gl.domElement.dataset.brainRot = Math.atan2(camera.position.x, camera.position.z).toFixed(4)
  })
  return null
}

/* ── Pointer tilt — the brain leans toward the cursor (desktop only) ─── */

const TILT_PITCH = 0.14
const TILT_ROLL = 0.18

/**
 * Subtle lean toward the pointer on top of the orbit: pitch follows the
 * cursor's vertical position, roll its horizontal one, eased in the frame
 * loop. Fine pointers only, and never under reduced motion — touch and
 * reduced-motion visitors get the static orbit (or none).
 */
function BrainTilt() {
  const { scene } = useThree()
  const target = React.useRef({ x: 0, z: 0 })
  React.useEffect(() => {
    if (coarsePointer() || prefersReducedMotion()) return
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientY / window.innerHeight - 0.5) * TILT_PITCH
      target.current.z = (e.clientX / window.innerWidth - 0.5) * TILT_ROLL
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [])
  useFrame((_state, delta) => {
    const root = scene.getObjectByName("brain-root")
    if (!root) return
    const k = Math.min(1, delta * 2.5)
    root.rotation.x += (target.current.x - root.rotation.x) * k
    root.rotation.z += (target.current.z - root.rotation.z) * k
  })
  return null
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
  const reducedMotion = React.useMemo(() => prefersReducedMotion(), [])
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
          dpr={[1, 2]}
          gl={{
            antialias: true,
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
          <BrainTelemetry />
          <BrainTilt />
          <Suspense fallback={null}>
            <BrainWireframe />
            <OrbitControls
              makeDefault
              /* Idle orbit is the hero's motion — perceptible, not a crawl
                 (1.8 ≈ 33s per revolution). Off under prefers-reduced-motion:
                 the e2e motion guard asserts the azimuth holds still there. */
              autoRotate={!reducedMotion}
              autoRotateSpeed={1.8}
              /* Pitch stays within ±12.6° of the equator: with the tight
                 desktop camera the long axis would otherwise clip vertically. */
              minPolarAngle={Math.PI / 2 - 0.22}
              maxPolarAngle={Math.PI / 2 + 0.22}
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
