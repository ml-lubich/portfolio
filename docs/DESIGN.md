# Design

## MLBot: briopedia's chat, phone-first (2026-09-11)

The chat follows briopedia's `ChatMessage` model. A muted action row sits under
each finished answer: Copy (tick + "Copied" for 1.6s — a label swap, not
motion, so reduced motion is unaffected) and, on the last answer only, Retry.
Your own messages get Copy + Edit; Edit opens an inline editor (Cancel /
Resend, Enter resends, Escape cancels) and resends from that point. Retry uses
the same truncate-and-resend path, so neither ever appends a duplicate. While
streaming, Send becomes Stop (AbortController on the `/api/chat` fetch) and the
partial answer is kept; an empty aborted turn reads "Stopped." rather than
showing a blank bubble. New chat lives in the header once there are turns.
There is no history and no persistence — deliberately: this is a public
portfolio, not a logged-in product.

The panel is one generous size — 480px × min(85dvh, 760px), briopedia's
proportions — with a single Enlarge/Shrink rung for wide charts, replacing the
old S/M/L cycle. Full-screen on phones.

**Phone-first typography.** The complaint was pinch-to-read, and the measured
cause was neither overflow nor iOS auto-zoom (the composer was already 16px):
everything was simply small — 14.5px prose, 12.5px pills, 12px labels, 28–32px
controls. Below `sm` prose and user messages are 16px/1.7, pills and actions
14px, and every control (Send/Stop, header buttons, Copy/Edit/Retry, pills) is
a 44px hit target; from `sm` up it returns to 15.5px/1.7 and compact controls.

**Follow-up pills carry the model's whole question**, sent on tap and exposed
in `title` and `aria-label`; only the visible label is shortened by
`clampFollowup` (52 chars, word boundary, ellipsis). Previously `parseFollowups`
clamped the *value*, so tapping a pill sent the fragment — and a visuals test
had enshrined that by asserting the value ended in an ellipsis. Both fixed.
Gates: `__tests__/mlbot-chat-actions.test.ts`, `__tests__/ai-followups.test.ts`.

## Type system & tokens — cua.ai landing-redesign (2026-08-10)

Visual reference: `cua.ai` (its `<html class="landing-redesign">` build). Adopted its
design *language* over the existing page structure; sections, hero brain, skill storm and
terminal are unchanged.

- **Fonts:** superseded on 2026-09-13 — see "Typography" below. This pass set `font-sans` →
  Urbanist and `font-display` → Instrument Serif, with Geist as the sans fallback; all three are
  gone. The rest of this section (ink, accents, radii) still stands.
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

- `#open-source` leads the projects section: curated public CLI/MCP projects (`data/oss-demos.ts`) as glass demo cards — an animated terminal demo per card (`DemoTerminal`: IntersectionObserver-gated typing; `prefers-reduced-motion` renders the final frame immediately), stats via `AnimatedCounter` (numeric values only; text stats render plain), tags, GitHub link, and a **selectable** `<pre><code>` install line (click-to-copy is extra, not the only path). A copy-pasteable `ossInstallAll()` block sits above the rail so brew / pip / pipx / npm / git lines can be pasted as a family. **One terminal types at a time** — the featured card is the only typer. The marquee below is retitled "Selected Work" and reads as the breadth tier.
- **Nav breakpoint policy:** the inline desktop link row requires ≥1280px (`xl:`); 768–1279px uses the mobile hamburger + overlay. The three gates (link row `xl:flex`, toggle `xl:hidden`, overlay `xl:hidden`) must always move together — splitting them re-introduces the iPad clipping bug.
- **Logo mark:** `components/site-logo-mark.tsx` is an inline-SVG "ML" monogram on a dark backing tile — resolution-independent, no raster, no tech-blue; the nav tile carries a higher-contrast border/bg than the old liquid-glass treatment.
- **Vertical rhythm:** a single spacing knob (`LAZY_SECTION_TOP` in `app/page.tsx`: `pt-4 md:pt-8 lg:pt-10`) governs every LazySection boundary; no per-section ad-hoc margins (guarded by `__tests__/section-rhythm.test.ts`).
- **Tablet detail drawer:** at compact widths ≥768px the scroll-stack `DetailPanel` presents as a fixed right-edge drawer (in-viewport by construction, `slide-in-from-right`); phones keep the full-viewport layer, desktop ≥1367px keeps the centered modal.

## Motion: hero entrance ladder & reduced motion (2026-09-05)

**Hero entrance is one ladder, not per-component literals.** `HERO_BEAT` in
`components/hero/data.ts` holds the entrance delay for every hero block, in DOM
order: tagline → subtitle → CTAs → tokscale badge → social row → stat row →
scroll cue. Blocks read it through `heroBeatDelay(beat)`. Previously each
component carried its own literal and they had drifted out of order — the
tagline animated in ahead of the name, the CTAs ahead of the subtitle they
answer, and the stat row ahead of the badge above it — so the hero landed as one
jumbled pop inside ~0.6s instead of reading as a reveal. The values must stay
**ascending**; `__tests__/hero-choreography.test.ts` fails if they don't.

The name is deliberately *not* in the table: it stays `HERO_NAME_REVEAL` in
`role-rotator.tsx` because `hero/index.tsx` derives the 3D brain's fade
(`BRAIN_FADE_MS`) from it. The ladder starts after the name reveal begins.

**Reduced motion zeroes delays, not just durations.** Every stagger on this site
— the hero ladder, `AnimatedText`'s `--at-delay` / `--al-delay`, `AnimatedName`'s
`--stagger`, the `.reveal-delay-*` classes — is expressed as a *delay* on an
element that starts at `opacity: 0`. The global
`@media (prefers-reduced-motion: reduce)` block in `app/globals.css` therefore
sets `animation-delay: 0ms !important` and `transition-delay: 0ms !important`
alongside the duration collapse. Without it, a reduced-motion visitor gets the
motion removed but keeps the waiting — content invisible for up to ~1.5s. The
`!important` is load-bearing: the hero blocks set `animation-delay` as an inline
style, and only an important author rule outranks that. **Any new staggered
reveal expressed in CSS is covered by this rule automatically — do not add a
per-component reduced-motion branch for delay.**

The one exception is a stagger held by a **JS timer**, which no stylesheet can
reach: `AnimatedName` gates its reveal on `setTimeout(delay)`, so it checks
`prefers-reduced-motion` itself and expands immediately. Any future component
that delays a reveal in JavaScript owes the same check.

**Keyboard parity on glass buttons.** `.glass-btn:focus-visible` shares the
`:hover` molten treatment (asymmetric radii, lift, sheen sweep), and is disabled
under reduced motion on the same terms. A tab visitor previously saw only the
generic focus ring, so the hero CTAs read as inert under keyboard navigation.

### Invariant — `AnimatedSection` and fixed-position children

`.animated-section` keeps a non-`none` `transform` (`perspective(1200px) …`)
even in its settled state, which makes it the containing block for any
`position: fixed` descendant. Sections that render their own full-viewport
overlay inline — `projects.tsx` and `open-source-showcase.tsx` render
`fixed inset-0 z-[120]` detail modals as direct children — therefore **cannot**
be wrapped in `AnimatedSection`; their modals would be trapped inside the
section box. Their reveal comes from `SectionHeader`'s scroll-triggered
`AnimatedText` instead. `skills.tsx` is safe to wrap because its modal is a
Radix `Dialog`, which portals to `document.body` and escapes the transform.

## Charts: pie readout lives in the legend (2026-09-05)

Pie charts (blog + MLBot) have no hover tooltip box. In a 20–34rem chat card
the Recharts tooltip lands on the ring itself, and its item text defaults to
`#000` (`contentStyle.color` never reaches the item rows), so it both clipped
the chart and was unreadable in dark mode. The legend is the readout instead:
each row shows swatch · name (wrapping, never truncated) · `value · pct%`;
hovering a slice or a row highlights the row and dims the other slices. Slice
percentages stay inside the ring; the legend is the only place names and
values are printed. Guarded by `__tests__/mlbot-chat-visuals.test.ts`.

## Hero CTAs: three weights, one pill language (2026-09-05)

The hero action row was five equal boxes reading as a toolbar. It now has
three weights: one filled pill (`bg-white text-background`, Get In Touch),
one glass pill (Ask MLBot — the site's signature), and a muted 13px text row
for View AI Expertise / Download Resume / Schedule Call, all `rounded-full`
to match the nav pill. Every action carries a distinct lucide icon (Mail,
MessageSquare, BrainCircuit, FileDown, CalendarDays). Hover and
`focus-visible` share the same −2px lift/fill — `__tests__/hero-ctas.test.ts`
enforces a `focus-visible:` twin for every `hover:` utility — and
`focus-visible:rounded-full` counters the global 4px focus radius. The
tertiary row sits in a faint `bg-background/45 backdrop-blur-sm` wash so 13px
text survives the densest part of the brain mesh. The pointer-tilt scene no
longer applies to this row (its transform fought the hover lift).

## Core Proficiency map: SVG, never empty, light-safe (2026-09-05)

`components/three/neural-constellation.tsx` is an SVG + HTML-label piece, not
WebGL: five monochrome nodes on a ring around a hub, node radius and spoke
weight scaling with proficiency, two slow counter-rotating dashed instrument
rings with a 7s breathe, signal pulses running hub → node on every spoke
(faster on the active node) and one orbiting the ring. The side panel is never
empty: it starts on the highest-scoring domain and auto-cycles every 4s with a
thin progress line; hovering, tapping, or keyboard-focusing a node (nodes are
`role="button"` with `tabIndex=0`) overrides it and lights only that node's
edges; leaving resumes the cycle. The dot selector under the panel jumps
directly. Under `prefers-reduced-motion` the map is static but complete. Every
mark paints with `currentColor`/theme tokens so it holds in light mode; `.light`
halves halo opacity so the blur reads as depth, not smudge (the first light
pass rendered halos through the themed `white`, which became black blobs).
Below `lg` the panel stacks under the map; it reads at 390px. Gate:
`__tests__/neural-map-redesign.test.ts` (replaces the WebGL-era
`neural-constellation-regression.test.ts`, whose frame-loop guard no longer
has a frame loop to guard).

## Hero brain: viewport-anchored, Heupler-scale, contained; scroll release (2026-09-05)

The 3D brain stage is anchored to the viewport (`svh`), never to the hero's
height, and it is **bounded by both viewport axes**: on sm+ the box is a
landscape 6:5 `min(100svh, 70vw)` tall, never taller than the section and
never wider than the screen. Two things shipped wrong in one afternoon and
the guards below pin both: a 118–120svh box ran past the hero's bottom edge
and was hard-clipped by `overflow-hidden` before the mask's foot fade
finished, and a box bound only by height ran off the sides at 2000px wide.
The mask lives on the box itself (a mask clips to its own border box). The
mesh's share of that box is the camera's job: desktop z 1.9 / fov 38 puts
the projected silhouette at 82–85% of the viewport height across a full
rotation at 1440×900 and 1920×1080 (josephheupler.com runs ~90% under a
shorter header; our floating pill is the binding constraint), crown ~45px
under the pill inside the crown fade, foot dissolving before the fold.
Phones keep the square `min(112vw, 64svh)` tier.

Motion: idle orbit at `autoRotateSpeed` 1.8 (~33s/rev — the old 0.45–0.8 read
as "not rotating"), drag-to-rotate with damping, and a pointer tilt
(`BrainTilt`: pitch follows cursor Y, roll follows X) on fine pointers only.
Auto-rotate and tilt are off under `prefers-reduced-motion`.

Measured, not asserted from class names: `BrainTelemetry` projects a fixed
subsample of the mesh's own vertices through the camera every 10th frame and
writes the page-pixel extent (`data-brain-bbox="l,t,r,b"`) and the camera
azimuth (`data-brain-rot`) onto the `<canvas>`. Bounding-box corners were
tried first and are useless — perspective inflates the near corners to 1.4×
the viewport. `e2e/hero-brain-fit.spec.ts` (in the push gate) asserts at
1280×720 / 1440×900 / 1920×1080 / 2560×1440: height share 0.78–0.94, centre
within 5% of the viewport centre, inside the viewport on all four sides and
inside the hero at the bottom, no horizontal overflow, and a pixel check that
the hero's last 4px match the page background (a sliced mesh leaves bright
pixels there). Its motion tests assert the azimuth advances at idle, moves
≥0.25rad on a 260px drag, resumes after release, and holds still under
reduced motion.

Scroll craft: `HeroScrollLayer` (`components/hero/hero-scroll-release.tsx`)
drives two transform/opacity-only moves — the brain recedes (scale 1→0.78,
fade) over the first 0.9vh of scroll, and the Tokscale/stat block lags the
page by 0.12·scrollY capped at 48px. Both route through
`shouldUseCompactScrollStackViewport`, so phones, tablets, coarse pointers,
reduced-motion and ≤4-core devices get a static hero. Nothing here changes
layout, which is what keeps `#contact` anchor scrolling exact. Journey,
Projects and Publications already run `ScrollStackSection`; the skill's rule
is one stack per page and we are at three, so no fourth was added. Gates:
`__tests__/hero-brain-size.test.ts`, `__tests__/scroll-craft.test.ts`,
`e2e/hero-brain-fit.spec.ts`.

## Hero: three-band layout + ambient wash (2026-09-15)

The hero is **three stacked bands**, not one absolute overlay on a full-viewport
brain box:

1. **Brain band** — mesh behind name / role / tagline only. Box is `h-full` inside
   `min-h-[min(420px,50svh)] sm:min-h-[min(64svh,52vw)]`, `sm:aspect-[6/5]`.
2. **CTA band** — pills and tertiary row sit **below** the mesh, never on it.
3. **Stats band** — Tokscale badge, social row, rotating stats.

Desktop camera: `z 1.82` / `fov 38` (measured fit inside the band). Phone tiers
in `getInitialCam` target ~71% mesh fill in the 420px canvas. The Joseph-scale
absolute `inset-0` stage (`92vh` box with CTAs overlaid) shipped 2026-09-14 and
was reverted — it read as a thumbnail on desktop and put buttons on the brain.

**Ambient gradient:** `--hero-ambient-wash` layers a cool top bloom over
`--page-wash` on `.hero-ambient-wash` inside `#hero` (same read as Client Work).
Gate: `__tests__/hero-scrim-halo.test.ts`.

Hero type keeps the dark ink halo **and** a white light bloom on `.hero-copy-halo`
(dark theme only). Gates: `__tests__/hero-brain-size.test.ts`,
`__tests__/hero-mobile-layout.test.ts`, `e2e/hero-brain-fit.spec.ts`,
`e2e/hero-cta-clearance.spec.ts`.

## About section: leads with the current role, no dead space (2026-09-05)

`components/sections/about.tsx` opens on EchoStar: the intro names the Staff
AI Engineer role, the Anduril/Mach offers it was chosen over, and why
(consumer-scale telecom). The `~/about — misha.bio` terminal types six lines
(EchoStar → prior employers → shipped systems → 6 papers → the agent-tool
family → Equiverse) and is sized to its content; a NOW / WHERE / SINCE /
BUILDING strip sits under it so the card never shows a blank lower half while
typing. The six tiles are token-based (`bg-card`, `border-border`) and
current: EXPERIENCE reads "EchoStar, Apple, Walmart", OPEN SOURCE reads "MCP
Servers + CLIs · imsg · imail · inotes · wa-mcp · jenkins-mcp" (was
"LangChain, CrewAI, Spring"). Grid is 1/2/3 columns at <640/640–1023/≥1024;
the portrait caps at 20rem when stacked. Typing and count-ups render their
final state immediately under `prefers-reduced-motion`. Gate:
`__tests__/about-section.test.ts`.

## Scroll devices below the hero (2026-09-05)

scroll-craft's first rule: a page uses several device families and never the
same one twice in a row. Below the hero this site had one — fade-on-enter on
every section, i.e. dead scroll between reveals. Three different families now
sit where reveals-only were, all on one primitive, `useSectionProgress`
(`lib/use-section-progress.ts`): 0 when a section's top reaches the viewport
bottom, 1 when its bottom leaves the top, delivered once per frame, and only
on viewports the scroll-stack table routes to motion (>1366px, fine pointer,
no touch slate, motion-ok, >4 cores). Everywhere else no listener attaches
and the section is exactly what it was.

- **Skill map is scrubbed** (`components/three/neural-constellation.tsx`): the
  section's travel selects the node — top node as it enters, bottom node as
  it leaves, middle 70% is the scrub band — and the 4s timer cycle stands
  down (panel reads "Scroll to trace", the progress line is hidden). Hover
  still overrides.
- **Consulting rail pans with the wheel** (`consulting-clients.tsx`): each
  frame of scroll while the rail is in view becomes a sideways impulse on
  the rail's existing momentum physics (`SCROLL_PAN_GAIN` 2400 → ~600px of
  pan per 900px of wheel at 60fps). Deltas above 0.12 of the span are jumps
  (resize, anchor click, `scrollTo`), not travel, and are ignored; drags
  are never fought.
- **Testimonials ground shifts** (`client-testimonials.tsx`): an accent-token
  tint layer the size of the section rises to 0.6 as the section centres and
  falls to 0 as it leaves — dark at both ends. Opacity only.

Each device publishes what it actually paints as `data-sc-verify-state`
(scroll-craft's verification convention — rendered values, never raw
progress). `e2e/scroll-devices.spec.ts` at 1600×1000 asserts each state
changes with scroll and, under reduced motion, does not. Two things the
gate taught: publish the rail's state from the physics tick, not the scroll
callback (the impulse hasn't moved anything yet there), and scroll like a
wheel in headless Chromium — `mouse.wheel(0, 500)` lands as one instant jump
the guard rightly ignores; ten 100px ticks are what a wheel sends. Gates:
`__tests__/scroll-devices.test.ts`, `e2e/scroll-devices.spec.ts`.

## Phone hero brain: half the viewport, and a picture — not a control (2026-09-06)

The first phone tier (box `min(190vw,88svh)`, mesh ~80% of the viewport)
failed on a real handset: the owner could not scroll past the hero. Two
causes, two fixes. Size: the box is now `max-sm:w-[min(120vw,56svh)]` — mesh
~49% of a 390×844 viewport, still the centrepiece behind the name, no longer
the whole screen. Scroll trap: `touch-action: pan-y` on the canvas was not
enough on iOS — OrbitControls still received the touch pointer events and the
swipe was eaten. On `(pointer: coarse)` the brain box and everything in it get
`pointer-events: none !important`, so a finger on the brain is a finger on the
page: it scrolls, the idle orbit keeps running, and drag-to-rotate/pointer tilt
stay fine-pointer features. Guards: `__tests__/hero-brain-size.test.ts`
(box bounds 100–140vw / ≤64svh, the coarse-pointer rule present) and the phone
cases in `e2e/hero-brain-fit.spec.ts` (mesh share 0.42–0.62 at 375/390/430,
`elementFromPoint` on the brain's centre is not inside the brain box, and the
page scrolls past the hero). Not verifiable here: the actual device — if it
still traps, check on the phone before touching numbers.

## About + Open Source: calm surfaces, colour instead of transcripts (2026-09-13)

The owner's read of these two sections was "too much shimmer and lit, it looks
like liquid glass but not a big fan", "just not consistent with the branding",
"looks too wall of text", and on the demos "too much text, needs to have more
animations / coloring". Both fixes are the same move: take the decoration out
and let the section's own content carry it.

**About drops the glass.** The six tiles were `HoloCell` — a pointer-tilted 3D
cell — each holding a `GlyphPlinth`: a conic-gradient hairline ring on
`holo-spin`, a counter-rotating tick ring, a `backdrop-blur-md` glass core
lifted 30px on Z, and a blurred floor-light pool under it. A `ShimmerOverlay`
swept the whole panel on top of that. All of it is gone. A tile is now a glyph
in a bordered square beside its label, then the value and the detail line,
left-aligned on `bg-card` over a `bg-border` panel that draws the hairlines
with `gap-px`. The ambient layer is the same two `blur-[100px]` orbs
`#open-source` uses, replacing three pulsing `translucent-glow` orbs plus a
WebGL `ParticleField` — the two sections now wash the same way, which is what
"consistent with the branding" meant.

**About's copy is four lines, not six.** The terminal types four one-row lines
(EchoStar → prior employers → shipped systems → Equiverse); the papers count
and the agent-tool family moved out of the transcript into the tiles that
already carry them, so nothing was dropped, only de-duplicated. The section
subtitle lost its third sentence the same way. `TerminalReveal` grew a
`bodyMinHeight` prop because its 220px body floor left a blank lower half under
a four-line script; About passes `min-h-[140px]`, `ai-expertise.tsx` keeps the
default. Section height at 1440×900 went 1440 → 1035, so
`app/page.tsx`'s LazySection reservation came down with it.

**The showcase's demos are three or four lines.** Every script lost its second
command block; the remaining lines fit one row at phone width. Install commands
and `packageUrl`s are untouched — those are registry-verified and a rewrite
risks re-inventing a command that doesn't exist. Guards:
`demo.length <= 4` and `line.s.length <= 70` in `__tests__/oss-demos.test.ts`.

**The mesh carries the demo now.** `ToolSignature` paints edges, signal dashes
and nodes in the tool's accent, turns on `.oss-signature-spin`, breathes its
nodes on `.oss-node-pulse`, and runs a short dash along every third edge on
`.oss-signal`. Node breathing moved off SVG `<animate>`: SMIL is out of reach of
`prefers-reduced-motion`, a class is not, and all three classes share one guard
in the OSS block of `globals.css`.

**Every tool has its own colour.** `project.accent` comes from `accentCycle`,
four of whose six entries are 0%-saturation white or near-white, so half the
showcase rendered the same grey. `ossAccent(index)` in `lib/theme.ts` spreads
cyan / magenta / sky / rose — hues the gradient table already owns — one per
tool, and the mesh, the stat gauges and the rail chip's underline all read it.
The rail is a colour picker rather than eight identical chips.

Gates: `__tests__/about-section.test.ts` (no plinth, no tilt, no shimmer, token
tiles, ≤4 bio lines each ≤72 chars), `__tests__/shimmer-consistency.test.ts`
(about.tsx is deliberately off the shimmer list),
`__tests__/open-source-showcase.test.ts` (accent cycle reaches rail + card, no
hex literals, every new class reduced-motion guarded).


## Typography: two families, Oxanium + JetBrains Mono (2026-09-13)

The owner's read was "the font needs to change … too literate, it needs to be
more techy / oriented … I like the joseph heupler font honestly … I want a more
futuristic / minimalist." The measurable inconsistency behind it: `app/layout.tsx`
loaded **seven** families — JetBrains Mono, Cormorant Garamond, Italiana,
Urbanist, Instrument Serif, Geist Sans and Geist Mono. Three were literary
serifs, and `font-display` resolving to Instrument Serif is what rendered the
"Misha Lubich" wordmark as a Garamond-ish display serif over a wireframe brain.

It is now the same two josephheupler.com runs:

| Role | Face | Token |
|---|---|---|
| headings + running text | **Oxanium** (variable 200–800) | `--font-oxanium` |
| eyebrows, labels, terminals, code | **JetBrains Mono** | `--font-jetbrains` |

`font-sans` and `font-display` both resolve to Oxanium — one voice, two roles,
which is what "consistent" has to mean here; `font-display` keeps its own size
and tracking, so headings still read as headings. The `italiana` and `cormorant`
Tailwind scales are gone (nothing outside `layout.tsx` ever used them), as is
`.font-display { font-synthesis-weight: none }` — that guard existed because
Instrument Serif shipped a single 400 weight, and Oxanium is variable, so the
`font-light`…`font-bold` utilities on heading call sites resolve to real weights
with nothing to synthesise.

**The blog keeps one face, deliberately.** A display face can punish long-form
prose, so the post body was checked at 1440 and 390 before committing to it.
Oxanium is a rounded-square humanist, not a headline-only face; at the blog's
measure and leading it reads cleanly, so no second body face was introduced.
Revisit only with a screenshot that shows it failing.

**Two orphan variables surfaced and were fixed**, which is the whole reason the
gate checks references rather than just imports: `.mlbot-md code` asked for
`var(--font-mono)` (josephheupler.com's name for it — never defined here, so
inline code in a chat answer fell back to the browser default while the block
above it rendered in JetBrains), and `architecture-diagram.tsx` asked for
`var(--font-geist-mono)`, which the swap would have left dangling.

**Payload, measured** at 1440×900 against the dev server, counting every
`woff2` response on the homepage: **7 files / 265.3 KB → 2 files / 51.6 KB**, a
213.7 KB drop. Font bytes compete with LCP text on first paint, so this should
help it; the drop itself is the measured part, the LCP delta is not.

Gate: `__tests__/typography-system.test.ts` — the `next/font/google` import is
exactly `{ JetBrains_Mono, Oxanium }`, no retired family or `--font-*` variable
is referenced anywhere under `app/`, `components/`, `lib/` or the Tailwind
config, and every `var(--font-*)` any stylesheet reads is one `layout.tsx`
actually defines.
