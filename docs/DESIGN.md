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

- `#open-source` leads the projects section: an **Open-Source Agent Tools** grid (`data/oss-agent-tools.ts`, `components/sections/oss-tool-grid.tsx`) — thirteen cards in a two-column layout matching the GitHub profile TOOLS panel, each with a **click-to-copy** install row (`components/ui/copy-command.tsx`). `/fork` repeats the grid plus `ossInstallFork()` (explicit `brew tap ml-lubich/tap` first) for USB-agent / fork checkouts. Below that: curated public CLI/MCP projects (`data/oss-demos.ts`) as glass demo cards — an animated terminal demo per card (`DemoTerminal`: IntersectionObserver-gated typing; `prefers-reduced-motion` renders the final frame immediately), stats via `AnimatedCounter` (numeric values only; text stats render plain), tags, GitHub link, and a **selectable** `<pre><code>` install line (click-to-copy is extra, not the only path). A copy-pasteable `ossInstallAll()` block sits above the rail so brew / pip / pipx / npm / git lines can be pasted as a family. **One terminal types at a time** — the featured card is the only typer. The marquee below is retitled "Selected Work" and reads as the breadth tier.
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
AI Engineer role, staff level in under 3 years, and consumer-scale telecom
(agent + RAG in front of millions). Do **not** name Anduril/Mach or a
"chosen over" frame. The `~/about — misha.bio` terminal types short lines
(EchoStar → prior employers → shipped systems → Equiverse) and is sized to
its content. The portrait stays `aspect-[3/4]` at every width (source
1093×1439) so it does not stretch into a wide crop beside the terminal.
NOW / WHERE / SINCE / BUILDING sits under the terminal as a 2×2 grid and
grows with that portrait. The six tiles are
token-based (`bg-card`, `border-border`) and current: EXPERIENCE reads
"EchoStar, Apple, Walmart", OPEN SOURCE reads "MCP Servers + CLIs · imsg ·
imail · inotes · wa-mcp · jenkins-mcp". Grid is 1/2/3 columns at
<640/640–1023/≥1024; the portrait caps at 20rem when stacked. Typing and
count-ups render their final state immediately under
`prefers-reduced-motion`. Gate: `__tests__/about-section.test.ts`.

## Blog posts: one cover, then diagrams only when they earn it (2026-09-24)

Each post has a single cover (`data/blog/post-meta.json`), rendered once above
the body. The body does not repeat that photo. Extra figures are for a
different image. Posts about something that was built use a chart fence
(pipeline, comparison, or tree) instead of a second stock photo. Length stays
uneven on purpose: short narrative essays next to longer build notes.
Gate: `__tests__/data-integrity.test.ts`.

## Agents-build easter egg (2026-09-16)

Opt-in overlay (`components/easter/agents-build.tsx`): type `agents` when
focus is not in an input, or open `/#agents`. Predetermined build sequences
from `lib/agents-build.ts` spawn with shuffled order/timing; Esc or the
dismiss control clears them. When idle the component returns `null` — no
layout cost for ordinary visitors. Gate: `__tests__/agents-build-egg.test.ts`.

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

## 3D Chrome Metallic Text & Scroll Performance (2026-09-15)

1. **Metallic text palette — 3D chrome/steel facet stops**:
   Previously, metallic text was flattened to stops between 88% and 100% lightness (`--metal-mid: hsl(220 8% 92%)`), washing out text into flat bright white. The updated palette extracts facet tones from the beveled 3D chrome "ML" mark:
   - `--metal-low`: Dark charcoal steel/gunmetal facet (`hsl(220 16% 50%)` dark / `hsl(220 16% 28%)` light)
   - `--metal-mid`: Polished platinum/silver steel (`hsl(220 12% 78%)` dark / `hsl(220 14% 42%)` light)
   - `--metal-hi`: Specular chrome white highlight (`hsl(0 0% 100%)` dark / `hsl(220 16% 58%)` light)
   The multi-stop linear gradient (`0% foreground`, `14% metal-low`, `24% metal-mid`, `30% metal-hi`, `38% metal-mid`, `48% metal-low`, etc.) restores sharp bevel reflections, chrome specular highlights, and dimensional contrast on all bold text, hero headers, and `.gradient-text` elements without flat pure white or pure black.

2. **Scroll performance — WebGL idle pause & DOM write elimination**:
   - `Brain3D` (`components/brain/index.tsx`): Integrates an `IntersectionObserver` that toggles `<Canvas frameloop={inView ? "always" : "never"}>` (with a 150px buffer). When the reader scrolls past the hero into the rest of the site, Three.js ceases all frame loop processing, vector projections, and WebGL renders, freeing GPU/CPU for smooth 60/120fps scrolling.
   - `HeroScrollLayer` (`components/hero/hero-scroll-release.tsx`): Tracks previously applied transform and opacity strings, dropping redundant DOM style updates on every scroll frame once the hero is past or transforms are steady.
   - `ScrollStackCardsDesktop` (`components/cards/index.tsx`): Avoids traversing cards and rewriting DOM properties on every scroll tick when a card stack is resting outside the viewport (at `totalProgress === 0` or `1`).

## Shimmer Spawn-In Primitives (2026-09-16)

Ported from josephheupler.com (jheupler-site) to ensure smooth visual continuity when elements load and mount:

1. **Hero 3D Brain load skeleton (.brain-skeleton)**:
   - Matches josephheupler.com signature #7: smooth shimmer wire ring (.brain-skeleton), not an empty hole or jarring jump.
   - Renders in `components/hero/index.tsx` while `showBrain` is false during initial deferral / Three.js compile (~1200ms).
   - Styled with concentric wire rings, radial glow, and `skeleton-shimmer` 1.6s sweep; disabled under `prefers-reduced-motion: reduce`.

2. **Section load placeholders (Skeleton & SectionSkeleton)**:
   - Matches josephheupler.com signature #17: `Skeleton` and `SectionSkeleton` in `components/ui/skeleton.tsx`.
   - Uses `.skel` shimmer sweep animation (`skel-shimmer-sweep` 1.8s) instead of flat pulse.
   - Used by `components/layout/lazy-section.tsx` when `!visible` and by `app/page.tsx` for dynamic section loading states, ensuring below-the-fold content mounts with subtle skeleton shimmer instead of empty voids.
   - Retains all height reservation invariants tested in `__tests__/lazy-section-reservations.test.ts`.

## Text Glow-Pass on Scroll (2026-09-19)

Owner ask: "as we are scrolling it shimmers … only for laptop not mobile …
like a glow passing through", and it must stay subtle and cost nothing on scroll.

- **What:** each section body paragraph (`#main-content p`) gets a soft
  `text-shadow` halo in `--accent-glow-soft` that peaks as it crosses the
  viewport centre and is gone by the top/bottom quarter (`@keyframes
  text-glow-pass`, `animation-range: cover`). `text-shadow` is inherited, so
  `AnimatedText`'s per-word spans glow with their paragraph.
- **Why not a gradient sweep:** `background-clip: text` does not clip text
  inside `AnimatedText`'s transformed inline-block words — with a transparent
  fill they would vanish.
- **Why CSS, not JS:** the old `ScrollShimmer` wrote `--scroll-y` on `<html>`
  every step and was unmounted for flicker. This is a scroll-driven animation:
  no listener, no custom-property writes. Browsers without
  `animation-timeline` render plain text.
- **Gate:** `@supports (animation-timeline: view())` + `(min-width: 1024px)
  and (hover: hover) and (pointer: fine) and (prefers-reduced-motion:
  no-preference)`. Phones, tablets and coarse pointers never match.
- **Scroller trap:** `overflow: hidden` makes an element a (non-scrolling)
  scroll container, and `view()` binds to the nearest one — a frozen timeline.
  Inside the gate, `section.overflow-hidden` / `section.animated-section` use
  `overflow: clip` (same paint, not a scroller; page height verified
  unchanged). Paragraphs under any inner `overflow-*` box (cards, marquees,
  inner scrollers) are excluded rather than left frozen mid-glow.

Gate: `__tests__/text-glow-pass.test.ts`.

## Cycling install marquee (2026-09-24)

The Open-Source Agent Tools panel opened on a static install row, so the
first thing a visitor read was whichever tool happened to sit in card one —
`brew install ml-lubich/tap/imsg`.

A single prompt now sits above the grid (`components/ui/cycling-install.tsx`)
and types its way through **every** tool's install command in a loop: type,
hold long enough to read and copy, erase, next. Mac-window chrome, a
`ml-lubich/tap` title and a live tool-count counter frame it as one tap rather than
a ticker; under the line a caption names the tool currently on screen and a row
of dots marks the position in the roll-call. The count follows `ossAgentTools` (thirteen as of 2026-09-24, including ical, vgate, and claude-tiers).

- Timing is a pure function of elapsed ms — `lib/install-cycle.ts`
  (`installCycleFrame`, `stepDuration`, `cycleDuration`). The component is one
  rAF loop plus gates; the schedule is unit-tested without a DOM.
- The `ml-lubich` handle is accented wherever an install command is rendered —
  in the marquee it takes the current tool's `ossAccent`, so the name changes
  colour as the line cycles; in the static card rows (`copy-command.tsx`) it is
  `text-primary/90`. `splitBrand()` also accents a half-typed handle, so the
  name doesn't flicker plain-then-coloured as its last letters land.
- Gates: off-screen (IntersectionObserver), `prefers-reduced-motion` (full
  command, no typing, no cursor) and hover (pauses, so the command you reached
  for is still there when the pointer lands). Frames only re-render when the
  visible text actually changes — a character lands every ~48ms.
- The animated line is `aria-hidden`; screen readers get a static `sr-only`
  list of all commands instead of a churning one.

Gate: `__tests__/install-cycle.test.ts`.

## Open-Source Showcase: real-output proof, not just links (2026-09-24)

The owner wanted pdfify-md and imail-mcp's OSS tool cards to show what the
tool actually does, not just a repo link — "REAL output only, no mockups, no
invented numbers." Both live under the existing featured-card slot
(`OssDemoCard`), gated the same way as the terminal and app sim above them:
an optional `OssMedia` union on `data/oss-demos.ts`'s `OssDemo.media`,
rendered by the new `components/sections/oss-demo-media.tsx` (no new design
tokens — reuses the card's `bg-black/*` / `border-white/[0.0x]` / font-mono
language).

- **pdfify-md (`kind: "pdf-compare"`)**: `public/demos/pdfify/sample.md` — a
  heading, a Mermaid flowchart, a Mermaid sequence diagram, a table, and a
  TypeScript code block — run through `pdfify-md`'s own CLI
  (`node dist/cli.js sample.md`, headless Chrome via `--launch-options
  executablePath`) to produce `sample.pdf`, then rasterized to
  `sample-preview.png` (page 1, 150dpi, resized to 900px) with `pdftoppm`.
  The card renders the exact source text beside the rendered page image, plus
  "View sample.md" / "Download PDF" links — literally the input and output of
  one real run, side by side.
- **imail-mcp (`kind: "eval-table"`)**: the real `imail autodraft-eval`
  output — 14 synthetic (`example.com`-only, no real inbox data) labeled
  cases, PASS/FAIL per case, and the harness's own summary line
  ("13/14 passed, 0 unsafe sends") — plus a guardrail list pulled from
  `autodraft.py`'s actual gate: `auto_send_allowed()` requires confidence
  ≥ 0.95, stakes = low, a known contact, a reply ≤ 400 chars, no
  attachments, and non-recruiter intent, and `validate_decision()` fails
  closed on the untrusted LLM JSON before any of that runs.
- Fixing this surfaced two pre-existing inaccuracies, corrected in the same
  pass: `imail`/`imsg` still linked their pre-rename GitHub slugs
  (`imail` → `imail-mcp`, `imsg` → `imsg-mcp`; both still 302, this
  points at the canonical URL), and the pdfify-md terminal demo showed a
  `--out` flag the CLI doesn't have.
- `claude-tiers` joins the tool family the same way imsg/imail/pdfify did:
  entries in `data/projects.ts`, `data/oss-demos.ts` (`git clone` install —
  it ships as a Claude Code plugin marketplace, not a package registry), and
  `data/oss-agent-tools.ts` (13 cards now, was 12).

Gates: `__tests__/oss-demos.test.ts` (`ALLOWED_PUBLIC_IDS` includes
`claude-tiers`), `__tests__/oss-agent-tools.test.ts` (13-tool list).

## Writing section: Substack pointer + subscribe embed (2026-09-24, updated 2026-09-25)

`#writing` (nav "Writing", between Clients and Projects) is a small,
non-intrusive section (`components/sections/substack.tsx`) reusing
`AnimatedSection` + `SectionHeader`: one card linking the latest post, then
Substack's own subscribe-box embed (`<iframe src="https://mlubich.substack.com/embed">`,
lazy-loaded, transparent background, wrapped in the same
`rounded-2xl border border-white/[0.08] bg-white/[0.03]` glass-card style as
the rest of the section), plus plain links to the publication and to the
Substack profile (`substack.com/@mlubich`). No feed fetch, no popup, no
modal.

- `lib/substack.ts` holds the publication constants and `LATEST_POST` as a
  hand-maintained pointer (title, url, one-line summary), not a live RSS
  fetch — one post exists today, so a feed/cache layer is not earned yet.
  Update `LATEST_POST` by hand when Misha publishes again.
- Substack is also listed in `components/social-icons.tsx` (renders in both
  hero and footer via the shared `SOCIAL_LINKS` array) and in the Person
  schema's `sameAs` (`components/seo/json-ld.tsx`).
- MLBot's system prompt (`lib/ai/profile-tools.ts`) names the publication and
  its latest post so the assistant can point visitors to it when asked about
  writing, blog posts, or opinions on AI/engineering.

Gate: `__tests__/substack.test.ts`.

## Follow section: X, LinkedIn, Substack, GitHub (2026-09-25)

`#follow` (nav "Follow", right after Writing) is its own top-level section
(`components/sections/follow.tsx`) — a "find me online" card grid, separate
from the Writing section's Substack embed. Cards are driven by one
`FOLLOW_CARDS` array (icon, name, description, action label/href, profile
href), so adding another platform later (e.g. YouTube) is one array entry,
not a new layout. Currently: X, LinkedIn, Substack (profile link + subscribe
CTA), GitHub.

No live feed embeds: X's logged-out timeline widget is unreliable and
LinkedIn has no public profile-feed embed, so each card is a styled glass
card (`rounded-2xl border border-white/[0.08] bg-white/[0.03]`, matching the
rest of the site) with an icon, handle, one-line description, and an
external "Follow" / "Connect" / "Subscribe" button (`min-h-[48px]`,
`target="_blank"`, `rel="noopener noreferrer"`). Two columns on desktop
(`sm:grid-cols-2`), stacked on mobile — verified at 375px with no horizontal
scroll.

- X has no lucide-react icon; `XIcon` (an inline SVG) lives in
  `components/social-icons.tsx` and is reused here and in the Contact
  section's social row.
- The X, LinkedIn, and Substack profile URLs also appear in
  `components/social-icons.tsx` (`SOCIAL_LINKS`), `components/sections/contact.tsx`,
  `components/seo/json-ld.tsx` (Person `sameAs`), and `lib/ai/profile-tools.ts`
  (`X_URL`, alongside `LINKEDIN_URL`/`GITHUB_URL`) — one set of real profile
  URLs, referenced everywhere rather than re-typed.

Gate: `__tests__/substack.test.ts` (`describe("Follow section")`,
`describe("X (Twitter) presence")`).

## Motion polish pass: blur reveal, breathing orbs, grain, glass terminal (2026-09-24)

Four small, original effects (`~/.claude/skills/motion-showcase` recipes,
reimplemented in this site's own palette — no natively.software assets/code
copied), scoped to stay cheap and reuse what already existed rather than
stacking a parallel motion system:

- **AnimatedSection now blurs in, not just fades/slides.** `.animated-section`
  starts at `filter: blur(6px)`, settles to `filter: none` alongside the
  existing opacity/transform transition — one more property on an already
  centralized reveal, not a new mechanism. Every per-section `delay` still
  routes through the existing `reveal-delay-*` lookup.
- **New pure stagger/distance module**, `lib/reveal-stagger.ts`:
  `staggerDelayMs(index, opts)` (ascending, capped), `revealDistancePx(kind)`
  (badge/body/visual travel table), and `revealMotion(kind, index,
  reducedMotion)`, which returns `{delayMs: 0, distancePx: 0, blurPx: 0}`
  outright under reduced motion. Powers the new hero glass card's own
  reveal and its chrome-dot stagger. Gate: `__tests__/reveal-stagger.test.ts`.
- **Hero ambient orbs now breathe.** Rather than add a second gradient-mesh
  blob layer next to `BackgroundOrbs`' existing three orbs (`app/globals.css`
  `.ambient-orb`), a second keyframe (`hero-blob-breathe`, opacity
  0.72→1→0.72 over 4s) is layered onto the existing per-orb drift animation
  via the multi-value `animation-name`/`animation-duration` properties it
  already used — same reuse on the `(hover: none)` mobile override. Cheap
  (opacity-only, no new composited layer) and already covered by the
  sitewide `@media (prefers-reduced-motion)` block, which zeroes every
  animation on `*`.
- **Grain overlay, hero-scoped only.** `components/hero/grain-overlay.tsx` —
  an inline `feTurbulence` SVG data URI at `opacity-[0.025]`,
  `pointer-events-none aria-hidden`, sitting only behind the hero. The
  page-wide texture pass rejected film grain outright (see the `.page-texture`
  comment above, "read as dirt, not depth") — that verdict stands for the
  page backdrop; at hero scale and this much lower opacity it reads as
  texture instead, which is why this is scoped to `#hero` and not reapplied
  site-wide.
- **Hero floating glass terminal** — removed 2026-09-25: the OSS demo belongs in the
  Open-Source section further down, not in the hero. Its `mb-24 sm:mb-28`
  bottom reserve moved onto the stats `HeroScrollLayer` so the "Explore" cue
  still clears the carousel dots.

**Skipped:** the hero background/demo video recipe (motion-showcase #1) —
no source footage recorded yet. Follow-up, not done here.

## About terminal: rewrites itself from a bio bank (2026-09-25)

The `~/about — misha.bio` card beside the portrait no longer types one bio and
stops. `components/terminal/terminal-loop.tsx` (`TerminalLoop`) types a bio,
holds it ~4s, backspaces it, and types the next from `BIO_SCRIPTS` in
`data/about-bio.ts` — forever. It reuses the install marquee's pure scheduler
(`linesCycleFrame` in `lib/install-cycle.ts` joins each bio with `\n`), so
there is one type/hold/erase engine on the site, not two.

- Every fact in the bank already appears elsewhere on the site; the first bio
  still opens on EchoStar. Lines stay ≤ 70 chars.
- All bios sit stacked invisibly in one grid cell, so the card is always as
  tall as the tallest bio and nothing below it moves while it rewrites.
- Pauses off-screen; reduced motion shows the first bio, static; screen
  readers get the first bio once via `sr-only`.
- The window frame is shared (`TerminalWindow` in `terminal-reveal.tsx`). Its
  traffic-light and panel colours are inline styles: the old interpolated
  arbitrary-value classes were never generated by Tailwind, so the dots
  rendered blank.

Gate: `__tests__/about-bio-loop.test.ts`.
