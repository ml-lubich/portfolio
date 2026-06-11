# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Fixed

- Fixed the "A Day in My Life" live terminal collapsing code indentation while typing: cmd/out/code lines now render with `whitespace-pre-wrap`, so leading tabs/spaces in Python snippets and multi-space column alignment in command output are preserved. Added `__tests__/terminal-indentation-regression.test.ts` guarding the fix.

### Added

- Added a proprietary all-rights-reserved `LICENSE` at the repo root: the portfolio source, design, and content may not be copied, reused, or repurposed without written permission.

### Fixed

- Fixed the homepage React hydration warning caused by mobile-only ambient-orb style overrides and viewport-derived animated-section entrance styles. Ambient orb geometry/animation is now CSS/data-attribute driven instead of inline style driven, and animated sections no longer read viewport breakpoints for their first render.
- Hardened external link/media smoke tests with bounded request timeouts and an explicit skip for Google Calendar bot-blocking so CI does not hang on valid third-party links.
- Removed broad visual jitter from the homepage: ambient hero orbs now use static blur with transform-only drift instead of per-frame hue/filter animation, scroll-linked metallic shimmer updates are quantized and disabled on coarse/reduced-motion devices, and element scroll-progress bars ignore mobile browser chrome height-only resize events.
- Fixed the homepage hero hydration mismatch by making the ambient-orb DOM deterministic across SSR and first client render. Mobile now hides extra decorative orbs with stable CSS classes instead of slicing the rendered tree during breakpoint detection, and the hero shell uses stable `svh` sizing rather than dynamic viewport height.
- Reduced hero 3D brain flicker on desktop: the rotating wireframe lines now render with MSAA antialiasing and a 2x DPR cap (was `antialias: false` / DPR 1.5), so thin lines no longer crawl/shimmer as the brain auto-rotates. Also softened two synchronized per-frame strobe terms — the orb glow breathe (`0.88 + 0.12*sin(t*5)` -> `0.95 + 0.05*sin(t*2)`) and the neural-trail flicker (`0.96 + 0.04*sin(t*3.5)` -> `0.98 + 0.02*sin(t*1.8)`) — which read as flicker on the otherwise static hero.

### Changed

- Documented the approval-gated release flow: verified changes push to `origin/dev` first, then promote to production only after Misha approves the dev deployment.
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
