import { describe, expect, it } from "vitest"
import {
  isBlogChartJsonString,
  splitMarkdownByBlogChartFences,
  transformChartFences,
} from "@/lib/mdx-chart-fences"

const treeJson = `{
  "type": "tree",
  "title": "The Vibe Coding Danger Loop",
  "color": "blue",
  "steps": [
    "Vibe Code a Feature",
    {
      "label": "Works in Demo?",
      "branches": [
        {
          "condition": "Yes",
          "color": "amber",
          "steps": ["Ship to Production", "Edge Case Hits"]
        }
      ]
    }
  ]
}`

describe("transformChartFences", () => {
  it("rewrites mermaid fences to ChartFence MDX", () => {
    const src = `Intro

\`\`\`mermaid
{ "type": "pipeline", "steps": [] }
\`\`\`

Outro`
    const out = transformChartFences(src)
    expect(out).toContain("<ChartFence")
    expect(out).toMatch(/b64='/)
    expect(out).not.toContain("```mermaid")
  })

  it("rewrites chart fences", () => {
    const out = transformChartFences(
      `\`\`\`chart\n{ "type": "pie", "data": [] }\n\`\`\``
    )
    expect(out).toContain("<ChartFence")
  })

  it("does not rewrite non-json mermaid fences", () => {
    const src = `\`\`\`mermaid
graph TD
  A[Start] --> B[End]
\`\`\``
    const out = transformChartFences(src)
    expect(out).toContain("```mermaid")
    expect(out).not.toContain("<ChartFence")
  })

  it("rewrites mermaid tree charts", () => {
    const out = transformChartFences(`\`\`\`mermaid\n${treeJson}\n\`\`\``)
    expect(out).toContain("<ChartFence")
    const m = out.match(/b64='([^']+)'/)
    expect(m).toBeTruthy()
    const decoded = Buffer.from(m![1], "base64").toString("utf8")
    expect(JSON.parse(decoded).type).toBe("tree")
  })

  it("rewrites json fences only when body is BlogChart JSON", () => {
    const chart = transformChartFences(`\`\`\`json\n${treeJson}\n\`\`\``)
    expect(chart).toContain("<ChartFence")

    const api = transformChartFences(
      `\`\`\`json\n{ "error": "not a chart" }\n\`\`\``
    )
    expect(api).toContain("```json")
    expect(api).not.toContain("<ChartFence")
  })
})

describe("isBlogChartJsonString", () => {
  it("accepts tree payloads", () => {
    expect(isBlogChartJsonString(treeJson)).toBe(true)
  })
})

describe("splitMarkdownByBlogChartFences", () => {
  it("splits mermaid and leaves unrelated json code blocks in text", () => {
    const md = `A\n\n\`\`\`mermaid\n${treeJson}\n\`\`\`\n\nB`
    const parts = splitMarkdownByBlogChartFences(md)
    expect(parts).toHaveLength(3)
    expect(parts[0].type).toBe("text")
    expect(parts[1].type).toBe("chart")
    expect(parts[1].content).toContain('"type": "tree"')
    expect(parts[2].type).toBe("text")
  })

  it("keeps non-json mermaid fences as text content", () => {
    const md = `A

\`\`\`mermaid
graph TD
  A[Start] --> B[End]
\`\`\`

B`
    const parts = splitMarkdownByBlogChartFences(md)
    expect(parts).toHaveLength(1)
    expect(parts[0].type).toBe("text")
    expect(parts[0].content).toContain("```mermaid")
  })
})
