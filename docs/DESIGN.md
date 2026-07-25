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
- Live code lines render through a preformatted `<pre><code>` pair so indentation in generated snippets is preserved before and after syntax highlighting.
- `lib/snake-game.ts` contains the pure Snake state transitions so movement, collision, growth, and keyboard mapping can be tested independently from React rendering.

## Skill Storm density (2026-07-24)

- Visual reference: `theodouwes-site` SkillStorm (CSS 3D carousel). Portfolio uses the same ring-band idea with denser pill packing so a larger skill bank reads as a cloud, not a sparse ring.
- Data: `data/skills.ts` is the storm source (`skillCategories.flatMap(items)`).

## Agent tooling sections (2026-07-24)

- `#value-maxxing` — short manifesto (valuemaxxing over tokenmaxxing).
- `#tool-matrix` — table from `data/tool-matrix.ts`; yes / partial / — cells only.

## Open-Source Showcase & chrome fixes (2026-07-25)

- `#open-source` leads the projects section: curated public CLI/MCP projects (`data/oss-demos.ts`) as glass demo cards — an animated terminal demo per card (`DemoTerminal`: IntersectionObserver-gated typing; `prefers-reduced-motion` renders the final frame immediately), stats via `AnimatedCounter` (numeric values only; text stats render plain), tags, GitHub link, and a copyable install string. **One terminal types at a time** — the container activates only the highest-intersection card. The marquee below is retitled "Selected Work" and reads as the breadth tier.
- **Nav breakpoint policy:** the inline desktop link row requires ≥1280px (`xl:`); 768–1279px uses the mobile hamburger + overlay. The three gates (link row `xl:flex`, toggle `xl:hidden`, overlay `xl:hidden`) must always move together — splitting them re-introduces the iPad clipping bug.
- **Logo mark:** `components/site-logo-mark.tsx` is an inline-SVG "ML" monogram on a dark backing tile — resolution-independent, no raster, no tech-blue; the nav tile carries a higher-contrast border/bg than the old liquid-glass treatment.
- **Vertical rhythm:** a single spacing knob (`LAZY_SECTION_TOP` in `app/page.tsx`: `pt-4 md:pt-8 lg:pt-10`) governs every LazySection boundary; no per-section ad-hoc margins (guarded by `__tests__/section-rhythm.test.ts`).
- **Tablet detail drawer:** at compact widths ≥768px the scroll-stack `DetailPanel` presents as a fixed right-edge drawer (in-viewport by construction, `slide-in-from-right`); phones keep the full-viewport layer, desktop ≥1367px keeps the centered modal.
