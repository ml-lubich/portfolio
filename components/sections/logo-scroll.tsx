"use client"

import { useRef, useEffect } from "react"
import Image from "next/image"
import { SiApple, SiHonda, SiWalmart, SiGithub } from "react-icons/si"
import { AnimatedText } from "../animations/animated-text"

/* ──────────────────────────────────────────────────────────────────────
 *  LogoScroll — Three infinite marquee rows of grey company logos.
 *  Each logo is a clickable link. Rows alternate direction (→ ← →).
 *  Placed directly below the Hero section.
 * ────────────────────────────────────────────────────────────────────── */

interface Logo {
    name: string
    href: string
    /** Official brand mark; null renders a clean text wordmark instead. */
    icon: React.ReactNode
}

const MARK = "h-8 w-8 sm:h-9 sm:w-9"

/** Brand-colored client logos are muted to match the grey strip; the row's
 *  existing hover (via `group`) restores full color and contrast. */
const CLIENT_LOGO_IMG =
    "w-auto opacity-70 grayscale transition-[filter,opacity] duration-300 group-hover:opacity-100 group-hover:grayscale-0"

/**
 * Official marks (Simple Icons) where they exist; clean grey wordmarks for
 * institutions/clients that have no monochrome brand mark. Order matters —
 * rows are dealt round-robin, so adjacent entries land on different rows.
 */
const LOGOS: Logo[] = [
    { name: "Apple", href: "https://www.apple.com", icon: <SiApple className={MARK} /> },
    { name: "GitHub", href: "https://github.com", icon: <SiGithub className={MARK} /> },
    { name: "Walmart", href: "https://www.walmart.com", icon: <SiWalmart className={MARK} /> },
    { name: "UC Berkeley", href: "https://www.berkeley.edu", icon: null },
    { name: "Honda Innovations", href: "https://www.hondainnovations.com", icon: <SiHonda className={MARK} /> },
    { name: "Lawrence Berkeley Lab", href: "https://www.lbl.gov", icon: null },
    {
        name: "LUPFR",
        href: "https://lupfr.com",
        icon: (
            <Image
                src="/logos/lupfr-mark.png"
                alt="LUPFR Entertainment logo"
                width={256}
                height={256}
                className={`h-8 sm:h-9 ${CLIENT_LOGO_IMG}`}
            />
        ),
    },
    { name: "EnrichData", href: "https://www.enrichdata.net/", icon: null },
    { name: "W3 Sourcing", href: "https://www.w3sourcing.com/", icon: null },
    { name: "eria.co", href: "https://www.eria.co/", icon: null },
    { name: "Seaside", href: "https://seaside.la", icon: null },
]

/** Pixels per second for auto-scroll */
const AUTO_SPEED = 40

function LogoItem({ logo }: { logo: Logo }) {
    return (
        <a
            href={logo.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-shrink-0 items-center gap-2.5 px-6 text-muted-foreground/55 transition-colors duration-300 hover:text-muted-foreground sm:px-9"
        >
            {logo.icon}
            <span className="whitespace-nowrap text-sm font-medium uppercase tracking-[0.12em] sm:text-base">
                {logo.name}
            </span>
        </a>
    )
}

/** One auto-scrolling row. Renders the logo set twice and wraps at the
 *  half-width so the loop is seamless in either direction. */
function MarqueeRow({ logos, direction, speed }: { logos: Logo[]; direction: "left" | "right"; speed: number }) {
    const trackRef = useRef<HTMLDivElement>(null)
    const offsetRef = useRef(direction === "right" ? -1 : 0) // negative so a rightward row has room to move
    const rafRef = useRef(0)
    const lastRef = useRef(0)
    // Pause sources: offscreen (IntersectionObserver) OR the pointer hovering the
    // row. Hover-pause is what makes the logos clickable: a moving target slides
    // out from under the pointer between press and release, so the click never
    // lands (it reads like the marquee "ignored" you and kept scrolling).
    // Freezing the row while pointed at holds the link still long enough to click.
    const hiddenRef = useRef(false)
    const hoverRef = useRef(false)
    const kickRef = useRef<() => void>(() => {})

    // Repeat the set so even a short list fills ultrawide viewports.
    const set = [...logos, ...logos, ...logos]

    useEffect(() => {
        const dir = direction === "left" ? -1 : 1

        const animate = (t: number) => {
            if (hiddenRef.current || hoverRef.current) {
                rafRef.current = 0
                return
            }
            if (lastRef.current === 0) lastRef.current = t
            const dt = (t - lastRef.current) / 1000
            lastRef.current = t

            const el = trackRef.current
            const half = el ? el.scrollWidth / 2 : 0
            if (half > 1) {
                offsetRef.current += dir * speed * dt
                while (offsetRef.current <= -half) offsetRef.current += half
                while (offsetRef.current > 0) offsetRef.current -= half
                if (el) el.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
            }
            rafRef.current = requestAnimationFrame(animate)
        }

        // Start the loop unless something wants it paused (offscreen or hovered).
        const kick = () => {
            if (!rafRef.current && !hiddenRef.current && !hoverRef.current) {
                lastRef.current = 0
                rafRef.current = requestAnimationFrame(animate)
            }
        }
        kickRef.current = kick

        const root = trackRef.current
        if (!root || typeof IntersectionObserver === "undefined") {
            kick()
            return () => {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = 0
            }
        }

        const io = new IntersectionObserver(
            ([e]) => {
                hiddenRef.current = !e.isIntersecting
                if (e.isIntersecting) {
                    kick()
                } else {
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
    }, [direction, speed])

    // Pause this row while the pointer is over it so its links hold still and are
    // clickable; resume on leave. Works for touch too: a tap fires enter→leave,
    // freezing the row for the duration of the press.
    const pause = () => {
        hoverRef.current = true
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
    }
    const resume = () => {
        hoverRef.current = false
        kickRef.current()
    }

    return (
        <div
            className="overflow-hidden"
            onPointerEnter={pause}
            onPointerLeave={resume}
            onPointerCancel={resume}
        >
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
    return (
        <section
            id="partners"
            className="relative w-full overflow-hidden border-b border-border/40 bg-background/40 py-4 md:py-7 lg:py-9 md:backdrop-blur-sm"
            aria-label="Companies and institutions"
        >
            {/* Heading */}
            <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50 sm:mb-6 sm:text-sm">
                <AnimatedText text="Trusted & partnered with:" variant="blur-slide" stagger={40} duration={600} />
            </p>

            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background/60 to-transparent sm:w-32" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background/60 to-transparent sm:w-32" />

            {/* Three rows, alternating direction. Brands are dealt round-robin so
                no logo appears in more than one row (no vertical repetition). */}
            <div className="flex flex-col gap-3 sm:gap-4">
                <MarqueeRow logos={LOGOS.filter((_, i) => i % 3 === 0)} direction="right" speed={AUTO_SPEED} />
                <MarqueeRow logos={LOGOS.filter((_, i) => i % 3 === 1)} direction="left" speed={AUTO_SPEED * 0.85} />
                <MarqueeRow logos={LOGOS.filter((_, i) => i % 3 === 2)} direction="right" speed={AUTO_SPEED * 1.1} />
            </div>
        </section>
    )
}
