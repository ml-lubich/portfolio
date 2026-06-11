#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const hooksDir = path.join(repoRoot, ".git", "hooks");
const HOOKS = [
  { src: "pre-commit.sh", dest: "pre-commit" },
  { src: "pre-push.sh", dest: "pre-push" },
];

if (!fs.existsSync(path.join(repoRoot, ".git"))) {
  process.exit(0);
}

if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

for (const hook of HOOKS) {
  const src = path.join(repoRoot, "scripts", hook.src);
  if (!fs.existsSync(src)) {
    continue;
  }
  const dest = path.join(hooksDir, hook.dest);
  fs.copyFileSync(src, dest);
  fs.chmodSync(dest, 0o755);
  console.log(`Hook installed at .git/hooks/${hook.dest}`);
}
