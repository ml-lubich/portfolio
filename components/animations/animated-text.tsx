"use client"

import {
    useEffect,
    useRef,
    useState,
    type ReactNode,
    type CSSProperties,
    Children,
    isValidElement,
    cloneElement,
    type ReactElement,
} from "react"
import { cn } from "@/lib/utils"

/* ─────────────────────────────────────────────────────────────────
 *  AnimatedText — Anthropic-style text reveal animation.
 *
 *  Splits text into words and reveals each with a staggered
 *  blur → sharp + opacity + translateY animation, triggered
 *  on viewport entry via IntersectionObserver.
 *
 *  Supports both plain strings and JSX children.
 * ────────────────────────────────────────────────────────────────── */

type AnimationVariant =
    | "fade-up"       // Classic fade + rise from below
    | "blur-slide"    // Blur-to-sharp with horizontal slide (Anthropic-style)
    | "letter-rise"   // Per-character rise with stagger
    | "gradient-fill" // Words fade in, gradient sweeps across

interface AnimatedTextProps {
    /** Plain text to animate (will be split into words) */
    text?: string
    /** JSX children — each top-level child animates as a unit */
    children?: ReactNode
    /** HTML tag to render. Default: "span" */
    as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "div"
    /** Animation variant */
    variant?: AnimationVariant
    /** Delay before animation starts (ms) */
    delay?: number
    /** Duration per word (ms) */
    duration?: number
    /** Stagger between words (ms) */
    stagger?: number
    /** Additional CSS classes */
    className?: string
    /** IntersectionObserver threshold. Default: 0.15 */
    threshold?: number
    /** If true, replays every time element enters viewport */
    replay?: boolean
}

export function AnimatedText({
    text,
    children,
    as: Tag = "span",
    variant = "blur-slide",
    delay = 0,
    duration = 700,
    stagger = 50,
    className,
    threshold = 0.15,
    replay = false,
}: AnimatedTextProps) {
    const containerRef = useRef<HTMLElement>(null)
    const [isVisible, setIsVisible] = useState(false)
    const hasAnimated = useRef(false)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (!hasAnimated.current || replay) {
                        setIsVisible(true)
                        hasAnimated.current = true
                    }
                    if (!replay) observer.unobserve(el)
                } else if (replay) {
                    setIsVisible(false)
                }
            },
            { threshold }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [threshold, replay])

    // Build tokens from text or from children
    const tokens = buildTokens(text, children)

    return (
        <Tag
            ref={containerRef as React.RefObject<never>}
            className={cn("animated-text-root", className)}
            style={{ "--at-duration": `${duration}ms` } as CSSProperties}
        >
            {(() => {
                let wordIdx = 0
                return tokens.map((token, i) => {
                    // Space tokens render directly — no animation wrapper needed
                    if (
                        isValidElement(token) &&
                        (token as ReactElement<{ className?: string }>).props?.className?.includes("animated-text-space")
                    ) {
                        return token
                    }

                    const idx = wordIdx++
                    const wordDelay = delay + idx * stagger
                    return (
                        <span
                            key={i}
                            className={cn("animated-text-word", `at-${variant}`)}
                            data-visible={isVisible ? "true" : "false"}
                            style={
                                {
                                    "--at-delay": `${wordDelay}ms`,
                                    "--at-index": idx,
                                } as CSSProperties
                            }
                        >
                            {token}
                        </span>
                    )
                })
            })()}
        </Tag>
    )
}

/* ── Splits text/children into animatable tokens ─────────────────── */
function buildTokens(text?: string, children?: ReactNode): ReactNode[] {
    // If plain text provided, split by words (keep spaces)
    if (text) {
        return text.split(/(\s+)/).filter(Boolean).map((word, i) => {
            if (/^\s+$/.test(word)) return <span key={`sp-${i}`} className="animated-text-space">{"\u00A0"}</span>
            return word
        })
    }

    // For JSX children, each top-level element is a token.
    // Text nodes get split by word.
    if (children) {
        const result: ReactNode[] = []
        Children.forEach(children, (child) => {
            if (typeof child === "string") {
                const words = child.split(/(\s+)/).filter(Boolean)
                words.forEach((word, i) => {
                    if (/^\s+$/.test(word)) {
                        result.push(<span key={`sp-${result.length}`} className="animated-text-space">{"\u00A0"}</span>)
                    } else {
                        result.push(word)
                    }
                })
            } else if (typeof child === "number") {
                result.push(String(child))
            } else if (isValidElement(child)) {
                // For JSX elements (like <span className="gradient-text">), extract text inside
                // and treat the whole element as one token
                result.push(child)
            }
        })
        return result
    }

    return []
}

/* ─────────────────────────────────────────────────────────────────
 *  AnimatedLetters — Per-character animation for headings.
 *
 *  Each letter animates independently with stagger for a
 *  dramatic kinetic typography effect.
 * ────────────────────────────────────────────────────────────────── */

interface AnimatedLettersProps {
    text: string
    as?: "span" | "h1" | "h2" | "h3" | "h4" | "div"
    className?: string
    delay?: number
    stagger?: number
    duration?: number
    threshold?: number
}

export function AnimatedLetters({
    text,
    as: Tag = "span",
    className,
    delay = 0,
    stagger = 25,
    duration = 600,
    threshold = 0.15,
}: AnimatedLettersProps) {
    const containerRef = useRef<HTMLElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.unobserve(el)
                }
            },
            { threshold }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [threshold])

    const chars = text.split("")

    return (
        <Tag
            ref={containerRef as React.RefObject<never>}
            className={cn("animated-letters-root", className)}
            aria-label={text}
        >
            {chars.map((char, i) => (
                <span
                    key={`${char}-${i}`}
                    className="animated-letter"
                    aria-hidden="true"
                    data-visible={isVisible ? "true" : "false"}
                    style={
                        {
                            "--al-delay": `${delay + i * stagger}ms`,
                            "--al-duration": `${duration}ms`,
                            display: char === " " ? "inline-block" : undefined,
                            width: char === " " ? "0.3em" : undefined,
                        } as CSSProperties
                    }
                >
                    {char}
                </span>
            ))}
        </Tag>
    )
}
