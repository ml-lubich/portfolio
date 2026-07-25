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
- Featured open-source projects include the agent family: `imsg-mcp`, `imail-mcp`, `inotes-mcp`, `wa-mcp`, plus `bitbucket-cli` (CLI-named exception — not `*-mcp`), and related tools (`twig`, `confluence-cli`, `like-fable` as applicable).
- Homepage includes `#value-maxxing` (valuemaxxing ≠ tokenmaxxing) and `#tool-matrix` (honest CLI/MCP comparison).
- Do not invent coverage % or market claims; keep matrix cells conservative (`partial` when incomplete).

### 2026-07-25 — Open-Source Showcase (public-only, no invented metrics)

- The Open-Source Showcase (`#projects`, `components/sections/open-source-showcase.tsx`) covers public `ml-lubich` repos only — no proprietary, internal, or employer content.
- Each demo's terminal script (`data/oss-demos.ts`) must use real, documented commands for that tool with plausible, representative output — not fabricated benchmark numbers or invented flags.
- `stats` values shown per card must be real (e.g. published test coverage, measured speedups) or omitted; do not invent metrics to fill a stat slot.
