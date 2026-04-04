"use client"

import { useRef, useCallback, useEffect } from "react"
import { workMarqueeSegments } from "@/data/work-marquee"

/** Slower than LogoScroll (40 px/s) — readable drift, obvious marquee */
const PX_PER_SEC = 22

/**
 * Thin horizontal marquee — real names + neutral scope terms only.
 * rAF-driven (same strategy as LogoScroll) so motion is reliable vs CSS keyframes.
 */
function MarqueeTrack({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div
      className="flex w-max shrink-0 items-center gap-6 pr-6 sm:gap-10 sm:pr-10"
      aria-hidden={ariaHidden || undefined}
    >
      {workMarqueeSegments.map((label) => (
        <span
          key={ariaHidden ? `${label}-dup` : label}
          className="whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/45 sm:text-xs"
        >
          {label}
        </span>
      ))}
    </div>
  )
}

export function WorkMarquee() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const rafRef = useRef(0)
  const lastTimeRef = useRef(0)
  const pausedRef = useRef(false)

  const applyTransform = useCallback(() => {
    const el = trackRef.current
    if (el) {
      el.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
    }
  }, [])

  const wrapOffset = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const half = el.scrollWidth / 2
    if (half <= 1) return
    while (offsetRef.current <= -half) {
      offsetRef.current += half
    }
  }, [])

  const animate = useCallback(
    (time: number) => {
      if (pausedRef.current) {
        rafRef.current = 0
        return
      }

      if (lastTimeRef.current === 0) lastTimeRef.current = time
      const dt = (time - lastTimeRef.current) / 1000
      lastTimeRef.current = time

      const el = trackRef.current
      const half = el ? el.scrollWidth / 2 : 0
      if (half > 1) {
        offsetRef.current -= PX_PER_SEC * dt
        wrapOffset()
      }
      applyTransform()

      rafRef.current = requestAnimationFrame(animate)
    },
    [applyTransform, wrapOffset],
  )

  useEffect(() => {
    const root = sectionRef.current
    if (!root || typeof IntersectionObserver === "undefined") {
      pausedRef.current = false
      lastTimeRef.current = 0
      rafRef.current = requestAnimationFrame(animate)
      return () => {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
    }

    const io = new IntersectionObserver(
      ([e]) => {
        const vis = e.isIntersecting
        if (vis) {
          pausedRef.current = false
          if (!rafRef.current) {
            lastTimeRef.current = 0
            rafRef.current = requestAnimationFrame(animate)
          }
        } else {
          pausedRef.current = true
          cancelAnimationFrame(rafRef.current)
          rafRef.current = 0
        }
      },
      { threshold: 0, rootMargin: "80px" },
    )
    io.observe(root)
    return () => {
      io.disconnect()
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [animate])

  return (
    <div
      ref={sectionRef}
      className="relative border-y border-white/[0.05] bg-black/[0.15] py-3 backdrop-blur-[2px] sm:py-3.5"
      aria-label="Recent consulting collaborators and typical project scope"
    >
      <p className="sr-only">{workMarqueeSegments.join(", ")}</p>
      <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/35">
        Recent scope & collaborators
      </p>

      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-12 bg-gradient-to-r from-background to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-12 bg-gradient-to-l from-background to-transparent sm:w-24" />

      <div className="min-w-0 overflow-hidden">
        <div ref={trackRef} className="flex w-max will-change-transform">
          <MarqueeTrack />
          <MarqueeTrack ariaHidden />
        </div>
      </div>
    </div>
  )
}
