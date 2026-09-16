import fs from "node:fs"
import path from "node:path"
import { describe, it, expect } from "vitest"

const ROOT = path.join(__dirname, "..")
const PAGE = path.join(ROOT, "app/fork/page.tsx")

describe("/fork install page", () => {
  it("exists for USB-agent fork checkouts", () => {
    expect(fs.existsSync(PAGE)).toBe(true)
  })

  const src = fs.readFileSync(PAGE, "utf8")

  it("uses ossInstallFork and the shared tool grid", () => {
    expect(src).toMatch(/ossInstallFork/)
    expect(src).toMatch(/OssToolGrid/)
    expect(src).toMatch(/CopyCommand/)
  })

  it("is noindex for agents, not a public SEO surface", () => {
    expect(src).toMatch(/index:\s*false/)
  })
})
