"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Components } from "react-markdown"
import { BlogChart } from "@/components/blog/charts/blog-chart"

interface BlogContentProps {
  content: string
}

/**
 * Renders blog post content, splitting markdown text from ```chart blocks.
 * Chart blocks contain JSON matching the BlogChart schema and are rendered
 * as interactive visualisations. Everything else is rendered as proper
 * Markdown via react-markdown with GFM (tables, strikethrough, etc.).
 */
export function BlogContent({ content }: BlogContentProps) {
  const parts = parseContent(content)

  return (
    <div className="blog-prose">
      {parts.map((part, i) => {
        if (part.type === "chart") {
          return <BlogChart key={i} json={part.content} />
        }
        return (
          <div key={i} className="prose-section">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={mdComponents}
            >
              {part.content}
            </ReactMarkdown>
          </div>
        )
      })}
    </div>
  )
}

/* ── Custom react-markdown component map ──────────────────────── */

const mdComponents: Components = {
  // Tables
  table: ({ children, ...props }) => (
    <table className="blog-table" {...props}>{children}</table>
  ),
  thead: ({ children, ...props }) => <thead {...props}>{children}</thead>,
  tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
  tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
  th: ({ children, ...props }) => <th {...props}>{children}</th>,
  td: ({ children, ...props }) => <td {...props}>{children}</td>,

  // Code blocks & inline code
  pre: ({ children, ...props }) => {
    // Extract language from the child <code> element's className
    const codeChild = React.Children.toArray(children).find(
      (child): child is React.ReactElement =>
        React.isValidElement(child) && (child as React.ReactElement).type === "code"
    ) as React.ReactElement | undefined
    const langMatch = /language-(\w+)/.exec(
      (codeChild?.props as { className?: string })?.className || ""
    )
    return (
      <pre
        className="blog-code-block"
        {...(langMatch ? { "data-lang": langMatch[1] } : {})}
        {...props}
      >
        {children}
      </pre>
    )
  },
  code: ({ children, className, ...props }) => {
    // Inline code — no className from remark
    // Block code — has className like "language-python"
    return <code {...props}>{children}</code>
  },

  // Links
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="blog-link"
      {...props}
    >
      {children}
    </a>
  ),

  // Images
  img: ({ src, alt, ...props }) => (
    <figure className="blog-figure">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt || ""} loading="lazy" {...props} />
      {alt && <figcaption>{alt}</figcaption>}
    </figure>
  ),

  // Blockquotes
  blockquote: ({ children, ...props }) => (
    <blockquote {...props}>{children}</blockquote>
  ),
}

/* ── Content parser — splits chart blocks from markdown ────────── */

interface ContentPart {
  type: "text" | "chart"
  content: string
}

function parseContent(content: string): ContentPart[] {
  const parts: ContentPart[] = []
  const chartRegex = /```chart\n([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = chartRegex.exec(content)) !== null) {
    // Text before chart block
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index).trim()
      if (text) parts.push({ type: "text", content: text })
    }
    // Chart block
    parts.push({ type: "chart", content: match[1].trim() })
    lastIndex = match.index + match[0].length
  }

  // Remaining text
  const remaining = content.slice(lastIndex).trim()
  if (remaining) parts.push({ type: "text", content: remaining })

  return parts
}
