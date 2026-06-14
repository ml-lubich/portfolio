# Testing

## Commands

- `bun run test` — Vitest suite (also enforced by the `pre-push` git hook).
- `bun run test:add <slug>` — scaffold a new test file in `__tests__/`. Generates a ready-to-run stub with correct imports, naming convention guidance, and fixture path instructions. Accepts `--describe "what you are guarding"`. Example: `bun run test:add nav-scroll --describe "navbar stays transparent over the hero"`.
- `bun run build` — runs `vitest run` explicitly, then the production Next build using `bunx next build --webpack`; Turbopack currently fails on `pages-manifest.json` generation in this app-only project. Vercel executes this same script, so the test suite (including asset/media reference checks) gates every deployment.
- `bun run lint` — ESLint.

## Git hook enforcement

`bun install` installs both hooks via `scripts/install-hooks.js`:

- `pre-commit` → `bun run lint` + `bun run build` (tests + production build).
- `pre-push` → `bun run test` (full suite, including media/resource reference checks). Do not bypass with `--no-verify`.

## Automated: blog listing metadata

- `__tests__/data-integrity.test.ts` — under "Blog posts data": every post has an HTTPS `coverImage`, and cover URLs are **pairwise distinct** (enforces `data/blog/post-meta.json` staying in sync with unique art per slug).

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

## Automated: navbar surface over hero

- `__tests__/nav-hero-surface.test.ts` — `computeNavPastHero` in `lib/nav-hero-surface.ts`: frosted mode only when `#hero`’s `getBoundingClientRect().bottom <= 0`; transparent while any part of the hero remains below the viewport top. Includes a shallow guard that `components/nav/index.tsx` still calls `computeNavPastHero` and retains blur-off vs blur-on class tokens.
- The same suite guards that the desktop navbar keeps the floating `.nav-glass.nav-shell` shell so future edits do not regress to a flat full-width bar.

## Automated: terminal snake game

- `__tests__/snake-game.test.ts` — `lib/snake-game.ts`: verifies initial board placement, laptop keyboard direction mapping, reversal prevention, food growth/scoring, and wall collision loss state.

## Manual: hero brain

1. Open `/` on a **viewport width &lt; 1024px** and **≥ 1024px**.
2. Confirm brain **overall size** matches expectations (driven by `useInitialScale`).
3. Confirm **orb dots** are visible (driven by `uSizeMul` in `brain-wireframe.tsx` + `orbSizes` in `neural-orbs.tsx`).

No automated visual regression for WebGL is required unless a dedicated snapshot pipeline is added.

## Blog listing payload

- `app/blog/page.tsx` passes `toBlogPostListItems(sortedPosts)` into `BlogPageClient` so the browser never hydrates with full MDX bodies (cards use `readingTime` from the MDX loader). Regression: listing interactivity must not require `post.content` on the client.

## Automated: mobile performance guardrails

- `__tests__/mobile-performance-regression.test.ts` — guards that blog listing/article client code does not import Framer Motion, blog card touch taps do not trigger route prefetch, and the homepage keeps mobile performance mode for delayed WebGL, skipped particle canvas, tighter lazy-section preload margins, stable `svh` hero sizing, hydration-stable transform-only ambient orbs, CSS-owned ambient-orb visuals, viewport-independent animated-section first render, throttled scroll shimmer, and width-only brain resize listeners. `__tests__/hero-ssr-consistency.test.ts` also asserts the full seven-orb SSR tree so breakpoint detection cannot change the first client render.

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
