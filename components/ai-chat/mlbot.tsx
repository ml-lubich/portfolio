"use client"

/**
 * ─── MLBot ────────────────────────────────────────────────────────────
 *
 * Floating chat launcher + panel. Talks to `/api/chat`, which streams SSE
 * frames: `text` (token delta), `tool` (a lookup started), `chart` (a spec
 * to render), `error`, `done`.
 *
 * Charts render with recharts, already a site dependency — no new chart lib.
 *
 * Per-message actions (copy, retry, edit-and-resend), stop-while-streaming
 * and new-chat follow briopedia's ChatPane/ChatMessage — same affordances,
 * no conversation persistence (public site, nothing to log in to).
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { X, ArrowUp, ArrowUpToLine, Maximize2, Minimize2, Copy, Check, RotateCcw, Pencil, Square, MessageSquarePlus, Loader2 } from "lucide-react"
import { SiteLogoMark } from "@/components/site-logo-mark"
import { BlogChart } from "@/components/blog/charts/blog-chart"
import { splitChatSegments } from "@/lib/ai/chat-segments"
import { clampFollowup, splitFollowup, type Followup } from "@/lib/ai/followups"
import { isPinnedToBottom } from "@/lib/ai/chat-scroll"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { wooshScrollTo } from "@/components/nav/woosh-scroll"
import { ChatChart, type ChartSpec } from "./chat-chart"
import { BookingCard } from "./booking-card"
import { BOOKING_URL, type BookingSpec } from "@/lib/ai/profile-tools"

/** One tool call, as a step the reader can watch: it runs, then it settles. */
interface ToolStep {
    name: string
    done: boolean
}

interface Turn {
    role: "user" | "assistant"
    content: string
    charts?: ChartSpec[]
    tools?: ToolStep[]
    /** Model-suggested next questions, extracted from the same reply. */
    followups?: Followup[]
    /** Calendar hand-off, when the visitor asked about working together. */
    booking?: BookingSpec
}

/* Panel footprint. One generous default — briopedia's 480px × min(85dvh,760px)
 * — plus a wider rung for a chart or a table. Mobile ignores this: the panel
 * is full-screen there. */
const PANEL_SIZES = [
    "sm:h-[min(47.5rem,85dvh,calc(100dvh-8rem))] sm:w-[min(30rem,calc(100vw-2rem))]",
    "sm:h-[min(56rem,90dvh,calc(100dvh-8rem))] sm:w-[min(42rem,calc(100vw-2rem))]",
] as const

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
        <span className="flex items-center gap-1.5 text-[14px] text-muted-foreground sm:text-[13px]">
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

/* One tool call, drawn as a numbered step. A static line made the panel look
 * hung mid-answer; a spinner says the lookup is running, a tick says it came
 * back, and the number keeps three sequential lookups from reading as one
 * repeated sentence.
 *
 * Reduced motion stops the spin and says "running" in words instead — a still
 * spinner on its own is exactly the frozen state this replaces. */
function ToolStepRow({ name, done, index }: ToolStep & { index: number }) {
    return (
        <p
            data-mlbot-tool
            className={`mlbot-tool-in flex items-center gap-2 text-[13px] sm:text-[12px] ${done ? "text-muted-foreground/60" : "text-foreground/80"}`}
        >
            <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] leading-none tabular-nums ${
                    done ? "border-white/10 text-muted-foreground/50" : "border-[color:var(--accent-glow)] text-[color:var(--accent-glow)]"
                }`}
                aria-hidden
            >
                {index + 1}
            </span>

            {done ? (
                <Check data-mlbot-tool-state="done" className="h-3.5 w-3.5 shrink-0 text-[color:var(--accent-glow)]/70" aria-hidden />
            ) : (
                <Loader2
                    data-mlbot-tool-state="running"
                    className="h-3.5 w-3.5 shrink-0 animate-spin text-[color:var(--accent-glow)] motion-reduce:animate-none"
                    aria-hidden
                />
            )}

            <span>{TOOL_LABELS[name]}</span>
            {!done && <span className="hidden text-muted-foreground/70 motion-reduce:inline">— running</span>}
        </p>
    )
}

/* Shared chrome for the small per-message controls. Muted until hovered so
 * the row reads as metadata, not a toolbar. */
/* Phone-first: 44px tall and 14px so a thumb can hit it and an eye can read
 * it without zooming; compact from sm up where a pointer is precise. */
const ACTION =
    "flex h-11 items-center gap-1.5 rounded-md px-3 text-[14px] text-muted-foreground/80 transition-colors hover:bg-white/[0.06] hover:text-foreground sm:h-7 sm:px-2 sm:text-[12px]"

function CopyButton({ text, label }: { text: string; label: string }) {
    const [copied, setCopied] = useState(false)

    // Reset the tick. A confirmation label, not motion — reduced motion
    // has nothing to say about it.
    useEffect(() => {
        if (!copied) return
        const id = setTimeout(() => setCopied(false), 1600)
        return () => clearTimeout(id)
    }, [copied])

    return (
        <button
            type="button"
            onClick={() => navigator.clipboard.writeText(text).then(() => setCopied(true))}
            aria-label={label}
            title={label}
            className={ACTION}
        >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? <span>Copied</span> : null}
        </button>
    )
}

export function MLBot() {
    const [open, setOpen] = useState(false)
    const [turns, setTurns] = useState<Turn[]>([])
    const [input, setInput] = useState("")
    const [busy, setBusy] = useState(false)
    const [showTop, setShowTop] = useState(false)
    const [size, setSize] = useState(0)
    /** Index of the user turn being edited in place, and its draft text. */
    const [editing, setEditing] = useState<{ index: number; draft: string } | null>(null)

    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const abortRef = useRef<AbortController | null>(null)
    /* `busy` is state, so two pills tapped in the same tick both read the
     * pre-render `false` and both fire — which is how two answers ended up
     * being written at once. The ref flips synchronously, so the second tap
     * has nothing to do. It is a gate, not a queue: the tap is dropped. */
    const busyRef = useRef(false)
    /* Which conversation a stream belongs to. Closing the panel or starting a
     * new chat bumps it, so a late frame from the old request can never write
     * into what is on screen now. */
    const runRef = useRef(0)

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

    // Closing the panel ends the answer it was writing. Without this the
    // stream keeps arriving and lands in whatever conversation is open next.
    useEffect(() => {
        if (open) return
        runRef.current++
        abortRef.current?.abort()
    }, [open])

    /** Aborts the in-flight stream; whatever has arrived stays on screen. */
    const stop = useCallback(() => abortRef.current?.abort(), [])

    const newChat = useCallback(() => {
        runRef.current++
        stop()
        setTurns([])
        setInput("")
        setEditing(null)
        inputRef.current?.focus()
    }, [stop])

    /** `from` truncates the transcript first — retry and edit-and-resend both
     *  replace the old answer rather than appending a second one after it. */
    const send = useCallback(
        async (text: string, from?: number) => {
            const question = text.trim()
            // One question at a time. A tap while an answer is streaming is
            // dropped on the spot — nothing is queued behind it.
            if (!question || busyRef.current) return
            busyRef.current = true
            const run = ++runRef.current

            setInput("")
            setEditing(null)
            setBusy(true)

            const history = [...turns.slice(0, from ?? turns.length), { role: "user" as const, content: question }]
            setTurns([...history, { role: "assistant", content: "", charts: [], tools: [] }])

            /** Mutates only the in-flight assistant turn (always the last one),
             *  and only while this run still owns the transcript. */
            const patch = (fn: (t: Turn) => Turn) => {
                if (runRef.current !== run) return
                setTurns((prev) => prev.map((t, i) => (i === prev.length - 1 ? fn(t) : t)))
            }

            /** A lookup has returned once anything follows it. */
            const settle = (t: Turn): Turn =>
                t.tools?.some((s) => !s.done) ? { ...t, tools: t.tools.map((s) => ({ ...s, done: true })) } : t

            const controller = new AbortController()
            abortRef.current = controller

            try {
                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    signal: controller.signal,
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
                            patch((t) => ({ ...settle(t), content: t.content + String(data) }))
                        } else if (event === "chart") {
                            patch((t) => ({ ...settle(t), charts: [...(t.charts ?? []), data as ChartSpec] }))
                        } else if (event === "tool") {
                            const name = (data as { name: string }).name
                            // Settle FIRST, then append: the new step is the only
                            // one still running.
                            patch((t) => {
                                const prev = settle(t)
                                return { ...prev, tools: [...(prev.tools ?? []), { name, done: false }] }
                            })
                        } else if (event === "booking") {
                            patch((t) => ({ ...t, booking: data as BookingSpec }))
                        } else if (event === "followups") {
                            // Wire form is a plain string, optionally `label :: question`.
                            // An object pair is accepted too, so either server works.
                            patch((t) => ({
                                ...t,
                                followups: (data as (string | Followup)[]).map((f) => (typeof f === "string" ? splitFollowup(f) : f)),
                            }))
                        } else if (event === "error") {
                            patch((t) => ({ ...t, content: (data as { message: string }).message }))
                        }
                    }
                }
            } catch (err) {
                // Stop keeps the partial answer; only a real failure gets the
                // error copy. An empty aborted turn says what happened instead
                // of leaving a blank bubble.
                if ((err as Error)?.name === "AbortError") {
                    patch((t) => (t.content || t.charts?.length ? t : { ...t, content: "Stopped." }))
                } else {
                    patch((t) => ({ ...t, content: "Couldn't reach MLBot. Check your connection and try again." }))
                }
            } finally {
                if (abortRef.current === controller) abortRef.current = null
                // No lookup is still running once the stream is over, however
                // it ended.
                patch(settle)
                busyRef.current = false
                setBusy(false)
            }
        },
        [turns],
    )

    /** Re-runs the last question, replacing its answer. */
    const retry = useCallback(() => {
        const i = turns.findLastIndex((t) => t.role === "user")
        if (i >= 0) send(turns[i].content, i)
    }, [send, turns])

    const lastAssistant = turns.findLastIndex((t) => t.role === "assistant")

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
                    <header className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3 sm:py-2.5">
                        <SiteLogoMark width={28} height={28} sizes="28px" alt="" className="h-7 w-7 object-contain" />
                        <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-medium text-foreground sm:text-[14px]">MLBot</p>
                            <p className="truncate text-[13px] text-muted-foreground sm:text-[12px]">Ask about Misha&apos;s work</p>
                        </div>

                        {turns.length > 0 && (
                            <button
                                type="button"
                                onClick={newChat}
                                aria-label="New chat"
                                title="New chat"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground sm:h-8 sm:w-8"
                            >
                                <MessageSquarePlus className="h-4 w-4" />
                            </button>
                        )}

                        {/* Toggles between the roomy default and a wider rung for
                            charts and tables. */}
                        <button
                            type="button"
                            onClick={() => setSize((n) => (n + 1) % PANEL_SIZES.length)}
                            aria-label="Resize MLBot"
                            aria-pressed={size === 1}
                            title={size === 0 ? "Enlarge" : "Shrink"}
                            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground sm:flex"
                        >
                            {size === 0 ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                        </button>

                        {/* Always visible, unlike the resize control: on a phone
                            the panel is inset-0 full-screen and Escape — the only
                            other way out — does not exist on a touch device. */}
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Close MLBot"
                            title="Close MLBot"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground sm:h-8 sm:w-8"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </header>

                    <div ref={scrollRef} className="min-w-0 flex-1 space-y-5 overflow-x-hidden overflow-y-auto px-4 py-5 sm:space-y-4 sm:px-5 sm:py-4">
                        {turns.length === 0 && (
                            <div className="space-y-3">
                                <p className="text-[16px] leading-relaxed text-muted-foreground sm:text-[14.5px]">
                                    I can look through Misha&apos;s roles, projects, skills and papers — and chart them.
                                </p>
                                <div className="flex flex-col items-start gap-1.5">
                                    {SUGGESTIONS.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            disabled={busy}
                                            onClick={() => send(s)}
                                            className="min-h-11 max-w-full truncate rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-left text-[14px] text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0 sm:px-3 sm:py-1.5 sm:text-[13px]"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {turns.map((turn, i) => (
                            <div key={i} className={turn.role === "user" ? "mlbot-turn-in group/turn flex min-w-0 flex-col items-end" : "mlbot-turn-in min-w-0 space-y-2"}>
                                {turn.role === "user" ? (
                                    editing?.index === i ? (
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault()
                                                send(editing.draft, i)
                                            }}
                                            className="w-full max-w-[85%] space-y-2 rounded-2xl rounded-br-sm border border-white/[0.12] bg-white/[0.05] p-2"
                                        >
                                            <textarea
                                                autoFocus
                                                value={editing.draft}
                                                onChange={(e) => setEditing({ index: i, draft: e.target.value })}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Escape") setEditing(null)
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault()
                                                        send(editing.draft, i)
                                                    }
                                                }}
                                                rows={2}
                                                maxLength={1000}
                                                aria-label="Edit your message"
                                                className="min-h-[44px] w-full resize-none bg-transparent px-1.5 py-1 text-[16px] leading-[1.6] text-foreground border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
                                            />
                                            <div className="flex justify-end gap-1">
                                                <button type="button" onClick={() => setEditing(null)} aria-label="Cancel edit" className={ACTION}>
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={busy || !editing.draft.trim()}
                                                    aria-label="Resend"
                                                    className="flex h-11 items-center gap-1.5 rounded-md bg-foreground px-3 text-[14px] text-background transition-opacity disabled:opacity-30 sm:h-7 sm:px-2.5 sm:text-[12px]"
                                                >
                                                    Resend
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <p data-mlbot-role="user" className="max-w-[85%] overflow-hidden break-words rounded-2xl rounded-br-sm bg-white/[0.08] px-4 py-3 text-[16px] leading-[1.6] text-foreground sm:px-3.5 sm:py-2.5 sm:text-[15.5px]">
                                                {turn.content}
                                            </p>
                                            {!busy && (
                                                <div className="mt-1 flex items-center gap-0.5 opacity-60 transition-opacity focus-within:opacity-100 group-hover/turn:opacity-100">
                                                    <CopyButton text={turn.content} label="Copy message" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditing({ index: i, draft: turn.content })}
                                                        aria-label="Edit message"
                                                        title="Edit message"
                                                        className={ACTION}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )
                                ) : (
                                    <>
                                        {turn.tools?.map(({ name, done }, j) =>
                                            TOOL_LABELS[name] ? <ToolStepRow key={j} name={name} done={done} index={j} /> : null,
                                        )}

                                        {turn.charts?.map((spec, j) => <ChatChart key={j} spec={spec} />)}

                                        {turn.booking && <BookingCard booking={turn.booking} />}

                                        {splitChatSegments(turn.content).map((seg, j) =>
                                            seg.kind === "diagram" ? (
                                                <div key={j} className="my-2 max-w-full overflow-x-auto">
                                                    <BlogChart json={seg.json} />
                                                </div>
                                            ) : (
                                                <div key={j} className="mlbot-md min-w-0 text-[16px] leading-[1.7] text-foreground/90 sm:text-[15.5px]">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{seg.value}</ReactMarkdown>
                                                </div>
                                            ),
                                        )}

                                        {busy && i === turns.length - 1 && !turn.content && !turn.tools?.length && (
                                            <ThinkingVerb />
                                        )}

                                        {/* Copy on every finished answer; retry only on the
                                            last one, since it replaces that answer. */}
                                        {!busy && (turn.content || turn.charts?.length) ? (
                                            <div className="flex items-center gap-0.5 pt-0.5">
                                                <CopyButton text={stripBookingLink(turn.content)} label="Copy answer" />
                                                {i === lastAssistant && (
                                                    <button type="button" onClick={retry} aria-label="Retry" title="Retry" className={ACTION}>
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                        <span>Retry</span>
                                                    </button>
                                                )}
                                            </div>
                                        ) : null}

                                        {/* A follow-up is a pair: the pill wears the short label,
                                            tapping it asks `q.question` — the whole, well-formed
                                            question, which is what lands in the transcript.

                                            They stay mounted while an answer streams, disabled
                                            rather than hidden: a pill that vanishes under a
                                            thumb is why two of them got tapped at once. */}
                                        {turn.followups?.length ? (
                                            <div className="flex flex-col items-start gap-1.5 pt-1">
                                                {turn.followups.map((q) => (
                                                    <button
                                                        key={q.question}
                                                        type="button"
                                                        data-mlbot-followup
                                                        disabled={busy}
                                                        onClick={() => send(q.question)}
                                                        title={q.question}
                                                        aria-label={q.question}
                                                        className="min-h-11 max-w-full rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-left text-[14px] leading-snug text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/[0.1] disabled:hover:text-muted-foreground sm:min-h-0 sm:px-3 sm:py-1.5 sm:text-[13px]"
                                                    >
                                                        {clampFollowup(q.label)}
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
                        className="flex items-end gap-2 border-t border-white/[0.08] px-3 py-3 sm:py-2.5"
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
                            /* Disabled while an answer streams: one question at a
                               time, and the greyed field says so before a second
                               one gets typed. */
                            disabled={busy}
                            placeholder={busy ? "MLBot is answering…" : "Ask about Misha…"}
                            aria-label="Message MLBot"
                            /* 16px, not 13: iOS zooms the page on focus below that, and the zoom
                               shrinks the layout viewport under this inset-0 panel — which is
                               what read as horizontal and vertical overflow. Declining the zoom
                               any other way means user-scalable=no, which fails WCAG 1.4.4. */
                            className="max-h-28 min-h-[44px] min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-2 text-[16px] text-foreground border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground/60"
                        />
                        {busy ? (
                            /* Send becomes Stop while streaming — one slot, no
                               layout shift, and the partial answer stays. */
                            <button
                                type="button"
                                onClick={stop}
                                aria-label="Stop generating"
                                title="Stop generating"
                                className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-80 sm:h-8 sm:w-8"
                            >
                                <Square className="h-3.5 w-3.5 fill-current" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                aria-label="Send"
                                className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30 sm:h-8 sm:w-8"
                            >
                                <ArrowUp className="h-4 w-4" />
                            </button>
                        )}
                    </form>
                </div>
            )}
        </>
    )
}
