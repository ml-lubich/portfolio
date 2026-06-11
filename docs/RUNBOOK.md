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

`bun run build` runs the full Vitest suite explicitly (including the asset/media reference checks) before producing the Next.js production build. Vercel runs this same `build` script, so the asset/media tests gate every deployment too.

Git hooks enforce the gate locally (installed by `bun install` via `scripts/install-hooks.js`):

- `pre-commit` runs `bun run lint` and `bun run build` (which includes the Vitest suite).
- `pre-push` runs `bun run test` so no push reaches origin with broken asset/media references or failing tests. Bypassing hooks with `--no-verify` is not an accepted workflow.
`bun run ship:dev` is the Bun-standard local pre-ship alias for the full CI check.

## Deployment flow

All changes ship to the `dev` branch first. Do not push directly to production or update the production branch until Misha explicitly approves the dev deployment.

1. Finish the local change and run `bun run ship:dev` from the repository root.
2. Commit the verified change with a conventional commit message.
3. Push the verified commit to `origin/dev` for review or preview deployment.
4. Wait for Misha's approval before promoting the same commit to production.
5. After approval, fast-forward or merge the approved `dev` commit into the production branch.

## Common failures

| Symptom | Likely cause | Recovery |
|---|---|---|
| Stale manifest or chunk errors | Old `.next` cache | Remove `.next` and rerun `bun run build`. |
| Blog date hydration mismatch | Local timezone formatting | Use the shared UTC blog date formatter. |
| Missing local media | Broken `public/` reference | Run `bun run test` and fix the failing resource-reference test. |
| Navbar flicker over hero | Scroll surface regression | Check `lib/nav-hero-surface.ts` and `__tests__/nav-hero-surface.test.ts`. |

## Credentials

The portfolio does not require local API keys. If a future integration needs credentials, use environment variables or the deployment provider secret store; do not commit `.env` values.
