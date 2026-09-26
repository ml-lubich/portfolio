# Testing

## Commands

- `bun run test` — Vitest suite (also enforced by the `pre-push` git hook).
- `bun run test:e2e` — Playwright suite (also enforced by the `pre-push` git hook). Reuses whatever dev server is already running on `:3000` (`reuseExistingServer`, see `playwright.config.ts`) or boots one itself. Install browsers once with `npx playwright install chromium` if they're missing.
- `bun run test:add <slug>` — scaffold a new test file in `__tests__/`. Generates a ready-to-run stub with correct imports, naming convention guidance, and fixture path instructions. Accepts `--describe "what you are guarding"`. Example: `bun run test:add nav-scroll --describe "navbar stays transparent over the hero"`.
- `bun run build` — runs `vitest run` explicitly, then the production Next build using `bunx next build --webpack`; Turbopack currently fails on `pages-manifest.json` generation in this app-only project. Vercel executes this same script, so the test suite (including asset/media reference checks) gates every deployment.
- `bun run lint` — ESLint.

## Git hook enforcement

`bun install` installs both hooks via `scripts/install-hooks.js`:

- `pre-commit` → `bun run lint` + `bun run build` (tests + production build). Kept to Vitest speed — no browser boot — so committing stays fast.
- `pre-push` → `bun run test` (full Vitest suite, including media/resource reference checks) **then** `bun run test:e2e` (full Playwright suite: runtime-error gate, API guard rails, cross-viewport visual checks). The browser suite is pre-push only because it's slower than the commit loop should be. Do not bypass either with `--no-verify`.

## Playwright suite (`e2e/`)

- `e2e/runtime-errors.spec.ts` — **the most important gate.** Loads every real route (`/`, `/blog`, `/tools`, `/llm-prices`, `/games`, `/demo`, `/privacy`, `/terms`) and fails on any uncaught `pageerror`, any un-allow-listed `console.error`, or the Next.js dev error overlay rendering. This is the only thing in the repo that catches a page throwing at runtime — e.g. a three.js `useFrame` loop touching a stale/undefined buffer geometry — since that class of bug only exists once real animation frames run in a real browser; no amount of unit or type-checking catches it. Keep `ALLOWED_CONSOLE_ERRORS` empty unless you can name a specific, justified, benign case in a comment next to it — an empty list means every `console.error` seen so far has been a real bug.
- `e2e/about-terminal.spec.ts` — the About terminal beside the portrait (desktop + mobile): it moves on from the first bio to a different one; the card keeps **one height** across a whole type → hold → erase → next cycle (sampled for 14s after the fade-up entrance settles — the entrance changes the box on purpose); the traffic lights have a real computed colour; under `prefers-reduced-motion` the whole first bio shows at once and doesn't change. Mutation-checked: removing the invisible bio stack that reserves the height makes the card jump 69px and the spec fails.
- `e2e/api-routes.spec.ts` — hits the live routes via Playwright's `request` context (no browser). `/api/tokscale`, `/api/github`, `/api/llm-prices` are checked against their real upstreams (consistent with `media-references.test.ts`'s existing pattern of probing real URLs rather than mocking them) for a clean 200 or a typed failure, never a 500. `/api/prompt-lint` and `/api/chat` are checked for validation and rate-limiting behavior only — **no request in this file ever reaches the model**; `/api/chat`'s history validation runs before the OpenRouter call, so probing the burst limiter (`lib/ai/rate-limit.ts`) with empty-history requests exercises the real guard rail for free. The one guard rail this file cannot exercise against a live server is the missing-`OPENROUTER_API_KEY` → 503 path, since the running dev server has the key configured; that path is a one-line `if (!apiKey)` in `app/api/chat/route.ts` and is left to code review.

## Automated: MLBot chat recovery

- `__tests__/coding-guard.test.ts` — coding asks ("write a python function", "fix my code", "leetcode", "source code") are refused before the model; "error code", "what languages", and "write me an email" are not.
- `__tests__/ai-chat-stream.test.ts` — OpenRouter chunk ingest (delta fragments, final `message.content`, array content parts), empty-final-after-tools fallback (must emit grounded text, never a bare `done`), cascade errors name every failed attempt, and `app/api/chat/route.ts` is wired to those helpers.
- `__tests__/ai-profile-tools.test.ts` — `search_profile` on “What has Misha built with agents?” returns a named agent project (name hit outranks a body mention); `searchTerms` stems `agents` → `agent` and drops question stopwords. `__tests__/ai-model-slugs.test.ts` still checks the cascade slugs exist upstream and advertise tools.
- A chat is working only when one real lookup question produces at least one `event: tool`, non-empty `event: text`, and zero `event: error`. HTTP 200 plus `event: done` with no text is a fail — that was the 2026-09-14 production blank-bubble.
- `__tests__/hero-scrim-halo.test.ts` — `.hero-copy-halo` filter includes a white light bloom (`0 0 34px`) as well as the dark ink halo.
- `__tests__/oss-demos.test.ts` — every showcase entry has a real install command; `ossInstallAll()` is a copy-pasteable brew/pip/pipx/npm/git block. `__tests__/open-source-showcase.test.ts` — install lines render as selectable `<pre><code>`, not a truncated button label.
- `__tests__/oss-agent-tools.test.ts` — thirteen grid tools with short display names; `ossInstallFork()` leads with `brew tap ml-lubich/tap`. `__tests__/fork-page.test.ts` — `/fork` ships the fork block + grid. `e2e/oss-tool-grid.spec.ts` — grid visible on `#open-source`, click-to-copy works, `/fork` shows tap line.
- `e2e/visual-integrity.spec.ts` — no horizontal overflow at 390/834/1440px, every `<img>` loads (`naturalWidth > 0`), and no `bg-card`-styled panel resolves to the same computed background color as the page (the "ghosting"/"black cards" bug class) across all eight routes. Only dark mode is checked: light mode ships disabled (`lib/light-mode.ts`, `forcedTheme="dark"`, toggle not even rendered), so testing it here would just run dark mode twice. Once light mode is re-enabled by default, extend this file to cover it too.
- `e2e/wide-layout.spec.ts`, `e2e/tablet-responsive.spec.ts`, `e2e/scroll-navigation.spec.ts` — pre-existing homepage-specific layout/motion regression specs (see file headers for what each guards).

## Automated: blog listing metadata

- `__tests__/data-integrity.test.ts` — under "Blog posts data": every post has an HTTPS `coverImage`, cover URLs are **pairwise distinct**, and the cover photo id is not repeated inside the article body.

## Automated: media references

- `__tests__/media-references.test.ts` — walks `app/`, `components/`, `content/`, `data/`, `lib/`, `styles/`, and text manifests under `public/` for image/media/static resource references. Local URLs must resolve to existing files under `public/` or a valid relative file, remote media URLs must return HTTP 2xx/3xx, and remote blog cover hosts must be present in `next.config.mjs` image remote patterns.
- External URL probes use bounded request timeouts. Known bot-blocked or automation-hostile domains such as Google Scholar, LinkedIn, and Google Calendar are explicitly skipped in link smoke tests while still remaining visible in source and data tests.

## Automated: blog hydration dates

- `__tests__/blog-hydration-regression.test.ts` — guards blog render paths against timezone-sensitive date rendering by requiring the shared deterministic formatter. Blog post dates must stay as `YYYY-MM-DD` so server and browser text do not drift by timezone.

## Automated: portfolio project data

- `__tests__/data-integrity.test.ts` — under "Projects data": every project has required public card/detail fields; optional project cover images must point under `/images/`, and optional detail links must be HTTPS with a non-empty label.

## Automated: hero hydration guard

- `__tests__/hero-ssr-consistency.test.ts` — `renderToString(<Hero />)` must be deterministic (no render-time randomness) and the hero shell must not derive layout `className` from viewport hooks (SSR/client parity).

## Automated: hero brain neural orbs

- `__tests__/brain-orb-regression.test.ts` — `makeOrbMaterial()` uniform declarations match shader usage and exposes the viewport-tuned `uPointGlowMul` shader uniform; `neural-orbs.tsx` uses `getBrainOrbViewportTier` + `setDrawRange` with shared `orbGeometry` buffers (no R3F `bufferGeometry ref` race); `brain-wireframe.tsx` builds `orbBundle`, mounts `<points geometry={…}>`, and applies tier uniforms on resize; `ORB_COUNT_CAP` stays bounded (8–64).

## Automated: nav scroll-target reachability

- `__tests__/nav-scroll-targets.test.ts` — every in-page anchor used anywhere in `app/`/`components/` (nav links, `navigateTo()` calls, `href="#…"`) must be reachable **before** lazy sections mount: either a `sectionId="…"` on its `LazySection` in `app/page.tsx` (renders an always-present `[data-section]` wrapper) or an always-mounted whitelist id (`hero`, `main-content`). Guards the "nav link looks dead" regression where a target section had no pre-mount placeholder.

## Automated: navbar surface over hero

- `__tests__/nav-hero-surface.test.ts` — `computeNavPastHero` in `lib/nav-hero-surface.ts`: frosted mode only when `#hero`’s `getBoundingClientRect().bottom <= 0`; transparent while any part of the hero remains below the viewport top. Includes a shallow guard that `components/nav/index.tsx` still calls `computeNavPastHero` and retains blur-off vs blur-on class tokens.
- The same suite guards that the desktop navbar keeps the floating `.nav-glass.nav-shell` shell, renders no top scroll-progress bar, and keeps `.nav-shell` free of `backdrop-filter` so future edits do not regress to scroll flicker or a flat full-width bar.

## Automated: terminal snake game

- `__tests__/snake-game.test.ts` — `lib/snake-game.ts`: verifies initial board placement, laptop keyboard direction mapping, reversal prevention, food growth/scoring, and wall collision loss state.
- `__tests__/terminal-indentation-regression.test.ts` — guards the live terminal renderer against code indentation regressions, including the multiline TypeScript `streamInference` fixture and `<pre><code>` rendering path.

## Manual: hero brain

1. Open `/` on a **viewport width &lt; 1024px** and **≥ 1024px**.
2. Confirm brain **overall size** matches josephheupler.com 1:1 (`h-[min(92vh,860px)]` desktop, `min(54svh,420px)` phone; camera `1.55/44` desktop). Driven by the hero box + `getInitialCam`, not `useInitialScale`.
3. Confirm **orb dots** are visible (driven by `uSizeMul` in `brain-wireframe.tsx` + `orbSizes` in `neural-orbs.tsx`).

No automated visual regression for WebGL is required unless a dedicated snapshot pipeline is added.

## Blog listing payload

- `app/blog/page.tsx` passes `toBlogPostListItems(sortedPosts)` into `BlogPageClient` so the browser never hydrates with full MDX bodies (cards use `readingTime` from the MDX loader). Regression: listing interactivity must not require `post.content` on the client.

## Automated: mobile performance guardrails

- `__tests__/mobile-performance-regression.test.ts` — guards that blog listing/article client code does not import Framer Motion, blog card touch taps do not trigger route prefetch, and the homepage keeps mobile performance mode for delayed WebGL, skipped particle canvas, tighter lazy-section preload margins, stable `svh` hero sizing, hydration-stable transform-only ambient orbs, CSS-owned ambient-orb visuals, viewport-independent animated-section first render, root `ScrollShimmer` remains unmounted, metallic text gradients stay static while scrolling, and width-only brain resize listeners. `__tests__/hero-ssr-consistency.test.ts` also asserts the full seven-orb SSR tree so breakpoint detection cannot change the first client render.

## Manual: blog card → article (performance)

1. Run `bun run build` and confirm the route table lists `● /blog/[slug]` (SSG via `generateStaticParams`), not server-only rendering for posts.
2. Optional local timing after `bun run start`: request one `/blog/<slug>` from loopback; TTFB should stay low because the HTML is pre-rendered. The `/blog` index may show `ƒ` (dynamic) in the build output because of `searchParams`; that affects first paint of the listing, not SSG post payloads.
3. In the browser on `/blog`: moving the mouse over cards must not cause visible jank on click — `components/blog/blog-card.tsx` applies tilt/glare via `requestAnimationFrame` + direct DOM updates (no `setState` on `mousemove`), and card links use `prefetch={false}` with `router.prefetch` on hover/focus/touch so the client does not prefetch every post in the viewport at once.

## Automated: resource references

- `__tests__/resource-references.test.ts` — scans app, component, content, data, lib, style, and public metadata text files for local image, media, font, manifest, and binary asset references. Absolute local references must resolve under `public/`; bare relative media strings in app/content/data fail so they cannot ship as runtime 404s.

## Automated: blog hydration regression

- `__tests__/blog-hydration-regression.test.ts` — blog render paths must use `formatBlogDate`, which formats date-only post metadata in UTC and prevents server/client text drift that can surface as minified React hydration error #418.

## Automated: blog link visibility

- `__tests__/blog-link-visibility.test.ts` — guards article prose links against dark-on-dark regressions by requiring classless MDX anchor coverage, the shared `.blog-link` markdown path, visible accent color, thicker underline, hover color, and keyboard focus outline.

## Automated: About terminal bio loop

- `__tests__/about-bio-loop.test.ts` — the bio bank (`data/about-bio.ts`): at least five distinct bios, the first opens on EchoStar, every bio is 3–4 lines of ≤ 70 chars, no retired titles. The schedule (`linesCycleFrame` in `lib/install-cycle.ts`): types across line breaks keeping finished lines whole, holds, erases back up, moves to the next bio, loops forever; edge cases (empty bank, single bio, negative clock, the exact step boundary). Server render of `TerminalLoop`: identical across two passes (hydration-safe), every bio present in the invisible height-reserving stack, screen readers get the first bio once, title and traffic-light colours rendered.
- Browser behaviour: `e2e/about-terminal.spec.ts` (see the Playwright list above).

## Automated: no interpolated Tailwind classes

- `__tests__/terminal-chrome.test.ts` — fails on any `-[${…}]` class in `components/` or `app/`. Tailwind only generates classes it can read literally, so an interpolated arbitrary value (`bg-[${terminalChrome.dotClose}]`, `shadow-[${shadows.filterTag}]`) is never generated and silently renders nothing — that is how the terminals' traffic lights and the blog's glows went missing. Theme colours go in `style={{ … }}`; hover/state effects go in a plain CSS class in `app/globals.css`. Also server-renders `TerminalReveal` to check its dots and panel carry real colours, and checks the install marquee's copy button never shares an accessible name with a card's copy button (two identical names failed `e2e/oss-tool-grid.spec.ts` in strict mode and are ambiguous to screen readers).

## E2E timing rule: bound sampling loops by the clock

A spec that samples the page in a loop must stop on elapsed wall time (`const until = Date.now() + N; while (Date.now() < until)`), never on an iteration count. Each sample is a browser round-trip, so on a loaded machine a fixed count stretches past the test timeout — `e2e/hero-role-rotator.spec.ts` (240 × 100ms) timed out at 90s under a full pre-push run while passing alone.
