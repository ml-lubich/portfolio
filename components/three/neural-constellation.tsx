"use client"

/* ──────────────────────────────────────────────────────────────────────
 *  NeuralConstellation — interactive 3D skill graph.
 *
 *  Replaces the flat metric cards + horizontal proficiency bars with a
 *  living neural network that speaks the same visual language as the hero
 *  <Brain3D>: Bézier synapses, glowing signal orbs, and the multi-layer
 *  Gaussian glow shader from <NeuralOrbDemo>.
 *
 *  Each skill is a node whose radius ∝ proficiency. Signal orbs stream
 *  along the synapses. Hovering a node lifts it and slides its detail
 *  bullets into the side panel. Reduced-motion / touch / no-WebGL visitors
 *  fall back to the accessible <AnimatedBars> chart.
 * ────────────────────────────────────────────────────────────────────── */

import React, {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import dynamic from "next/dynamic"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import { AnimatedBars, type BarItem } from "../animations/animated-bars"
import { AnimatedCounter } from "../animations/animated-counter"
import { hexNum } from "@/lib/theme"

/* ── Public data shapes ───────────────────────────────────────────────── */

export interface ConstellationMetric {
  value: string
  label: string
}

interface NodePlacement {
  /** short label rendered on the node */
  short: string
  /** world position (face-on 2.5D layout) */
  pos: [number, number, number]
  /** base RGB tint (0–1) for the orb glow */
  color: [number, number, number]
}

/* Pentagon layout — top, then clockwise. Slight z-depth for parallax life. */
const PLACEMENTS: NodePlacement[] = [
  { short: "PyTorch / TF", pos: [0.0, 1.5, 0.0], color: [0.42, 0.72, 1.0] },
  { short: "LLMs / RAG", pos: [1.62, 0.42, 0.35], color: [0.62, 0.5, 1.0] },
  { short: "Multi-Agent", pos: [1.0, -1.32, -0.25], color: [0.32, 0.86, 0.95] },
  { short: "MLOps / AWS", pos: [-1.0, -1.32, 0.28], color: [0.36, 0.82, 0.86] },
  { short: "Guardrails", pos: [-1.62, 0.42, -0.18], color: [0.52, 0.62, 1.0] },
]

const CORE: [number, number, number] = [0, 0, 0.12]
const POINT_SIZE_SCALE = 900

/* Map proficiency (0–100) → orb world size. */
function sizeForValue(v: number): number {
  const t = Math.max(0, Math.min(1, (v - 80) / 20)) // 80→0, 100→1
  return 0.24 + t * 0.2
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/* ── Shared glow shader (multi-layer Gaussian, per-point color + glow) ─── */

function makeGlowMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float size;
      attribute float aGlow;
      attribute vec3 aColor;
      varying vec3 vColor;
      varying float vGlow;
      void main() {
        vColor = aColor;
        vGlow = aGlow;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (${POINT_SIZE_SCALE.toFixed(1)} / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vColor;
      varying float vGlow;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;

        float core   = exp(-d * d * 160.0);
        float inner  = exp(-d * d * 50.0) * 0.9;
        float mid    = exp(-d * d * 18.0) * 0.55;
        float outer  = exp(-d * d * 6.0)  * 0.3;
        float fringe = exp(-d * d * 2.5)  * 0.12;

        float intensity = (core + inner + mid + outer + fringe) * vGlow;
        intensity *= 0.9 + 0.1 * sin(uTime * 4.0);

        vec3 col = vColor * (outer + mid + fringe)
                 + mix(vColor, vec3(1.0), 0.6) * inner
                 + vec3(1.0) * core;
        col = min(col, vec3(1.0));

        gl_FragColor = vec4(col, intensity);
      }
    `,
  })
}

/* ── The 3D scene ─────────────────────────────────────────────────────── */

interface SceneProps {
  values: number[]
  onHover: (index: number | null) => void
}

function ConstellationScene({ values, onHover }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const nodeGeoRef = useRef<THREE.BufferGeometry>(null!)
  const signalGeoRef = useRef<THREE.BufferGeometry>(null!)

  const nodeCount = PLACEMENTS.length
  const coreIndex = nodeCount

  /* Full point set = skill nodes + central core. */
  const points = useMemo<[number, number, number][]>(
    () => [...PLACEMENTS.map((p) => p.pos), CORE],
    []
  )

  /* Edges: core → each node (spokes) + pentagon ring. */
  const edges = useMemo<[number, number][]>(() => {
    const spokes: [number, number][] = PLACEMENTS.map((_, i) => [coreIndex, i])
    const ring: [number, number][] = PLACEMENTS.map((_, i) => [
      i,
      (i + 1) % nodeCount,
    ])
    return [...spokes, ...ring]
  }, [coreIndex, nodeCount])

  /* ── Node point attributes ──────────────────────────────────────────── */
  const nodePositions = useMemo(() => {
    const arr = new Float32Array((nodeCount + 1) * 3)
    points.forEach((p, i) => {
      arr[i * 3] = p[0]
      arr[i * 3 + 1] = p[1]
      arr[i * 3 + 2] = p[2]
    })
    return arr
  }, [points, nodeCount])

  const nodeColors = useMemo(() => {
    const arr = new Float32Array((nodeCount + 1) * 3)
    PLACEMENTS.forEach((p, i) => {
      arr[i * 3] = p.color[0]
      arr[i * 3 + 1] = p.color[1]
      arr[i * 3 + 2] = p.color[2]
    })
    // core = white-blue
    arr[coreIndex * 3] = 0.75
    arr[coreIndex * 3 + 1] = 0.85
    arr[coreIndex * 3 + 2] = 1.0
    return arr
  }, [nodeCount, coreIndex])

  const baseSizes = useMemo(() => {
    const arr = new Float32Array(nodeCount + 1)
    for (let i = 0; i < nodeCount; i++) arr[i] = sizeForValue(values[i] ?? 90)
    arr[coreIndex] = 0.3
    return arr
  }, [values, nodeCount, coreIndex])

  const nodeSizes = useMemo(() => Float32Array.from(baseSizes), [baseSizes])
  const nodeGlows = useMemo(() => new Float32Array(nodeCount + 1).fill(1), [nodeCount])

  /* current (eased) hover amount per node */
  const hoverAmt = useRef<Float32Array>(new Float32Array(nodeCount + 1))
  const hoverTargetRef = useRef<number>(-1)

  /* ── Signal orbs streaming along edges ─────────────────────────────── */
  const signals = useMemo(
    () =>
      edges.map((e, i) => ({
        a: e[0],
        b: e[1],
        progress: (i * 0.37) % 1,
        speed: 0.28 + (i % 3) * 0.06,
      })),
    [edges]
  )
  const signalPositions = useMemo(
    () => new Float32Array(signals.length * 3),
    [signals.length]
  )
  const signalColors = useMemo(() => {
    const arr = new Float32Array(signals.length * 3)
    signals.forEach((s, i) => {
      // tint each signal toward its destination node's color
      const c = s.b < nodeCount ? PLACEMENTS[s.b].color : [0.7, 0.85, 1.0]
      arr[i * 3] = c[0]
      arr[i * 3 + 1] = c[1]
      arr[i * 3 + 2] = c[2]
    })
    return arr
  }, [signals, nodeCount])
  const signalSizes = useMemo(
    () => new Float32Array(signals.length).fill(0.14),
    [signals.length]
  )
  const signalGlows = useMemo(
    () => new Float32Array(signals.length).fill(1.1),
    [signals.length]
  )

  /* ── Dim base synapse lines ────────────────────────────────────────── */
  const lineGeo = useMemo(() => {
    const positions = new Float32Array(edges.length * 2 * 3)
    const colors = new Float32Array(edges.length * 2 * 3)
    edges.forEach((e, i) => {
      const pa = points[e[0]]
      const pb = points[e[1]]
      const off = i * 6
      positions[off] = pa[0]
      positions[off + 1] = pa[1]
      positions[off + 2] = pa[2]
      positions[off + 3] = pb[0]
      positions[off + 4] = pb[1]
      positions[off + 5] = pb[2]
      const ca = e[0] < nodeCount ? PLACEMENTS[e[0]].color : [0.6, 0.75, 1]
      const cb = e[1] < nodeCount ? PLACEMENTS[e[1]].color : [0.6, 0.75, 1]
      colors[off] = ca[0] * 0.22
      colors[off + 1] = ca[1] * 0.22
      colors[off + 2] = ca[2] * 0.22
      colors[off + 3] = cb[0] * 0.22
      colors[off + 4] = cb[1] * 0.22
      colors[off + 5] = cb[2] * 0.22
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    return g
  }, [edges, points, nodeCount])

  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  )

  const nodeMaterial = useMemo(() => makeGlowMaterial(), [])
  const signalMaterial = useMemo(() => makeGlowMaterial(), [])

  /* ── Attach dynamic attributes once ────────────────────────────────── */
  useEffect(() => {
    const g = nodeGeoRef.current
    if (!g) return
    g.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3))
    g.setAttribute("size", new THREE.BufferAttribute(nodeSizes, 1))
    g.setAttribute("aColor", new THREE.BufferAttribute(nodeColors, 3))
    g.setAttribute("aGlow", new THREE.BufferAttribute(nodeGlows, 1))
  }, [nodePositions, nodeSizes, nodeColors, nodeGlows])

  useEffect(() => {
    const g = signalGeoRef.current
    if (!g) return
    g.setAttribute("position", new THREE.BufferAttribute(signalPositions, 3))
    g.setAttribute("size", new THREE.BufferAttribute(signalSizes, 1))
    g.setAttribute("aColor", new THREE.BufferAttribute(signalColors, 3))
    g.setAttribute("aGlow", new THREE.BufferAttribute(signalGlows, 1))
  }, [signalPositions, signalSizes, signalColors, signalGlows])

  const { pointer } = useThree()
  const elapsed = useRef(0)

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.05)
    elapsed.current += dt
    const t = elapsed.current

    /* gentle parallax + idle sway (kept small so labels stay readable) */
    if (groupRef.current) {
      const targetY = pointer.x * 0.18 + Math.sin(t * 0.25) * 0.05
      const targetX = -pointer.y * 0.14
      groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, targetY, 0.05)
      groupRef.current.rotation.x = lerp(groupRef.current.rotation.x, targetX, 0.05)
    }

    /* node pulse + eased hover lift */
    const amt = hoverAmt.current
    for (let i = 0; i <= nodeCount; i++) {
      const target = i === hoverTargetRef.current ? 1 : 0
      amt[i] = lerp(amt[i], target, 0.15)
      const pulse = 1 + 0.06 * Math.sin(t * 2.2 + i * 1.3)
      nodeSizes[i] = baseSizes[i] * pulse * (1 + amt[i] * 0.6)
      nodeGlows[i] = 1 + amt[i] * 1.1
    }

    /* stream signal orbs along their edges */
    signals.forEach((s, i) => {
      s.progress += s.speed * dt
      if (s.progress > 1) s.progress -= 1
      const pa = points[s.a]
      const pb = points[s.b]
      const p = s.progress
      signalPositions[i * 3] = lerp(pa[0], pb[0], p)
      signalPositions[i * 3 + 1] = lerp(pa[1], pb[1], p)
      signalPositions[i * 3 + 2] = lerp(pa[2], pb[2], p)
      // fade in/out at the ends so orbs don't pop at nodes
      const fade = Math.sin(Math.PI * p)
      signalSizes[i] = 0.1 + 0.07 * fade
      signalGlows[i] = 0.5 + 0.9 * fade
    })

    nodeMaterial.uniforms.uTime.value = t
    signalMaterial.uniforms.uTime.value = t

    const ng = nodeGeoRef.current
    if (ng) {
      ;(ng.getAttribute("size") as THREE.BufferAttribute).needsUpdate = true
      ;(ng.getAttribute("aGlow") as THREE.BufferAttribute).needsUpdate = true
    }
    const sg = signalGeoRef.current
    if (sg) {
      ;(sg.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true
      ;(sg.getAttribute("size") as THREE.BufferAttribute).needsUpdate = true
      ;(sg.getAttribute("aGlow") as THREE.BufferAttribute).needsUpdate = true
    }
  })

  const setHover = (i: number | null) => {
    hoverTargetRef.current = i ?? -1
    onHover(i)
    if (typeof document !== "undefined") {
      document.body.style.cursor = i === null ? "" : "pointer"
    }
  }

  return (
    <group ref={groupRef}>
      {/* dim synapses */}
      <lineSegments geometry={lineGeo} material={lineMaterial} />

      {/* streaming signal orbs */}
      <points material={signalMaterial}>
        <bufferGeometry ref={signalGeoRef} />
      </points>

      {/* skill + core nodes */}
      <points material={nodeMaterial}>
        <bufferGeometry ref={nodeGeoRef} />
      </points>

      {/* invisible hover targets + labels */}
      {PLACEMENTS.map((p, i) => {
        const r = sizeForValue(values[i] ?? 90) * 0.95
        const lx = p.pos[0] * 1.16
        const ly = p.pos[1] * 1.16 + (p.pos[1] >= 0 ? 0.28 : -0.28)
        return (
          <group key={p.short}>
            <mesh
              position={p.pos}
              onPointerOver={(e) => {
                e.stopPropagation()
                setHover(i)
              }}
              onPointerOut={() => setHover(null)}
            >
              <sphereGeometry args={[r, 16, 16]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            <Html
              position={[lx, ly, p.pos[2]]}
              center
              style={{ pointerEvents: "none", userSelect: "none" }}
              zIndexRange={[20, 0]}
            >
              <div className="flex flex-col items-center whitespace-nowrap text-center">
                <span className="text-[11px] font-medium tracking-wide text-foreground/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  {p.short}
                </span>
                <span
                  className="font-mono text-[10px] tabular-nums"
                  style={{
                    color: `rgb(${p.color.map((c) => Math.round(c * 235)).join(",")})`,
                  }}
                >
                  <NodeCount value={values[i] ?? 90} />
                </span>
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

/* Tiny count-up used inside a node label (mounts when section scrolls in). */
function NodeCount({ value }: { value: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const dur = 1400
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(eased * value))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{n}%</>
}

/* ── WebGL error boundary → falls back to bars ────────────────────────── */

class WebGLBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/* ── Enable heavy 3D only on capable, motion-OK, non-touch viewports ──── */

function useEnable3D(): boolean {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    const compute = () =>
      window.innerWidth >= 768 &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !window.matchMedia("(pointer: coarse)").matches
    setEnabled(compute())
    const onResize = () => setEnabled(compute())
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])
  return enabled
}

/* ── Public component ─────────────────────────────────────────────────── */

interface NeuralConstellationProps {
  bars: BarItem[]
  metrics: ConstellationMetric[]
}

function NeuralConstellationImpl({ bars, metrics }: NeuralConstellationProps) {
  const nodeBars = bars.slice(0, PLACEMENTS.length)
  const values = nodeBars.map((b) => b.value)
  const enable3D = useEnable3D()
  const [hovered, setHovered] = useState<number | null>(null)

  const active = hovered !== null ? nodeBars[hovered] : null

  const fallback = (
    <div className="rounded-2xl border border-white/[0.04] bg-card/25 p-5 backdrop-blur-xl frosted-panel md:p-8">
      <h3 className="mb-4 text-lg font-bold text-foreground md:mb-6">
        Core Proficiency
      </h3>
      <AnimatedBars bars={bars} duration={1600} stagger={150} />
    </div>
  )

  return (
    <div>
      {/* Telemetry readouts — the headline metrics reframed as HUD counters */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:mb-6 md:grid-cols-4 md:gap-4">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 backdrop-blur-md transition-colors duration-500 hover:border-primary/25"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-60" />
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-primary/50">
              <span
                className="h-1 w-1 rounded-full bg-primary/70"
                style={{
                  animation: "bar-breathe 3s ease-in-out infinite",
                  animationDelay: `${i * 400}ms`,
                }}
              />
              {m.label}
            </div>
            <AnimatedCounter
              value={m.value}
              duration={2000}
              className="mt-1 block font-display text-2xl font-light text-foreground md:text-3xl"
            />
          </div>
        ))}
      </div>

      {/* The constellation */}
      {enable3D ? (
        <WebGLBoundary fallback={fallback}>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-[#05060c]/60 backdrop-blur-xl frosted-panel">
            <div className="absolute inset-0 dot-pattern opacity-20" aria-hidden="true" />

            {/* header */}
            <div className="relative z-10 flex items-center justify-between px-5 pt-5 md:px-8 md:pt-6">
              <h3 className="text-lg font-bold text-foreground">
                Core Proficiency
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
                neural map · hover a node
              </span>
            </div>

            <div className="relative grid gap-0 lg:grid-cols-[1.6fr_1fr]">
              {/* canvas */}
              <div className="relative h-[380px] md:h-[460px]" aria-hidden="true">
                {/* z=5.5: frustum half-height ≈2.28 at the layout plane — clears the
                    top "PyTorch / TF" label (y≈2.02 + text height); 4.8 clipped it. */}
                <Canvas
                  camera={{ position: [0, 0, 5.5], fov: 45 }}
                  dpr={[1, 1.75]}
                  gl={{ antialias: true, alpha: true }}
                  style={{ background: "transparent" }}
                  onCreated={({ gl }) => {
                    gl.setClearColor(hexNum.background, 0)
                    gl.domElement.addEventListener(
                      "webglcontextlost",
                      (e) => e.preventDefault(),
                      false
                    )
                  }}
                >
                  <Suspense fallback={null}>
                    <ConstellationScene values={values} onHover={setHovered} />
                  </Suspense>
                </Canvas>
              </div>

              {/* detail panel */}
              <div className="relative z-10 border-t border-white/[0.05] p-5 md:border-l md:border-t-0 md:p-6">
                <div className="flex min-h-[280px] flex-col">
                  {active ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            background: `rgb(${PLACEMENTS[hovered!].color
                              .map((c) => Math.round(c * 235))
                              .join(",")})`,
                            boxShadow: `0 0 10px 1px rgb(${PLACEMENTS[hovered!].color
                              .map((c) => Math.round(c * 200))
                              .join(",")})`,
                          }}
                        />
                        <h4 className="text-base font-semibold text-foreground">
                          {active.label}
                        </h4>
                      </div>
                      {active.display && (
                        <div className="mt-1 font-mono text-xs text-primary/70">
                          {active.value}% · {active.display}
                        </div>
                      )}
                      <div className="mt-4 space-y-2">
                        {active.details?.map((d, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2"
                            style={{
                              animation: "panel-slide-up 0.4s ease-out both",
                              animationDelay: `${idx * 60}ms`,
                            }}
                          >
                            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {d}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                      <div className="mb-3 h-10 w-10 rounded-full border border-primary/20 bg-primary/5" />
                      <p className="max-w-[16rem] text-sm text-muted-foreground/70">
                        Each node is a domain — its glow scales with depth of
                        expertise. Hover any node to trace the details.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Screen-reader accessible equivalent of the graph */}
            <ul className="sr-only">
              {nodeBars.map((b) => (
                <li key={b.label}>
                  {b.label}: {b.value}% {b.display ?? ""}.{" "}
                  {b.details?.join(" ")}
                </li>
              ))}
            </ul>
          </div>
        </WebGLBoundary>
      ) : (
        fallback
      )}
    </div>
  )
}

/* WebGL/Canvas must not run through SSR. */
export const NeuralConstellation = dynamic(
  () => Promise.resolve(NeuralConstellationImpl),
  { ssr: false }
)
