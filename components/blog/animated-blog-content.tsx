"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { motion, useInView } from "framer-motion"
import { BlogContent } from "./blog-content"

/* ── Helpers ─────────────────────────────────────────────────────── */

/**
 * Protect markdown tables from being split by \n\n.
 * Groups consecutive lines starting with | into a single block.
 */
function protectTables(text: string): { text: string; isTable: boolean }[] {
  const lines = text.split("\n")
  const result: { text: string; isTable: boolean }[] = []
  let tableLines: string[] = []

  const flushTable = () => {
    if (tableLines.length > 0) {
      result.push({ text: tableLines.join("\n"), isTable: true })
      tableLines = []
    }
  }

  let nonTableLines: string[] = []
  const flushNonTable = () => {
    if (nonTableLines.length > 0) {
      result.push({ text: nonTableLines.join("\n"), isTable: false })
      nonTableLines = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushNonTable()
      tableLines.push(line)
    } else {
      flushTable()
      nonTableLines.push(line)
    }
  }
  flushTable()
  flushNonTable()

  return result
}

/* ─────────────────────────────────────────────────────────────────
 *  AnimatedBlogContent — Cool typewriter-style reveal for blog posts.
 *
 *  Wraps each prose section in a staggered animation that reveals
 *  content with a blur → sharp + opacity + slide transition, giving
 *  the feeling of the article "writing itself" as you open it.
 * ────────────────────────────────────────────────────────────────── */

interface AnimatedBlogContentProps {
  content: string
}

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 12,
    filter: "blur(3px)",
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.35,
      delay: 0.05 + i * 0.04,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
}



/**
 * A single animated section that reveals on viewport entry
 */
function AnimatedProseSection({
  children,
  index,
  onRevealed,
}: {
  children: React.ReactNode
  index: number
  onRevealed?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (isInView && !revealed) {
      const timer = setTimeout(() => {
        setRevealed(true)
        onRevealed?.()
      }, 50 + index * 40 + 350) // match animation duration
      return () => clearTimeout(timer)
    }
  }, [isInView, revealed, index, onRevealed])

  return (
    <motion.div
      ref={ref}
      custom={index}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={sectionVariants}
      className="relative"
    >
      {children}

    </motion.div>
  )
}

export function AnimatedBlogContent({ content }: AnimatedBlogContentProps) {
  const totalSections = useRef(0)
  const revealedCount = useRef(0)

  const handleRevealed = useCallback(() => {
    revealedCount.current++
  }, [])

  return (
    <div className="relative">
      {/* Animated blog content wrapper */}
      <AnimatedContentRenderer
        content={content}
        onRevealed={handleRevealed}
        totalSectionsRef={totalSections}
      />
    </div>
  )
}

/**
 * Inner component that wraps each prose-section in an animation
 */
function AnimatedContentRenderer({
  content,
  onRevealed,
  totalSectionsRef,
}: {
  content: string
  onRevealed: () => void
  totalSectionsRef: React.MutableRefObject<number>
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [wrappedContent, setWrappedContent] = useState<React.ReactNode>(null)

  useEffect(() => {
    // We render the content first, then wrap each prose-section in animation
    if (!containerRef.current) return

    const sections = containerRef.current.querySelectorAll(".prose-section, [data-chart], pre")
    totalSectionsRef.current = sections.length

    // If no sections found, show content immediately
    if (sections.length === 0) {
      totalSectionsRef.current = 1
      onRevealed()
    }
  }, [content, totalSectionsRef, onRevealed])

  return (
    <div ref={containerRef}>
      <StaggeredBlogContent content={content} onRevealed={onRevealed} />
    </div>
  )
}

/**
 * Renders BlogContent but with each section stagger-animated
 */
function StaggeredBlogContent({
  content,
  onRevealed,
}: {
  content: string
  onRevealed: () => void
}) {
  // Split content into sections by double newlines for animation chunks,
  // but preserve fenced code blocks (``` ... ```) and markdown tables
  // as single sections so they don't get broken apart.
  const sections = React.useMemo(() => {
    const parts: string[] = []
    // First, extract fenced code blocks so they don't get split
    const codeBlockRegex = /```[\s\S]*?```/g
    let lastIndex = 0
    let match
    const temp = content
    const segments: { text: string; isProtected: boolean }[] = []

    while ((match = codeBlockRegex.exec(temp)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ text: temp.slice(lastIndex, match.index), isProtected: false })
      }
      segments.push({ text: match[0], isProtected: true })
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < temp.length) {
      segments.push({ text: temp.slice(lastIndex), isProtected: false })
    }

    for (const seg of segments) {
      if (seg.isProtected) {
        parts.push(seg.text)
      } else {
        // Split by double newlines, but keep markdown tables together
        // A table is a block of lines starting with |
        const tableProtected = protectTables(seg.text)
        for (const block of tableProtected) {
          if (block.isTable) {
            parts.push(block.text)
          } else {
            const split = block.text.split(/\n\n+/)
            for (const s of split) {
              if (s.trim().length > 0) parts.push(s)
            }
          }
        }
      }
    }
    return parts
  }, [content])

  return (
    <div className="blog-prose">
      {sections.map((section, i) => (
        <AnimatedProseSection
          key={i}
          index={i}
          onRevealed={onRevealed}
        >
          <BlogContent content={section} />
        </AnimatedProseSection>
      ))}
    </div>
  )
}
