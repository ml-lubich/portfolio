'use client'
import type { ReactNode } from 'react'
import { MONO } from './theme'
import { useClock } from './use-viz'

/**
 * Shared frame for every SVG visual: fixed 3:2 box (no layout shift when tabs
 * swap), a title row, and the "illustrative" label that every visual carries.
 * Children receive the clock `t` and draw into a 600x400 viewBox below y=34.
 */
export function Viz({ title, desc, staticT = 0, children }: {
  title: string
  desc: string
  staticT?: number
  children: (t: number) => ReactNode
}) {
  const [ref, t] = useClock(staticT)
  return (
    <div
      ref={ref}
      className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border"
      style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-surface)' }}
    >
      <p className="sr-only">{desc} Illustrative simulation, not real measurements.</p>
      <svg viewBox="0 0 600 400" className="absolute inset-0 h-full w-full" aria-hidden="true" fontFamily={MONO}>
        <text x="16" y="22" fontSize="12.5" fill="var(--viz-fg)">{title}</text>
        <text x="584" y="22" fontSize="12" textAnchor="end" fill="var(--viz-muted)">illustrative</text>
        <line x1="16" x2="584" y1="31" y2="31" stroke="var(--viz-border)" />
        {children(t)}
      </svg>
    </div>
  )
}

/** Soft dot: halo + core, used for packets and heads. */
export function Dot({ x, y, r = 4, color = 'var(--viz-accent)' }: { x: number; y: number; r?: number; color?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r * 2.6} fill={color} opacity="0.22" />
      <circle cx={x} cy={y} r={r} fill={color} />
    </g>
  )
}
