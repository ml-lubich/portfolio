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

/** Monochromatic white-tinted client logos with crisp contrast against dark background. */
const CLIENT_LOGO_IMG =
    "w-auto opacity-85 transition-opacity duration-300 group-hover:opacity-100"

const LOGOS: Logo[] = [
    { name: "Apple", href: "https://www.apple.com", icon: <SiApple className="h-10 w-10 sm:h-12 sm:w-12 text-white/90 transition-opacity duration-300 group-hover:text-white" /> },
    {
        name: "Walmart",
        href: "https://www.walmart.com",
        icon: (
            <SiWalmart
                /* Simple-Icons ships this wordmark in a square 24×24 viewBox, but
                   the ink only spans y≈9.1→14.9 — 24% of the box. Forced into a
                   square it rendered ~23px of visible mark inside a 96px slot,
                   the *optically smallest* logo on the strip. Cropping the
                   viewBox to the ink lets `w-auto` size it like the other
                   wordmarks. */
                viewBox="0 9.1 24 5.8"
                /* Explicit width, not `w-auto`: react-icons stamps `width="1em"`
                   on the svg, and against that Chrome resolves `width:auto` to
                   the height instead of deriving it from the viewBox — which
                   squashed the wordmark back into a square. These widths are
                   the cropped 24 ÷ 5.8 ratio applied to each height. */
                className="h-8 w-[8.28rem] sm:h-10 sm:w-[10.35rem] text-white/90 transition-opacity duration-300 group-hover:text-white"
            />
        ),
    },
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
                /* The source mark is a black block + black wordmark: on this
                   strip it disappears entirely. Flattened to white so it
                   reads — then held back to ~70% because unlike the other
                   marks here this one is a *filled* square, and at full
                   strength it blares next to Apple's and Honda's glyphs. */
                className="h-8 sm:h-11 w-auto opacity-[0.72] brightness-0 invert transition-opacity duration-300 group-hover:opacity-95"
            />
        ),
    },
    {
        name: "Honda Innovations",
        href: "https://www.hondainnovations.com",
        icon: <SiHonda className="h-11 w-11 sm:h-14 sm:w-14 text-white/90 transition-opacity duration-300 group-hover:text-white" />,
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
                className="h-8 sm:h-11 w-auto opacity-90 brightness-0 invert transition-opacity duration-300 group-hover:opacity-100"
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
                /* The mark sits in ~48% transparent padding inside a 256² PNG,
                   so the box has to run bigger than the neighbouring wordmarks
                   to land the same optical weight. `sm:h-13` used to be here and
                   silently did nothing — there is no 13 on the Tailwind v3
                   spacing scale, so this was pinned at 40px on every breakpoint. */
                className="h-14 w-auto sm:h-[4.75rem] opacity-90 transition-opacity duration-300 group-hover:opacity-100"
            />
        ),
    },
    { name: "Seaside", icon: <SeasideMark className="h-10 w-10 sm:h-12 sm:w-12 opacity-90 transition-opacity duration-300 group-hover:opacity-100" /> },
    {
        name: "eria.co",
        href: "https://www.eria.co",
        icon: (
            <Image
                src="/logos/eria-wordmark.png"
                alt="ERIA Events logo"
                width={256}
                height={157}
                className="h-8 sm:h-11 w-auto opacity-90 transition-opacity duration-300 group-hover:opacity-100 brightness-0 invert"
            />
        ),
    },
]

/** Pixels per second for auto-scroll */
const AUTO_SPEED = 40

/** Copies of the logo set rendered back-to-back to make the loop seamless.
 *  Only enough to cover the widest realistic viewport plus one set of slack:
 *  a set is ~1.4k px, so 4 copies (~5.6k) still wraps cleanly on ultrawide. */
const COPIES = 4

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
    /** Width of one logo set, measured off the layout instead of re-read per
     *  frame. Reading `scrollWidth` inside the rAF loop forced a synchronous
     *  reflow on every tick — the single most expensive thing this strip did. */
    const setWidthRef = useRef(0)
    const reducedMotionRef = useRef(false)

    const repeated = Array.from({ length: COPIES }, () => LOGOS).flat()

    /** Apply the current offset to the DOM */
    const applyTransform = useCallback(() => {
        if (trackRef.current) {
            // translate3d keeps the track on its own compositor layer.
            trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
        }
    }, [])

    /** Wrap offset so it stays within one "set" width */
    const wrapOffset = useCallback(() => {
        const setWidth = setWidthRef.current
        if (setWidth <= 0) return
        // Keep offset within [-setWidth, 0] range
        while (offsetRef.current < -setWidth) offsetRef.current += setWidth
        while (offsetRef.current > 0) offsetRef.current -= setWidth
    }, [])

    /** Re-measure one set's width — on mount and whenever layout actually changes. */
    const measure = useCallback(() => {
        const el = trackRef.current
        if (el) setWidthRef.current = el.scrollWidth / COPIES
    }, [])

    useEffect(() => {
        measure()
        if (typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(measure)
        if (trackRef.current) ro.observe(trackRef.current)
        return () => ro.disconnect()
    }, [measure])

    useEffect(() => {
        if (typeof matchMedia !== "function") return
        const mq = matchMedia("(prefers-reduced-motion: reduce)")
        const sync = () => {
            reducedMotionRef.current = mq.matches
        }
        sync()
        mq.addEventListener("change", sync)
        return () => mq.removeEventListener("change", sync)
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
                // Auto-scroll, unless the visitor asked for reduced motion —
                // dragging still works, it just never drifts on its own.
                if (!reducedMotionRef.current) {
                    offsetRef.current -= AUTO_SPEED * dt
                }
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
