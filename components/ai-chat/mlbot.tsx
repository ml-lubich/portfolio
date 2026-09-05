"use client"

/**
 * ─── MLBot ────────────────────────────────────────────────────────────
 *
 * Floating chat launcher + panel. Talks to `/api/chat`, which streams SSE
 * frames: `text` (token delta), `tool` (a lookup started), `chart` (a spec
 * to render), `error`, `done`.
 *
 * Charts render with recharts, already a site dependency — no new chart lib.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { X, ArrowUp, ArrowUpToLine, Maximize2 } from "lucide-react"
import { SiteLogoMark } from "@/components/site-logo-mark"
import { BlogChart } from "@/components/blog/charts/blog-chart"
import { splitChatSegments } from "@/lib/ai/chat-segments"
import { isPinnedToBottom } from "@/lib/ai/chat-scroll"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { wooshScrollTo } from "@/components/nav/woosh-scroll"
import { ChatChart, type ChartSpec } from "./chat-chart"
import { BookingCard } from "./booking-card"
import { BOOKING_URL, type BookingSpec } from "@/lib/ai/profile-tools"

interface Turn {
    role: "user" | "assistant"
    content: string
    charts?: ChartSpec[]
    tools?: string[]
    /** Model-suggested next questions, extracted from the same reply. */
    followups?: string[]
    /** Calendar hand-off, when the visitor asked about working together. */
    booking?: BookingSpec
}

/* Panel footprint, cycled from the header. Small suits a quick answer next to
 * the page; large suits a chart or a table. Mobile ignores this — the panel is
 * full-screen there. */
const PANEL_SIZES = [
    "sm:h-[min(26rem,calc(100dvh-12rem))] sm:w-[min(20rem,calc(100vw-2rem))]",
    "sm:h-[min(34rem,calc(100dvh-12rem))] sm:w-[min(24rem,calc(100vw-2rem))]",
    "sm:h-[min(46rem,calc(100dvh-8rem))] sm:w-[min(36rem,calc(100vw-2rem))]",
] as const

const SIZE_LABELS = ["Small", "Medium", "Large"] as const

const SUGGESTIONS = [
    "What has Misha built with agents?",
    "Chart his strongest skills",
    "Where has he worked?",
    "What does he publish on?",
]

/** Human-readable labels for the tool names the model calls. */
/** The booking card already carries the link. Models paste it anyway, which
 *  renders as raw markdown and duplicates the card — so strip it on display
 *  rather than trusting the prompt to hold. */
function stripBookingLink(text: string): string {
    const escaped = BOOKING_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return text
        .replace(new RegExp(`\\[([^\\]]*)\\]\\(\\s*${escaped}[^)]*\\)`, "gi"), "$1")
        .replace(new RegExp(escaped, "gi"), "")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
}

/* Cycled while waiting. "Thinking…" is what every other chat says; these are
 * the site's own vocabulary, and the motion tells you it is alive rather than
 * hung — which is most of what a loading state is for. */
const THINKING_VERBS = [
    "Lubiching",
    "Pythoning",
    "Agenting",
    "Retrieving",
    "Prompting",
    "Vectorising",
    "Orchestrating",
    "Shipping",
    "Tokenising",
    "Kubernetting",
    "Refactoring",
    "Inferencing",
] as const

function ThinkingVerb() {
    const [i, setI] = useState(() => Math.floor(Math.random() * THINKING_VERBS.length))

    useEffect(() => {
        const id = setInterval(() => setI((n) => (n + 1) % THINKING_VERBS.length), 1100)
        return () => clearInterval(id)
    }, [])

    return (
        <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            {/* Keyed so each verb replays the fade rather than swapping in place. */}
            <span key={i} className="mlbot-verb">
                {THINKING_VERBS[i]}
            </span>
            <span className="mlbot-dots" aria-hidden>
                <i />
                <i />
                <i />
            </span>
        </span>
    )
}

const TOOL_LABELS: Record<string, string> = {
    search_profile: "Searching the profile",
    get_experience: "Reading work history",
    get_projects: "Pulling up projects",
    get_skills: "Checking skills",
    get_publications: "Looking up publications",
    get_testimonials: "Fetching testimonials",
    chart_skills: "Charting skills",
    chart_tech_usage: "Charting tech usage",
    chart_publications_by_year: "Charting publications",
    request_consultation: "Opening the calendar",
}

export function MLBot() {
    const [open, setOpen] = useState(false)
    const [turns, setTurns] = useState<Turn[]>([])
    const [input, setInput] = useState("")
    const [busy, setBusy] = useState(false)
    const [showTop, setShowTop] = useState(false)
    const [size, setSize] = useState(1)

    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // The launcher replaces the old back-to-top button, so it takes over that job
    // as a secondary control that appears once you've scrolled away from the hero.
    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 600)
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    // Any part of the page can ask MLBot to open (e.g. the hero CTA).
    useEffect(() => {
        const onOpen = () => setOpen(true)
        window.addEventListener("mlbot:open", onOpen)
        return () => window.removeEventListener("mlbot:open", onOpen)
    }, [])

    useEffect(() => {
        if (open) inputRef.current?.focus()
    }, [open])

    // Follow the stream. `turns` changes on every token, so this runs as the
    // reply grows — but only while the reader is still at the bottom, so
    // scrolling up to re-read an earlier answer is not yanked back down.
    useEffect(() => {
        const el = scrollRef.current
        if (!el || !isPinnedToBottom(el)) return
        el.scrollTo({ top: el.scrollHeight, behavior: busy ? "auto" : "smooth" })
    }, [turns, busy])

    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open])

    const send = useCallback(
        async (text: string) => {
            const question = text.trim()
            if (!question || busy) return

            setInput("")
            setBusy(true)

            const history = [...turns, { role: "user" as const, content: question }]
            setTurns([...history, { role: "assistant", content: "", charts: [], tools: [] }])

            /** Mutates only the in-flight assistant turn (always the last one). */
            const patch = (fn: (t: Turn) => Turn) =>
                setTurns((prev) => prev.map((t, i) => (i === prev.length - 1 ? fn(t) : t)))

            try {
                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        messages: history.map(({ role, content }) => ({ role, content })),
                    }),
                })

                if (!res.ok || !res.body) {
                    const { error } = await res.json().catch(() => ({ error: "Something went wrong." }))
                    patch((t) => ({ ...t, content: error ?? "Something went wrong." }))
                    return
                }

                const reader = res.body.getReader()
                const decoder = new TextDecoder()
                let buffer = ""

                for (;;) {
                    const { done, value } = await reader.read()
                    if (done) break
                    buffer += decoder.decode(value, { stream: true })

                    // SSE frames are separated by a blank line.
                    const frames = buffer.split("\n\n")
                    buffer = frames.pop() ?? ""

                    for (const frame of frames) {
                        const event = frame.match(/^event: (.+)$/m)?.[1]
                        const raw = frame.match(/^data: (.+)$/m)?.[1]
                        if (!event || !raw) continue

                        let data: unknown
                        try {
                            data = JSON.parse(raw)
                        } catch {
                            continue
                        }

                        if (event === "text") {
                            patch((t) => ({ ...t, content: t.content + String(data) }))
                        } else if (event === "chart") {
                            patch((t) => ({ ...t, charts: [...(t.charts ?? []), data as ChartSpec] }))
                        } else if (event === "tool") {
                            const name = (data as { name: string }).name
                            patch((t) => ({ ...t, tools: [...(t.tools ?? []), name] }))
                        } else if (event === "booking") {
                            patch((t) => ({ ...t, booking: data as BookingSpec }))
                        } else if (event === "followups") {
                            patch((t) => ({ ...t, followups: data as string[] }))
                        } else if (event === "error") {
                            patch((t) => ({ ...t, content: (data as { message: string }).message }))
                        }
                    }
                }
            } catch {
                patch((t) => ({ ...t, content: "Couldn't reach MLBot. Check your connection and try again." }))
            } finally {
                setBusy(false)
            }
        },
        [busy, turns],
    )

    return (
        <>
            {/* ── Launcher stack, bottom-right ── */}
            <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
                {showTop && !open && (
                    <button
                        type="button"
                        onClick={() => wooshScrollTo(0)}
                        aria-label="Back to top"
                        className="mlbot-surface flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowUpToLine className="h-4 w-4" />
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-label={open ? "Close MLBot" : "Chat with MLBot"}
                    aria-expanded={open}
                    className="mlbot-launcher group relative flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 hover:scale-[1.06] active:scale-95"
                >
                    {open ? (
                        <X className="h-5 w-5 text-foreground" />
                    ) : (
                        <SiteLogoMark width={40} height={40} sizes="40px" alt="" className="h-9 w-9 object-contain" />
                    )}
                    {!open && <span className="mlbot-pulse" aria-hidden />}
                    {/* Names the button. A bare logo does not tell a first-time
                        visitor that this is a chat they can talk to. */}
                    {!open && (
                        <span className="mlbot-tag" aria-hidden>
                            AI Chat
                        </span>
                    )}
                </button>
            </div>

            {/* ── Panel ── */}
            {open && (
                <div
                    role="dialog"
                    aria-label="Chat with MLBot"
                    /* Full-screen on a phone — a 24rem card floating over the
                       page is unusable with a keyboard open. From sm up it goes
                       back to the bottom-right panel. */
                    className={`mlbot-panel fixed inset-0 z-[60] flex h-dvh w-full flex-col overflow-hidden rounded-none sm:inset-auto sm:bottom-24 sm:right-6 sm:rounded-2xl ${PANEL_SIZES[size]}`}
                >
                    <header className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3">
                        <SiteLogoMark width={28} height={28} sizes="28px" alt="" className="h-7 w-7 object-contain" />
                        <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-medium text-foreground">MLBot</p>
                            <p className="truncate text-[12px] text-muted-foreground">Ask about Misha&apos;s work</p>
                        </div>

                        {/* Cycles S → M → L. One control beats a grow/shrink pair:
                            three sizes wrap round in two taps either way. */}
                        <button
                            type="button"
                            onClick={() => setSize((n) => (n + 1) % PANEL_SIZES.length)}
                            aria-label={`Resize MLBot (${SIZE_LABELS[size]})`}
                            title={`Resize MLBot — ${SIZE_LABELS[size]}`}
                            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground sm:flex"
                        >
                            <Maximize2 className="h-4 w-4" />
                        </button>
                    </header>

                    <div ref={scrollRef} className="min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto px-4 py-4">
                        {turns.length === 0 && (
                            <div className="space-y-3">
                                <p className="text-[14px] leading-relaxed text-muted-foreground">
                                    I can look through Misha&apos;s roles, projects, skills and papers — and chart them.
                                </p>
                                <div className="flex flex-col items-start gap-1.5">
                                    {SUGGESTIONS.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => send(s)}
                                            className="max-w-full truncate rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-left text-[12.5px] text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {turns.map((turn, i) => (
                            <div key={i} className={turn.role === "user" ? "mlbot-turn-in flex min-w-0 justify-end" : "mlbot-turn-in min-w-0 space-y-2"}>
                                {turn.role === "user" ? (
                                    <p className="max-w-[85%] overflow-hidden break-words rounded-2xl rounded-br-sm bg-white/[0.08] px-3.5 py-2.5 text-[14.5px] leading-[1.55] text-foreground">
                                        {turn.content}
                                    </p>
                                ) : (
                                    <>
                                        {turn.tools?.map((name, j) =>
                                            TOOL_LABELS[name] ? (
                                                <p key={j} className="mlbot-tool-in flex items-center gap-2 text-[12px] text-muted-foreground/70">
                                                    <span className="mlbot-tick" aria-hidden />
                                                    {TOOL_LABELS[name]}
                                                </p>
                                            ) : null,
                                        )}

                                        {turn.charts?.map((spec, j) => <ChatChart key={j} spec={spec} />)}

                                        {turn.booking && <BookingCard booking={turn.booking} />}

                                        {splitChatSegments(turn.content).map((seg, j) =>
                                            seg.kind === "diagram" ? (
                                                <div key={j} className="my-2 max-w-full overflow-x-auto">
                                                    <BlogChart json={seg.json} />
                                                </div>
                                            ) : (
                                                <div key={j} className="mlbot-md min-w-0 text-[14.5px] leading-[1.65] text-foreground/90">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{seg.value}</ReactMarkdown>
                                                </div>
                                            ),
                                        )}

                                        {busy && i === turns.length - 1 && !turn.content && !turn.tools?.length && (
                                            <ThinkingVerb />
                                        )}

                                        {!busy && turn.followups?.length ? (
                                            <div className="flex flex-col items-start gap-1.5 pt-1">
                                                {turn.followups.map((q) => (
                                                    <button
                                                        key={q}
                                                        type="button"
                                                        onClick={() => send(q)}
                                                        title={q}
                                                        className="max-w-full truncate rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-left text-[12.5px] text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
                                                    >
                                                        {q}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : null}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            send(input)
                        }}
                        className="flex items-end gap-2 border-t border-white/[0.08] px-3 py-2.5"
                    >
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    if (!busy && input.trim()) send(input)
                                }
                            }}
                            rows={1}
                            maxLength={1000}
                            placeholder="Ask about Misha…"
                            aria-label="Message MLBot"
                            className="max-h-28 min-h-[38px] min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-2 text-[13px] text-foreground border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
                        />
                        <button
                            type="submit"
                            disabled={busy || !input.trim()}
                            aria-label="Send"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30 mb-0.5"
                        >
                            <ArrowUp className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            )}
        </>
    )
}
