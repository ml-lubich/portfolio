# Architecture

## Hero 3D brain

| Concern | Where it lives | What to tune |
|--------|----------------|--------------|
| **Whole brain size** (mesh + lines + hit sphere) | `components/brain/brain-wireframe.tsx` — `useInitialScale()` | Breakpoints `0.46` / `0.48` / `0.54` by initial `innerWidth` (frozen after first read). |
| **Neural orb sprites** (glowing dots only) | `brain-wireframe.tsx` — `ShaderMaterial` + `uSizeMul` on mount (`520` / `460` / `420` / `380` by width). `neural-orbs.tsx` fills point buffers; count = `ORB_COUNT` in `constants.ts`. |
| **Camera framing** | `components/brain/index.tsx` — `getInitialCam()` | Initial `z` / `fov` (set on mount). |
| **Orb motion / graph** | `components/brain/constants.ts` | `ORB_COUNT`, `ORB_SPEED`, `CHAIN_*`, `TRAIL_LENGTH`. |

## Invariant

Do **not** confuse `useInitialScale()` with `uSizeMul`. Lowering `uSizeMul` shrinks only the sprite glow; changing `useInitialScale()` shrinks the entire brain asset.

## Background spectrum (page)

Rainbow wash orbs are **not** part of the WebGL brain. They live in `components/background-orbs.tsx` and section-level ambient divs; changes there do not affect the brain mesh.

## Blog listing performance & URLs

| Concern | Decision |
|--------|-----------|
| **Client payload** | `app/blog/page.tsx` builds `blogPostsForClient = toBlogPostListItems(sortedPosts)` for `BlogPageClient` so MDX bodies are not serialized to the browser. |
| **Cover images** | Listing cards use `next/image` with responsive `sizes` and `priority` only for the visible featured carousel slide. |
| **Motion** | Grid cards avoid `layout` / `popLayout` animations to reduce main-thread layout work on mobile. |
| **Canonical vs subdomain** | SEO canonicals and UI labels use apex + path (`getBlogCanonicalUrl()`, `getBlogPublicLabel()` from `lib/site-config.ts`). `blog.*` hosts rewrite to `/blog/*` via `proxy.ts` only. |

## Blog content

| Layer | Location | Notes |
|--------|-----------|--------|
| **Post body** (MDX) | `content/blog/<slug>.mdx` | Frontmatter: title, excerpt, date, category, tags. |
| **Listing metadata** | `data/blog/post-meta.json` | Per-slug `coverImage` and `views` (display strings). Loaded in `lib/mdx.ts` and merged when posts are read. |
