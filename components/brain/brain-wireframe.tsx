"use client"

import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useBrainData } from "./use-brain-data"
import {
  ORB_COUNT_CAP,
  getBrainMeshViewportScale,
  getBrainOrbViewportTier,
} from "./constants"
import { createPullUniforms, injectPull, makeOrbMaterial } from "./materials"
import { NeuralOrbs } from "./neural-orbs"
import { hexNum } from "@/lib/theme"

/* ── Rotating wireframe brain with neural orb effects ──────────────── */

function useInitialScale() {
  const scaleRef = React.useRef<number | null>(null)
  if (scaleRef.current === null && typeof window !== "undefined") {
    scaleRef.current = getBrainMeshViewportScale(window.innerWidth)
  }
  return scaleRef.current ?? getBrainMeshViewportScale(1280)
}

export function BrainWireframe() {
  const groupRef = useRef<THREE.Group>(null!)
  const hitRef = useRef<THREE.Mesh>(null!)
  const result = useBrainData()
  const brainScale = useInitialScale()

  const pull = useMemo(() => createPullUniforms(), [])
  const pullTarget = useRef(0)

  const material = React.useMemo(() => {
    const m = new THREE.LineBasicMaterial({
      color: hexNum.wireBase,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    })
    injectPull(m, pull)
    return m
  }, [pull])

  const glowMaterial = React.useMemo(() => {
    const m = new THREE.LineBasicMaterial({
      color: hexNum.wireGlow,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    })
    injectPull(m, pull)
    return m
  }, [pull])

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

  const orbMaterial = useMemo(() => makeOrbMaterial(pull), [pull])

  React.useEffect(() => {
    const apply = () => {
      const tier = getBrainOrbViewportTier(window.innerWidth)
      orbMaterial.uniforms.uSizeMul.value = tier.uSizeMul
      orbMaterial.uniforms.uPointGlowMul.value = tier.pointGlowMul
    }
    apply()
    window.addEventListener("resize", apply, { passive: true })
    return () => window.removeEventListener("resize", apply)
  }, [orbMaterial])

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

  /**
   * Orb buffers created synchronously with geometry so R3F never mounts an empty
   * `<bufferGeometry ref>` and races NeuralOrbs’ attribute install.
   */
  const orbBundle = useMemo(() => {
    if (!result) return null
    const positions = new Float32Array(ORB_COUNT_CAP * 3)
    const sizes = new Float32Array(ORB_COUNT_CAP)
    const colors = new Float32Array(ORB_COUNT_CAP * 3)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    const tier = getBrainOrbViewportTier(
      typeof window !== "undefined" ? window.innerWidth : 1280
    )
    geometry.setDrawRange(0, tier.activeOrbCount)
    return { positions, sizes, colors, geometry }
  }, [result])

  const elapsedRef = useRef(0)

  useFrame((_state, delta) => {
    elapsedRef.current += delta
    const t = elapsedRef.current
    orbMaterial.uniforms.uFade.value = 1
    orbMaterial.uniforms.uTime.value = t
    pull.uPullStrength.value +=
      (pullTarget.current - pull.uPullStrength.value) * Math.min(1, delta * 8)
  })

  if (!result || !signalGeo || !orbBundle) return null

  const { geo, brainData } = result

  return (
    <group ref={groupRef} scale={brainScale} rotation={[0, Math.PI * 0.5, 0]}>
      <group rotation={[-Math.PI * 0.5 + Math.PI * 0.08, 0, 0]}>
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
          onPointerLeave={() => {
            pullTarget.current = 0
          }}
        >
          <sphereGeometry args={[1.35, 32, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <lineSegments geometry={geo} material={material} />
        <lineSegments geometry={geo} material={glowMaterial} scale={1.02} />
        <lineSegments geometry={signalGeo.geometry} material={signalMaterial} />
        <points geometry={orbBundle.geometry} material={orbMaterial} />
        <NeuralOrbs
          brainData={brainData}
          colorAttr={signalGeo.colorAttr}
          orbGeometry={orbBundle.geometry}
          orbPositions={orbBundle.positions}
          orbSizes={orbBundle.sizes}
          orbColors={orbBundle.colors}
        />
      </group>
    </group>
  )
}
