"use client"

import React, { useRef, useState, useEffect, Suspense, Component, useMemo } from "react"
import type { ReactNode } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
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
 *  Real brain wireframe loaded from /brain.bin
 * ────────────────────────────────────────────────────────────────────── */

interface BrainData {
  positions: Float32Array      // flat line-segment positions for wireframe
  indices: Uint32Array
  vertexPositions: Float32Array // original per-vertex positions (x,y,z)
  edgePairs: Uint32Array        // original edge index pairs [a0,b0,a1,b1,...]
  edgeCount: number
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

/* ── React hook to load data ───────────────────────────────────────── */
function useBrainData() {
  const [result, setResult] = useState<{
    geo: THREE.BufferGeometry
    brainData: BrainData
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    loadBrainBin().then((data) => {
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

/* ── Build adjacency: vertex → list of edge indices ─────────────────── */
function buildAdjacency(edgePairs: Uint32Array, edgeCount: number) {
  const adj: Map<number, number[]> = new Map()
  for (let i = 0; i < edgeCount; i++) {
    const a = edgePairs[i * 2]
    const b = edgePairs[i * 2 + 1]
    if (!adj.has(a)) adj.set(a, [])
    if (!adj.has(b)) adj.set(b, [])
    adj.get(a)!.push(i)
    adj.get(b)!.push(i)
  }
  return adj
}

/* ──────────────────────────────────────────────────────────────────────
 *  NeuralOrbs — Glowing orbs that continuously travel connected edges,
 *  lighting up an energy trail behind them. Orbs NEVER despawn — when
 *  they near the end of their chain, more edges are appended. Old
 *  edges are trimmed so memory stays bounded.
 * ────────────────────────────────────────────────────────────────────── */

const ORB_COUNT = 20              // concurrent orbs
const ORB_SPEED = 1.8             // edges per second (base) — slow enough to see movement
const CHAIN_BUFFER = 40           // edges to keep built ahead of the orb
const CHAIN_TRIM_BEHIND = 12      // edges behind the orb before we trim old ones
const TRAIL_LENGTH = 6.0          // how far behind (in edges) the glow trail extends

interface OrbState {
  chain: number[]         // edge indices forming the path
  chainDirs: boolean[]    // direction per edge in chain
  tipVertex: number       // current vertex at the end of the chain
  lastEdge: number        // last edge in chain (for neighbor selection)
  progress: number        // fractional position along chain (0 = start of chain[0])
  speed: number
  trimmed: number         // how many edges have been trimmed from the start (offset)
}

function pickNeighborEdge(
  adjacency: Map<number, number[]>,
  edgePairs: Uint32Array,
  atVertex: number,
  fromEdge: number
): number {
  const edges = adjacency.get(atVertex) || []
  const candidates = edges.filter((e) => e !== fromEdge)
  if (candidates.length > 0)
    return candidates[Math.floor(Math.random() * candidates.length)]
  if (edges.length > 0)
    return edges[Math.floor(Math.random() * edges.length)]
  return -1
}

/* Extend a chain by appending more connected edges up to `target` total length */
function extendChain(
  chain: number[],
  chainDirs: boolean[],
  tipVertex: number,
  lastEdge: number,
  target: number,
  adjacency: Map<number, number[]>,
  edgePairs: Uint32Array,
): { tipVertex: number; lastEdge: number } {
  let tip = tipVertex
  let prev = lastEdge

  while (chain.length < target) {
    const nextEdge = pickNeighborEdge(adjacency, edgePairs, tip, prev)
    if (nextEdge < 0) {
      // Dead end — pick any random edge to teleport (rare on brain mesh)
      const randomEdge = Math.floor(Math.random() * (edgePairs.length / 2))
      chain.push(randomEdge)
      const goFwd = Math.random() > 0.5
      chainDirs.push(goFwd)
      tip = goFwd ? edgePairs[randomEdge * 2 + 1] : edgePairs[randomEdge * 2]
      prev = randomEdge
      continue
    }
    chain.push(nextEdge)
    const a = edgePairs[nextEdge * 2]
    const dir = a === tip
    chainDirs.push(dir)
    tip = dir ? edgePairs[nextEdge * 2 + 1] : edgePairs[nextEdge * 2]
    prev = nextEdge
  }

  return { tipVertex: tip, lastEdge: prev }
}

/* ── Pull-to-deform interaction ────────────────────────────────────── */
interface PullUniforms {
  uPullPoint: { value: THREE.Vector3 }
  uPullStrength: { value: number }
  uPullRadius: { value: number }
}

function createPullUniforms(): PullUniforms {
  return {
    uPullPoint: { value: new THREE.Vector3() },
    uPullStrength: { value: 0 },
    uPullRadius: { value: 0.35 },
  }
}

/** Inject GPU pull-displacement into any built-in Three.js material */
function injectPull(mat: THREE.Material, u: PullUniforms) {
  ;(mat as any).onBeforeCompile = (shader: any) => {
    shader.uniforms.uPullPoint = u.uPullPoint
    shader.uniforms.uPullStrength = u.uPullStrength
    shader.uniforms.uPullRadius = u.uPullRadius
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        uniform vec3 uPullPoint;
        uniform float uPullStrength;
        uniform float uPullRadius;`
      )
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `#include <begin_vertex>
        {
          vec3 _dir = uPullPoint - transformed;
          float _d = length(_dir);
          if (_d < uPullRadius && _d > 0.001 && uPullStrength > 0.0) {
            float _f = 1.0 - _d / uPullRadius;
            _f *= _f;
            transformed += (_dir / _d) * _f * uPullStrength * 0.12;
          }
        }`
      )
  }
  mat.needsUpdate = true
}

/* 5-layer Gaussian orb glow — with pull displacement */
function makeOrbMaterial(pull?: PullUniforms) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPullPoint: pull?.uPullPoint ?? { value: new THREE.Vector3() },
      uPullStrength: pull?.uPullStrength ?? { value: 0 },
      uPullRadius: pull?.uPullRadius ?? { value: 0.35 },
    },
    vertexShader: /* glsl */ `
      attribute float size;
      uniform vec3 uPullPoint;
      uniform float uPullStrength;
      uniform float uPullRadius;
      void main() {
        vec3 pos = position;
        vec3 _dir = uPullPoint - pos;
        float _d = length(_dir);
        if (_d < uPullRadius && _d > 0.001 && uPullStrength > 0.0) {
          float _f = 1.0 - _d / uPullRadius;
          _f *= _f;
          pos += (_dir / _d) * _f * uPullStrength * 0.12;
        }
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (500.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;

        float core   = exp(-d * d * 160.0);
        float inner  = exp(-d * d * 50.0)  * 0.9;
        float mid    = exp(-d * d * 18.0)  * 0.55;
        float outer  = exp(-d * d * 6.0)   * 0.3;
        float fringe = exp(-d * d * 2.5)   * 0.12;

        float intensity = core + inner + mid + outer + fringe;
        intensity *= 0.88 + 0.12 * sin(uTime * 5.0);

        vec3 color = vec3(0.2, 0.45, 0.9) * fringe
                   + vec3(0.4, 0.75, 1.0) * (outer + mid)
                   + vec3(0.8, 0.92, 1.0) * inner
                   + vec3(1.0, 1.0, 1.0)  * core;
        color = min(color, vec3(1.0));

        gl_FragColor = vec4(color, intensity);
      }
    `,
  })
}

function NeuralOrbs({
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

  // Build an initial chain from a random start edge
  function buildInitialChain(): OrbState {
    const chain: number[] = []
    const chainDirs: boolean[] = []

    const startEdge = Math.floor(Math.random() * edgeCount)
    chain.push(startEdge)
    const goForward = Math.random() > 0.5
    chainDirs.push(goForward)

    let tipVertex = goForward
      ? edgePairs[startEdge * 2 + 1]
      : edgePairs[startEdge * 2]
    let lastEdge = startEdge

    // Build a long initial chain
    const ext = extendChain(chain, chainDirs, tipVertex, lastEdge, CHAIN_BUFFER, adjacency, edgePairs)

    return {
      chain,
      chainDirs,
      tipVertex: ext.tipVertex,
      lastEdge: ext.lastEdge,
      progress: 0,
      speed: ORB_SPEED * (0.7 + Math.random() * 0.6),
      trimmed: 0,
    }
  }

  // Orb pool — all continuously traveling, never despawning
  const orbs = useRef<OrbState[]>([])
  if (orbs.current.length === 0) {
    for (let i = 0; i < ORB_COUNT; i++) {
      const orbState = buildInitialChain()
      // Stagger start positions so they don't all begin at edge 0
      orbState.progress = Math.random() * 8
      orbs.current.push(orbState)
    }
  }

  // Orb position + size buffers
  const orbPositions = useMemo(() => new Float32Array(ORB_COUNT * 3), [])
  const orbSizes = useMemo(() => new Float32Array(ORB_COUNT), [])

  // Flicker seeds
  const flickerSeeds = useRef<number[]>([])
  if (flickerSeeds.current.length === 0) {
    for (let i = 0; i < ORB_COUNT; i++)
      flickerSeeds.current.push(Math.random() * 100)
  }

  // Set attributes imperatively (avoids R3F <bufferAttribute> TS issues)
  useEffect(() => {
    if (!orbGeoRef.current) return
    orbGeoRef.current.setAttribute(
      "position", new THREE.BufferAttribute(orbPositions, 3)
    )
    orbGeoRef.current.setAttribute(
      "size", new THREE.BufferAttribute(orbSizes, 1)
    )
  }, [orbGeoRef, orbPositions, orbSizes])

  useFrame((state, delta) => {
    const colors = colorAttr.array as Float32Array
    const t = state.clock.getElapsedTime()

    // ── Clear only edges used by active orbs (efficient) ──────────────
    const dirtyEdges = new Set<number>()
    for (const orb of orbs.current) {
      for (const eIdx of orb.chain) dirtyEdges.add(eIdx)
    }
    for (const eIdx of dirtyEdges) {
      const off = eIdx * 6
      colors[off] = 0; colors[off + 1] = 0; colors[off + 2] = 0
      colors[off + 3] = 0; colors[off + 4] = 0; colors[off + 5] = 0
    }

    // ── Update each orb ───────────────────────────────────────────────
    for (let i = 0; i < ORB_COUNT; i++) {
      const orb = orbs.current[i]

      // Advance along chain
      orb.progress += orb.speed * delta

      // ── Extend chain ahead if we're getting close to the end ────────
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

      // ── Trim old edges far behind the orb to keep memory bounded ────
      const trimCount = Math.floor(localProgress) - CHAIN_TRIM_BEHIND
      if (trimCount > 0) {
        orb.chain.splice(0, trimCount)
        orb.chainDirs.splice(0, trimCount)
        orb.trimmed += trimCount
      }

      // ── Compute orb 3D position (lerp along current edge) ──────────
      const lp = orb.progress - orb.trimmed   // local progress within current chain array
      const clampedP = Math.max(0, Math.min(lp, orb.chain.length - 0.001))
      const edgeIdx = Math.min(Math.floor(clampedP), orb.chain.length - 1)
      const frac = clampedP - edgeIdx

      const eIdx = orb.chain[edgeIdx]
      const isForward = orb.chainDirs[edgeIdx]
      const aVert = edgePairs[eIdx * 2]
      const bVert = edgePairs[eIdx * 2 + 1]
      const startV = isForward ? aVert : bVert
      const endV = isForward ? bVert : aVert

      const ox = vertexPositions[startV * 3] * (1 - frac) + vertexPositions[endV * 3] * frac
      const oy = vertexPositions[startV * 3 + 1] * (1 - frac) + vertexPositions[endV * 3 + 1] * frac
      const oz = vertexPositions[startV * 3 + 2] * (1 - frac) + vertexPositions[endV * 3 + 2] * frac

      orbPositions[i * 3] = ox
      orbPositions[i * 3 + 1] = oy
      orbPositions[i * 3 + 2] = oz

      // Orb size with gentle pulse
      orbSizes[i] = 0.35 + 0.05 * Math.sin(t * 4.0 + i * 2.5)

      // ── Energy trail on visible chain edges ─────────────────────────
      const flicker = 0.92 + 0.08 * Math.sin(t * 14 + flickerSeeds.current[i])

      for (let e = 0; e < orb.chain.length; e++) {
        const chainEdge = orb.chain[e]
        const off = chainEdge * 6
        const fwd = orb.chainDirs[e]

        // Chain-progress position for this edge's two vertices
        const globalE = e + orb.trimmed
        const posA = fwd ? globalE : globalE + 1
        const posB = fwd ? globalE + 1 : globalE

        // Distance from orb to each vertex in chain-progress space
        const dA = orb.progress - posA
        const dB = orb.progress - posB

        // Skip edges far ahead (orb hasn't reached) or far behind (trail faded)
        if (dA < -0.5 && dB < -0.5) continue
        if (dA > TRAIL_LENGTH + 1 && dB > TRAIL_LENGTH + 1) continue

        const absA = Math.abs(dA)
        const absB = Math.abs(dB)

        // Bright Gaussian around orb + softer extended trail behind
        let wA = Math.exp(-absA * absA * 4.0)
        let wB = Math.exp(-absB * absB * 4.0)
        if (dA > 0) wA += Math.exp(-dA * 0.8) * 0.45
        if (dB > 0) wB += Math.exp(-dB * 0.8) * 0.45
        // Slight leading glow ahead of the orb
        if (dA < 0) wA += Math.exp(-absA * 6.0) * 0.2
        if (dB < 0) wB += Math.exp(-absB * 6.0) * 0.2
        wA = Math.min(1, wA * flicker)
        wB = Math.min(1, wB * flicker)

        if (wA < 0.005 && wB < 0.005) continue

        // Color: white-hot near orb → electric blue further away
        const hotA = Math.exp(-absA * 3.0)
        const hotB = Math.exp(-absB * 3.0)

        // Additive with existing color (multiple orbs can overlap)
        colors[off]     = Math.min(1, colors[off]     + (0.3 + 0.7 * hotA) * wA)
        colors[off + 1] = Math.min(1, colors[off + 1] + (0.6 + 0.4 * hotA) * wA)
        colors[off + 2] = Math.min(1, colors[off + 2] + 1.0 * wA)
        colors[off + 3] = Math.min(1, colors[off + 3] + (0.3 + 0.7 * hotB) * wB)
        colors[off + 4] = Math.min(1, colors[off + 4] + (0.6 + 0.4 * hotB) * wB)
        colors[off + 5] = Math.min(1, colors[off + 5] + 1.0 * wB)
      }
    }

    colorAttr.needsUpdate = true

    // Update orb point sprite buffers
    if (orbGeoRef.current) {
      const pa = orbGeoRef.current.getAttribute("position") as THREE.BufferAttribute
      const sa = orbGeoRef.current.getAttribute("size") as THREE.BufferAttribute
      if (pa) pa.needsUpdate = true
      if (sa) sa.needsUpdate = true
    }
  })

  return null
}

/* ── Rotating wireframe brain with neural orb effects ──────────────── */
function BrainWireframe() {
  const groupRef = useRef<THREE.Group>(null!)
  const orbGeoRef = useRef<THREE.BufferGeometry>(null!)
  const hitRef = useRef<THREE.Mesh>(null!)
  const result = useBrainData()

  // Shared pull-deform uniforms
  const pull = useMemo(() => createPullUniforms(), [])
  const pullTarget = useRef(0)

  // Base wireframe material (dim blue) — pull-aware
  const material = React.useMemo(() => {
    const m = new THREE.LineBasicMaterial({
      color: 0x3baaff,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    })
    injectPull(m, pull)
    return m
  }, [pull])

  // Outer glow wireframe — pull-aware
  const glowMaterial = React.useMemo(() => {
    const m = new THREE.LineBasicMaterial({
      color: 0x6dcfff,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    })
    injectPull(m, pull)
    return m
  }, [pull])

  // Signal overlay material — pull-aware
  const signalMaterial = React.useMemo(() => {
    const m = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    injectPull(m, pull)
    return m
  }, [pull])

  // Orb shader material (5-layer Gaussian glow, pull-aware)
  const orbMaterial = useMemo(() => makeOrbMaterial(pull), [pull])

  // Build signal geometry (same positions as brain, but with a color buffer)
  const signalGeo = useMemo(() => {
    if (!result) return null
    const g = new THREE.BufferGeometry()
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(result.brainData.positions, 3)
    )
    const colorCount = result.brainData.edgeCount * 2 * 3
    const colors = new Float32Array(colorCount)
    const colorAttr = new THREE.BufferAttribute(colors, 3)
    g.setAttribute("color", colorAttr)
    return { geometry: g, colorAttr }
  }, [result])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    orbMaterial.uniforms.uTime.value = t
    // Spring pull strength toward target
    pull.uPullStrength.value +=
      (pullTarget.current - pull.uPullStrength.value) * Math.min(1, delta * 8)
  })

  if (!result || !signalGeo) return null

  const { geo, brainData } = result

  return (
    <group ref={groupRef} scale={1.15}>
      <group rotation={[-Math.PI * 0.5 + Math.PI * 0.08, 0, 0]}>
        {/* Invisible sphere for pull interaction */}
        <mesh
          ref={hitRef}
          onPointerMove={(e) => {
            e.stopPropagation()
            if (hitRef.current) {
              pull.uPullPoint.value.copy(
                hitRef.current.worldToLocal(e.point.clone())
              )
            }
            pullTarget.current = 1
          }}
          onPointerLeave={() => { pullTarget.current = 0 }}
        >
          <sphereGeometry args={[1.1, 32, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        {/* Base wireframe */}
        <lineSegments geometry={geo} material={material} />
        <lineSegments geometry={geo} material={glowMaterial} scale={1.02} />
        {/* Signal overlay — edges light up here */}
        <lineSegments geometry={signalGeo.geometry} material={signalMaterial} />
        {/* Orb point sprites */}
        <points material={orbMaterial}>
          <bufferGeometry ref={orbGeoRef} />
        </points>
        {/* Neural orb logic — writes colors + positions */}
        <NeuralOrbs
          brainData={brainData}
          colorAttr={signalGeo.colorAttr}
          orbGeoRef={orbGeoRef}
        />
      </group>
    </group>
  )
}

/* ── Responsive camera helper — returns breakpoint-aware z & fov ──── */
function getResponsiveCam() {
  const w = typeof window !== "undefined" ? window.innerWidth : 1200
  if (w < 640) return { z: 4.0, fov: 52 }   // Mobile
  if (w < 1024) return { z: 3.5, fov: 48 }   // Tablet
  return { z: 3.2, fov: 45 }                  // Desktop
}

/* Runtime camera sync — updates the three.js camera when viewport changes */
function ResponsiveCamera() {
  const { camera } = useThree()
  React.useEffect(() => {
    const update = () => {
      const { z, fov } = getResponsiveCam()
      ;(camera as THREE.PerspectiveCamera).fov = fov
      camera.position.z = z
      ;(camera as THREE.PerspectiveCamera).updateProjectionMatrix()
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [camera])
  return null
}

/* ── Exported wrapper with error boundary ──────────────────────────── */
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
          }}
        >
          <ResponsiveCamera />
          <Suspense fallback={null}>
            <BrainWireframe />
            <OrbitControls
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
