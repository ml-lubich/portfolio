'use client'
import { useState } from 'react'
import { Dot, Viz } from './viz'
import { r1 } from './model'

const STAGES = [
  { name: 'Ingest', d: 'pull documents into one clean corpus', icon: 'M12 4v10M8 10l4 4 4-4M5 19h14' },
  { name: 'Chunk', d: 'split into overlapping passages', icon: 'M4 6h7M13 6h7M4 12h7M13 12h7M4 18h7M13 18h7' },
  { name: 'Embed', d: 'turn each passage into a vector', icon: 'M5 18L10 9L14 14L19 5' },
  { name: 'Index', d: 'store vectors for similarity search', icon: 'M5 6c0-2 14-2 14 0v12c0 2-14 2-14 0zM5 6c0 2 14 2 14 0M5 12c0 2 14 2 14 0' },
  { name: 'Retrieve', d: 'find the top-k passages for a question', icon: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5L20 20' },
  { name: 'LLM', d: 'answer from what was retrieved', icon: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z' },
  { name: 'Evaluate', d: 'score faithfulness before shipping', icon: 'M5 12l4 4 10-10' },
]
const SEG = 150, TOTAL = 900, SPEED = 90
const pos = (s: number): [number, number] => (s < 450 ? [75 + s, 110] : s < 600 ? [525, 110 + s - 450] : [525 - (s - 600), 260])
const RESULTS = [1, 1, 1, 0, 1, 1, 0, 1, 1, 1]

export default function RagPipeline() {
  const [hover, setHover] = useState<number | null>(null)
  return (
    <Viz title="rag pipeline" desc="Retrieval-augmented generation pipeline: ingest, chunk, embed, index, retrieve, LLM, evaluate, with an eval ticker." staticT={1.2}>
      {(t) => {
        const heads = [0, 1, 2].map((k) => (t * SPEED + k * 300) % TOTAL)
        const near = (i: number) => Math.min(...heads.map((h) => Math.abs(h - i * SEG)))
        const lead = Math.round(heads[0] / SEG) % STAGES.length
        const shown = hover ?? lead
        const tick = Math.floor(t / 1.5)
        const last = [0, 1, 2].map((k) => RESULTS[(tick + k) % RESULTS.length])
        return (
          <>
            <path d="M75 110H525V260H225" fill="none" stroke="var(--viz-border)" strokeWidth="2" strokeDasharray="4 6" />
            {STAGES.map((s, i) => {
              const [x, y] = pos(i * SEG)
              const lit = near(i) < 28 || hover === i
              return (
                <g key={s.name} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                  <rect x={r1(x - 59)} y={r1(y - 34)} width="118" height="68" rx="14" fill="var(--viz-surface-2)" stroke={lit ? 'var(--viz-accent)' : 'var(--viz-border)'} strokeWidth={lit ? 1.7 : 1} />
                  {lit && <rect x={r1(x - 59)} y={r1(y - 34)} width="118" height="68" rx="14" fill="var(--viz-accent)" opacity="0.12" />}
                  <g transform={`translate(${r1(x - 9)} ${r1(y - 27)}) scale(0.75)`} fill="none" stroke={lit ? 'var(--viz-accent)' : 'var(--viz-muted)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.icon} />
                  </g>
                  <text x={r1(x)} y={r1(y + 23)} textAnchor="middle" fontSize="14" fill="var(--viz-fg)">{s.name}</text>
                </g>
              )
            })}
            {heads.map((h, k) => { const [x, y] = pos(h); return <Dot key={k} x={r1(x)} y={r1(y)} /> })}
            <g>
              <rect x="16" y="226" width="118" height="68" rx="14" fill="none" stroke="var(--viz-border)" strokeDasharray="3 4" />
              <text x="75" y="248" textAnchor="middle" fontSize="12.5" fill="var(--viz-muted)">eval ticker</text>
              {last.map((ok, k) => (
                <circle key={k} cx={55 + k * 20} cy="264" r="5" fill={ok ? 'var(--viz-accent)' : 'var(--viz-accent-2)'} opacity={0.45 + k * 0.275} />
              ))}
              <text x="75" y="286" textAnchor="middle" fontSize="12.5" fill={last[2] ? 'var(--viz-accent-text)' : 'var(--viz-accent-2)'}>{last[2] ? 'pass' : 'fail'}</text>
            </g>
            <text x="300" y="368" textAnchor="middle" fontSize="14" fill="var(--viz-muted)">
              <tspan fill="var(--viz-fg)">{STAGES[shown].name.toLowerCase()}</tspan>: {STAGES[shown].d}
            </text>
          </>
        )
      }}
    </Viz>
  )
}
