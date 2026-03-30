/**
 * Pre-deploy smoke checks — loose guardrails so routine pushes don’t ship a broken site.
 *
 * Copyright © 2026 Misha Lubich. All rights reserved.
 *
 * Run before deploy: `bun run deploy:check` (lint + full test suite + this file is included).
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")

describe("deploy smoke — package scripts", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf-8")) as {
    scripts: Record<string, string>
  }

  it("prebuild runs vitest (blocks broken builds on Vercel)", () => {
    expect(pkg.scripts.prebuild).toMatch(/vitest/)
  })

  it("deploy:check runs lint then test", () => {
    expect(pkg.scripts["deploy:check"]).toMatch(/lint/)
    expect(pkg.scripts["deploy:check"]).toMatch(/test/)
  })
})

describe("deploy smoke — Next.js config", () => {
  const cfg = fs.readFileSync(path.join(ROOT, "next.config.mjs"), "utf-8")

  it("keeps reactStrictMode enabled", () => {
    expect(cfg).toContain("reactStrictMode: true")
  })

  it("hides X-Powered-By", () => {
    expect(cfg).toContain("poweredByHeader: false")
  })

  it("enables image optimization formats list", () => {
    expect(cfg).toContain("images:")
    expect(cfg).toContain("formats:")
  })
})

describe("deploy smoke — loose static asset bounds", () => {
  it("public/logo.png stays under 2MB", () => {
    const logoPath = path.join(ROOT, "public/logo.png")
    expect(fs.existsSync(logoPath)).toBe(true)
    expect(fs.statSync(logoPath).size).toBeLessThan(2 * 1024 * 1024)
  })

  it("generated favicon 512 asset is present and bounded", () => {
    const p = path.join(ROOT, "public/favicon/android-chrome-512x512.png")
    expect(fs.existsSync(p)).toBe(true)
    const n = fs.statSync(p).size
    expect(n).toBeGreaterThan(1024)
    expect(n).toBeLessThan(2 * 1024 * 1024)
  })
})
