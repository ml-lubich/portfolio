import * as THREE from "three"
import type { PullUniforms } from "./types"

/* ── Create pull-deform uniforms ──────────────────────────────────── */

export function createPullUniforms(): PullUniforms {
  return {
    uPullPoint: { value: new THREE.Vector3() },
    uPullStrength: { value: 0 },
    uPullRadius: { value: 0.35 },
  }
}

/* ── Inject GPU pull-displacement into Three.js material ──────────── */

export function injectPull(mat: THREE.Material, u: PullUniforms) {
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

/* ── 5-layer Gaussian orb glow shader (with pull displacement) ────── */

export function makeOrbMaterial(pull?: PullUniforms) {
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
        gl_PointSize = size * (620.0 / -mv.z);
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
