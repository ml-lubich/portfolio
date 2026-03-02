"use client"

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  id?: string
  delay?: number
  /** Enable 3D perspective tilt as section enters. Default: true */
  enable3D?: boolean
}

/**
 * Animated section with:
 * 1. One-shot IntersectionObserver reveal (smooth fade + slide + 3D tilt)
 * 2. Continuous scroll-driven subtle parallax after reveal
 *
 * The initial reveal uses CSS transitions for buttery smoothness.
 * After reveal, a gentle translateY parallax keeps sections feeling alive.
 */
export function AnimatedSection({
  children,
  className = "",
  id,
  delay = 0,
  enable3D = true,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [parallaxY, setParallaxY] = useState(0)
  const rafRef = useRef<number>(0)

  // One-shot IntersectionObserver for the initial reveal
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.08 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Continuous scroll-driven parallax (subtle, after reveal)
  const updateParallax = useCallback(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const windowH = window.innerHeight
    // How far the element center is from viewport center, normalized
    const centerOffset = (rect.top + rect.height / 2 - windowH / 2) / windowH
    // Gentle parallax: -8px to +8px based on scroll position
    setParallaxY(centerOffset * 16)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(updateParallax)
    }
    updateParallax()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("scroll", onScroll)
    }
  }, [updateParallax])

  // 3D perspective tilt amount (only during entrance, fades to 0)
  const rotateX = enable3D && !isVisible ? 5 : 0
  const scaleVal = isVisible ? 1 : 0.97

  return (
    <section
      ref={ref}
      id={id}
      className={`will-change-transform ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `perspective(1200px) translateY(${isVisible ? parallaxY : 32
          }px) rotateX(${rotateX}deg) scale(${scaleVal})`,
        transformOrigin: "center bottom",
        transition: isVisible
          ? "opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)"
          : "none",
        transitionDelay: isVisible ? `${delay}ms` : "0ms",
      }}
    >
      {children}
    </section>
  )
}
