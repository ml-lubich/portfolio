"use client"

import React, { useRef, useCallback, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { formatBlogDate, type BlogPostListItem } from "@/lib/blog-shared"
import { overlays, shadows, blogBg } from "@/lib/theme"

interface BlogCardProps {
  post: BlogPostListItem
  featured?: boolean
  onTagClick?: (tag: string) => void
  /** Featured hero only: preload this cover when it is the visible slide (LCP). */
  imagePriority?: boolean
}

function useBlogCardTiltGlare(
  cardRef: React.RefObject<HTMLDivElement | null>,
  glareRef: React.RefObject<HTMLDivElement | null>,
  perspectivePx: number,
  tiltMaxDeg: number
) {
  const lastTouchAtRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const pendingRef = useRef<{ cx: number; cy: number } | null>(null)

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const resetTiltGlare = useCallback(() => {
    const card = cardRef.current
    const glareEl = glareRef.current
    if (card) card.style.transform = ""
    if (glareEl) glareEl.style.background = overlays.blogGlare(50, 50, 0)
  }, [cardRef, glareRef])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (Date.now() - lastTouchAtRef.current < 500) return
      const el = cardRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = (e.clientX - rect.left) / rect.width
      const cy = (e.clientY - rect.top) / rect.height
      pendingRef.current = { cx, cy }

      if (rafRef.current != null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const p = pendingRef.current
        const card = cardRef.current
        const glareEl = glareRef.current
        if (!p || !card || !glareEl) return
        const rx = (p.cy - 0.5) * -tiltMaxDeg
        const ry = (p.cx - 0.5) * tiltMaxDeg
        card.style.transform = `perspective(${perspectivePx}px) rotateX(${rx}deg) rotateY(${ry}deg)`
        glareEl.style.background = overlays.blogGlare(p.cx * 100, p.cy * 100, 0.12)
      })
    },
    [cardRef, glareRef, perspectivePx, tiltMaxDeg]
  )

  const handleMouseLeave = useCallback(() => {
    resetTiltGlare()
  }, [resetTiltGlare])

  const handleTouchEnd = useCallback(() => {
    lastTouchAtRef.current = Date.now()
    resetTiltGlare()
  }, [resetTiltGlare])

  return { handleMouseMove, handleMouseLeave, handleTouchEnd }
}

export function BlogCard({
  post,
  featured = false,
  onTagClick,
  imagePriority = false,
}: BlogCardProps) {
  const router = useRouter()
  const readingTime = post.readingTime
  const formattedDate = formatBlogDate(post.date)

  const cardRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)

  const perspectivePx = featured ? 800 : 600
  const tiltMaxDeg = 8
  const { handleMouseMove, handleMouseLeave, handleTouchEnd } = useBlogCardTiltGlare(
    cardRef,
    glareRef,
    perspectivePx,
    tiltMaxDeg
  )

  const postHref = `/blog/${post.slug}`
  const warmRoute = useCallback(() => {
    router.prefetch(postHref)
  }, [router, postHref])

  const linkWarmHandlers = {
    prefetch: false as const,
    onMouseEnter: warmRoute,
    onFocus: warmRoute,
  }

  const cardMotionStyle: React.CSSProperties = {
    transition: "transform 0.15s ease-out",
  }

  const glareBaseStyle: React.CSSProperties = {
    background: overlays.blogGlare(50, 50, 0),
    transition: "opacity 0.2s",
  }

  if (featured) {
    return (
      <Link href={postHref} className="group block cursor-pointer" {...linkWarmHandlers}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchEnd={handleTouchEnd}
          style={cardMotionStyle}
        >
          <article className={`blog-glass-card relative overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-[${shadows.blogCardFeatured}]`}>
            <div
              ref={glareRef}
              className="pointer-events-none absolute inset-0 z-20 rounded-2xl"
              style={glareBaseStyle}
              aria-hidden="true"
            />

            <div className="relative h-[320px] overflow-hidden">
              <Image
                src={post.coverImage}
                alt=""
                fill
                priority={imagePriority}
                sizes="(max-width: 768px) 100vw, 896px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${blogBg.fade} ${blogBg.fadeSemi} to-transparent pointer-events-none`} />
              <div className="absolute left-6 top-6 flex gap-2">
                <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur-md">
                  {post.category}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur-md">
                  Featured
                </span>
              </div>
            </div>

            <div className="relative -mt-20 px-8 pb-8">
              <h2 className="no-metallic text-2xl font-semibold leading-tight text-foreground transition-colors group-hover:text-primary md:text-3xl">
                {post.title}
              </h2>
              <p className="mt-3 line-clamp-2 text-base text-muted-foreground">{post.excerpt}</p>

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
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                <span>{post.views} views</span>
              </div>
            </div>
          </article>
        </div>
      </Link>
    )
  }

  return (
    <div
      className="h-full"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchEnd={handleTouchEnd}
      style={cardMotionStyle}
    >
      <Link href={postHref} className="group block h-full cursor-pointer" {...linkWarmHandlers}>
        <article className={`blog-glass-card flex h-full min-h-[430px] flex-col overflow-hidden rounded-xl transition-all duration-500 hover:shadow-[${shadows.blogCardSmall}]`}>
          <div
            ref={glareRef}
            className="pointer-events-none absolute inset-0 z-20 rounded-xl"
            style={glareBaseStyle}
            aria-hidden="true"
          />

          <div className="relative h-[200px] overflow-hidden">
            <Image
              src={post.coverImage}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${blogBg.fade} via-transparent to-transparent pointer-events-none`} />
          </div>

          <div className="flex flex-1 flex-col px-6 pb-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary backdrop-blur-sm">
                {post.category}
              </span>
              <span className="text-xs text-muted-foreground">{readingTime} min</span>
              <span className="text-xs text-muted-foreground">{post.views} views</span>
            </div>

            <h3 className="no-metallic mt-3 text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
              {post.title}
            </h3>

            <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>

            <div className="mt-3 flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <button
                  key={tag}
                  type="button"
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
              <span className="text-xs font-medium text-primary opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                Read more →
              </span>
            </div>
          </div>
        </article>
      </Link>
    </div>
  )
}
