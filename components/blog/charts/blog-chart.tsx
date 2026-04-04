"use client"

import React from "react"
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type {
  BlogChart,
  ChartColor,
  PipelineChart,
  ComparisonChart,
  PieChartDef,
  TreeChart,
  TreeDecisionNode,
} from "./types"

/* ── Colour map ─────────────────────────────────────────────────── */

const BORDER: Record<ChartColor, string> = {
  blue: "border-l-blue-500",
  green: "border-l-emerald-500",
  red: "border-l-red-500",
  amber: "border-l-amber-500",
  cyan: "border-l-cyan-500",
  purple: "border-l-purple-500",
  default: "border-l-white/30",
}

const BG: Record<ChartColor, string> = {
  blue: "bg-blue-500/10",
  green: "bg-emerald-500/10",
  red: "bg-red-500/10",
  amber: "bg-amber-500/10",
  cyan: "bg-cyan-500/10",
  purple: "bg-purple-500/10",
  default: "bg-white/5",
}

const TEXT_ACCENT: Record<ChartColor, string> = {
  blue: "text-blue-400",
  green: "text-emerald-400",
  red: "text-red-400",
  amber: "text-amber-400",
  cyan: "text-cyan-400",
  purple: "text-purple-400",
  default: "text-white/70",
}

const PIE_HEX: Record<ChartColor, string> = {
  blue: "#3b82f6",
  green: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  cyan: "#06b6d4",
  purple: "#a855f7",
  default: "#94a3b8",
}

const PIE_PALETTE = [
  PIE_HEX.blue,
  PIE_HEX.amber,
  PIE_HEX.green,
  PIE_HEX.red,
  PIE_HEX.cyan,
  PIE_HEX.purple,
]

/* ── Helpers ────────────────────────────────────────────────────── */

function c(color?: ChartColor) {
  return color ?? "default"
}

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-1">
      <div className="h-4 w-px bg-white/20" />
      {label && (
        <span className="max-w-[200px] text-center text-[11px] leading-tight text-white/50">
          {label}
        </span>
      )}
      <div className="text-white/30 text-xs leading-none">▼</div>
    </div>
  )
}

function Node({
  label,
  color = "default",
}: {
  label: string
  color?: ChartColor
}) {
  return (
    <div
      className={`
        w-full max-w-xs rounded-lg border-l-[3px] px-4 py-2.5
        text-center text-sm leading-snug text-balance text-white/90 font-medium
        ${BORDER[color]} ${BG[color]}
      `}
    >
      {label}
    </div>
  )
}

/* ── Pipeline ───────────────────────────────────────────────────── */

function PipelineRenderer({ chart }: { chart: PipelineChart }) {
  return (
    <div className="flex flex-col items-center">
      {chart.steps.map((step, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Arrow label={chart.steps[i - 1].annotation} />}
          <Node label={step.label} color={c(step.color)} />
        </React.Fragment>
      ))}
    </div>
  )
}

/* ── Comparison ─────────────────────────────────────────────────── */

function ComparisonRenderer({ chart }: { chart: ComparisonChart }) {
  const leftColor = c(chart.left.color)
  const rightColor = c(chart.right.color)

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
      {/* Left side */}
      <div className="flex min-w-0 flex-col items-center">
        <h4 className={`mb-3 text-center text-sm font-semibold ${TEXT_ACCENT[leftColor]}`}>
          {chart.left.title}
        </h4>
        <div className="flex w-full max-w-sm flex-col items-center">
          {chart.left.steps.map((step, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Arrow />}
              <Node label={step} color={leftColor} />
            </React.Fragment>
          ))}
        </div>
      </div>
      {/* Right side */}
      <div className="flex min-w-0 flex-col items-center">
        <h4 className={`mb-3 text-center text-sm font-semibold ${TEXT_ACCENT[rightColor]}`}>
          {chart.right.title}
        </h4>
        <div className="flex w-full max-w-sm flex-col items-center">
          {chart.right.steps.map((step, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Arrow />}
              <Node label={step} color={rightColor} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Pie ────────────────────────────────────────────────────────── */

function PieRenderer({ chart }: { chart: PieChartDef }) {
  const data = chart.data.map((d, i) => ({
    name: d.label,
    value: d.value,
    fill: d.color ? PIE_HEX[d.color] : PIE_PALETTE[i % PIE_PALETTE.length],
  }))

  return (
    <div className="flex flex-col items-center gap-4">
      <ResponsiveContainer width="100%" height={260}>
        <RechartsPie>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={45}
            strokeWidth={0}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "hsl(220 20% 8%)",
              border: "1px solid hsl(220 15% 18%)",
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: "13px",
            }}
          />
        </RechartsPie>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-white/70">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: d.fill }}
            />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Tree ───────────────────────────────────────────────────────── */

function isDecision(step: string | TreeDecisionNode): step is TreeDecisionNode {
  return typeof step !== "string" && "branches" in step
}

function TreeRenderer({ chart }: { chart: TreeChart }) {
  const baseColor = c(chart.color)

  return (
    <div className="flex flex-col items-center">
      {chart.steps.map((step, i) => {
        if (typeof step === "string") {
          return (
            <React.Fragment key={i}>
              {i > 0 && <Arrow />}
              <Node label={step} color={baseColor} />
            </React.Fragment>
          )
        }

        if (isDecision(step)) {
          return (
            <React.Fragment key={i}>
              {i > 0 && <Arrow />}
              {/* Decision node */}
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-300">
                {step.label}
              </div>
              {/* Branches */}
              <div className="mt-2 grid w-full gap-3" style={{
                gridTemplateColumns: `repeat(${step.branches.length}, minmax(0, 1fr))`,
              }}>
                {step.branches.map((branch, bi) => {
                  const branchColor = c(branch.color)
                  return (
                    <div key={bi} className="flex flex-col items-center">
                      <span className={`mb-1 text-[11px] font-medium ${TEXT_ACCENT[branchColor]}`}>
                        {branch.condition}
                      </span>
                      <div className="text-white/30 text-xs leading-none mb-1">▼</div>
                      {branch.steps.map((s, si) => (
                        <React.Fragment key={si}>
                          {si > 0 && <Arrow />}
                          <Node label={s} color={branchColor} />
                        </React.Fragment>
                      ))}
                      {branch.loop && (
                        <div className="mt-1.5 text-[11px] text-white/40 italic">
                          ↩ back to &ldquo;{branch.loop}&rdquo;
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </React.Fragment>
          )
        }

        return null
      })}
    </div>
  )
}

/* ── Main renderer ──────────────────────────────────────────────── */

export function BlogChart({ json, className = "" }: { json: string; className?: string }) {
  let chart: BlogChart

  try {
    chart = JSON.parse(json) as BlogChart
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return (
      <div className={`rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400 ${className}`}>
        Invalid chart JSON: {msg}
      </div>
    )
  }

  return (
    <div
      className={`mb-8 mt-0 rounded-xl border border-white/[0.06] bg-[hsl(220_20%_6%)] px-6 pb-6 pt-0 [&>:first-child]:pt-2 ${className}`}
    >
      {chart.title && (
        <h3 className="no-metallic mb-4 !mt-0 text-center text-sm font-semibold text-white/60">
          {chart.title}
        </h3>
      )}
      {chart.type === "pipeline" && <PipelineRenderer chart={chart} />}
      {chart.type === "comparison" && <ComparisonRenderer chart={chart} />}
      {chart.type === "pie" && <PieRenderer chart={chart} />}
      {chart.type === "tree" && <TreeRenderer chart={chart} />}
    </div>
  )
}
