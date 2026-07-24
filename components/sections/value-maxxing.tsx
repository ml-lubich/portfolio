"use client"

import { ArrowUpRight, Ship, Wrench, Users2 } from "lucide-react"
import { AnimatedSection } from "../animations/animated-section"

/**
 * ─── Value-maxxing ─────────────────────────────────────────────────────
 * A short manifesto block, not a tokenmaxxing pitch: fewer, sharper tools
 * shipped and open-sourced beats padding a resume with unused frameworks.
 * Links out to the OSS agent-family repos built from real day-to-day work.
 */

const principles = [
    {
        icon: Ship,
        title: "Ship, don't stockpile",
        text: "Every tool below exists because a real workflow needed it \u2014 not as a portfolio filler.",
    },
    {
        icon: Wrench,
        title: "CLI-first, MCP second",
        text: "A fast local command saves agent tokens vs. a round-trip through a tool server. MCP is layered on where it earns its keep.",
    },
    {
        icon: Users2,
        title: "Open, honest, small",
        text: "MIT-licensed, TDD where it matters, and no rounded-up metrics \u2014 see the comparison above.",
    },
]

const ossLinks = [
    { label: "imsg-mcp", href: "https://github.com/ml-lubich/imsg" },
    { label: "imail-mcp", href: "https://github.com/ml-lubich/imail" },
    { label: "inotes-mcp", href: "https://github.com/ml-lubich/inotes" },
    { label: "wa-mcp", href: "https://github.com/ml-lubich/whatsapp-mcp" },
    { label: "bitbucket-cli", href: "https://github.com/ml-lubich/bitbucket-cli" },
    { label: "twig", href: "https://github.com/ml-lubich/twig" },
    { label: "confluence-cli", href: "https://github.com/ml-lubich/confluence-cli" },
    { label: "like-fable", href: "https://github.com/ml-lubich/like-fable" },
]

export function ValueMaxxing() {
    return (
        <AnimatedSection
            id="value-maxxing"
            className="relative scroll-mt-28 border-y border-white/[0.06] px-3 py-14 md:px-6 md:py-20 lg:py-24"
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_0%,rgba(255,255,255,0.04),transparent_75%)]" aria-hidden />

            <div className="relative mx-auto max-w-4xl text-center">
                <span className="inline-block font-mono text-xs uppercase tracking-widest text-primary">
                    Not tokenmaxxing
                </span>
                <h2 className="section-title mt-2 font-display text-3xl font-light text-foreground sm:text-4xl md:mt-4">
                    Value-maxxing<span className="text-foreground/50">,</span> not <span className="gradient-text">tokenmaxxing</span>
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    The measure isn&apos;t how many tokens an agent burns or how many frameworks show up on a resume \u2014
                    it&apos;s whether the thing shipped, works, and is small enough to trust. Every CLI/MCP below started as a
                    one-evening fix for friction in real work and got open-sourced once it earned its keep.
                </p>

                <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
                    {principles.map((p) => (
                        <div
                            key={p.title}
                            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm"
                        >
                            <p.icon className="h-4 w-4 text-primary/70" aria-hidden />
                            <h3 className="mt-3 text-sm font-semibold text-foreground">{p.title}</h3>
                            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground/80">{p.text}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
                    {ossLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 font-mono text-xs text-muted-foreground transition-all duration-200 hover:border-primary/60 hover:text-foreground hover:shadow-[0_0_20px_-6px_hsl(var(--primary)/0.5)]"
                        >
                            {link.label}
                            <ArrowUpRight className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100" aria-hidden />
                        </a>
                    ))}
                </div>
            </div>
        </AnimatedSection>
    )
}
