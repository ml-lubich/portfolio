"use client"

import { useCallback, useMemo } from "react"
import {
    Briefcase,
    Sparkles,
    BookOpen,
    ExternalLink,
    ArrowUpRight,
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { getSkillIcon } from "@/components/sections/skill-icons"
import { getSkillUsage, type SkillUsageItem } from "@/data/skill-connections"
import { getSkillCategory } from "@/data/skills"

/* ── Props ─────────────────────────────────────────────────────────── */

interface SkillDetailModalProps {
    skill: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

/* ── Section anchor mapping ───────────────────────────────────────── */

function scrollToSection(kind: string, id?: string) {
    const sectionId = kind === "experience" ? "journey" : kind === "project" ? "projects" : "publications"
    const el = document.getElementById(sectionId)
    if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
}

/* ── Usage Card ───────────────────────────────────────────────────── */

function UsageCard({ item, onNavigate }: { item: SkillUsageItem; onNavigate: () => void }) {
    if (item.kind === "experience") {
        return (
            <button
                onClick={onNavigate}
                className="group relative w-full overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-primary/5"
            >
                {/* Gradient accent strip */}
                <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${item.gradient} opacity-60 transition-opacity group-hover:opacity-100`} />

                <div className="pl-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Briefcase className="h-3.5 w-3.5 text-primary/70" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">Experience</span>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.company}
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground/70">{item.title}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/50">{item.period}</p>

                    <div className="mt-2 flex items-center gap-1 text-[10px] text-primary/60 opacity-0 transition-all duration-200 group-hover:opacity-100">
                        <span>Jump to section</span>
                        <ArrowUpRight className="h-2.5 w-2.5" />
                    </div>
                </div>
            </button>
        )
    }

    if (item.kind === "project") {
        return (
            <button
                onClick={onNavigate}
                className="group relative w-full overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-accent/5"
            >
                <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${item.gradient} opacity-60 transition-opacity group-hover:opacity-100`} />

                <div className="pl-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-3.5 w-3.5 text-accent/70" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-accent/70">Project</span>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                        {item.name}
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground/70">{item.metric}</p>

                    <div className="mt-2 flex items-center gap-1 text-[10px] text-accent/60 opacity-0 transition-all duration-200 group-hover:opacity-100">
                        <span>Jump to section</span>
                        <ArrowUpRight className="h-2.5 w-2.5" />
                    </div>
                </div>
            </button>
        )
    }

    // Publication
    return (
        <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block w-full overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-cyan-500/5"
        >
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-500 to-primary opacity-60 transition-opacity group-hover:opacity-100" />

            <div className="pl-3">
                <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-3.5 w-3.5 text-cyan-400/70" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/70">Publication</span>
                </div>
                <h4 className="text-sm font-semibold text-foreground group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {item.title}
                </h4>
                <p className="mt-0.5 text-xs text-muted-foreground/70">
                    {item.venue} &middot; {item.year}
                </p>

                <div className="mt-2 flex items-center gap-1 text-[10px] text-cyan-400/60 opacity-0 transition-all duration-200 group-hover:opacity-100">
                    <span>View paper</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                </div>
            </div>
        </a>
    )
}

/* ── Main Modal ───────────────────────────────────────────────────── */

export function SkillDetailModal({ skill, open, onOpenChange }: SkillDetailModalProps) {
    const usage = useMemo(() => (skill ? getSkillUsage(skill) : null), [skill])
    const icon = skill ? getSkillIcon(skill) : null
    const category = skill ? getSkillCategory(skill) : null

    const handleNavigate = useCallback(
        (kind: string, id?: string) => {
            onOpenChange(false)
            // Small delay to let dialog animation finish
            setTimeout(() => scrollToSection(kind, id), 250)
        },
        [onOpenChange],
    )

    if (!skill || !usage) return null

    const expCount = usage.items.filter((i) => i.kind === "experience").length
    const projCount = usage.items.filter((i) => i.kind === "project").length
    const pubCount = usage.items.filter((i) => i.kind === "publication").length

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl border-white/[0.08] bg-card/95 backdrop-blur-2xl sm:rounded-2xl overflow-hidden p-0">
                {/* ── Header with gradient background ─────────────────────── */}
                <div className="relative overflow-hidden px-6 pt-6 pb-4">
                    {/* Ambient glow */}
                    <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
                    <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-accent/15 blur-3xl" />

                    <DialogHeader className="relative">
                        <div className="flex items-center gap-3">
                            {/* Icon badge */}
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/25 ring-1 ring-white/10">
                                <span className="text-lg">{icon}</span>
                            </div>

                            <div>
                                <DialogTitle className="text-xl font-bold text-foreground">
                                    {skill}
                                </DialogTitle>
                                <DialogDescription className="mt-0.5">
                                    {category && (
                                        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                                            {category}
                                        </span>
                                    )}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Stats row */}
                    <div className="mt-4 flex gap-3">
                        {expCount > 0 && (
                            <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
                                <Briefcase className="h-3 w-3 text-primary/70" />
                                <span className="text-xs font-medium text-foreground">{expCount}</span>
                                <span className="text-[10px] text-muted-foreground/60">experience{expCount !== 1 ? "s" : ""}</span>
                            </div>
                        )}
                        {projCount > 0 && (
                            <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
                                <Sparkles className="h-3 w-3 text-accent/70" />
                                <span className="text-xs font-medium text-foreground">{projCount}</span>
                                <span className="text-[10px] text-muted-foreground/60">project{projCount !== 1 ? "s" : ""}</span>
                            </div>
                        )}
                        {pubCount > 0 && (
                            <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
                                <BookOpen className="h-3 w-3 text-cyan-400/70" />
                                <span className="text-xs font-medium text-foreground">{pubCount}</span>
                                <span className="text-[10px] text-muted-foreground/60">paper{pubCount !== 1 ? "s" : ""}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                {/* ── Scrollable usage list ───────────────────────────────── */}
                <div className="max-h-[50vh] overflow-y-auto px-6 py-4 custom-scrollbar">
                    {usage.items.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground/60">
                            No linked experiences yet — this skill is part of your toolkit.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {/* Experiences */}
                            {usage.items.filter((i) => i.kind === "experience").length > 0 && (
                                <div>
                                    <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">
                                        Where I&apos;ve used this
                                    </p>
                                    <div className="space-y-2">
                                        {usage.items
                                            .filter((i) => i.kind === "experience")
                                            .map((item, idx) => (
                                                <UsageCard
                                                    key={`exp-${idx}`}
                                                    item={item}
                                                    onNavigate={() => handleNavigate(item.kind, "id" in item ? item.id : undefined)}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Projects */}
                            {usage.items.filter((i) => i.kind === "project").length > 0 && (
                                <div>
                                    <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">
                                        Projects built with this
                                    </p>
                                    <div className="space-y-2">
                                        {usage.items
                                            .filter((i) => i.kind === "project")
                                            .map((item, idx) => (
                                                <UsageCard
                                                    key={`proj-${idx}`}
                                                    item={item}
                                                    onNavigate={() => handleNavigate(item.kind, "id" in item ? item.id : undefined)}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Publications */}
                            {usage.items.filter((i) => i.kind === "publication").length > 0 && (
                                <div>
                                    <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">
                                        Research &amp; publications
                                    </p>
                                    <div className="space-y-2">
                                        {usage.items
                                            .filter((i) => i.kind === "publication")
                                            .map((item, idx) => (
                                                <UsageCard
                                                    key={`pub-${idx}`}
                                                    item={item}
                                                    onNavigate={() => handleNavigate(item.kind)}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Footer ──────────────────────────────────────────────── */}
                <div className="border-t border-white/[0.04] bg-white/[0.01] px-6 py-3">
                    <p className="text-center text-[10px] text-muted-foreground/40">
                        Click any card to navigate &middot; {usage.items.length} connection{usage.items.length !== 1 ? "s" : ""} found
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
