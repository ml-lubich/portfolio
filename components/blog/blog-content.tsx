"use client"

import React from "react"
import { MermaidDiagram } from "@/components/blog/mermaid-diagram"

interface BlogContentProps {
  content: string
}

/**
 * Renders blog post content, splitting markdown text from ```mermaid blocks.
 * Renders mermaid blocks as interactive diagrams and text as styled prose.
 */
export function BlogContent({ content }: BlogContentProps) {
  const parts = parseContent(content)

  return (
    <div className="blog-prose">
      {parts.map((part, i) => {
        if (part.type === "mermaid") {
          return <MermaidDiagram key={i} chart={part.content} />
        }
        return (
          <div
            key={i}
            className="prose-section"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(part.content) }}
          />
        )
      })}
    </div>
  )
}

interface ContentPart {
  type: "text" | "mermaid"
  content: string
}

function parseContent(content: string): ContentPart[] {
  const parts: ContentPart[] = []
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = mermaidRegex.exec(content)) !== null) {
    // Text before mermaid block
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index).trim()
      if (text) parts.push({ type: "text", content: text })
    }
    // Mermaid block
    parts.push({ type: "mermaid", content: match[1].trim() })
    lastIndex = match.index + match[0].length
  }

  // Remaining text
  const remaining = content.slice(lastIndex).trim()
  if (remaining) parts.push({ type: "text", content: remaining })

  return parts
}

/**
 * Minimal markdown → HTML converter for blog content.
 * Handles headings, bold, italic, code, links, images, lists, tables,
 * fenced code blocks, blockquotes, and paragraphs.
 */
function markdownToHtml(md: string): string {
  // ── 1. Extract fenced code blocks (non-mermaid) before any processing ──
  const codeBlocks: string[] = []
  let html = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang: string, code: string) => {
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
    const langAttr = lang ? ` data-lang="${lang}"` : ""
    const idx = codeBlocks.length
    codeBlocks.push(
      `<pre class="blog-code-block"${langAttr}><code>${escaped.trimEnd()}</code></pre>`
    )
    return `\n%%CODEBLOCK_${idx}%%\n`
  })

  // ── 2. Escape HTML in remaining content ──
  html = html
    .replace(/&/g, "&amp;")
    .replace(/<(?!\/?(br|hr)\s*\/?>)/g, "&lt;")

  // ── 3. Tables ──
  html = html.replace(
    /\n(\|.+\|)\n(\|[\s\-:|]+\|)\n((?:\|.+\|\n?)+)/g,
    (_match, headerRow: string, _separator: string, bodyRows: string) => {
      const headers = headerRow.split("|").filter((c: string) => c.trim())
      const rows = bodyRows.trim().split("\n")
      let table = '<table class="blog-table"><thead><tr>'
      headers.forEach((h: string) => { table += `<th>${h.trim()}</th>` })
      table += "</tr></thead><tbody>"
      rows.forEach((row: string) => {
        const cells = row.split("|").filter((c: string) => c.trim())
        table += "<tr>"
        cells.forEach((c: string) => { table += `<td>${c.trim()}</td>` })
        table += "</tr>"
      })
      table += "</tbody></table>"
      return table
    }
  )

  // ── 4. Headings ──
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // ── 5. Bold & italic ──
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // ── 6. Inline code ──
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // ── 7. Blockquotes ──
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')

  // ── 8. Images — must come BEFORE links ──
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<figure class="blog-figure"><img src="$2" alt="$1" loading="lazy" /><figcaption>$1</figcaption></figure>'
  )
  // Remove empty figcaptions
  html = html.replace(/<figcaption><\/figcaption>/g, '')

  // ── 9. Links ──
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="blog-link">$1</a>'
  )

  // ── 10. Unordered lists ──
  html = html.replace(/^- (.+)$/gm, '<li class="ul-item">$1</li>')
  html = html.replace(/((?:<li class="ul-item">.+<\/li>\n?)+)/g, '<ul>$1</ul>')
  html = html.replace(/class="ul-item"/g, '')

  // ── 11. Ordered lists ──
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ol-item">$1</li>')
  html = html.replace(/((?:<li class="ol-item">.+<\/li>\n?)+)/g, '<ol>$1</ol>')
  html = html.replace(/class="ol-item"/g, '')

  // ── 12. Horizontal rule ──
  html = html.replace(/^---$/gm, '<hr />')

  // ── 13. Paragraphs — wrap non-tag lines ──
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ""
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<table") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<figure") ||
        trimmed.startsWith("%%CODEBLOCK_")
      ) {
        return trimmed
      }
      return `<p>${trimmed}</p>`
    })
    .join("\n")

  // ── 14. Restore code blocks ──
  codeBlocks.forEach((block, idx) => {
    html = html.replace(`%%CODEBLOCK_${idx}%%`, block)
  })

  return html
}
