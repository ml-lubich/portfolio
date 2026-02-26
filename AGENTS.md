# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Next.js 15 personal portfolio site (single-page app, no backend, no database, no external services). All content is static data in `lib/data/`.

### Services

| Service | Command | Port |
|---------|---------|------|
| Next.js Dev Server | `npm run dev` | 3000 |

### Key commands

See `package.json` `scripts` for the canonical list: `dev`, `build`, `lint`, `start`.

### Non-obvious caveats

- **No lockfile committed**: all lockfiles are gitignored; `npm install` will resolve from `package.json` on every run.
- **`.npmrc` sets `legacy-peer-deps=true`**: required because several Radix UI packages use `latest` version specifiers that may conflict with peer dependency ranges.
- **ESLint is not in `devDependencies` and no `.eslintrc.json` exists**: running `npm run lint` will prompt interactively. To lint non-interactively, run these setup commands locally (do NOT commit these changes -- they break Vercel):
  ```
  npm install --save-dev eslint@^8 eslint-config-next@15.2.4
  echo '{"extends":"next/core-web-vitals"}' > .eslintrc.json
  npm run lint
  ```
- **`next.config.mjs` disables ESLint and TypeScript checks during builds** (`ignoreDuringBuilds: true`, `ignoreBuildErrors: true`), so `npm run build` will always succeed even if lint/type errors exist. Run `npm run lint` separately to check.
- **Do NOT modify `package.json`**: adding devDependencies (like `eslint`) has been observed to break Vercel deployments on this project. Keep such changes local only.
- **No automated tests exist** in this repo. There is no test framework configured.
