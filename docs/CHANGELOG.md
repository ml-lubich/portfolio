# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Added

- Added `/tools` with a polished AI project cost estimator, deterministic system prompt linter, optional rate-limited Hugging Face critique endpoint, sitemap exposure, and nav dropdown entry.
- Added a recurring-style `State of AI — June 2026` post with a monthly industry pulse format, concrete market framing, and chart-backed strategy checklist.
- Expanded the blog timeline from `2026-04-06` through `2026-06-15` with eight new posts across AI architecture, MLOps, engineering culture, and product execution.
- Added mixed-length editorial content (short tactical briefs + long-form deep dives) so reading depth now varies by topic instead of clustering around a single article length.
- Added additional chart-backed visual narratives (pipeline, pie, comparison, and tree JSON fences) in new posts, aligned to the blog chart schema so MDX visualization rendering remains reliable.

### Changed

- Reworked flagship June blog posts to use stronger hooks, more first-person project context, concrete impact metrics, failed-attempt lessons, and a more casual but conservative Silicon Valley operator voice.

### Fixed

- Fixed `/llm-prices` search rendering so an `opus` query does not keep stale Grok rows visible when the upstream pricing feed reuses model identifiers.

- Live terminal code lines now render through a `<pre><code>` pair and the regression suite locks the multiline `streamInference` snippet indentation, so generated code remains tabbed before and after syntax highlighting.
- Live terminal code lines changed from inline `<span>` to `<code>` flex-item (`flex-1 min-w-0 font-mono whitespace-pre-wrap`). Leading spaces in indented Python snippets no longer collapse during the typing animation — the browser was discarding leading-whitespace-only inline text nodes on each keystroke burst. Regression test updated to assert `<code>` element, `font-mono`, and `flex-1`.
- Removed `break-all` from code line renderer (was incorrectly breaking in the middle of identifiers); `whitespace-pre-wrap` with a block-level flex item handles long-line wrapping correctly.

- Live terminal cmd/out/code lines now render with `[tab-size:4]` and explicit word-breaking (`break-words` for cmd/out), so aligned columns in output lines and long command strings wrap instead of overflowing the terminal card.

### Added

- Test gate is now explicit in the `build` script (`vitest run && bunx next build --webpack`) instead of relying on the `prebuild` lifecycle hook, so Vercel deployments always run the full suite — including asset/media reference checks — before building.
- Added a `pre-push` git hook (`scripts/pre-push.sh`, installed by `scripts/install-hooks.js`) that runs the full Vitest suite before any push.

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
