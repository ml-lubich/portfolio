# Requirements

## Internal documentation (this folder)

1. **Five canonical files** in `docs/`: `OVERVIEW.md`, `ARCHITECTURE.md`, `DESIGN.md`, `TESTING.md`, `REQUIREMENTS.md`.
2. **Not part of the public website:** No `app/docs/**` routes; no `Link` or `href` from site chrome (nav, footer, hero CTAs) to `/docs` or to raw GitHub doc paths for this repo’s `docs/` tree.
3. **Discovery:** `app/robots.ts` includes `Disallow: /docs/` so if a host ever maps static files at that path, crawlers should skip it.
4. **Brain tuning:** Mesh scale (`useInitialScale`) and orb sprites (`uSizeMul`, `neural-orbs` sizes) are separate requirements; regressions must not “fix” orbs by shrinking the whole brain without explicit design sign-off.

## Amendments

Append new constraints or decisions as new bullets or dated subsections; do not delete historical requirements without a recorded reason.

### 2026-05-05 — Terminal Snake Mode

- The homepage terminal includes a playable Snake mode from the existing terminal surface; it must support laptop keyboard input through arrow keys and WASD, expose visible start/pause/reset controls, and keep gameplay local to the browser.

### 2026-07-24 — Agent OSS family, denser storm, valuemaxxing

- Skill Storm must remain dense (target ≥110 unique skill pills), tuned toward theodouwes-site layout constants (`PILL_SPACING≈88`, denser ring tiers).
- Featured open-source projects include the agent family: `imsg-mcp`, `imail-mcp`, `inotes-mcp`, `wa-mcp`, plus `bitbucket-cli` (CLI-named exception — not `*-mcp`), and related tools (`twig`, `confluence-cli`, `like-fable`, `jenkins-mcp`, `pdfify-md`, `ical-cli`, `vgate` as applicable).
- Every showcase card ships a real, selectable install command (`brew` / `pip` / `pipx` / `npm i -g` / `git clone`). No card without one. The section also exposes `ossInstallAll()` as a copy-pasteable block of those same commands.
- Homepage includes `#value-maxxing` (valuemaxxing ≠ tokenmaxxing) and `#tool-matrix` (honest CLI/MCP comparison).
- Do not invent coverage % or market claims; keep matrix cells conservative (`partial` when incomplete).

### 2026-07-25 — Open-Source Showcase (public-only, no invented metrics)

- The Open-Source Showcase (`#projects`, `components/sections/open-source-showcase.tsx`) covers public `ml-lubich` repos only — no proprietary, internal, or employer content.
- Each demo's terminal script (`data/oss-demos.ts`) must use real, documented commands for that tool with plausible, representative output — not fabricated benchmark numbers or invented flags.
- `stats` values shown per card must be real (e.g. published test coverage, measured speedups) or omitted; do not invent metrics to fill a stat slot.

### 2026-09-14 — Hero brain 1:1 with josephheupler.com

- Desktop box is exactly `h-[min(92vh,860px)] w-[min(120%,980px)]` (jheupler-site `Brain3D` class).
- Phone box is exactly CSS `height: min(54svh, 420px)` / `width: min(132%, 470px)` on `.hero-brain-underlay`.
- Camera tiers are exactly `{z:1.38,fov:48}` / `{1.48,47}` / `{1.62,46}` / desktop `{1.55,44}`.
- Stage is absolute `inset-0` (Joseph's `.brain-stage`). Do not reintroduce a 50svh / 64svh band to "clear" the CTAs — that is how the mesh became a thumbnail. CTAs overlay the mesh and stay the topmost hit target.
- Mesh scale (`useInitialScale`) stays on the existing breakpoints; do not shrink the asset to fake a smaller box.
- Hero type is ink-haloed **and** light-bloomed (white drop-shadow on `.hero-copy-halo`) so the metallic fill reads shiny over the mesh. Do not dim the type to make the brain pop.

### 2026-09-23 — MLBot does not write code

- A request for a program, function, script, bugfix, LeetCode problem, or this site's source is refused with one fixed sentence before OpenRouter is called. Error codes, languages he uses, and "write me an email" stay in bounds.
- Covered by `__tests__/coding-guard.test.ts`.

### 2026-09-14 — MLBot must answer after tools

- A chat turn that called a tool and then streamed `event: done` with no text is a failure. Recover with `finalizeAssistantTurn` + a grounded fallback from the tool JSON.
- `searchTerms` strips punctuation and question stopwords; `agents` stems to `agent`. A name hit outranks a body mention. `get_projects` matches name + summary + tags, not tags alone. A silent-final fallback lists project names, not job titles, when both came back.
- After a tool returns, the model writes the answer. It does not call the same tool twice. An empty reply after tools is a failure.

### 2026-09-24 — Published CLI/MCP footprint

- Showcase and the agent-tool grid include `ical-cli` (PyPI `mac-ical`, Homebrew `ml-lubich/tap/ical`) and `vgate` (PyPI `vercel-mcp`, Homebrew `ml-lubich/tap/vgate`).
- `twig` install stays `pipx install twig-cli`, and that name resolves on PyPI. `pdfify-md` stays `npm i -g pdfify-md` and links the npm package page; Homebrew `ml-lubich/tap/pdfify-md` is the other install.
- Install strings stay real package-manager commands. PyPI name `ical-cli` is rejected as too similar to the existing `ical` project, so the package is `mac-ical`.
