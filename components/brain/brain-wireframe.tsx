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
import { useTheme } from "next-themes"
import { createPullUniforms, injectPull, makeOrbMaterial } from "./materials"
import { NeuralOrbs } from "./neural-orbs"
import { hexNum } from "@/lib/theme"
import { subscribeWidthResize } from "@/lib/viewport-resize"

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

  // In light mode the mesh inverts to near-black; the wireframe has to read
  // against a pale page the same way the near-white mesh reads against a dark one.
  const { resolvedTheme } = useTheme()
  const isLight = resolvedTheme === "light"

  const material = React.useMemo(() => {
    const m = new THREE.LineBasicMaterial({
      color: isLight ? hexNum.wireBaseLight : hexNum.wireBase,
      transparent: true,
      /* 0.72 on the dark hero, not 1: at full opacity every filament is an
         opaque white stroke and the mesh reads as a scribble. Translucent
         strokes let the far side of the brain show through the near side,
         which is what gives josephheupler.com's mesh its depth. Light mode
         keeps the heavier stroke — a near-black line on a pale page has no
         glow layer helping it. */
      opacity: isLight ? 1 : 0.72,
      depthWrite: false,
    })
    injectPull(m, pull)
    return m
  }, [pull, isLight])

  const glowMaterial = React.useMemo(() => {
    const m = new THREE.LineBasicMaterial({
      color: isLight ? hexNum.wireGlowLight : hexNum.wireGlow,
      transparent: true,
      /* The halo copy of the mesh. At 0.8 it is a second visible stroke
         offset from the first (a doubled outline); at 0.38 it is a bloom. */
      opacity: isLight ? 0.8 : 0.38,
      depthWrite: false,
    })
    injectPull(m, pull)
    return m
  }, [pull, isLight])

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
    return subscribeWidthResize(apply)
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
    <group ref={groupRef} name="brain-root" scale={brainScale} rotation={[0, Math.PI * 0.5, 0]}>
      {/* Pitch 0.08π ≈ 14°, the josephheupler.com pose — measured off that
          site, not inferred. The near-lateral profile is what makes the
          silhouette legible as a brain: frontal lobe, temporal fold, stem
          hanging at the back. The 3/4 look-down this used to carry (0.155π)
          foreshortens the lobes into an anonymous blob. */}
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
        {/* Named so BrainTelemetry (components/brain/index.tsx) can measure the
            real mesh extent — the invisible hit sphere above is bigger than
            the brain and must not be what the fit guard measures. */}
        <lineSegments name="brain-mesh" geometry={geo} material={material} />
        {/* 1.045, not 1.02: the halo has to stand off the stroke far enough to
            read as light around the filament rather than as a second line. */}
        <lineSegments geometry={geo} material={glowMaterial} scale={1.045} />
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
