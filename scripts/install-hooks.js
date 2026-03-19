#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const hooksDir = path.join(repoRoot, ".git", "hooks");
const preCommitSrc = path.join(repoRoot, "scripts", "pre-commit.sh");
const preCommitDest = path.join(hooksDir, "pre-commit");

if (!fs.existsSync(path.join(repoRoot, ".git")) || !fs.existsSync(preCommitSrc)) {
  process.exit(0);
}

if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

fs.copyFileSync(preCommitSrc, preCommitDest);
fs.chmodSync(preCommitDest, 0o755);
console.log("Pre-commit hook installed at .git/hooks/pre-commit");
