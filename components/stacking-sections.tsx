"use client"

import { useCallback, useEffect, useRef, Children, type ReactNode } from "react"

interface StackingSectionsProps {
  children: ReactNode
  /** Offset from viewport top where the first card sticks (px). Default: 70 */
  stickyTop?: number
  /** Additional offset per card to reveal the "peek" stack below (px). Default: 10 */
  stackGap?: number
}

/**
 * Wraps each child in a scroll-activated sticky container that produces a
 * hen-ry.com–style stacking-cards effect.
 *
 * How it works:
 * - Every child becomes a full-width "card" that sticks to the top of the
 *   viewport at an incrementally increasing `top` value.
 * - As the user scrolls, the next card slides up from below and lands on
 *   top of the previous one (higher z-index).
 * - Cards that are "covered" gently scale down, dim, and gain extra
 *   border-radius — all via GPU-composited transforms running inside
 *   requestAnimationFrame for buttery 60 fps.
 *
 * Important: does NOT use `overflow: hidden` so that inner sticky elements
 * (like ScrollStackCards in Journey / Projects) keep working.
 */
export function StackingSections({
  children,
  stickyTop = 70,
  stackGap = 10,
}: StackingSectionsProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const rafId = useRef<number>(0)

  /* ------------------------------------------------------------------ */
  /*  Scroll handler – reads layout, writes inline styles (no setState)  */
  /* ------------------------------------------------------------------ */
  const update = useCallback(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const cards = wrapper.querySelectorAll<HTMLDivElement>(
      ":scope > [data-page-card]",
    )
    const count = cards.length

    cards.forEach((card, i) => {
      const inner = card.querySelector<HTMLDivElement>("[data-page-inner]")
      if (!inner) return

      const rect = card.getBoundingClientRect()

      // ── How much of THIS card is covered by the NEXT card? ─────────
      let coverProgress = 0
      if (i < count - 1) {
        const nextRect = cards[i + 1].getBoundingClientRect()
        if (nextRect.top < rect.bottom) {
          coverProgress = Math.min(
            Math.max((rect.bottom - nextRect.top) / rect.height, 0),
            1,
          )
        }
      }

      // ── Visual transforms ──────────────────────────────────────────
      const scale = 1 - coverProgress * 0.04          // 1 → 0.96
      const brightness = 1 - coverProgress * 0.12      // 1 → 0.88
      const borderRadius = 20 + coverProgress * 12     // 20px → 32px
      const shadowOpacity = coverProgress * 0.3        // 0 → 0.3

      inner.style.transform = `scale(${scale})`
      inner.style.filter = `brightness(${brightness})`
      inner.style.borderRadius = `${borderRadius}px`
      inner.style.boxShadow = `0 ${8 + coverProgress * 16}px ${24 + coverProgress * 40}px rgba(0,0,0,${0.08 + shadowOpacity})`
    })
  }, [])

  useEffect(() => {
    const tick = () => {
      cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(update)
    }
    window.addEventListener("scroll", tick, { passive: true })
    window.addEventListener("resize", tick, { passive: true })
    // Initial paint
    update()
    return () => {
      cancelAnimationFrame(rafId.current)
      window.removeEventListener("scroll", tick)
      window.removeEventListener("resize", tick)
    }
  }, [update])

  const items = Children.toArray(children)

  return (
    <div ref={wrapperRef} className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {items.map((child, i) => (
        <div
          key={i}
          data-page-card
          className="sticky"
          style={{
            top: `${stickyTop + i * stackGap}px`,
            zIndex: i + 1,
          }}
        >
          <div
            data-page-inner
            className="overflow-hidden bg-background ring-1 ring-border/30 will-change-transform transition-[border-radius,transform,filter,box-shadow] duration-300 ease-out"
            style={{
              borderRadius: "20px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            {child}
          </div>
        </div>
      ))}
    </div>
  )
}
