"use client"

import React, { useRef, useMemo, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

/* ──────────────────────────────────────────────────────────────────────
 *  NeuralOrbDemo v2 — Curved edges, big glowing orbs, energy trails.
 *
 *  Each edge is a quadratic Bézier curve rendered as ~24 line segments.
 *  A large glowing orb travels along the curve. The trail is most
 *  intense right around the orb and fades out behind it.
 * ────────────────────────────────────────────────────────────────────── */

// ── 3 demo curves (start, control-point, end) ───────────────────────
const CURVES = [
    { a: [-1.6, 0.7, 0], cp: [0, 1.3, 0.4], b: [1.6, 0.5, 0] },
    { a: [-1.3, 0.0, 0.3], cp: [0.2, 0.4, -0.5], b: [1.2, -0.1, -0.2] },
    { a: [-1.0, -0.7, -0.2], cp: [-0.1, -1.1, 0.3], b: [1.5, -0.5, 0.1] },
]

const SEGS_PER_CURVE = 24
const CURVE_COUNT = CURVES.length
const TOTAL_SEGS = SEGS_PER_CURVE * CURVE_COUNT

/* Quadratic Bézier at t ∈ [0,1] */
function bezier(
    a: number[] | readonly number[],
    cp: number[] | readonly number[],
    b: number[] | readonly number[],
    t: number
): [number, number, number] {
    const u = 1 - t
    return [
        u * u * a[0] + 2 * u * t * cp[0] + t * t * b[0],
        u * u * a[1] + 2 * u * t * cp[1] + t * t * b[1],
        u * u * a[2] + 2 * u * t * cp[2] + t * t * b[2],
    ]
}

interface OrbState {
    progress: number
    speed: number
}

function DemoScene() {
    // ── Build curved line geometry ─────────────────────────────────────
    const { lineGeo, colorAttr } = useMemo(() => {
        const vertCount = TOTAL_SEGS * 2
        const positions = new Float32Array(vertCount * 3)
        const colors = new Float32Array(vertCount * 3)

        for (let c = 0; c < CURVE_COUNT; c++) {
            const { a, cp, b: bEnd } = CURVES[c]
            for (let s = 0; s < SEGS_PER_CURVE; s++) {
                const t0 = s / SEGS_PER_CURVE
                const t1 = (s + 1) / SEGS_PER_CURVE
                const p0 = bezier(a, cp, bEnd, t0)
                const p1 = bezier(a, cp, bEnd, t1)
                const segIdx = c * SEGS_PER_CURVE + s
                const vOff = segIdx * 6
                positions[vOff + 0] = p0[0]; positions[vOff + 1] = p0[1]; positions[vOff + 2] = p0[2]
                positions[vOff + 3] = p1[0]; positions[vOff + 4] = p1[1]; positions[vOff + 5] = p1[2]
            }
        }

        const g = new THREE.BufferGeometry()
        g.setAttribute("position", new THREE.BufferAttribute(positions, 3))
        const cAttr = new THREE.BufferAttribute(colors, 3)
        g.setAttribute("color", cAttr)
        return { lineGeo: g, colorAttr: cAttr }
    }, [])

    // Dim base curve
    const baseMaterial = useMemo(
        () => new THREE.LineBasicMaterial({
            color: 0x2a6fbf, transparent: true, opacity: 0.18, depthWrite: false,
        }),
        []
    )

    // Signal overlay (additive vertex colors)
    const signalMaterial = useMemo(
        () => new THREE.LineBasicMaterial({
            vertexColors: true, transparent: true, opacity: 1.0,
            depthWrite: false, blending: THREE.AdditiveBlending,
        }),
        []
    )

    // ── Orb point sprite ───────────────────────────────────────────────
    const orbGeoRef = useRef<THREE.BufferGeometry>(null!)
    const orbPositions = useMemo(() => new Float32Array(CURVE_COUNT * 3), [])
    const orbSizes = useMemo(() => new Float32Array(CURVE_COUNT), [])

    React.useEffect(() => {
        if (!orbGeoRef.current) return
        orbGeoRef.current.setAttribute("position", new THREE.BufferAttribute(orbPositions, 3))
        orbGeoRef.current.setAttribute("size", new THREE.BufferAttribute(orbSizes, 1))
    }, [orbPositions, orbSizes])

    // Big multi-layer glow shader
    const orbMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: { uTime: { value: 0 } },
            vertexShader: /* glsl */ `
        attribute float size;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (500.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
            fragmentShader: /* glsl */ `
        uniform float uTime;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;

          // 5-layer Gaussian for big soft orb
          float core   = exp(-d * d * 160.0);         // pinpoint white
          float inner  = exp(-d * d * 50.0)  * 0.9;   // bright inner
          float mid    = exp(-d * d * 18.0)  * 0.55;   // glow ring
          float outer  = exp(-d * d * 6.0)   * 0.3;   // wide halo
          float fringe = exp(-d * d * 2.5)   * 0.12;  // subtle edge

          float intensity = core + inner + mid + outer + fringe;
          intensity *= 0.88 + 0.12 * sin(uTime * 5.0);

          // White center → sky blue → deep blue at edges
          vec3 color = vec3(0.2, 0.45, 0.9) * fringe
                     + vec3(0.4, 0.75, 1.0) * (outer + mid)
                     + vec3(0.8, 0.92, 1.0) * inner
                     + vec3(1.0, 1.0, 1.0)  * core;
          color = min(color, vec3(1.0));

          gl_FragColor = vec4(color, intensity);
        }
      `,
        })
    }, [])

    // ── Orb states ─────────────────────────────────────────────────────
    const orbs = useRef<OrbState[]>([])
    if (orbs.current.length === 0) {

        for (let i = 0; i < CURVE_COUNT; i++) {
            orbs.current.push({
                progress: i * 0.25,
                speed: 0.12 + i * 0.02,
            })
        }
    }

    // ── Animate ────────────────────────────────────────────────────────
    useFrame((state, delta) => {
        const t = state.clock.getElapsedTime()
        const colors = colorAttr.array as Float32Array

        for (let c = 0; c < CURVE_COUNT; c++) {
            const orb = orbs.current[c]
            const curve = CURVES[c]

            orb.progress += orb.speed * delta
            if (orb.progress > 1.35) orb.progress = -0.15

            const p = Math.max(0, Math.min(1, orb.progress))
            const [ox, oy, oz] = bezier(curve.a, curve.cp, curve.b, p)
            orbPositions[c * 3] = ox
            orbPositions[c * 3 + 1] = oy
            orbPositions[c * 3 + 2] = oz

            // Big orb with gentle pulse
            orbSizes[c] = 0.35 + 0.05 * Math.sin(t * 4.0 + c * 2.5)

            // ── Energy trail on segments ─────────────────────────────────
            const flicker = 0.92 + 0.08 * Math.sin(t * 14 + c * 4.1)

            for (let s = 0; s < SEGS_PER_CURVE; s++) {
                const segIdx = c * SEGS_PER_CURVE + s
                const vOff = segIdx * 6

                const segStart = s / SEGS_PER_CURVE
                const segEnd = (s + 1) / SEGS_PER_CURVE

                // Distance from each vertex to orb position on curve
                const dA = orb.progress - segStart
                const dB = orb.progress - segEnd

                // Only light up segments the orb has passed or is on
                if (dA < -0.02 && dB < -0.02) {
                    colors[vOff] = 0; colors[vOff + 1] = 0; colors[vOff + 2] = 0
                    colors[vOff + 3] = 0; colors[vOff + 4] = 0; colors[vOff + 5] = 0
                    continue
                }

                // Per-vertex brightness: exponential falloff from orb position
                // Concentrated around the orb — falls off fast
                const absA = Math.abs(dA)
                const absB = Math.abs(dB)

                // Leading glow (slightly ahead of orb) + intense trail right behind
                let wA = Math.exp(-absA * absA * 25.0) // Gaussian, tight
                let wB = Math.exp(-absB * absB * 25.0)

                // Add a softer extended trail behind
                if (dA > 0) wA += Math.exp(-dA * 3.0) * 0.4
                if (dB > 0) wB += Math.exp(-dB * 3.0) * 0.4

                wA = Math.min(1, wA * flicker)
                wB = Math.min(1, wB * flicker)

                if (wA < 0.005 && wB < 0.005) {
                    colors[vOff] = 0; colors[vOff + 1] = 0; colors[vOff + 2] = 0
                    colors[vOff + 3] = 0; colors[vOff + 4] = 0; colors[vOff + 5] = 0
                    continue
                }

                // Color: white-hot near orb → blue further away
                const hotA = Math.exp(-absA * 8)
                const hotB = Math.exp(-absB * 8)

                colors[vOff + 0] = (0.3 + 0.7 * hotA) * wA
                colors[vOff + 1] = (0.6 + 0.4 * hotA) * wA
                colors[vOff + 2] = 1.0 * wA
                colors[vOff + 3] = (0.3 + 0.7 * hotB) * wB
                colors[vOff + 4] = (0.6 + 0.4 * hotB) * wB
                colors[vOff + 5] = 1.0 * wB
            }
        }

        colorAttr.needsUpdate = true
        if (orbGeoRef.current) {
            const pa = orbGeoRef.current.getAttribute("position") as THREE.BufferAttribute
            const sa = orbGeoRef.current.getAttribute("size") as THREE.BufferAttribute
            if (pa) pa.needsUpdate = true
            if (sa) sa.needsUpdate = true
        }
        orbMaterial.uniforms.uTime.value = t
    })

    return (
        <group>
            <lineSegments geometry={lineGeo} material={baseMaterial} />
            <lineSegments geometry={lineGeo} material={signalMaterial} />
            <points material={orbMaterial}>
                <bufferGeometry ref={orbGeoRef} />
            </points>
        </group>
    )
}

export function NeuralOrbDemo({ className = "" }: { className?: string }) {
    return (
        <div className={`w-full h-[400px] bg-black/90 rounded-xl border border-white/10 ${className}`}>
            <Canvas
                camera={{ position: [0, 0, 3], fov: 45 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true }}
                style={{ background: "transparent" }}
                onCreated={({ gl }) => gl.setClearColor(0x080810, 1)}
            >
                <Suspense fallback={null}>
                    <DemoScene />
                </Suspense>
            </Canvas>
        </div>
    )
}
