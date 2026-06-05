# Runbook

## First-time setup

Use Bun from the repository root:

```bash
bun install
```

## Local development

```bash
bun run dev
```

Open the local URL printed by Next.js and verify the homepage navbar, hero, blog route, privacy route, and terms route render without console errors.

## Verification

Run these checks before handing off changes:

```bash
bun run lint
bun run test
bun run build
bun run ship:dev
```

`bun run build` runs Vitest first through the `prebuild` script, then produces the Next.js production build.
`bun run ship:dev` is the Bun-standard local pre-ship alias for the full CI check.

## Common failures

| Symptom | Likely cause | Recovery |
|---|---|---|
| Stale manifest or chunk errors | Old `.next` cache | Remove `.next` and rerun `bun run build`. |
| Blog date hydration mismatch | Local timezone formatting | Use the shared UTC blog date formatter. |
| Missing local media | Broken `public/` reference | Run `bun run test` and fix the failing resource-reference test. |
| Navbar flicker over hero | Scroll surface regression | Check `lib/nav-hero-surface.ts` and `__tests__/nav-hero-surface.test.ts`. |

## Credentials

The portfolio does not require local API keys. If a future integration needs credentials, use environment variables or the deployment provider secret store; do not commit `.env` values.
