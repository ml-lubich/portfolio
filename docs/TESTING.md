# Testing

## Commands

- `bun run test` — Vitest suite (required before release per `package.json` `prebuild`).
- `bun run lint` — ESLint.

## Automated: blog listing metadata

- `__tests__/data-integrity.test.ts` — under "Blog posts data": every post has an HTTPS `coverImage`, and cover URLs are **pairwise distinct** (enforces `data/blog/post-meta.json` staying in sync with unique art per slug).

## Automated: portfolio project data

- `__tests__/data-integrity.test.ts` — under "Projects data": every project has required public card/detail fields; optional project cover images must point under `/images/`, and optional detail links must be HTTPS with a non-empty label.

## Automated: hero hydration guard

- `__tests__/hero-ssr-consistency.test.ts` — `renderToString(<Hero />)` must be deterministic (no render-time randomness) and the hero shell must not derive layout `className` from viewport hooks (SSR/client parity).

## Automated: hero brain neural orbs

- `__tests__/brain-orb-regression.test.ts` — `makeOrbMaterial()` uniform declarations match shader usage; `neural-orbs.tsx` uses `getBrainOrbViewportTier` + `setDrawRange` with shared `orbGeometry` buffers (no R3F `bufferGeometry ref` race); `brain-wireframe.tsx` builds `orbBundle` and mounts `<points geometry={…}>`; `ORB_COUNT_CAP` stays bounded (8–64).

## Automated: navbar surface over hero

- `__tests__/nav-hero-surface.test.ts` — `computeNavPastHero` in `lib/nav-hero-surface.ts`: frosted mode only when `#hero`’s `getBoundingClientRect().bottom <= 0`; transparent while any part of the hero remains below the viewport top. Includes a shallow guard that `components/nav/index.tsx` still calls `computeNavPastHero` and retains blur-off vs blur-on class tokens.

## Manual: hero brain

1. Open `/` on a **viewport width &lt; 1024px** and **≥ 1024px**.
2. Confirm brain **overall size** matches expectations (driven by `useInitialScale`).
3. Confirm **orb dots** are visible (driven by `uSizeMul` in `brain-wireframe.tsx` + `orbSizes` in `neural-orbs.tsx`).

No automated visual regression for WebGL is required unless a dedicated snapshot pipeline is added.

## Blog listing payload

- `app/blog/page.tsx` passes `toBlogPostListItems(sortedPosts)` into `BlogPageClient` so the browser never hydrates with full MDX bodies (cards use `readingTime` from the MDX loader). Regression: listing interactivity must not require `post.content` on the client.

## Manual: blog card → article (performance)

1. Run `bun run build` and confirm the route table lists `● /blog/[slug]` (SSG via `generateStaticParams`), not server-only rendering for posts.
2. Optional local timing after `bun run start`: request one `/blog/<slug>` from loopback; TTFB should stay low because the HTML is pre-rendered. The `/blog` index may show `ƒ` (dynamic) in the build output because of `searchParams`; that affects first paint of the listing, not SSG post payloads.
3. In the browser on `/blog`: moving the mouse over cards must not cause visible jank on click — `components/blog/blog-card.tsx` applies tilt/glare via `requestAnimationFrame` + direct DOM updates (no `setState` on `mousemove`), and card links use `prefetch={false}` with `router.prefetch` on hover/focus/touch so the client does not prefetch every post in the viewport at once.
