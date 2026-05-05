import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = path.resolve(__dirname, "..")

function readProjectFile(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8")
}

function extractCssRuleBlock(css: string, selector: string): string {
  const selectorStart = css.indexOf(selector)
  if (selectorStart < 0) {
    throw new Error(`Missing CSS selector: ${selector}`)
  }

  const blockStart = css.indexOf("{", selectorStart)
  const blockEnd = css.indexOf("}", blockStart)
  if (blockStart < 0 || blockEnd < 0) {
    throw new Error(`Missing CSS block for selector: ${selector}`)
  }

  return css.slice(blockStart + 1, blockEnd)
}

describe("blog link visibility", () => {
  it("styles article links with a visible accent instead of foreground text", () => {
    const css = readProjectFile("app/globals.css")
    const ruleBlock = extractCssRuleBlock(
      css,
      "article .blog-prose a[href],\n.blog-prose a.blog-link[href]",
    )

    expect(ruleBlock).toContain("color: hsl(var(--chart-3))")
    expect(ruleBlock).toContain("text-decoration-thickness: 2px")
    expect(ruleBlock).toContain("-webkit-text-fill-color: currentColor")
    expect(ruleBlock).not.toContain("@apply text-foreground")
    expect(ruleBlock).not.toContain("decoration-foreground")
  })

  it("keeps hover and keyboard focus states visible", () => {
    const css = readProjectFile("app/globals.css")

    expect(css).toContain("article .blog-prose a[href]:hover")
    expect(css).toContain("color: hsl(var(--chart-5))")
    expect(css).toContain("article .blog-prose a[href]:focus-visible")
    expect(css).toContain("outline: 2px solid hsl(var(--chart-3) / 0.75)")
  })

  it("covers classless MDX anchors and the shared markdown blog-link path", () => {
    const css = readProjectFile("app/globals.css")
    const markdownSource = readProjectFile("components/blog/blog-content.tsx")

    expect(css).toContain("article .blog-prose a[href]")
    expect(css).toContain(".blog-prose a.blog-link[href]")
    expect(markdownSource).toContain('className="blog-link"')
  })
})
