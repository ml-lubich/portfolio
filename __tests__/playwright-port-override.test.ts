import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

// Two sessions running the push gate at once used to collide on a hardcoded
// 3900: the second died on "already used", or the two servers killed each
// other and it surfaced as ERR_CONNECTION_REFUSED — a fake test failure that
// reads like broken code. The port must stay overridable.
describe("playwright config port", () => {
  const cfg = fs.readFileSync(
    path.join(path.resolve(__dirname, ".."), "playwright.config.ts"),
    "utf8",
  )

  it("reads the port from PLAYWRIGHT_PORT so parallel gates do not collide", () => {
    expect(cfg).toMatch(/process\.env\.PLAYWRIGHT_PORT/)
  })

  it("still defaults to 3900 when the env var is unset", () => {
    expect(cfg).toMatch(/process\.env\.PLAYWRIGHT_PORT\s*\?\?\s*3900/)
  })

  it("never hardcodes the port on the PORT assignment", () => {
    expect(cfg).not.toMatch(/^const PORT = 3900\s*$/m)
  })
})
