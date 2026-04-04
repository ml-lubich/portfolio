"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Components } from "react-markdown"
import { BlogChart } from "@/components/blog/charts/blog-chart"
import { splitMarkdownByBlogChartFences } from "@/lib/mdx-chart-fences"

interface BlogContentProps {
  content: string
}

/**
 * Renders blog post content, splitting markdown from ```mermaid / ```chart /
 * chart-shaped ```json blocks (BlogChart: pipeline, comparison, pie, tree).
 * Everything else is Markdown via react-markdown with GFM.
 */
export function BlogContent({ content }: BlogContentProps) {
  const parts = splitMarkdownByBlogChartFences(content)

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
  table: ({ children, className, ...props }) => (
    <div className="blog-table-wrap">
      <table className={`blog-table ${className ?? ""}`.trim()} {...props}>
        {children}
      </table>
    </div>
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
    // Block code — has className like "language-python" — no extra styles
    if (className) {
      return <code className={className} {...props}>{children}</code>
    }
    // Inline code — no className from remark
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

