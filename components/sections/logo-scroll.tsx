"use client"

import { useRef, useEffect } from "react"
import Image from "next/image"
import {
    SiApple,
    SiHonda,
} from "react-icons/si"
import { GraduationCap, FlaskConical } from "lucide-react"
import { AnimatedText } from "../animations/animated-text"

/* ──────────────────────────────────────────────────────────────────────
 *  LogoScroll — Three infinite marquee rows of grey company logos.
 *  Each logo is a clickable link. Rows alternate direction (→ ← →).
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
    href: string
    icon: React.ReactNode
    /** Wordmark images already show the name — skip the text label. */
    hideLabel?: boolean
}

/** Brand-colored client logos are muted to match the grey strip; the row's
 *  existing hover (via `group`) restores full color and contrast. */
const CLIENT_LOGO_IMG =
    "w-auto opacity-60 grayscale transition-[filter,opacity] duration-300 group-hover:opacity-95 group-hover:grayscale-0"

const LOGOS: Logo[] = [
    { name: "Apple", href: "https://www.apple.com", icon: <SiApple className="h-10 w-10 sm:h-12 sm:w-12" /> },
    { name: "Walmart", href: "https://www.walmart.com", icon: <WalmartSpark className="h-10 w-10 sm:h-12 sm:w-12" /> },
    { name: "Lawrence Berkeley Lab", href: "https://www.lbl.gov", icon: <FlaskConical className="h-10 w-10 sm:h-12 sm:w-12" /> },
    { name: "Honda Innovations", href: "https://www.hondainnovations.com", icon: <SiHonda className="h-10 w-10 sm:h-12 sm:w-12" /> },
    { name: "UC Berkeley", href: "https://www.berkeley.edu", icon: <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12" /> },
    {
        name: "LUPFR",
        href: "https://lupfr.com",
        icon: (
            <Image
                src="/logos/lupfr-mark.png"
                alt="LUPFR Entertainment logo"
                width={256}
                height={256}
                className={`h-10 sm:h-12 ${CLIENT_LOGO_IMG}`}
            />
        ),
    },
    { name: "Seaside", href: "https://seaside.la", icon: <SeasideMark className={`h-10 sm:h-12 ${CLIENT_LOGO_IMG}`} /> },
    { name: "eria.co", href: "https://www.eria.co/", icon: null },
]

/** Pixels per second for auto-scroll */
const AUTO_SPEED = 40

/** Rotate a copy of the array so each row starts on a different logo. */
function rotate<T>(arr: T[], n: number): T[] {
    const k = ((n % arr.length) + arr.length) % arr.length
    return [...arr.slice(k), ...arr.slice(0, k)]
}

function LogoItem({ logo }: { logo: Logo }) {
    return (
        <a
            href={logo.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-shrink-0 items-center gap-2.5 px-6 sm:px-8 text-muted-foreground/50 transition-colors duration-300 hover:text-muted-foreground/90"
        >
            {logo.icon}
            {!logo.hideLabel && (
                <span className="whitespace-nowrap text-sm font-medium tracking-wide uppercase sm:text-base">
                    {logo.name}
                </span>
            )}
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

            {/* Three rows, alternating direction */}
            <div className="flex flex-col gap-3 sm:gap-4">
                <MarqueeRow logos={rotate(LOGOS, 0)} direction="right" speed={AUTO_SPEED} />
                <MarqueeRow logos={rotate(LOGOS, 3)} direction="left" speed={AUTO_SPEED * 0.85} />
                <MarqueeRow logos={rotate(LOGOS, 5)} direction="right" speed={AUTO_SPEED * 1.1} />
            </div>
        </section>
    )
}
