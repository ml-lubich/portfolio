"use client"

import {
  useCallback,
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react"
import type { ScrollStackCardsProps, DragState } from "./types"
import { SPRING, DAMPING, FLING_DECAY, DRAG_DEAD_ZONE, newDragState } from "./constants"
import { GlowOverlay, ShineOverlay, ScanOverlay, CornerBrackets } from "./card-overlays"
import { overlays, shadows } from "@/lib/theme"

/**
 * Hen-ry.com–style sticky stacking cards with 3D transforms + drag physics.
 *
 * Cards stick as you scroll. You can also grab and drag any card — it follows
 * your pointer with 3D rotation derived from drag velocity, then flings and
 * springs back with momentum when you release.
 */
export function ScrollStackCards({
  cards,
  className = "",
  header,
  stickyTop = 80,
  stackOffset = 20,
  scrollPerCard = 50,
  perspective = 1200,
  activeCardId = null,
  onScrollDismiss,
  detailContent,
}: ScrollStackCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const glowRefs = useRef<(HTMLDivElement | null)[]>([])
  const scanRefs = useRef<(HTMLDivElement | null)[]>([])
  const shineRefs = useRef<(HTMLDivElement | null)[]>([])
  const rafId = useRef<number>(0)
  const hoveredIndex = useRef<number | null>(null)
  const isScrolling = useRef(false)
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Drag state per card
  const drags = useRef<DragState[]>([])
  const draggingIndex = useRef<number | null>(null)

  // Detail-panel expansion state (derived + refs for stable closures)
  const isExpanded = !!activeCardId
  const activeCardIdRef = useRef(activeCardId)
  activeCardIdRef.current = activeCardId
  const onScrollDismissRef = useRef(onScrollDismiss)
  onScrollDismissRef.current = onScrollDismiss
  const expandedScrollY = useRef(0)

  // Ensure drag array is sized
  if (drags.current.length !== cards.length) {
    drags.current = cards.map(() => newDragState())
  }

  /* ================================================================== */
  /*  SCROLL  —  sticky stacking + 3D depth                             */
  /* ================================================================== */
  const updateCards = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const vh = window.innerHeight
    const n = cards.length

    const scrolled = -rect.top
    const maxScroll = container.offsetHeight - vh
    if (maxScroll <= 0) return

    const totalProgress = Math.max(0, Math.min(scrolled / maxScroll, 1))
    const step = n > 1 ? 1 / (n - 1) : 1

    cardRefs.current.forEach((el, i) => {
      if (!el) return
      if (drags.current[i]?.active) return
      // When scrolling, override hover — let scroll transforms control all cards
      if (isScrolling.current && hoveredIndex.current === i) {
        hoveredIndex.current = null
        const shine = shineRefs.current[i]
        if (shine) shine.style.opacity = "0"
      }
      if (hoveredIndex.current === i) return

      const d = drags.current[i]
      const arriveAt = n > 1 ? i / (n - 1) : 0

      const enterStart = Math.max(0, arriveAt - step)
      const enterProgress = i === 0
        ? 1
        : Math.min(Math.max((totalProgress - enterStart) / step, 0), 1)

      let coverProgress = 0
      if (i < n - 1) {
        coverProgress = Math.min(
          Math.max((totalProgress - arriveAt) / step, 0),
          1,
        )
      }

      const scale = 1 - coverProgress * 0.06
      const translateZ = coverProgress * -60
      const rotateX = coverProgress * 2
      const brightness = 1 - coverProgress * 0.2
      const borderRadius = 16 + coverProgress * 16
      const slideUp = (1 - enterProgress) * 110
      const enterOpacity = Math.min(enterProgress * 2.5, 1)
      const stackedOpacity = 1 - coverProgress * 0.3
      const opacity = enterOpacity * stackedOpacity
      const shadowBlur = 30 + coverProgress * 20
      const shadowOpacity = 0.15 + coverProgress * 0.1

      const dragX = d ? d.dx : 0
      const dragY = d ? d.dy : 0
      const dragRotateY = d ? d.dx * 0.04 : 0
      const dragRotateX = d ? -d.dy * 0.04 : 0

      el.style.transform = [
        `perspective(${perspective}px)`,
        `rotateX(${rotateX + dragRotateX}deg)`,
        `rotateY(${dragRotateY}deg)`,
        `translateX(${dragX}px)`,
        `translateY(${slideUp + dragY}%)`,
        `translateZ(${translateZ}px)`,
        `scale(${scale})`,
      ].join(" ")
      el.style.opacity = `${opacity}`
      el.style.filter = `brightness(${brightness})`
      el.style.borderRadius = `${borderRadius}px`
      el.style.boxShadow = `0 ${10 + coverProgress * 15}px ${shadowBlur}px -8px rgba(0,0,0,${shadowOpacity})`
      el.style.pointerEvents = enterProgress < 0.5 ? "none" : "auto"
      el.style.transition = "none"

      const glow = glowRefs.current[i]
      if (glow) {
        const glowOpacity = enterProgress > 0.5 ? (1 - coverProgress) * 0.6 : 0
        glow.style.opacity = `${glowOpacity}`
      }

      const scan = scanRefs.current[i]
      if (scan) {
        scan.style.opacity = enterProgress > 0.5 ? "1" : "0"
      }

      const shine = shineRefs.current[i]
      if (shine) shine.style.opacity = "0"
    })
  }, [cards.length, perspective])

  /* ================================================================== */
  /*  DRAG  —  pointer down / move / up + touch equivalents             */
  /* ================================================================== */
  const onPointerDown = useCallback((clientX: number, clientY: number, index: number) => {
    const d = drags.current[index]
    d.active = true
    d.startX = clientX
    d.startY = clientY
    d.prevX = clientX
    d.prevY = clientY
    d.vx = 0
    d.vy = 0
    d.lastTime = performance.now()
    draggingIndex.current = index

    const el = cardRefs.current[index]
    if (el) el.style.zIndex = `${cards.length + 10}`
  }, [cards.length])

  const onPointerMove = useCallback((clientX: number, clientY: number, index: number) => {
    const d = drags.current[index]
    if (!d.active) return

    const now = performance.now()
    const dt = Math.max(now - d.lastTime, 1)

    d.dx = clientX - d.startX
    d.dy = clientY - d.startY

    d.vx = 0.6 * d.vx + 0.4 * ((clientX - d.prevX) / dt * 16)
    d.vy = 0.6 * d.vy + 0.4 * ((clientY - d.prevY) / dt * 16)

    d.prevX = clientX
    d.prevY = clientY
    d.lastTime = now

    const el = cardRefs.current[index]
    if (!el) return

    const rotY = d.dx * 0.06
    const rotX = -d.dy * 0.06
    const lift = 40 + Math.min(Math.sqrt(d.dx * d.dx + d.dy * d.dy) * 0.15, 30)
    const dragScale = 1.03

    el.style.transform = [
      `perspective(${perspective}px)`,
      `rotateX(${rotX}deg)`,
      `rotateY(${rotY}deg)`,
      `translateX(${d.dx}px)`,
      `translateY(${d.dy}px)`,
      `translateZ(${lift}px)`,
      `scale(${dragScale})`,
    ].join(" ")
    el.style.filter = "brightness(1.1)"
    el.style.boxShadow = shadows.cardDrag(d.dy)
    el.style.transition = "none"
    el.style.cursor = "grabbing"

    const glow = glowRefs.current[index]
    if (glow) glow.style.opacity = "0.9"
  }, [perspective])

  const onPointerUp = useCallback((index: number) => {
    const d = drags.current[index]
    d.active = false
    draggingIndex.current = null

    const el = cardRefs.current[index]
    if (el) {
      el.style.zIndex = `${index + 1}`
      el.style.cursor = ""
    }

    const animate = () => {
      if (d.active) return

      d.dx += d.vx
      d.dy += d.vy
      d.vx *= FLING_DECAY
      d.vy *= FLING_DECAY

      d.dx += -d.dx * SPRING
      d.dy += -d.dy * SPRING

      d.dx *= DAMPING
      d.dy *= DAMPING

      const dist = Math.sqrt(d.dx * d.dx + d.dy * d.dy)
      const vel = Math.sqrt(d.vx * d.vx + d.vy * d.vy)

      if (dist < 0.3 && vel < 0.2) {
        d.dx = 0
        d.dy = 0
        d.vx = 0
        d.vy = 0
        cancelAnimationFrame(rafId.current)
        rafId.current = requestAnimationFrame(updateCards)
        return
      }

      const card = cardRefs.current[index]
      if (card) {
        const rotY = d.dx * 0.04
        const rotX = -d.dy * 0.04
        card.style.transform = [
          `perspective(${perspective}px)`,
          `rotateX(${rotX}deg)`,
          `rotateY(${rotY}deg)`,
          `translateX(${d.dx}px)`,
          `translateY(${d.dy}px)`,
          `translateZ(10px)`,
          `scale(1)`,
        ].join(" ")
        card.style.transition = "none"
        card.style.filter = `brightness(${1 + dist * 0.0003})`
      }

      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [perspective, updateCards])

  /* ── Mouse handlers ─────────────────────────────────────────────────── */
  const handleMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>, index: number) => {
    if ((e.target as HTMLElement).closest("a, button")) return
    if (activeCardIdRef.current) return // No drag while panel is open
    e.preventDefault()
    onPointerDown(e.clientX, e.clientY, index)
  }, [onPointerDown])

  const handleMouseMoveCard = useCallback((e: ReactMouseEvent<HTMLDivElement>, index: number) => {
    const d = drags.current[index]
    if (d.active) {
      onPointerMove(e.clientX, e.clientY, index)
      return
    }

    // Don't apply hover effects while scrolling / stacking or when panel is expanded
    if (isScrolling.current) return
    if (activeCardIdRef.current) return

    const el = cardRefs.current[index]
    if (!el) return

    hoveredIndex.current = index
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const tiltX = (0.5 - y) * 12
    const tiltY = (x - 0.5) * 12

    el.style.transform = `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(30px) scale(1.02)`
    el.style.filter = "brightness(1.05)"
    el.style.boxShadow = shadows.cardHover
    el.style.transition = "transform 0.12s ease-out, box-shadow 0.12s ease-out, filter 0.12s ease-out"

    const glow = glowRefs.current[index]
    if (glow) {
      glow.style.opacity = "0.7"
      glow.style.background = overlays.cardGlow(x * 100, y * 100)
    }

    const shine = shineRefs.current[index]
    if (shine) {
      const angle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI) + 90
      shine.style.opacity = "1"
      shine.style.background = [
        `linear-gradient(${angle}deg, transparent 0%, hsla(0,0%,100%,0.01) 20%, hsla(0,0%,100%,0.12) 45%, hsla(0,0%,100%,0.01) 70%, transparent 100%)`,
        `radial-gradient(ellipse at ${x * 100}% ${y * 100}%, hsla(0,0%,100%,0.15), transparent 50%)`
      ].join(", ")
    }
  }, [perspective, onPointerMove])

  const handleMouseUp = useCallback((_e: ReactMouseEvent<HTMLDivElement>, index: number) => {
    if (drags.current[index].active) {
      onPointerUp(index)
    }
  }, [onPointerUp])

  const handleMouseLeave = useCallback((index: number) => {
    if (drags.current[index].active) {
      onPointerUp(index)
    }
    hoveredIndex.current = null
    const el = cardRefs.current[index]
    if (!el) return
    el.style.transition = "transform 0.5s cubic-bezier(0.23,1,0.32,1), box-shadow 0.5s ease, filter 0.5s ease, opacity 0.5s ease, border-radius 0.5s ease"
    el.style.cursor = ""

    const glow = glowRefs.current[index]
    if (glow) glow.style.opacity = "0"

    const shine = shineRefs.current[index]
    if (shine) shine.style.opacity = "0"

    cancelAnimationFrame(rafId.current)
    rafId.current = requestAnimationFrame(updateCards)
  }, [updateCards, onPointerUp])

  /* ── Touch handlers ─────────────────────────────────────────────────── */
  const handleTouchStart = useCallback((e: ReactTouchEvent<HTMLDivElement>, index: number) => {
    if ((e.target as HTMLElement).closest("a, button")) return
    if (activeCardIdRef.current) return // No drag while panel is open
    const t = e.touches[0]
    onPointerDown(t.clientX, t.clientY, index)
  }, [onPointerDown])

  const handleTouchMove = useCallback((e: ReactTouchEvent<HTMLDivElement>, index: number) => {
    const d = drags.current[index]
    if (!d.active) return
    const t = e.touches[0]
    const dist = Math.sqrt(
      (t.clientX - d.startX) ** 2 + (t.clientY - d.startY) ** 2,
    )
    if (dist > DRAG_DEAD_ZONE) {
      e.preventDefault()
      e.stopPropagation()
    }
    onPointerMove(t.clientX, t.clientY, index)
  }, [onPointerMove])

  const handleTouchEnd = useCallback((_e: ReactTouchEvent<HTMLDivElement>, index: number) => {
    if (drags.current[index].active) onPointerUp(index)
  }, [onPointerUp])

  /* ================================================================== */
  /*  Global mouse-up safety net (if pointer leaves card while dragging) */
  /* ================================================================== */
  useEffect(() => {
    const onGlobalUp = () => {
      if (draggingIndex.current != null) {
        onPointerUp(draggingIndex.current)
      }
    }
    const onGlobalMove = (e: MouseEvent) => {
      if (draggingIndex.current != null) {
        onPointerMove(e.clientX, e.clientY, draggingIndex.current)
      }
    }
    window.addEventListener("mouseup", onGlobalUp)
    window.addEventListener("mousemove", onGlobalMove)
    return () => {
      window.removeEventListener("mouseup", onGlobalUp)
      window.removeEventListener("mousemove", onGlobalMove)
    }
  }, [onPointerUp, onPointerMove])

  /* ── Record scroll position when panel expands ────────────────────── */
  useEffect(() => {
    if (activeCardId) {
      expandedScrollY.current = window.scrollY
    }
  }, [activeCardId])

  /* ================================================================== */
  /*  Scroll listener                                                    */
  /* ================================================================== */
  useEffect(() => {
    const onScroll = () => {
      // Auto-dismiss detail panel on meaningful scroll (> 25px)
      if (activeCardIdRef.current && onScrollDismissRef.current) {
        const delta = Math.abs(window.scrollY - expandedScrollY.current)
        if (delta > 25) {
          onScrollDismissRef.current()
        }
      }

      isScrolling.current = true
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
      scrollTimer.current = setTimeout(() => { isScrolling.current = false }, 150)
      cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(updateCards)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    updateCards()
    return () => {
      cancelAnimationFrame(rafId.current)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [updateCards])

  const runwayHeight = `${(cards.length - 1) * scrollPerCard + 100}vh`

  return (
    <div
      ref={containerRef}
      className={className || undefined}
      style={{ height: runwayHeight, position: "relative" }}
    >
      <div
        className="sticky mx-auto"
        style={{
          top: `${stickyTop}px`,
          maxWidth: "100%",
          zIndex: 10,
        }}
      >
        {header}

        {/* Split-view container for cards + detail panel */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: isExpanded ? "1rem" : "0",
            transition: "gap 0.65s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Card stack — shrinks left when detail panel is open */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gridTemplateRows: "1fr",
              width: isExpanded ? "45%" : "100%",
              flexShrink: 0,
              transition: "width 0.65s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {cards.map((card, i) => (
              <div
                key={card.id}
                ref={(el) => { cardRefs.current[i] = el }}
                data-stack-card
                className="will-change-transform select-none"
                style={{
                  gridRow: "1 / -1",
                  gridColumn: "1 / -1",
                  marginTop: `${i * stackOffset}px`,
                  transformOrigin: "center top",
                  transformStyle: "preserve-3d",
                  borderRadius: "16px",
                  overflow: "hidden",
                  cursor: isExpanded ? "pointer" : "grab",
                  zIndex: i + 1,
                  opacity: i === 0 ? 1 : 0,
                }}
                onMouseDown={(e) => handleMouseDown(e, i)}
                onMouseMove={(e) => handleMouseMoveCard(e, i)}
                onMouseUp={(e) => handleMouseUp(e, i)}
                onMouseLeave={() => handleMouseLeave(i)}
                onTouchStart={(e) => handleTouchStart(e, i)}
                onTouchMove={(e) => handleTouchMove(e, i)}
                onTouchEnd={(e) => handleTouchEnd(e, i)}
              >
                {card.children}

                <GlowOverlay ref={(el) => { glowRefs.current[i] = el }} />
                <ShineOverlay ref={(el) => { shineRefs.current[i] = el }} />
                <ScanOverlay ref={(el) => { scanRefs.current[i] = el }} />
                <CornerBrackets />
              </div>
            ))}
          </div>

          {/* Detail panel — expands to the right of the card stack */}
          {detailContent && (
            <div
              style={{
                width: isExpanded ? "54%" : "0",
                flexShrink: 0,
                maxHeight: `calc(100vh - ${stickyTop + 80}px)`,
                overflowY: isExpanded ? "auto" : "hidden",
                overflowX: "hidden",
                overscrollBehavior: "contain",
                scrollbarGutter: "stable",
                opacity: isExpanded ? 1 : 0,
                transition: "width 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease",
                pointerEvents: isExpanded ? "auto" : "none",
                zIndex: cards.length + 20,
              }}
            >
              {detailContent}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
