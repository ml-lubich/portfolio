"use client"

/**
 * Shows the open-source agent tooling driving the surfaces it targets —
 * Mac apps, a Bitbucket workspace, a Jenkins controller.
 *
 * The step advances on a timer, but only while the section is on screen —
 * an off-screen interval would keep React re-rendering a window nobody is
 * looking at, and this sits well below the fold.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Copy, Github } from "lucide-react"
import { AnimatedSection } from "@/components/animations"
import { SectionHeader } from "@/components/layout/section-header"
import { MacWindow } from "@/components/demos/mac-window"
import { useTypewriter } from "@/components/demos/typewriter"
import { macDemos } from "@/data/mac-demos"

const STEP_MS = 3800

export function MacAppDemos() {
    const [activeDemo, setActiveDemo] = useState(0)
    const [step, setStep] = useState(0)
    const [copiedCommand, setCopiedCommand] = useState(false)
    const [inView, setInView] = useState(false)
    // Assume reduced until the client says otherwise, so SSR never claims to
    // be mid-animation.
    const [still, setStill] = useState(true)
    const sectionRef = useRef<HTMLDivElement>(null)

    const demo = macDemos[activeDemo]

    useEffect(() => {
        const el = sectionRef.current
        if (!el) return
        const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 })
        io.observe(el)
        return () => io.disconnect()
    }, [])

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const sync = () => setStill(mq.matches)
        sync()
        mq.addEventListener("change", sync)
        return () => mq.removeEventListener("change", sync)
    }, [])

    useEffect(() => {
        if (!inView) return
        if (still) return
        const id = setInterval(() => setStep((s) => (s + 1) % demo.steps.length), STEP_MS)
        return () => clearInterval(id)
    }, [inView, still, demo.steps.length])

    const pickDemo = useCallback((i: number) => {
        setActiveDemo(i)
        setStep(0)
    }, [])

    const current = demo.steps[step]
    const typed = useTypewriter(current.command)
    const playing = inView && !still
    const copyCommand = useCallback(() => {
        navigator.clipboard.writeText(current.command).then(() => {
            setCopiedCommand(true)
            window.setTimeout(() => setCopiedCommand(false), 1600)
        })
    }, [current.command])

    return (
        <AnimatedSection id="mac-demos" className="relative section-y">
            <div ref={sectionRef} className="relative mx-auto max-w-5xl px-3 md:px-6">
                <SectionHeader
                    label="Open Source"
                    title={
                        <>
                            Building{" "}
                            <span className="gradient-text underline decoration-[var(--accent-glow)] decoration-2 underline-offset-[0.18em]">
                                open-source agents
                            </span>{" "}
                            that drive real work
                        </>
                    }
                    subtitle="Not a terminal transcript — the app, repo and pipeline state each command actually produced."
                />

                {/* App switcher */}
                <div className="mac-demo-switcher mb-5 flex flex-wrap justify-center gap-2">
                    {macDemos.map((d, i) => (
                        <button
                            key={d.id}
                            type="button"
                            onClick={() => pickDemo(i)}
                            aria-pressed={i === activeDemo}
                            className={`mac-demo-switcher-button rounded-full border px-3.5 py-1.5 text-[12px] transition-colors ${
                                i === activeDemo
                                    ? "border-[var(--line-strong)] bg-foreground/[0.08] text-foreground"
                                    : "border-[var(--line-soft)] text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {d.app}
                            <span className="ml-1.5 font-mono text-[10.5px] text-muted-foreground">{d.tool}</span>
                        </button>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-[1.35fr_1fr] md:items-start">
                    <MacWindow demo={demo} step={current} />

                    <div className="flex flex-col gap-3">
                        <p className="text-[13px] leading-relaxed text-muted-foreground">{demo.tagline}</p>

                        {/* The command that produced the window state on the left. */}
                        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-[var(--line-soft)] bg-[var(--surface-1)] px-3 py-2.5">
                            <code className="block min-h-[1.4em] min-w-0 flex-1 break-words font-mono text-[11.5px] leading-relaxed text-foreground/90">
                                <span className="text-[var(--accent-glow)]">$</span>{" "}
                                {/* The typed text is decoration mid-animation; assistive
                                    tech reads the whole command instead. */}
                                <span className="sr-only">{current.command}</span>
                                <span aria-hidden>{typed.shown}</span>
                                {!typed.done && (
                                    <span aria-hidden className="mac-caret">
                                        ▌
                                    </span>
                                )}
                            </code>
                            <button
                                type="button"
                                onClick={copyCommand}
                                aria-label={`Copy command: ${current.command}`}
                                className="mac-demo-copy inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md border border-[var(--line-soft)] bg-white/[0.04] px-2.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60"
                            >
                                {copiedCommand ? <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                                {copiedCommand ? "Copied" : "Copy"}
                            </button>
                        </div>

                        <p className="text-[12px] leading-relaxed text-muted-foreground">{current.caption}</p>

                        {/* Step dots double as manual controls; the active one fills
                            over exactly one step so the wait is legible. */}
                        <div data-playing={playing} className="flex items-center gap-1.5">
                            {demo.steps.map((s, i) => (
                                <button
                                    key={s.command}
                                    type="button"
                                    onClick={() => setStep(i)}
                                    aria-label={`Step ${i + 1}: ${s.command}`}
                                    aria-current={i === step}
                                    className="mac-demo-step-button flex h-8 w-8 items-center justify-center rounded-full"
                                >
                                    {i === step ? (
                                        <span
                                            key={`${demo.id}-${step}`}
                                            style={{ animationDuration: `${STEP_MS}ms` }}
                                            className="mac-progress block h-1.5 w-6 overflow-hidden rounded-full bg-foreground/25"
                                        />
                                    ) : <span className="h-1.5 w-1.5 rounded-full bg-foreground/25 transition-colors hover:bg-foreground/40" />}
                                </button>
                            ))}
                        </div>

                        <a
                            href={demo.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-fit items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <Github className="h-3.5 w-3.5" />
                            {demo.repoUrl.replace("https://github.com/", "")}
                        </a>
                    </div>
                </div>
            </div>
        </AnimatedSection>
    )
}
