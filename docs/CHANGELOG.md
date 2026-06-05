# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Fixed

- Reduced hero 3D brain flicker on desktop: the rotating wireframe lines now render with MSAA antialiasing and a 2x DPR cap (was `antialias: false` / DPR 1.5), so thin lines no longer crawl/shimmer as the brain auto-rotates. Also softened two synchronized per-frame strobe terms — the orb glow breathe (`0.88 + 0.12*sin(t*5)` -> `0.95 + 0.05*sin(t*2)`) and the neural-trail flicker (`0.96 + 0.04*sin(t*3.5)` -> `0.98 + 0.02*sin(t*1.8)`) — which read as flicker on the otherwise static hero.

### Changed

- Reworked the navbar capsule into a stable liquid-glass surface: removed the hard border (soft layered glass rim instead) and added a static specular sheen for the wet-glass look.

### Fixed

- Smoothed section reveal animations on laptop/desktop: `AnimatedSection` no longer mounts a per-section scroll listener that ran `getBoundingClientRect()` plus a transform write every scroll frame. With ~12 sections this was thrashing layout each frame (the staggered/glitchy feel). The reveal is now a single GPU-composited CSS transition, the entrance is snappier (0.55s desktop / 0.42s mobile instead of 1.2s), `will-change` is released once the reveal settles so each section stops holding a GPU layer, and reduced-motion visitors skip the animation entirely.
- Added Bun `ci` and `ship:dev` scripts so local pre-ship verification has one documented command.
- Modernized the homepage navigation into a floating glass capsule with upgraded active-link, CTA, logo, and mobile-toggle treatments.

### Fixed

- Eliminated navbar scroll flicker at the hero boundary: the capsule backdrop blur is now always composited and only changes radius (light over the hero, deeper once scrolled) instead of toggling `backdrop-filter` on/off, which was creating and destroying a render layer every time the surface flipped.
- Eliminated navbar scroll jitter: the capsule no longer applies an always-on `backdrop-filter` blur over the animated WebGL hero. The frosted blur now switches on only after scrolling past the hero (gated by `data-nav-scrolled`), so the live brain is never re-blurred every frame.

## [0.2.0] - 2026-06-01

### Changed

- Established `VERSION` as the root release marker and mirrored it in `package.json`.
