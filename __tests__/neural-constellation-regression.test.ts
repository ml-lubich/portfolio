/**
 * Guardrail for components/three/neural-constellation.tsx.
 *
 * Regression: the frame loop cast `ng.getAttribute("size") as THREE.BufferAttribute`
 * and set `.needsUpdate` on it unguarded. The attribute was attached via a
 * `useEffect` on a geometry ref, but R3F's `useFrame` can tick before that
 * passive effect flushes (classic effect-vs-rAF race) — so `getAttribute`
 * returned `undefined` and the property set threw:
 *   "Cannot set properties of undefined (setting 'needsUpdate')"
 *
 * The same race was already fixed once in this repo, in
 * components/brain/neural-orbs.tsx, by building the BufferGeometry
 * synchronously (attributes attached the instant the object is created,
 * no ref + effect race) plus a defensive `if (attr)` guard before
 * `needsUpdate`. This test locks in the same fix here.
 */

import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, it, expect } from "vitest"

const ROOT = path.resolve(__dirname, "..")
const src = readFileSync(
  path.join(ROOT, "components/three/neural-constellation.tsx"),
  "utf8",
)

describe("neural-constellation regression guards", () => {
  it("never dereferences a possibly-undefined buffer attribute in the frame loop", () => {
    // No bare `getAttribute(...) as THREE.BufferAttribute).needsUpdate` — every
    // such access must be guarded (assigned to a variable and checked, or
    // optional-chained) before `.needsUpdate` is set.
    expect(src).not.toMatch(
      /as THREE\.BufferAttribute\)\.needsUpdate\s*=/,
    )
  })

  it("attaches node/signal geometry attributes synchronously (no ref + effect race)", () => {
    // Root-cause fix: attributes must exist the moment the geometry object is
    // created, not be attached later via a useEffect keyed off a ref — that
    // ordering is racy against R3F's useFrame loop.
    expect(src).not.toMatch(/bufferGeometry\s+ref=\{\s*nodeGeoRef\s*\}/)
    expect(src).not.toMatch(/bufferGeometry\s+ref=\{\s*signalGeoRef\s*\}/)
  })

  it("guards every needsUpdate write on geometry attributes with an existence check", () => {
    const guardedPattern =
      /if\s*\(\s*\w+\s*\)\s*\(?\s*\w+\s*(as THREE\.BufferAttribute\s*)?\)?\.needsUpdate\s*=\s*true/g
    const matches = src.match(guardedPattern) ?? []
    // node geo (size, aGlow) + signal geo (position, size, aGlow) = 5 writes
    expect(matches.length).toBeGreaterThanOrEqual(5)
  })
})
