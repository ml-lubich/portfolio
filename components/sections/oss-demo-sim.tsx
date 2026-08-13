"use client"

/**
 * OssDemoSim — the app window a tool actually drives.
 *
 * The terminal next to it shows the command; this shows the result in the app
 * it came from, so "local iMessage CLI" reads as a thread rather than a line of
 * output. Above it, the MCP round-trip that produced it: agent → server → app.
 *
 * Rows reveal in sequence, gated on `active` like DemoTerminal — only the
 * featured tool animates, and reduced-motion visitors get the end state.
 */

import type { OssSim, SimRow } from "@/data/oss-demos"

/** Stagger between rows, and the head start the flow strip takes. */
const ROW_MS = 260
const FLOW_MS = 180

function Bubble({ row, style }: { row: SimRow; style: React.CSSProperties }) {
    const outbound = row.side === "out"

    return (
        <div className={`oss-sim-row flex ${outbound ? "justify-end" : "justify-start"}`} style={style}>
            <div className="max-w-[80%]">
                {row.from && !outbound && (
                    <p className="mb-1 px-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/50">
                        {row.from}
                    </p>
                )}
                <p
                    className={`rounded-2xl px-3 py-1.5 text-[12px] leading-snug ${
                        outbound
                            ? "rounded-br-sm bg-primary/85 text-primary-foreground"
                            : "rounded-bl-sm bg-white/[0.08] text-foreground/90"
                    }`}
                >
                    {row.text}
                </p>
                {row.meta && (
                    <p className={`mt-0.5 px-1 font-mono text-[9px] text-muted-foreground/40 ${outbound ? "text-right" : ""}`}>
                        {row.meta}
                    </p>
                )}
            </div>
        </div>
    )
}

function ListRow({ row, style }: { row: SimRow; style: React.CSSProperties }) {
    return (
        <div
            className="oss-sim-row flex items-start gap-3 rounded-lg border-l-2 border-primary/40 bg-white/[0.03] px-3 py-2"
            style={style}
        >
            <div className="min-w-0 flex-1">
                {row.from && <p className="truncate text-[12px] font-medium text-foreground/90">{row.from}</p>}
                <p className="truncate text-[11px] text-muted-foreground/70">{row.text}</p>
            </div>
            {row.meta && (
                <span className="shrink-0 rounded-full border border-white/[0.08] bg-black/25 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-muted-foreground/50">
                    {row.meta}
                </span>
            )}
        </div>
    )
}

export function OssDemoSim({ sim, active }: { sim: OssSim; active?: boolean }) {
    // Not active: no delays, no animation class effect — the panel just sits at
    // its end state, which is also what the CSS falls back to.
    const delay = (i: number, base: number) => (active ? { animationDelay: `${base + i * ROW_MS}ms` } : {})
    const isChat = sim.kind === "imessage"

    return (
        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-black/25">
            {/* ── MCP round-trip ── */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-white/[0.06] px-3 py-2">
                {sim.flow.map((stage, i) => (
                    <span key={stage} className="flex items-center gap-1.5">
                        {i > 0 && <span className="font-mono text-[9px] text-muted-foreground/30">→</span>}
                        <span
                            className="oss-sim-row rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70"
                            style={delay(i, 0)}
                        >
                            {stage}
                        </span>
                    </span>
                ))}
            </div>

            {/* ── The app window ── */}
            <div className="border-b border-white/[0.06] px-3 py-1.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/45">{sim.app}</p>
            </div>

            <div className={`space-y-2 p-3 ${isChat ? "" : "space-y-1.5"}`}>
                {sim.rows.map((row, i) =>
                    isChat ? (
                        <Bubble key={i} row={row} style={delay(i, sim.flow.length * FLOW_MS)} />
                    ) : (
                        <ListRow key={i} row={row} style={delay(i, sim.flow.length * FLOW_MS)} />
                    ),
                )}
            </div>
        </div>
    )
}
