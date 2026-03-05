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
      uSizeMul: { value: 380.0 },
      uPullPoint: pull?.uPullPoint ?? { value: new THREE.Vector3() },
      uPullStrength: pull?.uPullStrength ?? { value: 0 },
      uPullRadius: pull?.uPullRadius ?? { value: 0.35 },
    },
    vertexShader: /* glsl */ `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uSizeMul;
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
        gl_PointSize = size * (uSizeMul / -mv.z);
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

        // Smooth gaussian layers — no hard edges
        float core   = exp(-d * d * 120.0);
        float inner  = exp(-d * d * 40.0)  * 0.85;
        float mid    = exp(-d * d * 14.0)  * 0.50;
        float outer  = exp(-d * d * 5.0)   * 0.28;
        float fringe = exp(-d * d * 2.0)   * 0.10;

        float intensity = core + inner + mid + outer + fringe;
        // Soft edge fade instead of hard discard boundary
        intensity *= smoothstep(0.5, 0.25, d);
        intensity *= 0.88 + 0.12 * sin(uTime * 5.0);
        intensity *= uFade;

        vec3 color = ${glsl.glowColor} * fringe
                   + vec3(0.35, 0.65, 0.88) * (outer + mid)
                   + vec3(0.70, 0.82, 0.90) * inner
                   + vec3(0.92, 0.92, 0.94)  * core;
        color = min(color, vec3(1.0));

        gl_FragColor = vec4(color, intensity);
      }
    `,
  })
}

/* ── Gradient wireframe material (dark→white + depth + rim glow) ──── */

export function makeWireGradientMaterial(pull: PullUniforms, opacity: number) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uOpacity: { value: opacity },
      uPullPoint: pull.uPullPoint,
      uPullStrength: pull.uPullStrength,
      uPullRadius: pull.uPullRadius,
    },
    vertexShader: /* glsl */ `
      uniform vec3 uPullPoint;
      uniform float uPullStrength;
      uniform float uPullRadius;
      varying float vGrad;
      varying vec3 vMvPos;
      varying vec3 vPos;
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
        vGrad = smoothstep(-1.2, 1.2, pos.y);
        vMvPos = mv.xyz;
        vPos = pos;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying float vGrad;
      varying vec3 vMvPos;
      varying vec3 vPos;
      void main() {
        // Enhanced 3D grey/white gradient: dark grey bottom → bright white top
        vec3 deepGrey  = vec3(0.07, 0.08, 0.10);
        vec3 midGrey   = vec3(0.30, 0.32, 0.36);
        vec3 lightGrey = vec3(0.58, 0.60, 0.65);
        vec3 brightWhite = vec3(0.80, 0.82, 0.85);

        // Multi-stop gradient for realistic 3D shading
        vec3 color;
        if (vGrad < 0.3) {
          color = mix(deepGrey, midGrey, vGrad / 0.3);
        } else if (vGrad < 0.65) {
          color = mix(midGrey, lightGrey, (vGrad - 0.3) / 0.35);
        } else {
          color = mix(lightGrey, brightWhite, (vGrad - 0.65) / 0.35);
        }

        // Depth-based brightness (closer to camera = brighter)
        float depth = -vMvPos.z;
        float df = smoothstep(4.5, 1.2, depth);
        color *= 0.4 + 0.6 * df;

        // Strong rim glow — silhouette edge highlight for 3D pop
        vec3 viewDir = normalize(-vMvPos);
        vec3 posDir  = normalize(vPos);
        float rim = pow(1.0 - abs(dot(viewDir, posDir)), 2.5);
        // Subtle teal tint on rim for cursor.com feel
        color += vec3(0.04, 0.10, 0.12) * rim;

        // Specular-like highlight on top-facing surfaces
        float topLight = max(0.0, dot(normalize(vPos), vec3(0.0, 1.0, 0.3)));
        color += brightWhite * pow(topLight, 4.0) * 0.05;

        gl_FragColor = vec4(color, uOpacity);
      }
    `,
  })
}
