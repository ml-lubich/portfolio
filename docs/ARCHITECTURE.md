# Architecture

## Hero 3D brain

| Concern | Where it lives | What to tune |
|--------|----------------|--------------|
| **Whole brain size** (mesh + lines + hit sphere) | `components/brain/brain-wireframe.tsx` — `useInitialScale()` | Breakpoints `0.46` / `0.48` / `0.54` by initial `innerWidth` (frozen after first read). |
| **Neural orb sprites** (glowing dots only) | `components/brain/constants.ts` — `getBrainOrbViewportTier()` controls active count, `sizeBase` / `sizeAmp`, `uSizeMul`, `trailGlowMul`, and `pointGlowMul`. `brain-wireframe.tsx` applies `uSizeMul` + `uPointGlowMul`; `neural-orbs.tsx` fills point buffers and applies active count + trail glow. |
| **Camera framing** | `components/brain/index.tsx` — `getInitialCam()` | Initial `z` / `fov` (set on mount). |
| **Orb motion / graph** | `components/brain/constants.ts` | `ORB_COUNT`, `ORB_SPEED`, `CHAIN_*`, `TRAIL_LENGTH`. |

## Invariant

Do **not** confuse `useInitialScale()` with `uSizeMul` / `uPointGlowMul`. Lowering `uSizeMul` shrinks only the sprite glow; lowering `uPointGlowMul` dims only point-sprite intensity; changing `useInitialScale()` shrinks the entire brain asset.

## Background spectrum (page)

Rainbow wash orbs are **not** part of the WebGL brain. They live in `components/background-orbs.tsx` and section-level ambient divs; changes there do not affect the brain mesh.

`components/background-orbs.tsx` renders the same seven decorative orb nodes during SSR and the first client render. Orb position, color, blur, animation, mobile overrides, and paused/running state are owned by `app/globals.css` through stable classes and `data-orbs-in-view`; do not reintroduce inline visual styles or viewport-based render branches for those properties.

`components/animations/animated-section.tsx` also keeps first-render reveal styling independent of viewport hooks. Entrance visibility and settling are expressed through `data-reveal-*` attributes plus CSS classes so React hydrates stable attributes before IntersectionObserver updates run.

## Blog listing performance & URLs

| Concern | Decision |
|--------|-----------|
| **Client payload** | `app/blog/page.tsx` builds `blogPostsForClient = toBlogPostListItems(sortedPosts)` for `BlogPageClient` so MDX bodies are not serialized to the browser. |
| **Cover images** | Listing cards use `next/image` with responsive `sizes` and `priority` only for the visible featured carousel slide. |
| **Motion** | Blog listing and article routes avoid Framer Motion; route-level animation is plain CSS/markup so mobile hydration does not pull in the animation runtime. Grid cards avoid `layout` / `popLayout` animations to reduce main-thread layout work on mobile. |
| **Route prefetch** | Blog cards prefetch on hover/focus only. Touch start does not trigger prefetch, so a mobile tap is not competing with navigation image/JS fetches. |
| **Canonical vs subdomain** | SEO canonicals and UI labels use apex + path (`getBlogCanonicalUrl()`, `getBlogPublicLabel()` from `lib/site-config.ts`). `blog.*` hosts rewrite to `/blog/*` via `proxy.ts` only. |

## Mobile homepage performance

| Concern | Decision |
|--------|----------|
| **Hero WebGL** | `components/hero/index.tsx` defaults to mobile performance mode on first paint and loads `Brain3D` on mobile only after idle. Desktop can still sync the brain reveal with the name animation. |
| **Hero particles** | `ParticleCanvas` is skipped while mobile performance mode is active; the spectrum background remains as the lightweight visual layer. |
| **Lazy sections** | `components/layout/lazy-section.tsx` keeps the desktop `400px` preload margin but uses a tighter `120px` default margin on mobile so below-fold chunks mount closer to the viewport. |

## Blog content

| Layer | Location | Notes |
|--------|-----------|--------|
| **Post body** (MDX) | `content/blog/<slug>.mdx` | Frontmatter: title, excerpt, date, category, tags. |
| **Listing metadata** | `data/blog/post-meta.json` | Per-slug `coverImage` and `views` (display strings). Loaded in `lib/mdx.ts` and merged when posts are read. |
