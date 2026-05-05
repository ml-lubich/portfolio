# Requirements

## Internal documentation (this folder)

1. **Five canonical files** in `docs/`: `OVERVIEW.md`, `ARCHITECTURE.md`, `DESIGN.md`, `TESTING.md`, `REQUIREMENTS.md`.
2. **Not part of the public website:** No `app/docs/**` routes; no `Link` or `href` from site chrome (nav, footer, hero CTAs) to `/docs` or to raw GitHub doc paths for this repo’s `docs/` tree.
3. **Discovery:** `app/robots.ts` includes `Disallow: /docs/` so if a host ever maps static files at that path, crawlers should skip it.
4. **Brain tuning:** Mesh scale (`useInitialScale`) and orb sprites (`uSizeMul`, `neural-orbs` sizes) are separate requirements; regressions must not “fix” orbs by shrinking the whole brain without explicit design sign-off.

## Amendments

Append new constraints or decisions as new bullets or dated subsections; do not delete historical requirements without a recorded reason.
