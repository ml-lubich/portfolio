"use client"

/**
 * Renders a chart spec emitted by an MLBot tool call.
 * Uses recharts (already a site dependency) — no new charting library.
 */

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

export interface ChartSpec {
    kind: "bar" | "line" | "radar"
    title: string
    unit?: string
    data: { label: string; value: number }[]
}

const AXIS = { fontSize: 10, fill: "hsl(var(--muted-foreground))" } as const

export function ChatChart({ spec }: { spec: ChartSpec }) {
    if (!spec?.data?.length) return null

    // Horizontal bars: skill/tech labels are words, and they stay readable in a
    // 22rem panel only when the category axis runs down the side.
    const isBar = spec.kind !== "line"

    return (
        <figure className="my-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
            <figcaption className="mb-2 text-[11px] font-medium text-muted-foreground">
                {spec.title}
                {spec.unit ? ` (${spec.unit})` : ""}
            </figcaption>

            <div style={{ height: Math.max(150, spec.data.length * (isBar ? 34 : 18) + 24) }}>
                <ResponsiveContainer width="100%" height="100%">
                    {isBar ? (
                        <BarChart data={spec.data} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
                            <CartesianGrid horizontal={false} stroke="hsl(var(--border))" strokeOpacity={0.3} />
                            <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} />
                            <YAxis
                                type="category"
                                dataKey="label"
                                width={92}
                                interval={0}
                                tick={AXIS}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Bar dataKey="value" fill="var(--accent-glow)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    ) : (
                        <LineChart data={spec.data} margin={{ left: 4, right: 12, top: 8, bottom: 4 }}>
                            <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />
                            <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} width={24} />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="var(--accent-glow)"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                            />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>
        </figure>
    )
}
