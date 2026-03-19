#!/usr/bin/env sh
# Pre-commit: verify lint and build pass. Commit is blocked if either fails.
set -e

echo "Pre-commit: running lint..."
bun run lint

echo "Pre-commit: running build..."
bun run build

echo "Pre-commit: lint and build passed."
