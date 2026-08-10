# Design

## Type system & tokens — cua.ai landing-redesign (2026-08-10)

Visual reference: `cua.ai` (its `<html class="landing-redesign">` build). Adopted its
design *language* over the existing page structure; sections, hero brain, skill storm and
terminal are unchanged.

- **Fonts** (`app/layout.tsx` + `tailwind.config.ts`): `font-sans` → **Urbanist**, `font-display` →
  **Instrument Serif**, mono unchanged (**JetBrains Mono**). Geist remains as the sans fallback.
- **Instrument Serif is 400-only.** Existing headings carry `font-light`…`font-bold`, so
  `.font-display { font-synthesis-weight: none }` in `globals.css` blocks faux-bold — the serif
  always renders as a true 400, matching cua. Do not remove this without also normalising the
  weight utilities on all `font-display` call sites.
- **Ink:** `--muted-foreground` moved `215 15% 55%` → `217 15% 69%` (cua `--color-ink-muted`
  `#a4adbb`); secondary copy no longer sinks into the background.
- **Accents:** `--brand` `205 100% 69%` (cua `#61bcff`), plus `--brand-soft`, `--brand-glow`,
  `--hairline`. Hue 205 is deliberately *not* the banned 217 tech blue, and brand is reserved for
  rules/glows/hairlines — headline text keeps the metallic silver sheen
  (`__tests__/no-tech-blue.test.ts`).
- **Radii:** `--radius` `0.75rem` → `0.625rem` (cua `--radius-card` 10px); `--radius-card-lg` 1.5rem.
- Surfaces were already within ~1% of cua's `#07080a` / `#0a0c10` ramp and were left alone.

Not adopted: cua's page *structure* (numbered 01–03 feature cards, 4-column OS grid, product
showcase). That would replace the portfolio's own sections rather than restyle them.

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
