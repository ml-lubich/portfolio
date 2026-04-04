/**
 * Blog chart JSON (pipeline | comparison | pie | tree) — fence detection + MDX rewrite.
 */

export function isBlogChartJsonString(body: string): boolean {
  const t = body.trim()
  if (!t.startsWith("{")) return false
  try {
    const o = JSON.parse(t) as { type?: string }
    return (
      o.type === "pipeline" ||
      o.type === "comparison" ||
      o.type === "pie" ||
      o.type === "tree"
    )
  } catch {
    return false
  }
}

export type MarkdownChartPart =
  | { type: "text"; content: string }
  | { type: "chart"; content: string }

/**
 * Split markdown for react-markdown so ```mermaid / ```chart / chart-shaped ```json
 * become chart segments (same behaviour as MDX transform).
 */
export function splitMarkdownByBlogChartFences(markdown: string): MarkdownChartPart[] {
  const parts: MarkdownChartPart[] = []
  const re = /```\s*(mermaid|chart|json)\s*\r?\n([\s\S]*?)```/gi
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(markdown)) !== null) {
    const lang = m[1].toLowerCase()
    const body = m[2]
    const isChartFence =
      ((lang === "mermaid" || lang === "chart") && isBlogChartJsonString(body)) ||
      (lang === "json" && isBlogChartJsonString(body))

    if (!isChartFence) continue

    if (m.index > lastIndex) {
      const text = markdown.slice(lastIndex, m.index).trim()
      if (text) parts.push({ type: "text", content: text })
    }
    parts.push({ type: "chart", content: body.trim() })
    lastIndex = m.index + m[0].length
  }
  const remaining = markdown.slice(lastIndex).trim()
  if (remaining) parts.push({ type: "text", content: remaining })
  if (parts.length === 0 && markdown.trim().length > 0) {
    parts.push({ type: "text", content: markdown.trim() })
  }
  return parts
}

/**
 * Pass payload as base64 in a string literal:
 * - `json={...}` is stripped by next-mdx-remote's `removeJavaScriptExpressions`
 * - Raw JSON in `json='...'` breaks MDX on newlines / quotes inside the attribute
 */
function toChartFenceMdx(body: string): string {
  const trimmed = body.trim()
  const b64 = Buffer.from(trimmed, "utf8").toString("base64")
  return `\n\n<ChartFence b64='${b64}' />\n\n`
}

/**
 * Bodies of fenced blocks that become `<ChartFence />` (same rules as `transformChartFences`).
 */
export function extractChartFenceBodiesFromMdx(mdxSource: string): string[] {
  const bodies: string[] = []
  const mermaidOrChart =
    /```\s*(?:mermaid|chart)\s*\r?\n([\s\S]*?)```/gi
  let m: RegExpExecArray | null
  while ((m = mermaidOrChart.exec(mdxSource)) !== null) {
    const body = m[1]
    if (isBlogChartJsonString(body)) bodies.push(body.trim())
  }
  const jsonFence = /```\s*json\s*\r?\n([\s\S]*?)```/gi
  while ((m = jsonFence.exec(mdxSource)) !== null) {
    const body = m[1]
    if (isBlogChartJsonString(body)) bodies.push(body.trim())
  }
  return bodies
}

export function transformChartFences(mdxSource: string): string {
  let out = mdxSource.replace(
    /```\s*(?:mermaid|chart)\s*\r?\n([\s\S]*?)```/g,
    (full, body: string) => {
      if (!isBlogChartJsonString(body)) return full
      return toChartFenceMdx(body)
    }
  )
  out = out.replace(
    /```\s*json\s*\r?\n([\s\S]*?)```/g,
    (full, body: string) => {
      if (!isBlogChartJsonString(body)) return full
      return toChartFenceMdx(body)
    }
  )
  return out
}
