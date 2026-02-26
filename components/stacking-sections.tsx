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
      const scale = 1 - coverProgress * 0.05          // 1 → 0.95
      const brightness = 1 - coverProgress * 0.15      // 1 → 0.85
      const borderRadius = 16 + coverProgress * 16     // 16px → 32px

      inner.style.transform = `scale(${scale})`
      inner.style.filter = `brightness(${brightness})`
      inner.style.borderRadius = `${borderRadius}px`
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
    <div ref={wrapperRef}>
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
            className="bg-background ring-1 ring-border/40 shadow-2xl shadow-black/[0.08] will-change-transform"
            style={{ borderRadius: "16px" }}
          >
            {child}
          </div>
        </div>
      ))}
    </div>
  )
}
