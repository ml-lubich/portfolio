import { defineConfig, devices } from "@playwright/test"

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
//  3. Overridable, so two sessions can run this gate at the same time. It was
//     hardcoded, which meant the second run died on "http://localhost:3900 is
//     already used" — or the two servers killed each other and it surfaced as
//     ERR_CONNECTION_REFUSED, a failure that reads like broken code and is not.
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3900)
// Per-port dist dir: a second run building into the first run's .next-e2e
// would swap the build out from under its live server.
const DIST = PORT === 3900 ? ".next-e2e" : `.next-e2e-${PORT}`

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
  },
  // Every spec runs on a laptop AND a phone. The phone profile brings touch,
  // isMobile, DPR 3 and a mobile UA; Chromium for both (the iPhone profile
  // defaults to WebKit, which isn't installed here and would double runtime).
  // A spec that asserts desktop-only behaviour opts out of the phone project
  // with `test.skip(({ isMobile }) => isMobile, ...)` — never by loosening the
  // assertion. hero-brain-fit.spec.ts is ignored on the phone project instead:
  // its desktop describes call page.setViewportSize (isMobile would still be
  // on) and its own phone describes already pin phone viewports via test.use.
  projects: [
    {
      name: "desktop",
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 14 Pro"], browserName: "chromium" },
      testIgnore: /hero-brain-fit\.spec\.ts/,
    },
  ],
  webServer: {
    // Always rebuild: this is a push gate, so it must test the code that is
    // actually about to be pushed, not a stale server left over from a
    // previous run.
    command: `PLAYWRIGHT_DIST_DIR=${DIST} bunx next build --webpack && git checkout -- next-env.d.ts && PLAYWRIGHT_DIST_DIR=${DIST} bunx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    // Generous: covers a cold build (~2min measured) plus server boot under
    // contention from other work on this box.
    timeout: 300_000,
  },
})
