import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { validateBlogChartJsonString } from "@/lib/blog-chart-schema"
import { extractChartFenceBodiesFromMdx } from "@/lib/mdx-chart-fences"

const repoRoot = path.resolve(__dirname, "..")
const blogDir = path.join(repoRoot, "content", "blog")

function listMdxFiles(dir: string): string[] {
  const out: string[] = []
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) out.push(...listMdxFiles(p))
    else if (ent.isFile() && ent.name.endsWith(".mdx")) out.push(p)
  }
  return out
}

describe("blog MDX chart fences", () => {
  it("every chart fence in content/blog validates against the BlogChart schema", () => {
    const files = listMdxFiles(blogDir)
    expect(files.length).toBeGreaterThan(0)

    const failures: string[] = []
    for (const file of files) {
      const src = fs.readFileSync(file, "utf8")
      const bodies = extractChartFenceBodiesFromMdx(src)
      const rel = path.relative(repoRoot, file)
      bodies.forEach((body, i) => {
        const r = validateBlogChartJsonString(body)
        if (!r.ok) failures.push(`${rel} fence #${i + 1}: ${r.error}`)
      })
    }

    expect(failures).toEqual([])
  })
})
