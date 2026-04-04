/**
 * Blog route smoke — every MDX file on disk is loaded and would not hit notFound().
 *
 * Static HTTP 404 checks are covered indirectly: generateStaticParams uses blogPosts;
 * if a file were skipped by the loader, /blog/<slug> would 404 at runtime for that path.
 *
 * Full integration HTTP smoke would require a running server; keep prebuild fast.
 */

import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { getAllPosts } from "@/lib/mdx"

const repoRoot = path.resolve(__dirname, "..")
const blogDir = path.join(repoRoot, "content", "blog")

function slugFromMdxDir(): string[] {
  if (!fs.existsSync(blogDir)) return []
  return fs
    .readdirSync(blogDir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => name.replace(/\.mdx$/u, ""))
    .sort()
}

describe("blog routes — filesystem vs loader (no missing slugs)", () => {
  it("every content/blog/*.mdx slug is present in getAllPosts()", () => {
    const fromDisk = slugFromMdxDir()
    expect(fromDisk.length).toBeGreaterThan(0)

    const fromLoader = getAllPosts()
      .map((p) => p.slug)
      .sort()

    expect(fromLoader).toEqual(fromDisk)
  })
})
