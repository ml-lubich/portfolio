"use client"

import { useEffect, useRef, useState } from "react"
import { useInView, useReducedMotion } from "framer-motion"
import { DEFAULT_CYCLE, linesCycleFrame, type CycleTimings, type LinesFrame } from "@/lib/install-cycle"
import { TerminalWindow } from "./terminal-reveal"

/**
 * A terminal that never finishes: types one multi-line block, holds it,
 * erases it, types the next from `scripts` — forever. The schedule is the
 * pure `linesCycleFrame`; this file is the rAF loop and its gates (paused
 * off-screen, static first block under reduced motion).
 */
export function TerminalLoop({
    scripts,
    title,
    prompt = "$",
    timings = DEFAULT_CYCLE,
    className = "",
}: {
    scripts: string[][]
    title: string
    prompt?: string
    timings?: CycleTimings
    className?: string
}) {
    const ref = useRef<HTMLDivElement>(null)
    const seen = useInView(ref, { once: true, margin: "-80px" })
    const onScreen = useInView(ref)
    const reduce = useReducedMotion() ?? false
    const elapsedRef = useRef(0)
    const [frame, setFrame] = useState<LinesFrame>({ index: 0, lines: [""], erasing: false })

    useEffect(() => {
        if (reduce || !onScreen || scripts.length === 0) return
        let raf = 0
        let last = performance.now()
        // Resume where it paused, not from the top — elapsed only grows while visible.
        let elapsed = elapsedRef.current
        const tick = (now: number) => {
            elapsed += now - last
            last = now
            elapsedRef.current = elapsed
            const next = linesCycleFrame(scripts, elapsed, timings)
            setFrame((prev) =>
                prev.index === next.index &&
                prev.erasing === next.erasing &&
                prev.lines.join("\n") === next.lines.join("\n")
                    ? prev
                    : next,
            )
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [reduce, onScreen, scripts, timings])

    const lines = reduce ? scripts[0] ?? [] : frame.lines
    const lastLine = lines.length - 1

    return (
        <TerminalWindow ref={ref} visible={seen} title={title} className={className}>
            {/* Every block stacked invisibly in one grid cell sizes the body to the
                tallest bio, so the card (and the page under it) never jumps as
                lines appear and disappear. */}
            <div className="grid flex-1 px-5 py-4 font-mono text-sm leading-relaxed">
                {scripts.map((script, i) => (
                    <div key={i} className="invisible col-start-1 row-start-1" aria-hidden>
                        {script.map((line, j) => (
                            <div key={j} className="flex gap-2">
                                <span className="shrink-0">{prompt}</span>
                                <span>{line}</span>
                            </div>
                        ))}
                    </div>
                ))}

                {/* Screen readers get the first bio once, not a churning one. */}
                <p className="sr-only">{(scripts[0] ?? []).join(" ")}</p>

                <div className="col-start-1 row-start-1" aria-hidden>
                    {lines.map((line, i) => (
                        <div key={i} className="flex gap-2">
                            <span className="shrink-0 select-none text-emerald-400/80">{prompt}</span>
                            <span className="text-foreground/90">
                                {line}
                                {i === lastLine && (
                                    // Zero-width in the line box so a near-full line never wraps
                                    // just because the cursor landed on it (see TerminalReveal).
                                    <span className="relative inline-block w-0 align-middle">
                                        <span
                                            className={`absolute left-px top-1/2 h-[1.1em] w-[7px] -translate-y-1/2 bg-emerald-400 ${
                                                frame.erasing || reduce ? "" : "animate-terminal-blink"
                                            }`}
                                        />
                                    </span>
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </TerminalWindow>
    )
}
