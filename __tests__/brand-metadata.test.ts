/**
 * Brand metadata guardrails — default social previews must stay on the favicon pack.
 *
 * Copyright © 2026 Misha Lubich. All rights reserved.
 *
 * Run: bun run test
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"
import {
  SITE_DEFAULT_OG_IMAGE,
  SITE_DEFAULT_OG_IMAGE_SIZE,
} from "@/lib/site-config"

const ROOT = path.resolve(__dirname, "..")

describe("SITE_DEFAULT_OG_IMAGE (favicon brand)", () => {
  it("points under /favicon/ (not legacy og-image.png)", () => {
    expect(SITE_DEFAULT_OG_IMAGE).toMatch(/^\/favicon\//)
    expect(SITE_DEFAULT_OG_IMAGE).not.toContain("og-image")
  })

  it("file exists on disk", () => {
    const abs = path.join(ROOT, "public", SITE_DEFAULT_OG_IMAGE.replace(/^\//, ""))
    expect(fs.existsSync(abs), `Missing public file for ${SITE_DEFAULT_OG_IMAGE}`).toBe(
      true,
    )
  })

  it("file size is within loose bounds (not empty, not a multi‑MB accident)", () => {
    const abs = path.join(ROOT, "public", SITE_DEFAULT_OG_IMAGE.replace(/^\//, ""))
    const bytes = fs.statSync(abs).size
    expect(bytes).toBeGreaterThan(512)
    expect(bytes).toBeLessThan(800 * 1024)
  })

  it("declared dimensions are square 512 (matches android-chrome asset)", () => {
    expect(SITE_DEFAULT_OG_IMAGE_SIZE.width).toBe(512)
    expect(SITE_DEFAULT_OG_IMAGE_SIZE.height).toBe(512)
  })
})

describe("Layouts wire default OG to SITE_DEFAULT_OG_IMAGE", () => {
  const layoutRoot = fs.readFileSync(path.join(ROOT, "app/layout.tsx"), "utf-8")
  const layoutBlog = fs.readFileSync(path.join(ROOT, "app/blog/layout.tsx"), "utf-8")

  it("app/layout uses the constant in openGraph.images (not /og-image.png)", () => {
    expect(layoutRoot).toContain("SITE_DEFAULT_OG_IMAGE")
    const start = layoutRoot.indexOf("openGraph:")
    const end = layoutRoot.indexOf("twitter:")
    expect(start).toBeGreaterThan(-1)
    expect(end).toBeGreaterThan(start)
    const ogBlock = layoutRoot.slice(start, end)
    expect(ogBlock).toContain("SITE_DEFAULT_OG_IMAGE")
    expect(ogBlock).not.toContain("/og-image.png")
  })

  it("app/layout twitter.images uses SITE_DEFAULT_OG_IMAGE", () => {
    const start = layoutRoot.indexOf("twitter:")
    const end = layoutRoot.indexOf("alternates:")
    expect(start).toBeGreaterThan(-1)
    expect(end).toBeGreaterThan(start)
    const twBlock = layoutRoot.slice(start, end)
    expect(twBlock).toContain("SITE_DEFAULT_OG_IMAGE")
  })

  it("app/blog/layout uses SITE_DEFAULT_OG_IMAGE and not /og-image.png", () => {
    expect(layoutBlog).toContain("SITE_DEFAULT_OG_IMAGE")
    expect(layoutBlog).not.toContain("/og-image.png")
  })
})

describe("PWA manifest references favicon pack icons", () => {
  const manifestPath = path.join(ROOT, "public/favicon/site.webmanifest")
  const raw = fs.readFileSync(manifestPath, "utf-8")
  const manifest = JSON.parse(raw) as { icons?: { src: string }[] }

  it("android icons live under /favicon/", () => {
    for (const icon of manifest.icons ?? []) {
      expect(icon.src).toMatch(/^\/favicon\//)
    }
  })
})
