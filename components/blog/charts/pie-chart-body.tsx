"use client"

import React from "react"
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

/* Recharts wrapper, separated so it lives in its own chunk loaded by
   `next/dynamic` from `blog-chart.tsx`. Keeps the ~200KB recharts bundle
   off blog routes that don't render a `pie` chart (e.g. blog listing,
   most posts that only use pipeline / comparison / tree). */

interface PieDatum {
  name: string
  value: number
  fill: string
}

/* Labels ride INSIDE the ring. Outside them, a long series name runs past the
   card in any narrow container — a chat panel clipped "Water Quality 33%" down
   to "r Quality 33%". The legend beneath already names every slice, so only
   the share needs drawing, and a slice too thin to hold it gets none. */
function renderSliceLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
}) {
  if (percent < 0.06) return null

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const rad = -midAngle * (Math.PI / 180)

  return (
    <text
      x={cx + radius * Math.cos(rad)}
      y={cy + radius * Math.sin(rad)}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function PieChartBody({ data }: { data: PieDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RechartsPie>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius="80%"
          innerRadius="36%"
          strokeWidth={0}
          label={renderSliceLabel}
          labelLine={false}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
            fontSize: "13px",
          }}
        />
      </RechartsPie>
    </ResponsiveContainer>
  )
}
