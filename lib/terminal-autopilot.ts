/** Commands the interactive shell types on its own while nobody is using it.
 *  Every entry must run clean against the virtual filesystem in
 *  lib/virtual-fs.ts — __tests__/terminal-autopilot.test.ts replays the list
 *  in order and fails on the first error line. */
export const AUTOPILOT_COMMANDS: readonly string[] = [
  "whoami",
  "ls",
  "cat notes/ideas.md",
  "cd projects",
  "ls",
  "cd agent-swarm",
  "cat README.md",
  "head -n 12 orchestrator.py",
  "cd ../rag-system",
  "cat config.yaml",
  "cd",
  "uptime",
  "cat scripts/deploy.sh",
  "cd projects/ml-pipeline",
  "grep -n def src/train.py",
  "cd",
  "neofetch",
  "date",
  "history",
]

/** Idle time before the autopilot picks up the keyboard. */
export const AUTOPILOT_IDLE_MS = 6_000
