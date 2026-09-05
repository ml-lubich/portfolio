import { defineConfig } from "@playwright/test"

// A dedicated port + dist dir (see next.config.mjs) so this suite builds and
// serves its OWN production server, independent of whatever `bun run dev`
// instance a developer (or another agent) already has open. Two wins over
// the old "reuse the dev port" approach:
//  1. No more colliding with `.next/dev/lock` — a separate distDir means a
//     `next build` here can run at the same time as someone else's `next
//     dev` without either one erroring out.
//  2. A production server has no on-demand/webpack-dev compile latency, so
//     page loads are fast and *consistent* instead of "however long the dev
//     compiler takes right now" — the dev-server approach was the direct
//     cause of a batch of `page.goto` 90s timeouts under concurrent load.
const PORT = 3900

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  retries: 0,
  // Every spec shares one server process. Uncapped (one worker per core on
  // a many-core box) opens far more concurrent browser contexts than one
  // Node process serving a Next.js app can field, which is what produced
  // the flakiness this comment used to describe. 4 is comfortably below
  // core count on any dev machine and keeps response times steady.
  workers: 4,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    // Always rebuild: this is a push gate, so it must test the code that is
    // actually about to be pushed, not a stale server left over from a
    // previous run.
    command: `PLAYWRIGHT_DIST_DIR=.next-e2e bunx next build --webpack && git checkout -- next-env.d.ts && PLAYWRIGHT_DIST_DIR=.next-e2e bunx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    // Generous: covers a cold build (~2min measured) plus server boot under
    // contention from other work on this box.
    timeout: 300_000,
  },
})
