"use client"

/**
 * OssDemoSim — compact app window with authentic per-tool chrome.
 */

import type { OssSim, SimKind, SimRow } from "@/data/oss-demos"

const ROW_MS = 260
const FLOW_MS = 180

function skinClass(kind: SimKind): string {
    return `oss-sim-skin-${kind}`
}

function Bubble({ row, style }: { row: SimRow; style: React.CSSProperties }) {
    const outbound = row.side === "out"

    return (
        <div className={`oss-sim-row flex ${outbound ? "justify-end" : "justify-start"}`} style={style}>
            <div className="max-w-[80%]">
                {row.from && !outbound && (
                    <p className="oss-sim-from mb-1 px-1 font-mono text-[9px] uppercase tracking-wider">{row.from}</p>
                )}
                <p
                    className={`oss-sim-bubble rounded-2xl px-3 py-1.5 text-[12px] leading-snug ${
                        outbound ? "oss-sim-bubble-out rounded-br-sm" : "oss-sim-bubble-in rounded-bl-sm"
                    }`}
                >
                    {row.text}
                </p>
                {row.meta && (
                    <p className={`oss-sim-meta mt-0.5 px-1 font-mono text-[9px] ${outbound ? "text-right" : ""}`}>
                        {row.meta}
                    </p>
                )}
            </div>
        </div>
    )
}

function ListRow({ row, style }: { row: SimRow; style: React.CSSProperties }) {
    return (
        <div className="oss-sim-row oss-sim-list-row flex items-start gap-3 rounded-lg px-3 py-2" style={style}>
            <div className="min-w-0 flex-1">
                {row.from && <p className="oss-sim-list-from truncate text-[12px] font-medium">{row.from}</p>}
                <p className="oss-sim-list-text truncate text-[11px]">{row.text}</p>
            </div>
            {row.meta && <span className="oss-sim-list-meta shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider">{row.meta}</span>}
        </div>
    )
}

function VercelAccountFlow() {
    return (
        <svg className="oss-vgate-flow" viewBox="0 0 480 92" role="img" aria-label="Saved account token routes through vgate to the Vercel CLI">
            <path d="M82 45H398" fill="none" stroke="hsl(var(--primary) / .35)" strokeWidth="2" />
            {[{ x: 18, title: "Account", detail: "personal" }, { x: 188, title: "vgate", detail: "secure switch" }, { x: 358, title: "Vercel CLI", detail: "authenticated" }].map((node) => (
                <g key={node.title}>
                    <rect x={node.x} y="18" width="106" height="54" rx="12" fill="#10131b" stroke="hsl(var(--primary) / .48)" />
                    <text x={node.x + 53} y="40" textAnchor="middle" className="oss-vgate-title">{node.title}</text>
                    <text x={node.x + 53} y="57" textAnchor="middle" className="oss-vgate-detail">{node.detail}</text>
                </g>
            ))}
            <circle className="oss-vgate-packet" cx="83" cy="45" r="4" fill="hsl(var(--primary))" />
        </svg>
    )
}

export function OssDemoSim({ sim, active }: { sim: OssSim; active?: boolean }) {
    const delay = (i: number, base: number) => (active ? { animationDelay: `${base + i * ROW_MS}ms` } : {})
    const isChat = sim.kind === "whatsapp"

    return (
        <div className={`oss-sim-window overflow-hidden rounded-xl ${skinClass(sim.kind)}`}>
            <div className="oss-sim-flow flex flex-wrap items-center gap-1.5 border-b px-3 py-2">
                {sim.flow.map((stage, i) => (
                    <span key={stage} className="flex items-center gap-1.5">
                        {i > 0 && <span className="oss-sim-flow-arrow font-mono text-[9px]">→</span>}
                        <span
                            className="oss-sim-row oss-sim-flow-stage rounded-md px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                            style={delay(i, 0)}
                        >
                            {stage}
                        </span>
                    </span>
                ))}
            </div>

            <div className="oss-sim-titlebar border-b px-3 py-1.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em]">{sim.app}</p>
            </div>

            {sim.kind === "vercel" && <VercelAccountFlow />}

            <div className={`oss-sim-body space-y-2 p-3 ${isChat ? "" : "space-y-1.5"}`}>
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
