"use client"

import {
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react"

interface ScrollStackCard {
  id: string
  children: ReactNode
}

interface ScrollStackCardsProps {
  cards: ScrollStackCard[]
  className?: string
  /** Distance from top of viewport where cards stick (px). Default: 80 */
  stickyTop?: number
  /** Extra vertical offset per card so you see the stack peek (px). Default: 20 */
  stackOffset?: number
  /** Scroll distance allocated per card (vh). Default: 50 */
  scrollPerCard?: number
  /** 3D perspective depth (px). Default: 1200 */
  perspective?: number
}

/* ── Per-card drag physics state ─────────────────────────────────────── */
interface DragState {
  /** Is the pointer currently down on this card? */
  active: boolean
  /** Pointer starting position */
  startX: number
  startY: number
  /** Current drag offset from origin */
  dx: number
  dy: number
  /** Velocity (px / frame) — used for fling */
  vx: number
  vy: number
  /** Previous pointer position for velocity calc */
  prevX: number
  prevY: number
  /** Timestamp of last pointer move */
  lastTime: number
}

function newDragState(): DragState {
  return { active: false, startX: 0, startY: 0, dx: 0, dy: 0, vx: 0, vy: 0, prevX: 0, prevY: 0, lastTime: 0 }
}

/** Spring constant & damping for rubber-band snap-back */
const SPRING = 0.08
const DAMPING = 0.82
const FLING_DECAY = 0.92
const DRAG_DEAD_ZONE = 4

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
  stickyTop = 80,
  stackOffset = 20,
  scrollPerCard = 50,
  perspective = 1200,
}: ScrollStackCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const glowRefs = useRef<(HTMLDivElement | null)[]>([])
  const scanRefs = useRef<(HTMLDivElement | null)[]>([])
  const rafId = useRef<number>(0)
  const hoveredIndex = useRef<number | null>(null)

  // Drag state per card
  const drags = useRef<DragState[]>([])
  const draggingIndex = useRef<number | null>(null)

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

    // How far the container top has scrolled above the viewport top
    const scrolled = -rect.top
    // Total scrollable distance within the runway
    const maxScroll = container.offsetHeight - vh
    if (maxScroll <= 0) return

    // Overall progress through the scroll runway [0, 1]
    const totalProgress = Math.max(0, Math.min(scrolled / maxScroll, 1))

    // Step size: each card-to-card transition takes this much progress
    const step = n > 1 ? 1 / (n - 1) : 1

    cardRefs.current.forEach((el, i) => {
      if (!el) return
      // Skip scroll-based transform when hovering or dragging this card
      if (hoveredIndex.current === i || drags.current[i]?.active) return

      const d = drags.current[i]

      // Progress point where this card has fully arrived
      const arriveAt = n > 1 ? i / (n - 1) : 0

      // ── Enter progress: 0 = offscreen below, 1 = fully landed ──
      const enterStart = Math.max(0, arriveAt - step)
      const enterProgress = i === 0
        ? 1
        : Math.min(Math.max((totalProgress - enterStart) / step, 0), 1)

      // ── Cover progress: 0 = top card, 1 = fully covered by next ──
      let coverProgress = 0
      if (i < n - 1) {
        coverProgress = Math.min(
          Math.max((totalProgress - arriveAt) / step, 0),
          1,
        )
      }

      // ── 3D visual transforms ──
      const scale = 1 - coverProgress * 0.06
      const translateZ = coverProgress * -60
      const rotateX = coverProgress * 2
      const brightness = 1 - coverProgress * 0.2
      const borderRadius = 16 + coverProgress * 16
      const slideUp = (1 - enterProgress) * 110    // % from below
      const enterOpacity = Math.min(enterProgress * 2.5, 1)
      const stackedOpacity = 1 - coverProgress * 0.3
      const opacity = enterOpacity * stackedOpacity
      const shadowBlur = 30 + coverProgress * 20
      const shadowOpacity = 0.15 + coverProgress * 0.1

      // Add residual drag offset (spring-back animation)
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

      // Holographic edge glow intensity based on stack position
      const glow = glowRefs.current[i]
      if (glow) {
        const glowOpacity = enterProgress > 0.5 ? (1 - coverProgress) * 0.6 : 0
        glow.style.opacity = `${glowOpacity}`
      }

      // Scan-line speed based on progress
      const scan = scanRefs.current[i]
      if (scan) {
        scan.style.opacity = enterProgress > 0.5 ? "1" : "0"
      }
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

    // Lift card z-index while dragging
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

    // Velocity (smoothed)
    d.vx = 0.6 * d.vx + 0.4 * ((clientX - d.prevX) / dt * 16)
    d.vy = 0.6 * d.vy + 0.4 * ((clientY - d.prevY) / dt * 16)

    d.prevX = clientX
    d.prevY = clientY
    d.lastTime = now

    // Apply drag transform immediately
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
    el.style.boxShadow = `0 ${30 + Math.abs(d.dy) * 0.2}px 80px -12px rgba(0,0,0,0.45), 0 0 60px -10px rgba(100,140,255,0.15)`
    el.style.transition = "none"
    el.style.cursor = "grabbing"

    // Enhanced glow while dragging
    const glow = glowRefs.current[index]
    if (glow) glow.style.opacity = "0.9"
  }, [perspective])

  const onPointerUp = useCallback((index: number) => {
    const d = drags.current[index]
    d.active = false
    draggingIndex.current = null

    // Restore z-index
    const el = cardRefs.current[index]
    if (el) {
      el.style.zIndex = `${index + 1}`
      el.style.cursor = ""
    }

    // Fling + spring-back physics loop
    const animate = () => {
      if (d.active) return // user grabbed it again

      // Apply fling velocity
      d.dx += d.vx
      d.dy += d.vy
      d.vx *= FLING_DECAY
      d.vy *= FLING_DECAY

      // Spring force toward origin
      d.dx += -d.dx * SPRING
      d.dy += -d.dy * SPRING

      // Dampen
      d.dx *= DAMPING
      d.dy *= DAMPING

      // Stop when settled
      const dist = Math.sqrt(d.dx * d.dx + d.dy * d.dy)
      const vel = Math.sqrt(d.vx * d.vx + d.vy * d.vy)

      if (dist < 0.3 && vel < 0.2) {
        d.dx = 0
        d.dy = 0
        d.vx = 0
        d.vy = 0
        // Recalc scroll-based transforms
        cancelAnimationFrame(rafId.current)
        rafId.current = requestAnimationFrame(updateCards)
        return
      }

      // Apply physics to card
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
    // Don't hijack clicks on links/buttons inside cards
    if ((e.target as HTMLElement).closest("a, button")) return
    e.preventDefault()
    onPointerDown(e.clientX, e.clientY, index)
  }, [onPointerDown])

  const handleMouseMoveCard = useCallback((e: ReactMouseEvent<HTMLDivElement>, index: number) => {
    const d = drags.current[index]
    if (d.active) {
      onPointerMove(e.clientX, e.clientY, index)
      return
    }

    // Hover tilt (only when not dragging)
    const el = cardRefs.current[index]
    if (!el) return

    hoveredIndex.current = index
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const tiltX = (0.5 - y) * 8
    const tiltY = (x - 0.5) * 8

    el.style.transform = `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(30px) scale(1.02)`
    el.style.filter = "brightness(1.05)"
    el.style.boxShadow = "0 30px 80px -12px rgba(0,0,0,0.4), 0 0 50px -8px rgba(100,100,255,0.12)"
    el.style.transition = "transform 0.12s ease-out, box-shadow 0.12s ease-out, filter 0.12s ease-out"

    // Glow follows cursor
    const glow = glowRefs.current[index]
    if (glow) {
      glow.style.opacity = "0.7"
      glow.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, hsla(217,91%,60%,0.25), transparent 60%)`
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

    cancelAnimationFrame(rafId.current)
    rafId.current = requestAnimationFrame(updateCards)
  }, [updateCards, onPointerUp])

  /* ── Touch handlers ─────────────────────────────────────────────────── */
  const handleTouchStart = useCallback((e: ReactTouchEvent<HTMLDivElement>, index: number) => {
    if ((e.target as HTMLElement).closest("a, button")) return
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
    // Only hijack scroll after passing dead zone
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

  /* ================================================================== */
  /*  Scroll listener                                                    */
  /* ================================================================== */
  useEffect(() => {
    const onScroll = () => {
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

  /* ────────────────────────────────────────────────────────────────── */
  /*  Scroll runway height:                                            */
  /*  (n-1) transitions × scrollPerCard vh  +  100vh (initial view)    */
  /*  → the sticky wrapper stays pinned the entire time.               */
  /* ────────────────────────────────────────────────────────────────── */
  const runwayHeight = `${(cards.length - 1) * scrollPerCard + 100}vh`

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height: runwayHeight, position: "relative" }}
    >
      {/* Sticky frame: pins at stickyTop while scrolling through the runway */}
      <div
        className="sticky mx-auto"
        style={{ top: `${stickyTop}px`, maxWidth: "100%" }}
      >
        {/* Grid overlay: every card occupies the same cell; tallest one sizes the grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gridTemplateRows: "1fr",
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
                cursor: "grab",
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
              {/* Card content */}
              {card.children}

              {/* ── Holographic edge glow (follows cursor / drag) ── */}
              <div
                ref={(el) => { glowRefs.current[i] = el }}
                className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
                style={{
                  opacity: 0,
                  background: "radial-gradient(circle at 50% 50%, hsla(217,91%,60%,0.2), transparent 60%)",
                  mixBlendMode: "screen",
                }}
              />

              {/* ── Scan-line overlay ── */}
              <div
                ref={(el) => { scanRefs.current[i] = el }}
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                  opacity: 0,
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, hsla(217,91%,60%,0.03) 2px, hsla(217,91%,60%,0.03) 4px)",
                  backgroundSize: "100% 4px",
                  transition: "opacity 0.5s",
                }}
              />

              {/* ── Corner tech brackets ── */}
              <div className="pointer-events-none absolute left-2 top-2 z-10 h-4 w-4 border-l border-t border-primary/20" />
              <div className="pointer-events-none absolute right-2 top-2 z-10 h-4 w-4 border-r border-t border-primary/20" />
              <div className="pointer-events-none absolute bottom-2 left-2 z-10 h-4 w-4 border-b border-l border-primary/20" />
              <div className="pointer-events-none absolute bottom-2 right-2 z-10 h-4 w-4 border-b border-r border-primary/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
