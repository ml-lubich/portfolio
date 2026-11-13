#!/usr/bin/env node
"use strict";
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const gitPath = path.join(repoRoot, ".git");
const HOOKS = [
  { src: "pre-commit.sh", dest: "pre-commit" },
  { src: "pre-push.sh", dest: "pre-push" },
];

if (!fs.existsSync(gitPath)) {
  process.exit(0);
}

// Respect configured hooks (including shared machine-wide hooks) and don't overwrite them.
let configuredHooks = "";
try {
  configuredHooks = execFileSync("git", ["config", "--get", "core.hooksPath"], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
} catch {
  // No configured hook path; install into this repository’s Git directory.
}
if (configuredHooks) {
  console.log(`Using configured Git hooks at ${configuredHooks}; project hooks not installed.`);
  process.exit(0);
}

const hooksPath = execFileSync("git", ["rev-parse", "--git-path", "hooks"], {
  cwd: repoRoot,
  encoding: "utf8",
}).trim();
const hooksDir = path.resolve(repoRoot, hooksPath);
fs.mkdirSync(hooksDir, { recursive: true });

for (const hook of HOOKS) {
  const src = path.join(repoRoot, "scripts", hook.src);
  if (!fs.existsSync(src)) {
    continue;
  }
  const dest = path.join(hooksDir, hook.dest);
  fs.copyFileSync(src, dest);
  fs.chmodSync(dest, 0o755);
  console.log(`Hook installed at ${path.relative(repoRoot, dest)}`);
}
