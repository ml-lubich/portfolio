# Design

## 3D hero

- **Hero placement (CSS):** The WebGL brain sits in `components/hero/index.tsx` inside a square sized from `vw` (desktop uses full hero; below `sm` the square is ~`68vw` with extra top padding on the brain layer and on the hero section so the H1/role block clears the fixed nav). On viewports below `sm`, avoid flex vertical centering plus negative `translateY` (crown clips under `overflow-hidden`); use `items-start`, top padding, and a positive `translateY` so the mesh sits lower in the hero.
- **Mobile chrome:** Header logo uses `h-12 w-12` below `sm` and `h-16 w-16` from `sm` up (`components/nav/index.tsx`).
- **Nav surface:** While `#hero` is still in view (its bottom edge is below the viewport top), the fixed header stays transparent without backdrop blur so the hero brain reads through the bar. Once the hero has fully scrolled off (`#hero`’s bottom is at or above the viewport top), the bar switches to the frosted glass treatment for legibility over page sections.
- The brain reads as a single focal object: wireframe + additive signal lines + point-sprite “neural orbs” (`ORB_COUNT` traveling particles; `uSizeMul` is set once from viewport width in `brain-wireframe.tsx`).

## Documentation UX

- Canonical specs live under `docs/` as Markdown. The production app does not serve these paths; crawlers are instructed to ignore `/docs/` (see `app/robots.ts`).

## Terminal Interactivity

- `components/terminal/index.tsx` owns the homepage terminal chrome and mode switch. The animated session feed stays the default mode, while Snake mounts as a local client-only panel inside the same terminal body.
- `lib/snake-game.ts` contains the pure Snake state transitions so movement, collision, growth, and keyboard mapping can be tested independently from React rendering.
