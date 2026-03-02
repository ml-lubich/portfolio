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
  rootMargin = "400px",
  minHeight = "50vh",
  className = "",
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
      { rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div ref={ref} className={`overflow-x-hidden ${className}`} style={visible ? undefined : { minHeight }}>
      {visible ? children : null}
    </div>
  )
}
