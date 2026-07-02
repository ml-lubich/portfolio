import { defineConfig } from "@playwright/test"

const PORT = 3811

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: `bunx next dev --webpack -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    // Generous: this box often runs heavy eval jobs (load >100) and a cold
    // webpack dev boot can exceed two minutes under that contention.
    timeout: 300_000,
  },
})
