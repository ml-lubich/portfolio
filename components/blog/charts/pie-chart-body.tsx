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
  )
}
