#!/usr/bin/env sh
# Pre-push: run the full Vitest suite (includes media/resource reference
# checks) so no push reaches origin with broken assets or failing tests.
set -e

echo "Pre-push: running test suite (includes asset/media checks)..."
bun run test

echo "Pre-push: all tests passed."
