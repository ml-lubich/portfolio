"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

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
  const rafRef = useRef<number>(0)
  const revealDone = useRef(false)

  // One-shot IntersectionObserver for the initial reveal
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
          // Allow the CSS reveal transition to finish, then switch to direct DOM parallax
          setTimeout(() => { revealDone.current = true }, 1200 + delay)
        }
      },
      { threshold: 0.08 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  // Continuous scroll-driven parallax — direct DOM mutation, zero re-renders
  useEffect(() => {
    function updateParallax() {
      const el = ref.current
      if (!el || !revealDone.current) return
      const rect = el.getBoundingClientRect()
      const windowH = window.innerHeight
      const centerOffset = (rect.top + rect.height / 2 - windowH / 2) / windowH
      const parallaxY = centerOffset * 16
      // Update DOM directly — no React state, no re-render
      el.style.transform = `perspective(1200px) translateY(${parallaxY}px) rotateX(0deg) scale(1)`
      el.style.transitionProperty = "opacity"
    }

    function onScroll() {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(updateParallax)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

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
        transform: `perspective(1200px) translateY(${isVisible ? 0 : 32
          }px) rotateX(${rotateX}deg) scale(${scaleVal})`,
        transformOrigin: "center bottom",
        transitionProperty: isVisible ? "opacity, transform" : "none",
        transitionDuration: isVisible ? "1s, 1.2s" : "0s",
        transitionTimingFunction: isVisible ? "cubic-bezier(0.16, 1, 0.3, 1)" : "ease",
        transitionDelay: isVisible ? `${delay}ms` : "0ms",
      }}
    >
      {children}
    </section>
  )
}
