"use client"

import { useCallback, useEffect, useRef, type ReactNode } from "react"

interface ScrollStackCard {
  id: string
  children: ReactNode
}

interface ScrollStackCardsProps {
  cards: ScrollStackCard[]
  className?: string
  /** Distance from top of viewport where cards stick (px). Default: 80 */
  stickyTop?: number
  /** Extra vertical stacking offset per card (px). Default: 30 */
  stackOffset?: number
  /** How much scroll-distance is allocated per card (vh). Default: 50 */
  scrollPerCard?: number
}

/**
 * Premium scroll-controlled stacking cards à la hen-ry.com.
 *
 * Each card is position:sticky. As the user scrolls, the next card slides up
 * from below and sits on top while the previous card compresses into the
 * background (scale-down, slight darkening, subtle border-radius growth).
 * Everything is driven by scroll position — no spring physics, no JS animation
 * frames — just raw 60 fps GPU-composited transforms tied to requestAnimationFrame.
 */
export function ScrollStackCards({
  cards,
  className = "",
  stickyTop = 80,
  stackOffset = 30,
  scrollPerCard = 55,
}: ScrollStackCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rafId = useRef<number>(0)

  /* ------------------------------------------------------------------ */
  /*  Core: read scroll position → write inline transforms (no setState) */
  /* ------------------------------------------------------------------ */
  const updateCards = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const cardEls = container.querySelectorAll<HTMLDivElement>("[data-stack-card]")
    const containerRect = container.getBoundingClientRect()
    const containerTop = containerRect.top
    const viewportH = window.innerHeight

    cardEls.forEach((el, i) => {
      // Each card "owns" a section of the overall scroll distance.
      // scrollPerCard (vh) * i gives the start of each card's active range.
      const cardScrollStart = (scrollPerCard / 100) * viewportH * i
      // How far the container has scrolled past the viewport top
      const scrolled = -containerTop
      // Progress for THIS card: 0 → it's below viewport, 1 → fully stuck
      const rawProgress = (scrolled - cardScrollStart + viewportH) / viewportH
      const progress = Math.min(Math.max(rawProgress, 0), 1)

      // How many cards have stacked ON TOP of this one
      const cardsAbove = cards.length - 1 - i
      let behindAmount = 0
      if (i < cards.length - 1) {
        // How far the NEXT card has progressed (tells us how "behind" this card is)
        const nextStart = (scrollPerCard / 100) * viewportH * (i + 1)
        const nextRaw = (scrolled - nextStart + viewportH) / viewportH
        behindAmount = Math.min(Math.max(nextRaw, 0), 1)
      }

      // ---- Compute visual properties ----
      // Scale shrinks when card is pushed behind newer cards
      const scale = 1 - behindAmount * 0.05
      // Slight upward push when behind
      const translateY = behindAmount * -8
      // Darken / reduce brightness when behind
      const brightness = 1 - behindAmount * 0.15
      // Opacity entrance: fade-in as card enters
      const enterOpacity = Math.min(progress * 2, 1)
      // Opacity exit: darken when fully stacked
      const stackedOpacity = 1 - behindAmount * 0.25
      const opacity = enterOpacity * stackedOpacity
      // Slide-up entrance from bottom
      const slideUp = (1 - progress) * 60

      el.style.transform = `scale(${scale}) translateY(${slideUp + translateY}px)`
      el.style.opacity = `${opacity}`
      el.style.filter = `brightness(${brightness})`
    })
  }, [cards.length, scrollPerCard])

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(updateCards)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    // Initial paint
    updateCards()
    return () => {
      cancelAnimationFrame(rafId.current)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [updateCards])

  // Container height: enough room so every card gets a scroll segment
  const containerMinHeight = `${cards.length * scrollPerCard}vh`

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: containerMinHeight }}
    >
      {cards.map((card, i) => (
        <div
          key={card.id}
          data-stack-card
          className="sticky will-change-transform"
          style={{
            top: `${stickyTop + i * stackOffset}px`,
            zIndex: i + 1,
            marginBottom: `${scrollPerCard * 0.4}vh`,
          }}
        >
          {card.children}
        </div>
      ))}
    </div>
  )
}
