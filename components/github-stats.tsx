"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { AnimatedSection } from "./animated-section"
import { AnimatedCounter } from "./animated-counter"
import { SectionHeader } from "./section-header"
import {
    GitFork,
    Star,
    BookOpen,
    Users,
    Activity,
    ExternalLink,
    GitCommit,
    ArrowUpRight,
    Clock,
    Flame,
    Calendar,
    TrendingUp,
} from "lucide-react"
import { SiGithub } from "react-icons/si"

/* ── Types ───────────────────────────────────────────────────── */
interface GitHubUser {
    public_repos: number
    followers: number
    following: number
    created_at: string
    avatar_url: string
    bio: string | null
    name: string | null
    login: string
}

interface GitHubRepo {
    name: string
    full_name: string
    html_url: string
    description: string | null
    stargazers_count: number
    forks_count: number
    language: string | null
    updated_at: string
    fork: boolean
    topics: string[]
    size: number
}

interface LanguageStat {
    name: string
    value: number
    percentage: number
    color: string
}

interface ContributionDay {
    date: string
    count: number
    level: 0 | 1 | 2 | 3 | 4
}

interface GitHubEvent {
    type: string
    created_at: string
    payload?: {
        commits?: unknown[]
        size?: number
    }
}

/* ── Language colors (GitHub standard) ───────────────────────── */
const LANG_COLORS: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Python: "#3572A5",
    Java: "#b07219",
    Rust: "#dea584",
    Go: "#00ADD8",
    "C++": "#f34b7d",
    C: "#555555",
    Ruby: "#701516",
    Swift: "#F05138",
    Kotlin: "#A97BFF",
    Shell: "#89e051",
    HTML: "#e34c26",
    CSS: "#563d7c",
    SCSS: "#c6538c",
    Dockerfile: "#384d54",
    Makefile: "#427819",
    Jupyter: "#DA5B0B",
    "Jupyter Notebook": "#DA5B0B",
    MDX: "#fcb32c",
    Vue: "#41b883",
    Dart: "#00B4AB",
    PHP: "#4F5D95",
}

/* ── Contribution heatmap level colours (brand blue) ─────────── */
const LEVEL_COLORS = [
    "hsla(217, 91%, 60%, 0.04)",
    "hsla(217, 91%, 60%, 0.22)",
    "hsla(217, 91%, 60%, 0.42)",
    "hsla(217, 91%, 60%, 0.64)",
    "hsla(217, 91%, 60%, 0.88)",
] as const

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""]

const GITHUB_USERNAME = "ml-lubich"
const WEEKS_TO_SHOW = 22
const CELL = 13
const GAP = 3

/* ── Helpers ─────────────────────────────────────────────────── */
function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    const intervals = [
        { label: "y", seconds: 31536000 },
        { label: "mo", seconds: 2592000 },
        { label: "d", seconds: 86400 },
        { label: "h", seconds: 3600 },
        { label: "m", seconds: 60 },
    ]
    for (const { label, seconds: s } of intervals) {
        const count = Math.floor(seconds / s)
        if (count >= 1) return count + label + " ago"
    }
    return "just now"
}

function toKey(d: Date) {
    return d.toISOString().split("T")[0]
}

function buildContributionData(events: GitHubEvent[]) {
    const countMap: Record<string, number> = {}
    for (const ev of events) {
        const key = toKey(new Date(ev.created_at))
        const n =
            ev.type === "PushEvent" && Array.isArray(ev.payload?.commits)
                ? ev.payload!.commits!.length
                : 1
        countMap[key] = (countMap[key] || 0) + n
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startOfThisWeek = new Date(today)
    startOfThisWeek.setDate(today.getDate() - today.getDay())
    const startDate = new Date(startOfThisWeek)
    startDate.setDate(startDate.getDate() - (WEEKS_TO_SHOW - 1) * 7)

    const flat: ContributionDay[] = []
    const cursor = new Date(startDate)
    while (cursor <= today) {
        const key = toKey(cursor)
        const count = countMap[key] || 0
        let level: 0 | 1 | 2 | 3 | 4 = 0
        if (count >= 8) level = 4
        else if (count >= 5) level = 3
        else if (count >= 2) level = 2
        else if (count >= 1) level = 1
        flat.push({ date: key, count, level })
        cursor.setDate(cursor.getDate() + 1)
    }

    const grid: ContributionDay[][] = []
    for (let i = 0; i < flat.length; i += 7) {
        grid.push(flat.slice(i, Math.min(i + 7, flat.length)))
    }

    let total = 0, best = 0, cur = 0
    for (const day of flat) {
        total += day.count
        if (day.count > 0) { cur++; best = Math.max(best, cur) } else cur = 0
    }
    best = Math.max(best, cur)

    let streak = 0
    for (let i = flat.length - 1; i >= 0; i--) {
        if (flat[i].count > 0) streak++; else break
    }

    const activeDays = flat.filter((d) => d.count > 0).length
    const avg = activeDays > 0 ? (total / activeDays).toFixed(1) : "0"
    return { grid, stats: { total, streak, best, avg } }
}

/* ── Component ───────────────────────────────────────────────── */
export function GitHubStats() {
    const [user, setUser] = useState<GitHubUser | null>(null)
    const [repos, setRepos] = useState<GitHubRepo[]>([])
    const [languages, setLanguages] = useState<LanguageStat[]>([])
    const [totalStars, setTotalStars] = useState(0)
    const [totalForks, setTotalForks] = useState(0)
    const [contributionGrid, setContributionGrid] = useState<ContributionDay[][]>([])
    const [contribStats, setContribStats] = useState({ total: 0, streak: 0, best: 0, avg: "0" })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number; x: number; y: number } | null>(null)
    const fetchedRef = useRef(false)

    const fetchGitHubData = useCallback(async () => {
        if (fetchedRef.current) return
        fetchedRef.current = true
        try {
            const base = "https://api.github.com/users/" + GITHUB_USERNAME
            const [userRes, reposRes, ev1, ev2, ev3] = await Promise.all([
                fetch(base),
                fetch(base + "/repos?per_page=100&sort=updated"),
                fetch(base + "/events?per_page=100&page=1"),
                fetch(base + "/events?per_page=100&page=2"),
                fetch(base + "/events?per_page=100&page=3"),
            ])
            if (!userRes.ok || !reposRes.ok) throw new Error("GitHub API rate limit reached. Stats will refresh shortly.")
            const userData: GitHubUser = await userRes.json()
            const reposData: GitHubRepo[] = await reposRes.json()
            const allEvents: GitHubEvent[] = []
            for (const res of [ev1, ev2, ev3]) {
                if (res.ok) { const data = await res.json(); if (Array.isArray(data)) allEvents.push(...data) }
            }
            const { grid, stats } = buildContributionData(allEvents)
            setContributionGrid(grid)
            setContribStats(stats)
            const ownRepos = reposData.filter((r) => !r.fork)
            const stars = ownRepos.reduce((sum, r) => sum + r.stargazers_count, 0)
            const forks = ownRepos.reduce((sum, r) => sum + r.forks_count, 0)
            const langMap: Record<string, number> = {}
            for (const repo of ownRepos) { if (repo.language) langMap[repo.language] = (langMap[repo.language] || 0) + repo.size }
            const totalSize = Object.values(langMap).reduce((a, b) => a + b, 0)
            const langStats = Object.entries(langMap)
                .map(([name, value]) => ({ name, value, percentage: totalSize > 0 ? (value / totalSize) * 100 : 0, color: LANG_COLORS[name] || "#8b8b8b" }))
                .sort((a, b) => b.value - a.value).slice(0, 8)
            setUser(userData)
            setRepos(ownRepos.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()))
            setLanguages(langStats)
            setTotalStars(stars)
            setTotalForks(forks)
        } catch (err) { setError(err instanceof Error ? err.message : "Failed to load GitHub data") }
        finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchGitHubData() }, [fetchGitHubData])

    const monthPositions = useMemo(() => {
        const positions: { label: string; col: number }[] = []
        let lastMonth = -1
        for (let w = 0; w < contributionGrid.length; w++) {
            const day = contributionGrid[w]?.[0]
            if (day) {
                const month = new Date(day.date + "T12:00:00").getMonth()
                if (month !== lastMonth) { positions.push({ label: MONTH_NAMES[month], col: w }); lastMonth = month }
            }
        }
        return positions
    }, [contributionGrid])

    if (loading) {
        return (
            <AnimatedSection id="github" className="relative py-14 sm:py-20 overflow-hidden">
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="mb-10 text-center">
                        <div className="mx-auto h-4 w-32 animate-pulse rounded bg-muted" />
                        <div className="mx-auto mt-4 h-10 w-96 max-w-full animate-pulse rounded bg-muted" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (<div key={i} className="h-32 animate-pulse rounded-2xl bg-white/[0.015] border border-white/[0.03]" />))}
                    </div>
                    <div className="mt-6 h-52 animate-pulse rounded-2xl bg-white/[0.015] border border-white/[0.03]" />
                </div>
            </AnimatedSection>
        )
    }

    if (error) {
        return (
            <AnimatedSection id="github" className="relative py-14 sm:py-20 overflow-hidden">
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
                    <p className="text-muted-foreground text-sm">{error}</p>
                </div>
            </AnimatedSection>
        )
    }

    const topRepos = repos.slice(0, 4)
    const accountAge = user ? new Date().getFullYear() - new Date(user.created_at).getFullYear() : 0

    return (
        <AnimatedSection id="github" className="relative py-14 sm:py-20 overflow-hidden">
            {/* Background orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[100px] translucent-glow" />
                <div className="absolute -left-40 bottom-1/4 h-[500px] w-[500px] rounded-full bg-accent/8 blur-[100px] translucent-glow" style={{ animationDelay: "2.5s" }} />
                <div className="absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/5 blur-[80px] translucent-glow" style={{ animationDelay: "4s" }} />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                <SectionHeader
                    icon={<Activity className="h-3.5 w-3.5" />}
                    label="Open Source"
                    title={<>Live from <span className="gradient-text">GitHub</span></>}
                    subtitle="Real-time stats pulled from the GitHub API — contributions, languages, and recent activity."
                />

                {/* Stat cards */}
                <div className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
                    {[
                        { icon: <BookOpen className="h-5 w-5" />, label: "Repositories", value: String(user?.public_repos ?? 0), gradient: "from-primary to-accent" },
                        { icon: <Star className="h-5 w-5" />, label: "Stars Earned", value: String(totalStars), gradient: "from-accent to-[hsl(180,70%,50%)]" },
                        { icon: <GitFork className="h-5 w-5" />, label: "Forks", value: String(totalForks), gradient: "from-[hsl(180,70%,50%)] to-primary" },
                        { icon: <Users className="h-5 w-5" />, label: "Followers", value: String(user?.followers ?? 0), gradient: "from-primary to-[hsl(340,75%,55%)]" },
                    ].map((stat, i) => (
                        <AnimatedSection key={stat.label} delay={i * 80}>
                            <div className="group relative overflow-hidden rounded-2xl border border-white/[0.03] bg-white/[0.01] backdrop-blur-2xl p-5 sm:p-6 transition-all duration-500 hover:border-primary/30 hover:bg-white/[0.025] glass-card-3d">
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                <div className={"absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r " + stat.gradient + " opacity-40"} />
                                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/8 blur-2xl opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-150" />
                                <div className="relative">
                                    <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                                        <span className="text-primary/60 transition-colors group-hover:text-primary">{stat.icon}</span>
                                        <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                                    </div>
                                    <div className="text-2xl font-bold text-foreground sm:text-3xl">
                                        <AnimatedCounter value={stat.value} duration={1800} />
                                    </div>
                                </div>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>

                {/* Contribution heatmap */}
                <AnimatedSection delay={160}>
                    <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/[0.03] bg-white/[0.01] backdrop-blur-2xl p-6 sm:p-8 transition-all duration-500 hover:border-primary/20 hover:bg-white/[0.02]">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40 opacity-60" />

                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                                <Calendar className="h-4 w-4 text-primary" />
                                Contribution Activity
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Flame className="h-3.5 w-3.5 text-orange-400" />
                                    <span className="font-semibold text-foreground">{contribStats.streak}</span> day streak
                                </span>
                                <span className="hidden sm:flex items-center gap-1.5">
                                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                                    <span className="font-semibold text-foreground">{contribStats.avg}</span> per active day
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto pb-2 -mx-2 px-2">
                            <div className="inline-flex gap-0 min-w-max">
                                {/* Day labels */}
                                <div className="flex flex-col mr-2" style={{ gap: GAP }}>
                                    <div style={{ height: 16 }} />
                                    {DAY_LABELS.map((label, i) => (
                                        <div key={i} className="flex items-center justify-end pr-1 text-[10px] leading-none text-muted-foreground/50" style={{ height: CELL }}>
                                            {label}
                                        </div>
                                    ))}
                                </div>

                                <div className="relative">
                                    {/* Month labels */}
                                    <div className="relative flex" style={{ height: 16, marginBottom: GAP }}>
                                        {monthPositions.map(({ label, col }, i) => (
                                            <div key={label + "-" + i} className="absolute text-[10px] text-muted-foreground/50" style={{ left: col * (CELL + GAP) }}>
                                                {label}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Cell grid */}
                                    <div className="flex" style={{ gap: GAP }}>
                                        {contributionGrid.map((week, wIdx) => (
                                            <div key={wIdx} className="flex flex-col" style={{ gap: GAP }}>
                                                {week.map((day) => (
                                                    <div
                                                        key={day.date}
                                                        className="rounded-[3px] transition-all duration-200 hover:scale-[1.7] hover:z-10 cursor-crosshair"
                                                        style={{
                                                            width: CELL,
                                                            height: CELL,
                                                            backgroundColor: LEVEL_COLORS[day.level],
                                                            border: day.level > 0 ? "1px solid hsla(217, 91%, 60%, 0.10)" : "1px solid hsla(220, 15%, 25%, 0.08)",
                                                            boxShadow: day.level >= 3 ? "0 0 " + (day.level * 4) + "px hsla(217, 91%, 60%, " + (day.level * 0.06) + ")" : "none",
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect()
                                                            setHoveredCell({ date: day.date, count: day.count, x: rect.left + rect.width / 2, y: rect.top })
                                                        }}
                                                        onMouseLeave={() => setHoveredCell(null)}
                                                    />
                                                ))}
                                                {week.length < 7 && [...Array(7 - week.length)].map((_, i) => (
                                                    <div key={"pad-" + i} style={{ width: CELL, height: CELL }} />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Legend + stats */}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.02] pt-4">
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
                                <span>Less</span>
                                {LEVEL_COLORS.map((color, i) => (
                                    <div key={i} className="rounded-[2px]" style={{ width: 10, height: 10, backgroundColor: color, border: "1px solid hsla(220, 15%, 18%, 0.08)" }} />
                                ))}
                                <span>More</span>
                            </div>
                            <div className="flex items-center gap-5 text-xs text-muted-foreground">
                                <span><span className="font-semibold text-foreground">{contribStats.total}</span> contributions</span>
                                <span className="hidden sm:block">Best streak: <span className="font-semibold text-foreground">{contribStats.best}</span> days</span>
                            </div>
                        </div>

                        {/* Tooltip */}
                        {hoveredCell && (
                            <div className="pointer-events-none fixed z-50 rounded-lg border border-white/[0.04] bg-popover/95 px-3 py-2 text-xs shadow-xl backdrop-blur-xl" style={{ left: hoveredCell.x, top: hoveredCell.y - 42, transform: "translateX(-50%)" }}>
                                <span className="font-semibold text-foreground">{hoveredCell.count} contributions</span>{" "}
                                <span className="text-muted-foreground">on {new Date(hoveredCell.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            </div>
                        )}
                    </div>
                </AnimatedSection>

                {/* Languages + Recent repos */}
                <div className="grid gap-5 lg:grid-cols-2">
                    {/* Language breakdown */}
                    <AnimatedSection delay={240}>
                        <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.03] bg-white/[0.01] backdrop-blur-2xl p-6 sm:p-8 transition-all duration-500 hover:border-primary/20 hover:bg-white/[0.02] glass-card-3d">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />
                            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-foreground">
                                <GitCommit className="h-4 w-4 text-primary" />
                                Language Distribution
                            </h3>
                            <div className="mb-6 flex h-3 overflow-hidden rounded-full bg-white/[0.02]">
                                {languages.map((lang) => (
                                    <div key={lang.name} className="transition-all duration-1000 ease-out first:rounded-l-full last:rounded-r-full" style={{ width: lang.percentage + "%", backgroundColor: lang.color, minWidth: lang.percentage > 0 ? "3px" : 0 }} title={lang.name + ": " + lang.percentage.toFixed(1) + "%"} />
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                {languages.map((lang, idx) => (
                                    <div key={lang.name} className="flex items-center justify-between gap-2 animate-slide-up" style={{ animationDelay: idx * 60 + "ms", opacity: 0 }}>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: lang.color }} />
                                            <span className="truncate text-sm text-muted-foreground">{lang.name}</span>
                                        </div>
                                        <span className="flex-shrink-0 font-mono text-xs text-foreground/70">{lang.percentage.toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex items-center gap-3 border-t border-white/[0.02] pt-4">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Building on GitHub for {accountAge}+ years</span>
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* Recent repos */}
                    <AnimatedSection delay={320}>
                        <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.03] bg-white/[0.01] backdrop-blur-2xl p-6 sm:p-8 transition-all duration-500 hover:border-primary/20 hover:bg-white/[0.02] glass-card-3d">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />
                            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-foreground">
                                <Activity className="h-4 w-4 text-accent" />
                                Recent Activity
                            </h3>
                            <div className="space-y-3">
                                {topRepos.map((repo, idx) => (
                                    <a key={repo.name} href={repo.html_url} target="_blank" rel="noopener noreferrer" className="group/repo flex items-start gap-3 rounded-xl border border-white/[0.02] bg-white/[0.01] p-3.5 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.025] animate-slide-up" style={{ animationDelay: idx * 80 + "ms", opacity: 0 }}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate font-medium text-sm text-foreground group-hover/repo:text-primary transition-colors">{repo.name}</span>
                                                <ArrowUpRight className="h-3 w-3 flex-shrink-0 text-muted-foreground opacity-0 transition-all group-hover/repo:opacity-100 group-hover/repo:translate-x-0.5 group-hover/repo:-translate-y-0.5" />
                                            </div>
                                            {repo.description && <p className="mt-1 truncate text-xs text-muted-foreground">{repo.description}</p>}
                                            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                                {repo.language && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: LANG_COLORS[repo.language] || "#8b8b8b" }} />
                                                        {repo.language}
                                                    </span>
                                                )}
                                                {repo.stargazers_count > 0 && <span className="flex items-center gap-1"><Star className="h-3 w-3" />{repo.stargazers_count}</span>}
                                                {repo.forks_count > 0 && <span className="flex items-center gap-1"><GitFork className="h-3 w-3" />{repo.forks_count}</span>}
                                                <span className="ml-auto">{timeAgo(repo.updated_at)}</span>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                            <a href={"https://github.com/" + GITHUB_USERNAME} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/[0.03] bg-white/[0.015] px-4 py-2 text-xs font-medium text-muted-foreground transition-all duration-300 hover:border-primary/30 hover:text-foreground hover:bg-white/[0.03]">
                                <SiGithub className="h-3.5 w-3.5" />
                                View all repos on GitHub
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </AnimatedSection>
                </div>
            </div>
        </AnimatedSection>
    )
}
