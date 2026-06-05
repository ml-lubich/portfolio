"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  id?: string
  delay?: number
  /** Enable 3D perspective tilt as section enters. Default: true */
  enable3D?: boolean
}

/** True when the visitor asked the OS to minimize motion. */
function _wantsReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * One-shot scroll-into-view reveal (fade + slide + subtle 3D tilt).
 *
 * The reveal is a single GPU-composited CSS transition — there is **no**
 * per-section scroll listener, so N sections no longer thrash layout on every
 * scroll frame. `will-change` is dropped once the reveal settles to release the
 * GPU layer, and motion is skipped entirely for reduced-motion users.
 */
export function AnimatedSection({
  children,
  className = "",
  id,
  delay = 0,
  enable3D = true,
}: AnimatedSectionProps) {
  const isMobile = useIsMobile()
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [settled, setSettled] = useState(false)

  // One-shot IntersectionObserver for the initial reveal.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (_wantsReducedMotion()) {
      setIsVisible(true)
      setSettled(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsVisible(true)
        observer.unobserve(entry.target)
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Release the GPU layer after the reveal finishes (no permanent will-change).
  useEffect(() => {
    if (!isVisible || settled) return
    const tail = (isMobile ? 420 : 620) + delay
    const t = window.setTimeout(() => setSettled(true), tail)
    return () => clearTimeout(t)
  }, [isVisible, settled, isMobile, delay])

  // 3D perspective tilt amount (only during entrance, fades to 0).
  const rotateX = enable3D && !isVisible ? (isMobile ? 2 : 4) : 0
  const scaleVal = isVisible ? 1 : (isMobile ? 0.99 : 0.985)
  const enterY = isMobile ? 14 : 24
  const dur = isMobile ? "0.42s" : "0.55s"

  return (
    <section
      ref={ref}
      id={id}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `perspective(1200px) translateY(${isVisible ? 0 : enterY
          }px) rotateX(${rotateX}deg) scale(${scaleVal})`,
        transformOrigin: "center bottom",
        transitionProperty: isVisible ? "opacity, transform" : "none",
        transitionDuration: isVisible ? `${dur}, ${dur}` : "0s",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: isVisible ? `${delay}ms` : "0ms",
        willChange: settled ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </section>
  )
}
