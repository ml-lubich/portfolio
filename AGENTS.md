# AGENTS.md

## Cursor Cloud specific instructions

This is a Next.js 14 personal portfolio site (single page, no backend/database). Standard commands are in `package.json`:

- **Dev server:** `npm run dev` (port 3000)
- **Lint:** `npm run lint`
- **Build:** `npm run build`

### Non-obvious caveats

- **ESLint version:** Next.js 14 requires ESLint 8 and `eslint-config-next@14`. Installing the latest ESLint (v9+) or `eslint-config-next@latest` will break `npm run lint` due to config format incompatibilities.
- **`.npmrc` has `legacy-peer-deps=true`:** Required because React 19 has peer-dep conflicts with some Radix UI packages. Do not remove.
- **No lockfile in the repo:** There is no `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`. Each `npm install` resolves versions fresh. Be aware that dependency versions may drift.
- **Deleted component files (HEAD commit `8684ee5`):** The latest commit on `main` deleted several UI component files (`components/ui/button.tsx`, `about-card.tsx`, `badge.tsx`, `portfolio-card.tsx`, `unified-reveal.tsx`, `section-header.tsx`, `skill-card.tsx`, `action-button.tsx`, `carousel-3d.tsx`, `research-card.tsx`) and data files (`lib/data/experiences.ts`, `projects.ts`, `publications.ts`, `skills.ts`) while the code still imports them. These were restored from git history (`HEAD~1`) to make the build work. If working on the `main` branch, you will need to restore these files.
- **No automated tests exist** in this codebase. There is no test runner or test framework configured.
