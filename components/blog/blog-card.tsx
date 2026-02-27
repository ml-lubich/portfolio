"use client"

import React, { useRef, useState, useCallback } from "react"
import Link from "next/link"
import type { BlogPost } from "@/lib/blog-data"
import { getReadingTime } from "@/lib/blog-data"

interface BlogCardProps {
  post: BlogPost
  featured?: boolean
  onTagClick?: (tag: string) => void
}

export function BlogCard({ post, featured = false, onTagClick }: BlogCardProps) {
  const readingTime = getReadingTime(post.content)
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setTilt({ x: (y - 0.5) * -8, y: (x - 0.5) * 8 })
    setGlare({ x: x * 100, y: y * 100, opacity: 0.12 })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 })
    setGlare({ x: 50, y: 50, opacity: 0 })
  }, [])

  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} className="group block cursor-pointer">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.15s ease-out",
          }}
        >
          <article className="blog-glass-card relative overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-[0_0_60px_hsla(217,91%,60%,0.1),0_0_120px_hsla(265,80%,65%,0.05)]">
            {/* Glare overlay */}
            <div
              className="pointer-events-none absolute inset-0 z-20 rounded-2xl"
              style={{
                background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, hsla(217,91%,80%,${glare.opacity}), transparent 60%)`,
                transition: "opacity 0.2s",
              }}
              aria-hidden="true"
            />

            {/* Cover image */}
            <div className="relative h-[320px] overflow-hidden">
              <img
                src={post.coverImage}
                alt=""
                loading="eager"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,20%,4%)] via-[hsl(220,20%,4%,0.6)] to-transparent pointer-events-none" />
              <div className="absolute left-6 top-6 flex gap-2">
                <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur-md">
                  {post.category}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur-md">
                  Featured
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="relative -mt-20 px-8 pb-8">
              <h2 className="text-2xl font-semibold leading-tight text-foreground transition-colors group-hover:text-primary md:text-3xl">
                {post.title}
              </h2>
              <p className="mt-3 line-clamp-2 text-base text-muted-foreground">
                {post.excerpt}
              </p>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/[0.04] bg-white/[0.03] px-2.5 py-0.5 text-xs text-muted-foreground/70 backdrop-blur-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-4 text-sm text-muted-foreground">
                <time dateTime={post.date}>{formattedDate}</time>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                <span>{readingTime} min read</span>
              </div>
            </div>
          </article>
        </div>
      </Link>
    )
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.15s ease-out",
      }}
    >
      <Link href={`/blog/${post.slug}`} className="group block cursor-pointer h-full">
        <article className="blog-glass-card flex h-full flex-col overflow-hidden rounded-xl transition-all duration-500 hover:shadow-[0_0_40px_hsla(217,91%,60%,0.08),0_0_80px_hsla(265,80%,65%,0.04)]">
          {/* Glare overlay */}
          <div
            className="pointer-events-none absolute inset-0 z-20 rounded-xl"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, hsla(217,91%,80%,${glare.opacity}), transparent 60%)`,
              transition: "opacity 0.2s",
            }}
            aria-hidden="true"
          />

          {/* Cover image */}
          <div className="relative h-[200px] overflow-hidden">
            <img
              src={post.coverImage}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,20%,4%)] via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col px-6 pb-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary backdrop-blur-sm">
                {post.category}
              </span>
              <span className="text-xs text-muted-foreground">{readingTime} min</span>
            </div>

            <h3 className="mt-3 text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
              {post.title}
            </h3>

            <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
              {post.excerpt}
            </p>

            {/* Tags — clickable */}
            <div className="mt-3 flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <button
                  key={tag}
                  onClick={(e) => {
                    if (onTagClick) {
                      e.preventDefault()
                      e.stopPropagation()
                      onTagClick(tag)
                    }
                  }}
                  className="rounded-full border border-white/[0.04] bg-white/[0.02] px-2 py-0.5 text-[10px] font-medium text-muted-foreground/60 backdrop-blur-sm transition-all hover:border-accent/20 hover:text-accent/80"
                  aria-label={`Filter by tag: ${tag}`}
                >
                  #{tag}
                </button>
              ))}
              {post.tags.length > 3 && (
                <span className="px-1 text-[10px] text-muted-foreground/40">+{post.tags.length - 3}</span>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <time dateTime={post.date} className="text-xs text-muted-foreground">
                {formattedDate}
              </time>
              <span className="text-xs font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                Read more →
              </span>
            </div>
          </div>
        </article>
      </Link>
    </div>
  )
}
