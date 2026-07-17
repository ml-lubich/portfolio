import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = path.resolve(__dirname, "..")

function readProjectFile(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8")
}

describe("blog header top scrim", () => {
  it("renders a dark fade-to-transparent scrim above the header", () => {
    const source = readProjectFile("components/blog/blog-header.tsx")

    expect(source).toContain("bg-gradient-to-b from-black/95 via-black/55 to-transparent")
    expect(source).toContain('aria-hidden="true"')
    expect(source).toContain("pointer-events-none fixed inset-x-0 top-0 z-40")
  })

  it("ties the scrim's opacity to the same scrolled state as the header", () => {
    const source = readProjectFile("components/blog/blog-header.tsx")
    const scrimBlockStart = source.indexOf("Top scrim")
    const headerBlockStart = source.indexOf("<header")
    expect(scrimBlockStart).toBeGreaterThan(-1)
    expect(headerBlockStart).toBeGreaterThan(scrimBlockStart)

    const scrimBlock = source.slice(scrimBlockStart, headerBlockStart)
    expect(scrimBlock).toContain('scrolled ? "opacity-100" : "opacity-0"')
  })

  it("sits behind the header's own z-index so nav content stays on top", () => {
    const source = readProjectFile("components/blog/blog-header.tsx")
    expect(source).toContain("z-40")
    expect(source).toContain("z-50")
  })
})
