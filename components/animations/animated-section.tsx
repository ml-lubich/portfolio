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

const ENTER_ROTATE_X_DEG = 4
const ENTER_SETTLE_MS = 620
const DELAY_CLASSES: Record<number, string> = {
  0: "reveal-delay-0",
  80: "reveal-delay-80",
  100: "reveal-delay-100",
  150: "reveal-delay-150",
  160: "reveal-delay-160",
  200: "reveal-delay-200",
  240: "reveal-delay-240",
  300: "reveal-delay-300",
  320: "reveal-delay-320",
  400: "reveal-delay-400",
  450: "reveal-delay-450",
  480: "reveal-delay-480",
  560: "reveal-delay-560",
  600: "reveal-delay-600",
  640: "reveal-delay-640",
  720: "reveal-delay-720",
}

/** True when the visitor asked the OS to minimize motion. */
function _wantsReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function _calc_rotateX(enable3D: boolean, isVisible: boolean): number {
  return enable3D && !isVisible ? ENTER_ROTATE_X_DEG : 0
}

function _fmt_delayClass(delay: number): string {
  return DELAY_CLASSES[delay] ?? DELAY_CLASSES[0]
}

function _fmt_sectionClass(className: string, delay: number): string {
  return ["animated-section", _fmt_delayClass(delay), className].join(" ").trim()
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
    const tail = ENTER_SETTLE_MS + delay
    const t = window.setTimeout(() => setSettled(true), tail)
    return () => clearTimeout(t)
  }, [isVisible, settled, delay])

  return (
    <section
      ref={ref}
      id={id}
      className={_fmt_sectionClass(className, delay)}
      data-reveal-visible={isVisible ? "true" : "false"}
      data-reveal-settled={settled ? "true" : "false"}
      data-reveal-3d={_calc_rotateX(enable3D, isVisible) > 0 ? "true" : "false"}
    >
      {children}
    </section>
  )
}
