"use client"

/**
 * A macOS-chrome window rendering one `MacDemo` step.
 *
 * Messages, Mail and Notes are all list/detail, so one component covers all
 * three from data — the only branch is bubbles vs. body copy in the detail
 * pane. Presentational: the parent owns which step is showing.
 */

import type { CSSProperties } from "react"
import type { MacDemo, MacDemoStep } from "@/data/mac-demos"

const TRAFFIC = ["#ff5f56", "#ffbd2e", "#27c93f"] as const

export function MacWindow({ demo, step }: { demo: MacDemo; step: MacDemoStep }) {
    return (
        <div className="mac-window overflow-hidden rounded-xl">
            {/* Title bar */}
            <div className="mac-titlebar flex items-center gap-2 px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                    {TRAFFIC.map((c) => (
                        <span key={c} className="h-3 w-3 rounded-full" style={{ background: c }} />
                    ))}
                </div>
                <p className="flex-1 text-center text-[12px] font-medium text-foreground/70">{demo.app}</p>
                {/* Balances the traffic lights so the title stays optically centred. */}
                <div className="w-[52px]" aria-hidden />
            </div>

            <div className="flex min-h-[15rem]">
                {/* Sidebar */}
                <div className="mac-sidebar w-[38%] shrink-0 py-2 sm:w-[40%]">
                    <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {demo.sidebarTitle}
                    </p>
                    {/* Keyed on the command so a step change replays the entrance
                        rather than mutating rows in place. */}
                    <ul key={`rows-${step.command}`}>
                        {step.rows.map((row, i) => (
                            <li
                                key={row.title}
                                style={{ "--i": i } as CSSProperties}
                                className={`mac-row-in mx-1.5 rounded-md px-2 py-1.5 transition-colors duration-300 ${
                                    i === step.activeRow ? "mac-row-active" : ""
                                }`}
                            >
                                <div className="flex items-center gap-1.5">
                                    {row.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-glow)]" />}
                                    <p className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-foreground/90">
                                        {row.title}
                                    </p>
                                    {row.meta && <span className="shrink-0 text-[10px] text-muted-foreground">{row.meta}</span>}
                                </div>
                                <p className="truncate pl-0 text-[10.5px] text-muted-foreground">{row.preview}</p>
                                {row.tag && (
                                    <span className="mt-1 inline-block rounded border border-[var(--line-soft)] px-1 py-px text-[9px] uppercase tracking-wide text-muted-foreground">
                                        {row.tag}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Detail */}
                <div key={`detail-${step.command}`} className="mac-pane mac-detail min-w-0 flex-1 px-3.5 py-3">
                    <p className="truncate text-[12.5px] font-semibold text-foreground">{step.detail.title}</p>
                    {step.detail.subtitle && (
                        <p className="mb-2.5 truncate text-[10.5px] text-muted-foreground">{step.detail.subtitle}</p>
                    )}

                    {step.detail.bubbles && (
                        <div className="space-y-1.5 pt-1">
                            {step.detail.bubbles.map((b, i) => (
                                <div key={i} className={b.from === "me" ? "flex justify-end" : "flex justify-start"}>
                                    <p
                                        style={{ "--i": i } as CSSProperties}
                                        className={`mac-bubble-in max-w-[85%] rounded-2xl px-2.5 py-1.5 text-[11px] leading-snug ${
                                            b.from === "me" ? "mac-bubble-me" : "mac-bubble-them"
                                        }`}
                                    >
                                        {b.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {step.detail.body && (
                        <div className="space-y-0.5 pt-0.5">
                            {step.detail.body.map((line, i) => (
                                <p
                                    key={i}
                                    className="whitespace-pre-wrap font-mono text-[10.5px] leading-relaxed text-foreground/75"
                                >
                                    {line || " "}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
