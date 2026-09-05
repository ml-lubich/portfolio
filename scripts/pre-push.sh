#!/usr/bin/env sh
# Pre-push: run the full Vitest suite (includes media/resource reference
# checks), then the Playwright suite (runtime-error gate, API guard rails,
# cross-viewport layout/visual checks) — so no push reaches origin with
# broken assets, failing tests, a page that throws in the browser, or a
# broken API route. Playwright is pre-push only (not pre-commit) because it
# boots a real browser and is slower than the commit loop should be.
set -e

echo "Pre-push: running test suite (includes asset/media checks)..."
bun run test

echo "Pre-push: running Playwright suite (runtime errors, API routes, visual checks)..."
bun run test:e2e

echo "Pre-push: all tests passed."
