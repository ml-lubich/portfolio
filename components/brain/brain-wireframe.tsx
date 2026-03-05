"use client"

import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useBrainData } from "./use-brain-data"
import { createPullUniforms, injectPull, makeOrbMaterial } from "./materials"
import { NeuralOrbs } from "./neural-orbs"
import { hexNum } from "@/lib/theme"

/* ── Rotating wireframe brain with neural orb effects ──────────────── */

export function BrainWireframe() {
  const groupRef = useRef<THREE.Group>(null!)
  const orbGeoRef = useRef<THREE.BufferGeometry>(null!)
  const hitRef = useRef<THREE.Mesh>(null!)
  const result = useBrainData()

  // Fade-in factor: ramps from 0 → 1 over ~1.5 s after data loads
  const fadeRef = useRef(0)

  // Shared pull-deform uniforms
  const pull = useMemo(() => createPullUniforms(), [])
  const pullTarget = useRef(0)

  // Target opacities for fade-in
  const TARGET_BASE_OPACITY = 0.14
  const TARGET_GLOW_OPACITY = 0.05
  const TARGET_SIGNAL_OPACITY = 0.28

  // Base wireframe material (dim — lets rainbow signal shine through)
  const material = React.useMemo(() => {
    const m = new THREE.LineBasicMaterial({
      color: hexNum.wireBase,
      transparent: true,
      opacity: 0,          // start invisible
      depthWrite: false,
    })
    injectPull(m, pull)
    return m
  }, [pull])

  // Outer glow wireframe
  const glowMaterial = React.useMemo(() => {
    const m = new THREE.LineBasicMaterial({
      color: hexNum.wireGlow,
      transparent: true,
      opacity: 0,          // start invisible
      depthWrite: false,
    })
    injectPull(m, pull)
    return m
  }, [pull])

  // Signal overlay material
  const signalMaterial = React.useMemo(() => {
    const m = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,          // start invisible
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    injectPull(m, pull)
    return m
  }, [pull])

  // Orb shader material
  const orbMaterial = useMemo(() => makeOrbMaterial(pull), [pull])

  // Build signal geometry
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

  // Accumulated elapsed time (avoids deprecated THREE.Clock)
  const elapsedRef = useRef(0)

  useFrame((_state, delta) => {
    elapsedRef.current += delta
    const t = elapsedRef.current

    // Smooth fade-in: ramp from 0 → 1 over ~1.5s
    if (fadeRef.current < 1) {
      fadeRef.current = Math.min(1, fadeRef.current + delta / 1.5)
      const ease = fadeRef.current * fadeRef.current * (3 - 2 * fadeRef.current) // smoothstep
      material.opacity = TARGET_BASE_OPACITY * ease
      glowMaterial.opacity = TARGET_GLOW_OPACITY * ease
      signalMaterial.opacity = TARGET_SIGNAL_OPACITY * ease
      orbMaterial.uniforms.uFade.value = ease
    }

    orbMaterial.uniforms.uTime.value = t
    pull.uPullStrength.value +=
      (pullTarget.current - pull.uPullStrength.value) * Math.min(1, delta * 8)
  })

  if (!result || !signalGeo) return null

  const { geo, brainData } = result

  return (
    <group ref={groupRef} scale={0.82}>
      <group rotation={[-Math.PI * 0.5 + Math.PI * 0.08, 0, 0]}>
        {/* Invisible sphere for pull interaction */}
        <mesh
          ref={hitRef}
          onPointerMove={(e) => {
            if (hitRef.current) {
              pull.uPullPoint.value.copy(
                hitRef.current.worldToLocal(e.point.clone())
              )
            }
            pullTarget.current = 1
          }}
          onPointerLeave={() => { pullTarget.current = 0 }}
        >
          <sphereGeometry args={[1.35, 32, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        {/* Base wireframe */}
        <lineSegments geometry={geo} material={material} />
        <lineSegments geometry={geo} material={glowMaterial} scale={1.02} />
        {/* Signal overlay */}
        <lineSegments geometry={signalGeo.geometry} material={signalMaterial} />
        {/* Orb point sprites */}
        <points material={orbMaterial}>
          <bufferGeometry ref={orbGeoRef} />
        </points>
        {/* Neural orb logic */}
        <NeuralOrbs
          brainData={brainData}
          colorAttr={signalGeo.colorAttr}
          orbGeoRef={orbGeoRef}
        />
      </group>
    </group>
  )
}
