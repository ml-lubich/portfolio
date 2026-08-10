"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import Image from "next/image"
import {
    SiApple,
    SiHonda,
    SiWalmart,
} from "react-icons/si"
import { AnimatedText } from "../animations/animated-text"

/* ──────────────────────────────────────────────────────────────────────
 *  LogoScroll — Infinite horizontal marquee of grey company logos
 *  Auto-scrolls continuously AND supports click/touch drag.
 *  Placed directly below the Hero section.
 * ────────────────────────────────────────────────────────────────────── */

/** Seaside "//" brand mark — from the SEA//SIDE logo-concepts sheet */
function SeasideMark({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 256 256" aria-hidden>
            <circle cx="128" cy="128" r="128" fill="#5B8FCB" />
            <g stroke="#F5F5F2" strokeWidth={15}>
                <line x1="102" y1="172" x2="137" y2="84" />
                <line x1="146" y1="172" x2="181" y2="84" />
            </g>
        </svg>
    )
}

interface Logo {
    name: string
    icon: React.ReactNode
    /** Brand site the mark links to. Omitted when there is no public URL. */
    href?: string
}

/** Brand-colored client logos are muted to match the grey strip; the row's
 *  existing hover (via `group`) restores full color and contrast. */
/** Monochromatic white-tinted client logos with crisp contrast against dark background. */
const CLIENT_LOGO_IMG =
    "w-auto brightness-0 invert opacity-85 transition-[filter,opacity] duration-300 group-hover:opacity-100"

/** Scaled up icon sizes for uniform visual weight */
const ICON_MARK = "h-11 w-11 sm:h-14 sm:w-14 text-white/85 transition-opacity duration-300 group-hover:text-white"

const LOGOS: Logo[] = [
    { name: "Apple", href: "https://www.apple.com", icon: <SiApple className="h-10 w-10 sm:h-13 sm:w-13 text-white/85 transition-opacity duration-300 group-hover:text-white" /> },
    { name: "Walmart", href: "https://www.walmart.com", icon: <SiWalmart className="h-12 w-12 sm:h-16 sm:w-16 text-white/85 transition-opacity duration-300 group-hover:text-white" /> },
    {
        name: "Lawrence Berkeley Lab",
        href: "https://www.lbl.gov",
        icon: (
            <Image
                src="/logos/berkeley-lab.svg"
                alt="Lawrence Berkeley National Laboratory logo"
                width={366}
                height={79}
                unoptimized
                className={`h-9 sm:h-12 ${CLIENT_LOGO_IMG}`}
            />
        ),
    },
    {
        name: "Honda Innovations",
        href: "https://www.hondainnovations.com",
        icon: <SiHonda className="h-11 w-11 sm:h-14 sm:w-14 text-white/85 transition-opacity duration-300 group-hover:text-white" />,
    },
    {
        name: "UC Berkeley",
        href: "https://www.berkeley.edu",
        icon: (
            <Image
                src="/logos/uc-berkeley.svg"
                alt="University of California, Berkeley logo"
                width={215}
                height={68}
                unoptimized
                className={`h-9 sm:h-12 ${CLIENT_LOGO_IMG}`}
            />
        ),
    },
    {
        name: "LUPFR",
        href: "https://lupfr.com",
        icon: (
            <Image
                src="/logos/lupfr-mark.png"
                alt="LUPFR Entertainment logo"
                width={256}
                height={256}
                className="h-10 w-auto sm:h-13 opacity-90 transition-opacity duration-300 group-hover:opacity-100"
            />
        ),
    },
    { name: "Seaside", icon: <SeasideMark className="h-10 w-10 sm:h-13 sm:w-13 opacity-85 transition-opacity duration-300 group-hover:opacity-100" /> },
    {
        name: "eria.co",
        href: "https://www.eria.co",
        icon: (
            <Image
                src="/logos/eria-wordmark.png"
                alt="ERIA Events logo"
                width={256}
                height={157}
                className={`h-9 sm:h-12 ${CLIENT_LOGO_IMG}`}
            />
        ),
    },
]

/** Pixels per second for auto-scroll */
const AUTO_SPEED = 40

/** Pointer travel (px) past which a gesture counts as a drag, not a click */
const DRAG_SLOP = 6

/** Marks only — the brand name stays in the tree for screen readers and as the
 *  link's accessible name, but is never painted beside the glyph. */
function LogoItem({ logo, duplicate }: { logo: Logo; duplicate: boolean }) {
    const shell =
        "group flex flex-shrink-0 items-center px-7 sm:px-10 text-muted-foreground/50 transition-colors duration-300 hover:text-muted-foreground/90 select-none"

    if (!logo.href) {
        return (
            <div className={shell} aria-hidden={duplicate || undefined}>
                {logo.icon}
                <span className="sr-only">{logo.name}</span>
            </div>
        )
    }

    return (
        <a
            href={logo.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${logo.name} (opens in a new tab)`}
            /* Copies past the first set are decorative filler for the loop —
               keep them out of the a11y tree and the tab order. */
            aria-hidden={duplicate || undefined}
            tabIndex={duplicate ? -1 : undefined}
            className={`${shell} rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}
        >
            {logo.icon}
            <span className="sr-only">{logo.name}</span>
        </a>
    )
}

export function LogoScroll() {
    const sectionRef = useRef<HTMLElement>(null)
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
    const marqueePausedRef = useRef(false)
    /** Total pointer travel for the current gesture — a drag past DRAG_SLOP must
     *  not also activate the logo link it happened to start on. */
    const dragDistRef = useRef(0)

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
            if (marqueePausedRef.current) {
                rafRef.current = 0
                return
            }
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
        const root = sectionRef.current
        if (!root || typeof IntersectionObserver === "undefined") {
            rafRef.current = requestAnimationFrame(animate)
            return () => cancelAnimationFrame(rafRef.current)
        }
        const io = new IntersectionObserver(
            ([e]) => {
                const vis = e.isIntersecting
                if (vis) {
                    marqueePausedRef.current = false
                    if (!rafRef.current) {
                        lastTimeRef.current = 0
                        rafRef.current = requestAnimationFrame(animate)
                    }
                } else {
                    marqueePausedRef.current = true
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

    /* ── Pointer (mouse + touch) handlers ─────────────────────────── */
    const onPointerDown = useCallback((e: React.PointerEvent) => {
        isDraggingRef.current = true
        setDragging(true)
        dragDistRef.current = 0
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
        dragDistRef.current = Math.max(dragDistRef.current, Math.abs(dx))

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

    /** Swallow the click that ends a drag so dragging the strip never navigates. */
    const onClickCapture = useCallback((e: React.MouseEvent) => {
        if (dragDistRef.current > DRAG_SLOP) {
            e.preventDefault()
            e.stopPropagation()
        }
    }, [])

    return (
        <section
            ref={sectionRef}
            id="partners"
            className="relative w-full overflow-hidden border-y border-white/20 bg-gradient-to-r from-background/90 via-card/80 to-background/90 py-5 sm:py-7 md:py-8 shadow-2xl backdrop-blur-xl"
            aria-label="Companies and institutions"
            style={{
                boxShadow: "0 20px 50px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
                clipPath: "ellipse(140% 100% at 50% 0%)",
            }}
        >
            {/* Top specular arch highlight line */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent z-10" />

            {/* Heading */}
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-foreground/80 sm:mb-4 sm:text-sm">
                <AnimatedText text="Trusted & partnered with:" variant="blur-slide" stagger={40} duration={600} />
            </p>

            {/* Deep gradient fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 bg-gradient-to-r from-background via-background/80 to-transparent sm:w-40" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 bg-gradient-to-l from-background via-background/80 to-transparent sm:w-40" />

            {/* Draggable scrolling track */}
            <div
                ref={trackRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onClickCapture={onClickCapture}
                className={`flex items-center will-change-transform touch-pan-y ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
                style={{ touchAction: "pan-y" }}
            >
                {repeated.map((logo, i) => (
                    <LogoItem key={`${logo.name}-${i}`} logo={logo} duplicate={i >= LOGOS.length} />
                ))}
            </div>
        </section>
    )
}
