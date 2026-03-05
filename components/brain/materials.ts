import * as THREE from "three"
import type { PullUniforms } from "./types"
import { glsl } from "@/lib/theme"

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
  ; (mat as any).onBeforeCompile = (shader: any) => {
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
      uFade: { value: 0 },
      uPullPoint: pull?.uPullPoint ?? { value: new THREE.Vector3() },
      uPullStrength: pull?.uPullStrength ?? { value: 0 },
      uPullRadius: pull?.uPullRadius ?? { value: 0.35 },
    },
    vertexShader: /* glsl */ `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform vec3 uPullPoint;
      uniform float uPullStrength;
      uniform float uPullRadius;
      void main() {
        vColor = color;
        vec3 pos = position;
        vec3 _dir = uPullPoint - pos;
        float _d = length(_dir);
        if (_d < uPullRadius && _d > 0.001 && uPullStrength > 0.0) {
          float _f = 1.0 - _d / uPullRadius;
          _f *= _f;
          pos += (_dir / _d) * _f * uPullStrength * 0.12;
        }
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (570.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uFade;
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;

        float core   = exp(-d * d * 160.0) * 0.38;
        float inner  = exp(-d * d * 50.0)  * 0.32;
        float mid    = exp(-d * d * 18.0)  * 0.18;
        float outer  = exp(-d * d * 6.0)   * 0.09;
        float fringe = exp(-d * d * 2.5)   * 0.035;

        float intensity = core + inner + mid + outer + fringe;
        intensity *= 0.88 + 0.12 * sin(uTime * 5.0);
        intensity *= uFade;

        vec3 grey = vec3(0.90, 0.90, 0.94);
        vec3 color = mix(vColor, grey, 0.3) * fringe
                   + mix(vColor, grey, 0.25) * (outer + mid)
                   + mix(vColor, grey, 0.5) * inner
                   + mix(grey, vec3(1.0), 0.5) * core;
        color = min(color, vec3(1.0));

        gl_FragColor = vec4(color, intensity);
      }
    `,
  })
}
