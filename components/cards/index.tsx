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
import { GlowOverlay, ShineOverlay, ScanOverlay } from "./card-overlays"
import { overlays, shadows } from "@/lib/theme"
import { useIsMobile, useReducedStackEffects } from "@/hooks/use-mobile"

/** One shadow value during scroll — avoids interpolating box-shadow every frame (repaint-heavy). */
const DESKTOP_SCROLL_STACK_SHADOW =
  "0 22px 50px -12px rgba(0,0,0,0.32), 0 0 0 1px rgba(255,255,255,0.03)"

/** Bias linear scroll progress so most motion happens in the first part of each card segment (snappier). */
function snapScrollProgress(t: number, power: number): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  return 1 - (1 - t) ** power
}

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
  scrollPerCard = 38,
  perspective = 1200,
  activeCardId = null,
  onScrollDismiss,
  detailContent,
}: ScrollStackCardsProps) {
  const isMobile = useIsMobile()
  const reducedStack = useReducedStackEffects()
  const isMobileRef = useRef(isMobile)
  isMobileRef.current = isMobile

  // Mobile: minimal stack peek, short scroll runway — laptop uses caller props unchanged.
  /** Keep sticky headers below fixed nav (min 72px); capping at 48 caused overlap. */
  const effStickyTop = isMobile ? Math.max(72, Math.min(stickyTop, 96)) : stickyTop
  const effStackOffset = isMobile ? 0 : stackOffset
  const effScrollPerCard = isMobile ? Math.min(scrollPerCard, 14) : scrollPerCard
  const effPerspective = isMobile ? Math.min(perspective, 800) : perspective

  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const glowRefs = useRef<(HTMLDivElement | null)[]>([])
  const scanRefs = useRef<(HTMLDivElement | null)[]>([])
  const shineRefs = useRef<(HTMLDivElement | null)[]>([])
  const rafId = useRef<number>(0)
  const hoveredIndex = useRef<number | null>(null)
  const isScrolling = useRef(false)
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Index of the top interactive card (tilt / hover); -1 if none. */
  const tiltableIndexRef = useRef<number>(-1)
  /** Scratch buffers for enter/cover progress (no per-frame object alloc). */
  const scrollMetricsRef = useRef<{ enter: Float64Array; cover: Float64Array }>({
    enter: new Float64Array(0),
    cover: new Float64Array(0),
  })

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
  const detailWrapperRef = useRef<HTMLDivElement>(null)

  const reducedStackRef = useRef(reducedStack)
  reducedStackRef.current = reducedStack

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

    const scrolling = isScrolling.current
    const scrollAttr = scrolling ? "true" : "false"
    if (container.getAttribute("data-stack-scrolling") !== scrollAttr) {
      container.setAttribute("data-stack-scrolling", scrollAttr)
    }
    const reducedAttr = reducedStackRef.current ? "true" : "false"
    if (container.getAttribute("data-stack-reduced") !== reducedAttr) {
      container.setAttribute("data-stack-reduced", reducedAttr)
    }

    const rect = container.getBoundingClientRect()
    const vh = window.innerHeight
    const n = cards.length

    const scrolled = -rect.top
    const maxScroll = container.offsetHeight - vh
    const totalProgress =
      maxScroll <= 0
        ? 1
        : Math.max(0, Math.min(scrolled / maxScroll, 1))
    const step = n > 1 ? 1 / (n - 1) : 1

    let { enter: enterBuf, cover: coverBuf } = scrollMetricsRef.current
    if (enterBuf.length !== n) {
      enterBuf = new Float64Array(n)
      coverBuf = new Float64Array(n)
      scrollMetricsRef.current = { enter: enterBuf, cover: coverBuf }
    }

    let tiltable = -1

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
      const rawEnter =
        i === 0 ? 1 : Math.min(Math.max((totalProgress - enterStart) / step, 0), 1)
      const mobileTight = isMobileRef.current
      const enterPow = mobileTight ? 1.28 : 2.55
      const coverPow = mobileTight ? 1.22 : 2.45
      const enterProgress = i === 0 ? 1 : snapScrollProgress(rawEnter, enterPow)

      let rawCover = 0
      if (i < n - 1) {
        rawCover = Math.min(Math.max((totalProgress - arriveAt) / step, 0), 1)
      }
      const coverProgress = snapScrollProgress(rawCover, coverPow)

      enterBuf[i] = enterProgress
      coverBuf[i] = coverProgress

      // Softer motion + 2D stack on phones / tablets (see useReducedStackEffects).
      const reduced = reducedStackRef.current
      const slideMult = mobileTight ? 0.48 : 1
      const scaleMult = mobileTight ? 0.45 : 1
      const scale = 1 - coverProgress * (reduced ? 0.03 : 0.06) * scaleMult
      const translateZ = coverProgress * (reduced ? -25 : -60)
      const rotateX = coverProgress * (reduced ? 0.8 : 2)
      const borderRadius = 20 + coverProgress * 12
      const slideUp =
        (1 - enterProgress) * (reduced ? 38 : 52) * slideMult
      const enterOpacity = Math.min(enterProgress * (mobileTight ? 7.5 : 4.25), 1)
      const stackedOpacity = 1 - coverProgress * 0.3
      /* Bake “brightness” into opacity on all viewports — filter:brightness() repaints during scroll. */
      const dimFactor = reduced ? 1 - coverProgress * 0.18 : 1 - coverProgress * 0.2
      const opacity = enterOpacity * stackedOpacity * dimFactor
      const shadowBlur = 30 + coverProgress * 20
      const shadowOpacity = 0.15 + coverProgress * 0.1

      const dragX = d ? d.dx : 0
      const dragY = d ? d.dy : 0
      const dragRotateY = d ? d.dx * 0.04 : 0
      const dragRotateX = d ? -d.dy * 0.04 : 0

      const curPerspective = reduced ? Math.min(perspective, 800) : perspective
      /* Laptop/desktop: full 3D stack + tilt. Phones / iPad / touch tablets: 2D only. */
      const useFlatStack = reduced
      el.style.transform = useFlatStack
        ? [
            `translateX(${dragX}px)`,
            `translateY(${slideUp + dragY}%)`,
            `scale(${scale})`,
          ].join(" ")
        : [
            `perspective(${curPerspective}px)`,
            `rotateX(${rotateX + dragRotateX}deg)`,
            `rotateY(${dragRotateY}deg)`,
            `translateX(${dragX}px)`,
            `translateY(${slideUp + dragY}%)`,
            `translateZ(${translateZ}px)`,
            `scale(${scale})`,
          ].join(" ")
      el.style.opacity = `${opacity}`
      el.style.filter = ""
      if (reduced) {
        el.style.boxShadow = "0 12px 28px -10px rgba(0,0,0,0.35)"
        el.style.backfaceVisibility = "hidden"
      } else if (scrolling) {
        el.style.boxShadow = DESKTOP_SCROLL_STACK_SHADOW
        el.style.backfaceVisibility = "hidden"
      } else {
        el.style.boxShadow = `0 ${10 + coverProgress * 15}px ${shadowBlur}px -8px rgba(0,0,0,${shadowOpacity})`
        el.style.backfaceVisibility = ""
      }
      /* Lock radius when reduced; desktop keeps animated corners (backdrop is off while scrolling). */
      el.style.borderRadius = reduced ? "20px" : `${borderRadius}px`
      el.style.pointerEvents = enterProgress < 0.28 ? "none" : "auto"
      el.style.transition = "none"

      if (!scrolling && !reduced) {
        const glow = glowRefs.current[i]
        if (glow) {
          const glowOpacity = enterProgress > 0.32 ? (1 - coverProgress) * 0.6 : 0
          glow.style.opacity = `${glowOpacity}`
        }

        const scan = scanRefs.current[i]
        if (scan) {
          scan.style.opacity = enterProgress > 0.32 ? "1" : "0"
        }
      } else {
        const glow = glowRefs.current[i]
        if (glow) glow.style.opacity = "0"
        const scan = scanRefs.current[i]
        if (scan) scan.style.opacity = "0"
      }

      const shine = shineRefs.current[i]
      if (shine) shine.style.opacity = "0"
    })

    for (let i = n - 1; i >= 0; i--) {
      if (enterBuf[i] > 0.38 && coverBuf[i] < 0.9) {
        tiltable = i
        break
      }
    }
    tiltableIndexRef.current = tiltable
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

    const flatDrag = reducedStackRef.current
    el.style.transform = flatDrag
      ? [
          `translateX(${d.dx}px)`,
          `translateY(${d.dy}px)`,
          `scale(${dragScale})`,
        ].join(" ")
      : [
          `perspective(${perspective}px)`,
          `rotateX(${rotX}deg)`,
          `rotateY(${rotY}deg)`,
          `translateX(${d.dx}px)`,
          `translateY(${d.dy}px)`,
          `translateZ(${lift}px)`,
          `scale(${dragScale})`,
        ].join(" ")
    el.style.filter = flatDrag ? "" : "brightness(1.1)"
    el.style.boxShadow = flatDrag
      ? "0 16px 36px -12px rgba(0,0,0,0.4)"
      : shadows.cardDrag(d.dy)
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
        const flatFling = reducedStackRef.current
        const rotY = d.dx * 0.04
        const rotX = -d.dy * 0.04
        card.style.transform = flatFling
          ? [
              `translateX(${d.dx}px)`,
              `translateY(${d.dy}px)`,
              `scale(1)`,
            ].join(" ")
          : [
              `perspective(${perspective}px)`,
              `rotateX(${rotX}deg)`,
              `rotateY(${rotY}deg)`,
              `translateX(${d.dx}px)`,
              `translateY(${d.dy}px)`,
              `translateZ(10px)`,
              `scale(1)`,
            ].join(" ")
        card.style.transition = "none"
        card.style.filter = flatFling ? "" : `brightness(${1 + dist * 0.0003})`
      }

      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [perspective, updateCards])

  /* ── Mouse handlers ─────────────────────────────────────────────────── */
  const handleMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>, index: number) => {
    if (isMobileRef.current) return
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
    if (reducedStackRef.current) return

    // Only the front (top) card runs tilt / shine — avoids extra layout + gradient work on the stack
    if (index !== tiltableIndexRef.current) return
    // Suppress synthetic mouse events that fire after a touch tap (within 500ms)
    if (Date.now() - lastTouchTime.current < 500) return

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
    el.style.transition = "transform 0.28s cubic-bezier(0.25, 0.9, 0.35, 1), box-shadow 0.28s ease, filter 0.28s ease, opacity 0.28s ease, border-radius 0.28s ease"
    el.style.cursor = ""

    const glow = glowRefs.current[index]
    if (glow) glow.style.opacity = "0"

    const shine = shineRefs.current[index]
    if (shine) shine.style.opacity = "0"

    cancelAnimationFrame(rafId.current)
    rafId.current = requestAnimationFrame(updateCards)
  }, [updateCards, onPointerUp])

  /* ── Touch handlers ─────────────────────────────────────────────────── */
  // Track recent touch to suppress synthetic mouse-hover that fires after tap
  const lastTouchTime = useRef(0)

  const handleTouchStart = useCallback((e: ReactTouchEvent<HTMLDivElement>, index: number) => {
    if (isMobileRef.current) return
    if ((e.target as HTMLElement).closest("a, button")) return
    if (activeCardIdRef.current) return // No drag while panel is open
    lastTouchTime.current = Date.now()
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

    // Clear shine / glow so they don't stay frozen after a tap on mobile
    hoveredIndex.current = null
    const shine = shineRefs.current[index]
    if (shine) shine.style.opacity = "0"
    const glow = glowRefs.current[index]
    if (glow) glow.style.opacity = "0"

    // Re-run layout so the card snaps back to its scroll-stack position
    cancelAnimationFrame(rafId.current)
    rafId.current = requestAnimationFrame(updateCards)
  }, [onPointerUp, updateCards])

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

  /* ── Dynamically size detail panel to fit viewport ─────────────────── */
  useEffect(() => {
    const el = detailWrapperRef.current
    if (!el || !isExpanded) return

    const recalcHeight = () => {
      const top = el.getBoundingClientRect().top
      const available = window.innerHeight - top - 16
      const h = `${Math.max(200, available)}px`
      el.style.height = h
      el.style.maxHeight = h
    }

    // Double rAF so layout has settled after the slide-in transition starts
    requestAnimationFrame(() => requestAnimationFrame(recalcHeight))

    window.addEventListener('resize', recalcHeight, { passive: true })
    return () => window.removeEventListener('resize', recalcHeight)
  }, [isExpanded])

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
    let scrollCoalesce = 0
    let scrollRafId = 0
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
      scrollTimer.current = setTimeout(() => {
        isScrolling.current = false
        updateCards()
      }, 120)
      /* One transform pass per frame while scrolling — coalesces burst scroll events. */
      if (!scrollRafId) {
        scrollRafId = requestAnimationFrame(() => {
          scrollRafId = 0
          updateCards()
        })
      }
    }
    const onResize = () => {
      if (scrollCoalesce) return
      scrollCoalesce = requestAnimationFrame(() => {
        scrollCoalesce = 0
        updateCards()
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize, { passive: true })

    const container = containerRef.current
    const ro =
      container && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            updateCards()
          })
        : null
    if (container && ro) ro.observe(container)

    updateCards()
    requestAnimationFrame(() => updateCards())

    return () => {
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
      if (scrollCoalesce) cancelAnimationFrame(scrollCoalesce)
      if (scrollRafId) cancelAnimationFrame(scrollRafId)
      cancelAnimationFrame(rafId.current)
      ro?.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
      containerRef.current?.removeAttribute("data-stack-scrolling")
      containerRef.current?.removeAttribute("data-stack-reduced")
    }
  }, [updateCards])

  const runwayHeight = `${(cards.length - 1) * effScrollPerCard + 64}vh`

  return (
    <div
      ref={containerRef}
      className={className || undefined}
      style={{ height: runwayHeight, position: "relative" }}
    >
      <div
        className="sticky mx-auto"
        style={{
          top: `${effStickyTop}px`,
          maxWidth: "100%",
          zIndex: 10,
        }}
      >
        {header}

        {/* Split-view container for cards + detail panel */}
        <div className="relative">
          {/* Card stack — shifts left when detail panel is open */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gridTemplateRows: "1fr",
              transform: isExpanded
                ? "translateX(-15%) scale(0.85)"
                : "translateX(0) scale(1)",
              transformOrigin: "left top",
              transition: isMobile
                ? "transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)"
                : "transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)",
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
                  marginTop: `${i * effStackOffset}px`,
                  transformOrigin: "center top",
                  transformStyle: reducedStack ? "flat" : "preserve-3d",
                  borderRadius: "20px",
                  overflow: "hidden",
                  cursor: isExpanded ? "pointer" : isMobile ? "default" : "grab",
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
              </div>
            ))}
          </div>

          {/* Detail panel — slides in from right when a card is selected */}
          {detailContent && (
            <div
              ref={detailWrapperRef}
              className="absolute top-0 right-0 w-[92%] sm:w-[56%] lg:w-[52%]"
              style={{
                transform: isExpanded ? "translateX(0)" : "translateX(110%)",
                opacity: isExpanded ? 1 : 0,
                transition: isMobile
                  ? "transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease"
                  : "transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease",
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
