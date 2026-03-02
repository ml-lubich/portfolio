"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import {
    SiApple,
    SiHonda,
} from "react-icons/si"
import { GraduationCap, FlaskConical, Brain } from "lucide-react"

/* ──────────────────────────────────────────────────────────────────────
 *  LogoScroll — Infinite horizontal marquee of grey company logos
 *  Auto-scrolls continuously AND supports click/touch drag.
 *  Placed directly below the Hero section.
 * ────────────────────────────────────────────────────────────────────── */

/** Walmart Spark — the 6-pointed starburst mark */
function WalmartSpark({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            {[0, 60, 120, 180, 240, 300].map((angle) => (
                <ellipse
                    key={angle}
                    cx="12"
                    cy="4.5"
                    rx="1.8"
                    ry="4"
                    transform={`rotate(${angle} 12 12)`}
                />
            ))}
        </svg>
    )
}

interface Logo {
    name: string
    icon: React.ReactNode
}

const LOGOS: Logo[] = [
    { name: "Braintrust Data", icon: <Brain className="h-7 w-7 sm:h-8 sm:w-8" /> },
    { name: "Apple", icon: <SiApple className="h-7 w-7 sm:h-8 sm:w-8" /> },
    { name: "Walmart", icon: <WalmartSpark className="h-7 w-7 sm:h-8 sm:w-8" /> },
    { name: "Lawrence Berkeley Lab", icon: <FlaskConical className="h-7 w-7 sm:h-8 sm:w-8" /> },
    { name: "Honda Innovations", icon: <SiHonda className="h-7 w-7 sm:h-8 sm:w-8" /> },
    { name: "UC Berkeley", icon: <GraduationCap className="h-7 w-7 sm:h-8 sm:w-8" /> },
]

/** Pixels per second for auto-scroll */
const AUTO_SPEED = 40

function LogoItem({ logo }: { logo: Logo }) {
    return (
        <div className="flex flex-shrink-0 items-center gap-2.5 px-6 sm:px-8 text-muted-foreground/50 transition-colors duration-300 hover:text-muted-foreground/90 select-none">
            {logo.icon}
            <span className="whitespace-nowrap text-xs font-medium tracking-wide uppercase sm:text-sm">
                {logo.name}
            </span>
        </div>
    )
}

export function LogoScroll() {
    const trackRef = useRef<HTMLDivElement>(null)
    const offsetRef = useRef(0)           // current translateX (negative = scrolled left)
    const rafRef = useRef<number>(0)
    const lastTimeRef = useRef<number>(0)
    const isDraggingRef = useRef(false)
    const dragStartXRef = useRef(0)
    const dragOffsetRef = useRef(0)
    const velocityRef = useRef(0)
    const lastPointerXRef = useRef(0)
    const lastPointerTimeRef = useRef(0)
    const [dragging, setDragging] = useState(false)

    // We render 6 copies so there's always enough to wrap seamlessly
    const repeated = [...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS]

    /** Apply the current offset to the DOM */
    const applyTransform = useCallback(() => {
        if (trackRef.current) {
            trackRef.current.style.transform = `translateX(${offsetRef.current}px)`
        }
    }, [])

    /** Wrap offset so it stays within one "set" width */
    const wrapOffset = useCallback(() => {
        if (!trackRef.current) return
        // Width of one set of logos (total / 6)
        const totalWidth = trackRef.current.scrollWidth
        const setWidth = totalWidth / 6
        if (setWidth === 0) return
        // Keep offset within [-setWidth, 0] range
        while (offsetRef.current < -setWidth) offsetRef.current += setWidth
        while (offsetRef.current > 0) offsetRef.current -= setWidth
    }, [])

    /** Main animation loop */
    const animate = useCallback(
        (time: number) => {
            if (lastTimeRef.current === 0) lastTimeRef.current = time
            const dt = (time - lastTimeRef.current) / 1000 // seconds
            lastTimeRef.current = time

            if (!isDraggingRef.current) {
                // If there's residual drag velocity, apply momentum with decay
                if (Math.abs(velocityRef.current) > 0.5) {
                    offsetRef.current += velocityRef.current * dt
                    velocityRef.current *= 0.95 // friction
                } else {
                    velocityRef.current = 0
                }
                // Always auto-scroll
                offsetRef.current -= AUTO_SPEED * dt
            }

            wrapOffset()
            applyTransform()
            rafRef.current = requestAnimationFrame(animate)
        },
        [applyTransform, wrapOffset]
    )

    useEffect(() => {
        rafRef.current = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(rafRef.current)
    }, [animate])

    /* ── Pointer (mouse + touch) handlers ─────────────────────────── */
    const onPointerDown = useCallback((e: React.PointerEvent) => {
        isDraggingRef.current = true
        setDragging(true)
        velocityRef.current = 0
        dragStartXRef.current = e.clientX
        dragOffsetRef.current = offsetRef.current
        lastPointerXRef.current = e.clientX
        lastPointerTimeRef.current = performance.now()
            ; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }, [])

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDraggingRef.current) return
        const dx = e.clientX - dragStartXRef.current
        offsetRef.current = dragOffsetRef.current + dx

        // Track velocity for momentum
        const now = performance.now()
        const timeDelta = (now - lastPointerTimeRef.current) / 1000
        if (timeDelta > 0) {
            velocityRef.current = (e.clientX - lastPointerXRef.current) / timeDelta
        }
        lastPointerXRef.current = e.clientX
        lastPointerTimeRef.current = now
    }, [])

    const onPointerUp = useCallback(() => {
        isDraggingRef.current = false
        setDragging(false)
    }, [])

    return (
        <section
            id="partners"
            className="relative w-full overflow-hidden border-b border-border/40 bg-background/40 backdrop-blur-sm py-6 sm:py-8"
            aria-label="Companies and institutions"
        >
            {/* Heading */}
            <p className="mb-5 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50 sm:text-sm">
                Trusted & partnered with:
            </p>

            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background/60 to-transparent sm:w-32" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background/60 to-transparent sm:w-32" />

            {/* Draggable scrolling track */}
            <div
                ref={trackRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                className={`flex will-change-transform touch-pan-y ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
                style={{ touchAction: "pan-y" }}
            >
                {repeated.map((logo, i) => (
                    <LogoItem key={`${logo.name}-${i}`} logo={logo} />
                ))}
            </div>
        </section>
    )
}
