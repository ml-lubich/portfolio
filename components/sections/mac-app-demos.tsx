"use client"

/**
 * Shows the local-first Mac tools driving the apps they target.
 *
 * The step advances on a timer, but only while the section is on screen —
 * an off-screen interval would keep React re-rendering a window nobody is
 * looking at, and this sits well below the fold.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { Github } from "lucide-react"
import { AnimatedSection } from "@/components/animations"
import { SectionHeader } from "@/components/layout/section-header"
import { MacWindow } from "@/components/demos/mac-window"
import { macDemos } from "@/data/mac-demos"

const STEP_MS = 3800

export function MacAppDemos() {
    const [activeDemo, setActiveDemo] = useState(0)
    const [step, setStep] = useState(0)
    const [inView, setInView] = useState(false)
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
        if (!inView) return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
        const id = setInterval(() => setStep((s) => (s + 1) % demo.steps.length), STEP_MS)
        return () => clearInterval(id)
    }, [inView, demo.steps.length])

    const pickDemo = useCallback((i: number) => {
        setActiveDemo(i)
        setStep(0)
    }, [])

    const current = demo.steps[step]

    return (
        <AnimatedSection id="mac-demos" className="relative py-12 md:py-20">
            <div ref={sectionRef} className="relative mx-auto max-w-5xl px-3 md:px-6">
                <SectionHeader
                    label="Local-First Tooling"
                    title={<>Agents driving <span className="gradient-text">real Mac apps</span></>}
                    subtitle="Not a terminal transcript — the app state each command actually produced."
                />

                {/* App switcher */}
                <div className="mb-5 flex flex-wrap justify-center gap-2">
                    {macDemos.map((d, i) => (
                        <button
                            key={d.id}
                            type="button"
                            onClick={() => pickDemo(i)}
                            aria-pressed={i === activeDemo}
                            className={`rounded-full border px-3.5 py-1.5 text-[12px] transition-colors ${
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
                        <div className="rounded-lg border border-[var(--line-soft)] bg-[var(--surface-1)] px-3 py-2.5">
                            <code className="block break-words font-mono text-[11.5px] leading-relaxed text-foreground/90">
                                <span className="text-[var(--accent-glow)]">$</span> {current.command}
                            </code>
                        </div>

                        <p className="text-[12px] leading-relaxed text-muted-foreground">{current.caption}</p>

                        {/* Step dots double as manual controls. */}
                        <div className="flex items-center gap-1.5">
                            {demo.steps.map((s, i) => (
                                <button
                                    key={s.command}
                                    type="button"
                                    onClick={() => setStep(i)}
                                    aria-label={`Step ${i + 1}: ${s.command}`}
                                    aria-current={i === step}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        i === step ? "w-6 bg-foreground/70" : "w-1.5 bg-foreground/25 hover:bg-foreground/40"
                                    }`}
                                />
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
