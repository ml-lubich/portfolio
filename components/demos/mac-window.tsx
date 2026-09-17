"use client"

/**
 * Mini app window for one `MacDemo` step — each skin mimics the real UI
 * (Messages blue bubbles, Notes yellow paper, Jenkins console, etc.).
 */

import type { CSSProperties } from "react"
import type { MacDemo, MacDemoStep, MacRow } from "@/data/mac-demos"

const TRAFFIC = ["#ff5f56", "#ffbd2e", "#27c93f"] as const

function JenkinsOrb({ status }: { status: MacRow["status"] }) {
    if (!status) return null
    return <span className={`mac-jenkins-orb mac-jenkins-orb--${status}`} aria-hidden />
}

function MetaBadge({ meta, skin }: { meta: string; skin: MacDemo["skin"] }) {
    if (skin !== "bitbucket") {
        return <span className="mac-row-meta">{meta}</span>
    }
    const tone =
        meta === "OPEN" ? "mac-bb-badge--open" : meta === "DONE" ? "mac-bb-badge--done" : "mac-bb-badge--neutral"
    return <span className={`mac-bb-badge ${tone}`}>{meta}</span>
}

function MacTitleBar({ demo, step }: { demo: MacDemo; step: MacDemoStep }) {
    if (demo.skin === "whatsapp") {
        const chatTitle = step.detail.bubbles ? step.detail.title : demo.app
        return (
            <div className="mac-wa-header">
                <span className="mac-wa-back" aria-hidden>
                    ‹
                </span>
                <span className="mac-wa-avatar" aria-hidden>
                    {chatTitle.charAt(0)}
                </span>
                <p className="mac-wa-title">{chatTitle}</p>
            </div>
        )
    }

    if (demo.skin === "jenkins") {
        return (
            <div className="mac-jenkins-header">
                <span className="mac-jenkins-logo">Jenkins</span>
                <span className="mac-jenkins-crumb">{step.detail.title}</span>
            </div>
        )
    }

    if (demo.skin === "bitbucket") {
        return (
            <div className="mac-bb-header">
                <span className="mac-bb-logo">◆</span>
                <span className="mac-bb-title">Bitbucket</span>
                <span className="mac-bb-crumb">{demo.sidebarTitle}</span>
            </div>
        )
    }

    return (
        <div className="mac-titlebar flex items-center gap-2 px-3 py-2.5">
            <div className="flex items-center gap-1.5">
                {TRAFFIC.map((c) => (
                    <span key={c} className="h-3 w-3 rounded-full" style={{ background: c }} />
                ))}
            </div>
            <p className="mac-titlebar-label flex-1 text-center text-[12px] font-medium">{demo.app}</p>
            <div className="w-[52px]" aria-hidden />
        </div>
    )
}

export function MacWindow({ demo, step }: { demo: MacDemo; step: MacDemoStep }) {
    const isChat = Boolean(step.detail.bubbles)
    const isConsole = demo.skin === "jenkins" && Boolean(step.detail.body)

    return (
        <div className={`mac-window mac-skin-${demo.skin} overflow-hidden rounded-xl`}>
            <MacTitleBar demo={demo} step={step} />

            <div className="flex min-h-[15rem]">
                <div className="mac-sidebar w-[38%] shrink-0 py-2 sm:w-[40%]">
                    <p className="mac-sidebar-label px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider">
                        {demo.sidebarTitle}
                    </p>
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
                                    {demo.skin === "jenkins" ? (
                                        <JenkinsOrb status={row.status} />
                                    ) : (
                                        row.unread && <span className="mac-unread-dot h-1.5 w-1.5 shrink-0 rounded-full" />
                                    )}
                                    <p className="mac-row-title min-w-0 flex-1 truncate text-[11.5px] font-medium">
                                        {row.title}
                                    </p>
                                    {row.meta && <MetaBadge meta={row.meta} skin={demo.skin} />}
                                </div>
                                <p className="mac-row-preview truncate pl-0 text-[10.5px]">{row.preview}</p>
                                {row.tag && <span className="mac-mail-tag mt-1 inline-block rounded px-1 py-px text-[9px] uppercase tracking-wide">{row.tag}</span>}
                            </li>
                        ))}
                    </ul>
                </div>

                <div
                    key={`detail-${step.command}`}
                    className={`mac-pane mac-detail min-w-0 flex-1 px-3.5 py-3 ${isConsole ? "mac-jenkins-console" : ""} ${demo.skin === "notes" ? "mac-notes-paper" : ""}`}
                >
                    <p className="mac-detail-title truncate text-[12.5px] font-semibold">{step.detail.title}</p>
                    {step.detail.subtitle && (
                        <p className="mac-detail-subtitle mb-2.5 truncate text-[10.5px]">{step.detail.subtitle}</p>
                    )}

                    {step.detail.bubbles && (
                        <div className="mac-chat-thread space-y-1.5 pt-1">
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
                        <div className={`space-y-0.5 pt-0.5 ${isConsole ? "mac-jenkins-log" : ""}`}>
                            {step.detail.body.map((line, i) => (
                                <p
                                    key={i}
                                    className={`mac-detail-line whitespace-pre-wrap font-mono text-[10.5px] leading-relaxed ${
                                        isConsole && line.includes("FAILED") ? "mac-jenkins-log--fail" : ""
                                    } ${isConsole && line.includes("AssertionError") ? "mac-jenkins-log--error" : ""}`}
                                >
                                    {line || " "}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
