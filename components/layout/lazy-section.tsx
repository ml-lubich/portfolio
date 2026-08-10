"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

interface LazySectionProps {
  children: ReactNode
  /** How far before entering viewport to trigger load (px). Default: 200 */
  rootMargin?: string
  /** Minimum height placeholder to prevent layout shift. Default: 100vh */
  minHeight?: string
  /** CSS class on the wrapper (always applied) */
  className?: string
  /**
   * Section id used for nav scroll targeting. Sets a data-section attribute
   * on the wrapper so navigateTo() can find the placeholder before the
   * lazy children have mounted (avoids the jarring progressive-scroll
   * fallback).
   */
  sectionId?: string
}

/**
 * Intersection-observer wrapper that defers rendering heavy children
 * until the section is near the viewport. Once mounted, never unmounts.
 *
 * This prevents 6+ Three.js Canvas instances from all booting on initial
 * page load — each one only initialises when the user scrolls close.
 */
export function LazySection({
  children,
  rootMargin = "1600px",
  minHeight = "min(38dvh, 320px)",
  className = "",
  sectionId,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      {
        /* Mount well before the section is reachable. A section swapping from
           a ~320px placeholder to its real height is a page-height change; if
           that lands near the viewport the reader sees everything below it
           slide, which reads as the page scrolling on its own. Doing it a
           screenful-and-a-half early keeps the growth off-screen. */
        rootMargin:
          rootMargin === "1600px" && window.matchMedia("(max-width: 767px)").matches
            ? "700px"
            : rootMargin,
      }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  useEffect(() => {
    function onMountAll() {
      setVisible(true)
    }
    window.addEventListener("portfolio:mount-all", onMountAll)
    return () => window.removeEventListener("portfolio:mount-all", onMountAll)
  }, [])

  return (
    <div
      ref={ref}
      className={["lazy-section-wrap", className].filter(Boolean).join(" ") || undefined}
      data-section={sectionId || undefined}
      data-lazy-loaded={visible ? "true" : "false"}
      /* Floor stays applied after mount too: dropping it the instant the IO
         fires collapses the wrapper to 0 for the frame or two before the
         dynamic chunk paints, which is itself a jump. */
      style={{ minHeight }}
    >
      {visible ? children : null}
    </div>
  )
}
