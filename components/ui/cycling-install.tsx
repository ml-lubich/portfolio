"use client"

/**
 * CyclingInstall — one prompt that types its way through every public
 * `ml-lubich` tool, forever.
 *
 * The grid cards each carry their own static install line; this is the marquee
 * above them, so the panel opens on the whole set instead of parking on
 * whichever tool happens to sit first. Copy grabs whatever is on the line, and
 * hovering freezes the loop so the command you reached for is still there when
 * the pointer lands.
 *
 * Timing lives in lib/install-cycle.ts as a pure function of elapsed ms — this
 * file is the rAF loop, the gates (off-screen, reduced motion, hover) and the
 * markup.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"
import { DEFAULT_CYCLE, installCycleFrame, splitBrand, type CycleFrame } from "@/lib/install-cycle"

export interface CyclingInstallItem {
    id: string
    /** Short label shown under the line, e.g. "imsg". */
    displayName: string
    description?: string
    install: string
}

interface CyclingInstallProps {
    items: CyclingInstallItem[]
    /** Accent per item index — the handle and caption paint with it. */
    accentOf?: (index: number) => string
    className?: string
}

const BRAND = "ml-lubich"

export function CyclingInstall({ items, accentOf, className = "" }: CyclingInstallProps) {
    const commands = items.map((i) => i.install)
    const wrapRef = useRef<HTMLDivElement>(null)
    const [frame, setFrame] = useState<CycleFrame>({ index: 0, shown: commands[0] ?? "", erasing: false })
    const [copied, setCopied] = useState(false)
    const [paused, setPaused] = useState(false)
    const onScreen = useRef(false)
    const elapsed = useRef(0)

    const reducedMotion = useRef(
        typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    ).current

    /* Off-screen the loop would burn a frame budget re-typing a line nobody can
       see; the same gate the demo terminals already use. */
    useEffect(() => {
        const el = wrapRef.current
        if (!el || typeof IntersectionObserver === "undefined") {
            onScreen.current = true
            return
        }
        const io = new IntersectionObserver(([e]) => { onScreen.current = e.isIntersecting }, { threshold: 0.2 })
        io.observe(el)
        return () => io.disconnect()
    }, [])

    useEffect(() => {
        if (reducedMotion || commands.length === 0) return
        let raf = 0
        let last = performance.now()
        const tick = (now: number) => {
            const delta = now - last
            last = now
            if (onScreen.current && !paused) {
                elapsed.current += delta
                const next = installCycleFrame(commands, elapsed.current, DEFAULT_CYCLE)
                // A character lands every ~48ms; re-rendering on all 60 frames in
                // between would be 50 wasted renders per character.
                setFrame((prev) =>
                    prev.shown === next.shown && prev.index === next.index && prev.erasing === next.erasing
                        ? prev
                        : next,
                )
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- `commands` is rebuilt each render from a stable prop
    }, [reducedMotion, paused, items])

    const active = items[frame.index] ?? items[0]
    const command = active?.install ?? ""
    const accent = accentOf?.(frame.index)

    const copy = useCallback(() => {
        if (!command) return
        navigator.clipboard.writeText(command).then(() => {
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1600)
        })
    }, [command])

    if (items.length === 0) return null

    // Reduced motion gets the whole line, no typing, no cursor.
    const shown = reducedMotion ? command : frame.shown

    return (
        <div
            ref={wrapRef}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className={`oss-cycling-install overflow-hidden rounded-xl border border-primary/25 bg-black/55 shadow-[0_0_32px_-16px_hsl(var(--primary)/0.6)] ${className}`}
        >
            <div className="flex items-center gap-2 border-b border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-[#ff5f57]" aria-hidden />
                <span className="h-2 w-2 rounded-full bg-[#febc2e]" aria-hidden />
                <span className="h-2 w-2 rounded-full bg-[#28c840]" aria-hidden />
                <span className="ml-1.5 truncate font-mono text-[10px] tracking-wide text-muted-foreground/70">
                    <span className="text-primary">{BRAND}</span>/tap
                </span>
                <span className="ml-auto shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground/55">
                    {items.length} tools
                </span>
            </div>

            <div className="flex items-stretch">
                <p
                    className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden px-3 py-2.5 font-mono text-[12px] leading-5 sm:text-[13px]"
                    aria-hidden
                >
                    <span className="shrink-0 text-primary/90">$</span>
                    <span className="min-w-0 truncate text-foreground/90">
                        {splitBrand(shown, BRAND).map((part, i) =>
                            part.brand ? (
                                <span
                                    key={i}
                                    className="font-semibold"
                                    style={accent ? { color: accent } : undefined}
                                >
                                    {part.text}
                                </span>
                            ) : (
                                <span key={i}>{part.text}</span>
                            ),
                        )}
                        {!reducedMotion && (
                            <span
                                className={`ml-px inline-block text-primary ${
                                    frame.erasing ? "" : "animate-[terminal-blink_1s_step-end_infinite]"
                                }`}
                            >
                                ▊
                            </span>
                        )}
                    </span>
                </p>

                <button
                    type="button"
                    onClick={copy}
                    aria-label={`Copy install command: ${command}`}
                    className="inline-flex shrink-0 items-center gap-1.5 border-l border-white/[0.08] px-3 font-mono text-[10px] uppercase tracking-wider text-foreground/70 transition-colors hover:bg-white/[0.06] hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60"
                >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>

            <div className="flex items-center gap-2 border-t border-white/[0.06] px-3 py-1.5">
                <span
                    className="shrink-0 font-mono text-[10px] font-bold tracking-wide"
                    style={accent ? { color: accent } : undefined}
                >
                    {active?.displayName}
                </span>
                {active?.description && (
                    <span className="truncate font-mono text-[10px] text-muted-foreground/60">
                        {active.description}
                    </span>
                )}
                {/* Position in the roll-call, so the line reads as a set rather than a random ticker. */}
                <span className="ml-auto flex shrink-0 gap-1" aria-hidden>
                    {items.map((item, i) => (
                        <span
                            key={item.id}
                            className="h-1 w-1 rounded-full transition-colors duration-300"
                            style={{
                                background: i === frame.index ? (accent ?? "hsl(var(--primary))") : "rgba(255,255,255,0.18)",
                            }}
                        />
                    ))}
                </span>
            </div>

            {/* The animated line churns; screen readers get the static set instead. */}
            <ul className="sr-only">
                {items.map((item) => (
                    <li key={item.id}>{item.install}</li>
                ))}
            </ul>
        </div>
    )
}
