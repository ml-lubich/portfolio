/**
 * Guardrails for hero WebGL neural orbs: GLSL uniform declarations must match usage,
 * geometry attributes must not rely on a ref-only effect that bails forever, and
 * baseline tuning (orb count / sprite size) must stay in sane visible ranges.
 */

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, it, expect } from "vitest"
import { ORB_COUNT_CAP } from "@/components/brain/constants"
import { createPullUniforms, makeOrbMaterial } from "@/components/brain/materials"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, "..")

function declaredUniformNames(shaderSource: string): Set<string> {
  const names = new Set<string>()
  const re = /uniform\s+\w+\s+(\w+)\s*;/g
  let m: RegExpExecArray | null
  while ((m = re.exec(shaderSource)) !== null) {
    names.add(m[1])
  }
  return names
}

describe("brain orb regression guards", () => {
  it("makeOrbMaterial: every uniform used in a shader stage is declared in that stage", () => {
    const mat = makeOrbMaterial(createPullUniforms())
    const vertDecl = declaredUniformNames(mat.vertexShader)
    const fragDecl = declaredUniformNames(mat.fragmentShader)

    for (const name of Object.keys(mat.uniforms)) {
      if (new RegExp(`\\b${name}\\b`).test(mat.vertexShader)) {
        expect(
          vertDecl.has(name),
          `${name} referenced in vertex shader but missing uniform declaration`,
        ).toBe(true)
      }
      if (new RegExp(`\\b${name}\\b`).test(mat.fragmentShader)) {
        expect(
          fragDecl.has(name),
          `${name} referenced in fragment shader but missing uniform declaration`,
        ).toBe(true)
      }
    }
  })

  it("constants: ORB_COUNT_CAP stays a positive pool size for neural orbs", () => {
    expect(Number.isFinite(ORB_COUNT_CAP)).toBe(true)
    expect(ORB_COUNT_CAP).toBeGreaterThanOrEqual(8)
    expect(ORB_COUNT_CAP).toBeLessThanOrEqual(64)
  })

  it("neural-orbs: uses tiered draw range + shared buffers (no fragile ref-only geometry)", () => {
    const src = readFileSync(
      join(repoRoot, "components/brain/neural-orbs.tsx"),
      "utf8",
    )
    expect(src).toContain("getBrainOrbViewportTier")
    expect(src).toContain("setDrawRange")
    expect(src).toContain("orbGeometry")
    expect(src).toContain("ORB_COUNT_CAP")
    expect(src).toMatch(/orbSizes\[i\]\s*=/)
  })

  it("brain-wireframe: explicit orb geometry + points + tier uniforms", () => {
    const src = readFileSync(
      join(repoRoot, "components/brain/brain-wireframe.tsx"),
      "utf8",
    )
    expect(src).toContain("getBrainOrbViewportTier")
    expect(src).toContain("orbBundle")
    expect(src).toContain("orbMaterial.uniforms.uFade.value = 1")
    expect(src).toMatch(/<points\b/)
    expect(src).not.toMatch(/<bufferGeometry\s+ref=\{\s*orbGeoRef\s*\}/)
  })
})
