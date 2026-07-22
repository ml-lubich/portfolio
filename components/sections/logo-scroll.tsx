"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { SiApple, SiHonda, SiWalmart, SiGithub } from "react-icons/si"
import { AnimatedText } from "../animations/animated-text"

/* ──────────────────────────────────────────────────────────────────────
 *  LogoScroll — three compact marquee rows of official brand logos.
 *  Rows auto-scroll in alternating directions (→ ← →). Drag anywhere to
 *  scroll ALL rows together; each row keeps its own direction on release.
 *  Quick taps (no drag) still open the logo's link.
 * ────────────────────────────────────────────────────────────────────── */

interface Logo {
    name: string
    href: string
    /** Official brand mark; null renders a clean text wordmark instead. */
    icon: React.ReactNode
    /** Logo image already shows the brand name — skip the text label. */
    hideLabel?: boolean
}

const MARK = "h-7 w-7 sm:h-8 sm:w-8"

/** Single-tone logos: ghost to a light silhouette so they read on the dark
 *  strip; hover restores full color. */
const GHOST =
    "w-auto opacity-70 brightness-0 invert transition duration-300 group-hover:opacity-100 group-hover:brightness-100 group-hover:invert-0"

/** Multi-tone logos (internal negative space): grayscale keeps their shape;
 *  inverting would flatten them to a solid blob. */
const TONED =
    "w-auto opacity-75 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"

/**
 * Official marks (Simple Icons) and each client's real logo asset. Order
 * matters — rows are dealt round-robin, so adjacent entries land on
 * different rows (no brand repeats vertically).
 */
const LOGOS: Logo[] = [
    { name: "Apple", href: "https://www.apple.com", icon: <SiApple className={MARK} /> },
    { name: "GitHub", href: "https://github.com", icon: <SiGithub className={MARK} /> },
    { name: "Walmart", href: "https://www.walmart.com", icon: <SiWalmart className={MARK} /> },
    {
        name: "UC Berkeley",
        href: "https://www.berkeley.edu",
        hideLabel: true,
        icon: <Image src="/logos/uc-berkeley.svg" alt="UC Berkeley" width={430} height={135} className={`h-6 sm:h-7 ${GHOST}`} />,
    },
    { name: "Honda Innovations", href: "https://www.hondainnovations.com", icon: <SiHonda className={MARK} /> },
    { name: "Lawrence Berkeley Lab", href: "https://www.lbl.gov", icon: null },
    {
        name: "LUPFR",
        href: "https://lupfr.com",
        icon: <Image src="/logos/lupfr-mark.png" alt="LUPFR Entertainment logo" width={256} height={256} className={`h-7 sm:h-8 ${GHOST}`} />,
    },
    {
        name: "EnrichData",
        href: "https://www.enrichdata.net/",
        icon: <Image src="/logos/enrichdata.png" alt="EnrichData logo" width={256} height={256} className={`h-7 sm:h-8 ${GHOST}`} />,
    },
    {
        name: "W3 Sourcing",
        href: "https://www.w3sourcing.com/",
        hideLabel: true,
        icon: <Image src="/logos/w3sourcing.png" alt="W3 Sourcing" width={920} height={360} className={`h-6 sm:h-7 ${GHOST}`} />,
    },
    {
        name: "eria.co",
        href: "https://www.eria.co/",
        icon: <Image src="/logos/eria.png" alt="ERIA" width={256} height={256} className={`h-7 sm:h-8 ${GHOST}`} />,
    },
    {
        name: "Seaside",
        href: "https://seaside.la",
        icon: <Image src="/logos/seaside.svg" alt="Seaside" width={256} height={256} className={`h-7 sm:h-8 ${TONED}`} />,
    },
]

/** Pixels per second for auto-scroll */
const AUTO_SPEED = 32

/** Shared drag state: `total` is the cumulative horizontal drag applied to
 *  every row; `active` pauses auto-scroll while the pointer is held down. */
type DragState = { active: boolean; total: number }

function LogoItem({ logo }: { logo: Logo }) {
    return (
        <a
            href={logo.href}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            className="group flex flex-shrink-0 items-center gap-2 px-5 text-muted-foreground/55 transition-colors duration-300 hover:text-muted-foreground sm:px-7"
        >
            {logo.icon}
            {!logo.hideLabel && (
                <span className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.12em] sm:text-sm">
                    {logo.name}
                </span>
            )}
        </a>
    )
}

/** One auto-scrolling row. Reads the shared drag ref so all rows move together
 *  when dragged, while keeping its own auto-scroll direction. */
function MarqueeRow({
    logos,
    direction,
    speed,
    dragRef,
}: {
    logos: Logo[]
    direction: "left" | "right"
    speed: number
    dragRef: React.RefObject<DragState>
}) {
    const trackRef = useRef<HTMLDivElement>(null)
    const offsetRef = useRef(direction === "right" ? -1 : 0)
    const rafRef = useRef(0)
    const lastRef = useRef(0)
    const lastDragRef = useRef(0)
    const hiddenRef = useRef(false)

    // Repeat the set so even a short list fills ultrawide viewports.
    const set = [...logos, ...logos, ...logos]

    useEffect(() => {
        const dir = direction === "left" ? -1 : 1

        const animate = (t: number) => {
            if (hiddenRef.current) {
                rafRef.current = 0
                return
            }
            if (lastRef.current === 0) lastRef.current = t
            const dt = (t - lastRef.current) / 1000
            lastRef.current = t

            const el = trackRef.current
            const half = el ? el.scrollWidth / 2 : 0
            if (half > 1) {
                // Apply the shared drag delta uniformly to every row.
                const drag = dragRef.current
                offsetRef.current += drag.total - lastDragRef.current
                lastDragRef.current = drag.total
                // Auto-scroll only when not actively dragging.
                if (!drag.active) offsetRef.current += dir * speed * dt

                while (offsetRef.current <= -half) offsetRef.current += half
                while (offsetRef.current > 0) offsetRef.current -= half
                el!.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
            }
            rafRef.current = requestAnimationFrame(animate)
        }

        const start = () => {
            if (!rafRef.current && !hiddenRef.current) {
                lastRef.current = 0
                rafRef.current = requestAnimationFrame(animate)
            }
        }

        const root = trackRef.current
        if (!root || typeof IntersectionObserver === "undefined") {
            start()
            return () => {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = 0
            }
        }

        const io = new IntersectionObserver(
            ([e]) => {
                hiddenRef.current = !e.isIntersecting
                if (e.isIntersecting) start()
                else {
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
    }, [direction, speed, dragRef])

    return (
        <div className="overflow-hidden">
            <div ref={trackRef} className="flex w-max will-change-transform">
                {set.map((logo, i) => (
                    <LogoItem key={`${logo.name}-${i}`} logo={logo} />
                ))}
                {set.map((logo, i) => (
                    <LogoItem key={`${logo.name}-dup-${i}`} logo={logo} />
                ))}
            </div>
        </div>
    )
}

export function LogoScroll() {
    // Shared drag state read by every row's animation loop.
    const dragRef = useRef<DragState>({ active: false, total: 0 })
    const gestureRef = useRef({ down: false, startX: 0, startTotal: 0, moved: false })
    const [grabbing, setGrabbing] = useState(false)

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        gestureRef.current = { down: true, startX: e.clientX, startTotal: dragRef.current.total, moved: false }
        dragRef.current.active = true // freeze auto-scroll so a tapped logo holds still
        setGrabbing(true)
        // NOTE: don't capture the pointer here — capturing on press swallows the
        // click event on the inner <a>, breaking taps. Capture only once a drag
        // actually starts (below).
    }, [])

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        const g = gestureRef.current
        if (!g.down) return
        const dx = e.clientX - g.startX
        if (Math.abs(dx) > 4 && !g.moved) {
            g.moved = true
            e.currentTarget.setPointerCapture(e.pointerId) // it's a drag now — capture for smooth tracking
        }
        dragRef.current.total = g.startTotal + dx
    }, [])

    const endGesture = useCallback(() => {
        gestureRef.current.down = false
        dragRef.current.active = false
        setGrabbing(false)
    }, [])

    // Suppress the click that follows a drag so it doesn't open a link.
    const onClickCapture = useCallback((e: React.MouseEvent) => {
        if (gestureRef.current.moved) {
            e.preventDefault()
            e.stopPropagation()
        }
    }, [])

    return (
        <section
            id="partners"
            className="relative w-full overflow-hidden border-b border-border/40 bg-background/40 py-3 md:py-5 lg:py-6 md:backdrop-blur-sm"
            aria-label="Companies and institutions"
        >
            <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/50 sm:mb-4 sm:text-xs">
                <AnimatedText text="Trusted & partnered with:" variant="blur-slide" stagger={40} duration={600} />
            </p>

            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background/60 to-transparent sm:w-24" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background/60 to-transparent sm:w-24" />

            {/* Drag surface: all three rows move together, each keeps its direction */}
            <div
                className={`flex touch-pan-y flex-col gap-2 sm:gap-3 ${grabbing ? "cursor-grabbing" : "cursor-grab"}`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endGesture}
                onPointerCancel={endGesture}
                onClickCapture={onClickCapture}
            >
                <MarqueeRow logos={LOGOS.filter((_, i) => i % 3 === 0)} direction="right" speed={AUTO_SPEED} dragRef={dragRef} />
                <MarqueeRow logos={LOGOS.filter((_, i) => i % 3 === 1)} direction="left" speed={AUTO_SPEED * 0.85} dragRef={dragRef} />
                <MarqueeRow logos={LOGOS.filter((_, i) => i % 3 === 2)} direction="right" speed={AUTO_SPEED * 1.1} dragRef={dragRef} />
            </div>
        </section>
    )
}
