"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion, useInView } from "framer-motion"

interface TerminalRevealProps {
    /** Lines to type out. Each item is one line in the terminal. */
    lines: (string | ReactNode)[]
    /** Optional title shown in the terminal title bar */
    title?: string
    /** Delay before typing starts after scroll-in (ms) */
    startDelay?: number
    /** Speed per character (ms) — lower = faster */
    charSpeed?: number
    /** Pause between lines (ms) */
    linePause?: number
    /** Extra className on the outer wrapper */
    className?: string
    /** Optional prompt symbol */
    prompt?: string
}

/**
 * A translucent, glassy terminal window that types out text line-by-line
 * with a blinking green cursor when the element scrolls into view.
 *
 * Inspired by Gemini CLI / Vercel terminal aesthetics — 3D-like glass
 * panel with a subtle border glow, matching the modern portfolio feel.
 */
export function TerminalReveal({
    lines,
    title = "terminal",
    startDelay = 450,
    charSpeed = 38,
    linePause = 550,
    className = "",
    prompt = "$",
}: TerminalRevealProps) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, margin: "-80px" })

    // State: which characters have been revealed
    const [revealedLines, setRevealedLines] = useState<number>(0) // how many lines are fully typed
    const [currentLineChars, setCurrentLineChars] = useState<number>(0) // chars shown in current line
    const [started, setStarted] = useState(false)
    const [done, setDone] = useState(false)

    // Flatten ReactNode lines to plain text for character counting
    const plainLines = lines.map((l) => (typeof l === "string" ? l : ""))

    // Start typing after delay once in view
    useEffect(() => {
        if (!isInView) return
        const t = setTimeout(() => setStarted(true), startDelay)
        return () => clearTimeout(t)
    }, [isInView, startDelay])

    // Typing engine
    useEffect(() => {
        if (!started || done) return

        const lineIdx = revealedLines
        if (lineIdx >= lines.length) {
            setDone(true)
            return
        }

        const lineText = plainLines[lineIdx]
        if (currentLineChars < lineText.length) {
            const t = setTimeout(
                () => setCurrentLineChars((c) => c + 1),
                charSpeed + Math.random() * 15 // slight jitter for realism
            )
            return () => clearTimeout(t)
        }
        // Line complete — pause, then move to next
        const t = setTimeout(() => {
            setRevealedLines((r) => r + 1)
            setCurrentLineChars(0)
        }, linePause)
        return () => clearTimeout(t)
    }, [started, done, revealedLines, currentLineChars, lines.length, plainLines, charSpeed, linePause])

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30, rotateX: 4 }}
            animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className={`perspective-[1200px] ${className}`}
        >
            <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d1117]/80 shadow-2xl shadow-black/40 backdrop-blur-xl">
                {/* Subtle top-edge glow */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                {/* Title bar */}
                <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
                    {/* Traffic lights */}
                    <span className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/90" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/90" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/90" />
                    </span>
                    <span className="ml-2 font-mono text-[11px] text-muted-foreground/60 select-none">
                        {title}
                    </span>
                </div>

                {/* Terminal body */}
                <div className="px-5 py-4 font-mono text-sm leading-relaxed min-h-[80px]">
                    {lines.map((line, i) => {
                        const isTypingThis = i === revealedLines && started
                        const isRevealed = i < revealedLines
                        const isHidden = i > revealedLines

                        if (isHidden && !done) return null

                        const lineText = typeof line === "string" ? line : plainLines[i]

                        return (
                            <div key={i} className="flex gap-2">
                                {/* Prompt */}
                                <span className="shrink-0 select-none text-emerald-400/80">
                                    {prompt}
                                </span>
                                {/* Text */}
                                <span className="text-foreground/90">
                                    {isRevealed || done ? (
                                        // Fully revealed — render rich content if ReactNode
                                        typeof line === "string" ? line : line
                                    ) : isTypingThis ? (
                                        <>
                                            {lineText.slice(0, currentLineChars)}
                                            {/* Blinking cursor */}
                                            <span className="inline-block w-[7px] h-[1.1em] align-middle ml-px bg-emerald-400 animate-terminal-blink" />
                                        </>
                                    ) : null}
                                </span>
                            </div>
                        )
                    })}
                    {/* Cursor on empty new line when done */}
                    {done && (
                        <div className="flex gap-2 mt-0.5">
                            <span className="shrink-0 select-none text-emerald-400/80">{prompt}</span>
                            <span className="inline-block w-[7px] h-[1.1em] align-middle bg-emerald-400 animate-terminal-blink" />
                        </div>
                    )}
                </div>

                {/* Subtle inner glow on bottom-right */}
                <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />
            </div>
        </motion.div>
    )
}
