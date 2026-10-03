'use client'
import { Viz } from './viz'
import { ANSWER_LINES, CHUNKS, TRACE_QUERY, lerp, r1, rerankRank, traceState } from './model'

const ROW = 46, Y0 = 92, BAR = 90

export default function RagTrace() {
  return (
    <Viz title="retrieval trace with citations" desc="A question is embedded, five candidate passages are scored by vector similarity then reranked, and the answer streams with citation markers pointing to the top two passages." staticT={8.8}>
      {(t) => {
        const s = traceState(t)
        const reranked = s.rerank > 0.5
        const typed = TRACE_QUERY.slice(0, s.typed)
        let left = s.chars
        const lines = ANSWER_LINES.map((l) => { const n = Math.max(0, Math.min(l.length, left)); left -= l.length; return l.slice(0, n) })
        return (
          <>
            <rect x="16" y="42" width="568" height="30" rx="9" fill="var(--viz-surface-2)" stroke="var(--viz-border)" />
            <text x="28" y="62" fontSize="14" fill="var(--viz-fg)">{typed}{s.typed < TRACE_QUERY.length ? '▌' : ''}</text>
            {CHUNKS.map((c, i) => {
              const y = lerp(Y0 + i * ROW, Y0 + rerankRank(i) * ROW, s.rerank)
              const top = reranked && rerankRank(i) < 2
              const dim = reranked && !top
              const v = reranked ? c.rerank : c.sim
              return (
                <g key={c.id} opacity={dim ? 0.55 : 1}>
                  <rect x="16" y={r1(y)} width="318" height={ROW - 8} rx="10" fill="var(--viz-surface-2)" stroke={top ? 'var(--viz-accent)' : 'var(--viz-border)'} strokeWidth={top ? 1.6 : 1} />
                  <text x="28" y={r1(y + 24)} fontSize="13" fill="var(--viz-fg)">{c.id}</text>
                  <rect x="168" y={r1(y + 14)} width={BAR} height="8" rx="4" fill="var(--viz-border)" />
                  <rect x="168" y={r1(y + 14)} width={r1(BAR * v * s.bars)} height="8" rx="4" fill={reranked ? 'var(--viz-accent)' : 'var(--viz-accent-2)'} />
                  <text x="264" y={r1(y + 23)} fontSize="12.5" textAnchor="start" fill="var(--viz-muted)">{(v * s.bars).toFixed(2)}</text>
                  {top && <text x="328" y={r1(y + 24)} fontSize="13" fontWeight="700" textAnchor="end" fill="var(--viz-accent-text)">[{rerankRank(i) + 1}]</text>}
                </g>
              )
            })}
            <text x="16" y="336" fontSize="12.5" fill="var(--viz-muted)">{reranked ? 'bars: reranker score' : 'bars: vector similarity'}</text>
            <rect x="350" y="84" width="234" height="248" rx="12" fill="var(--viz-surface-2)" stroke="var(--viz-border)" />
            <text x="364" y="108" fontSize="12.5" fill="var(--viz-muted)">answer (grounded)</text>
            {lines.map((l, i) => (
              <text key={i} x="364" y={140 + i * 26} fontSize="14" fill="var(--viz-fg)">{l}</text>
            ))}
            {s.chars >= ANSWER_LINES.join('').length && (
              <g fontSize="13">
                <text x="364" y="236" fill="var(--viz-accent-text)">[1] keys.md §2</text>
                <text x="364" y="260" fill="var(--viz-accent-text)">[2] rotate.md §1</text>
              </g>
            )}
            <text x="300" y="384" textAnchor="middle" fontSize="13.5" fill="var(--viz-muted)">
              {s.typed < TRACE_QUERY.length ? 'embedding the question' : !reranked ? 'scoring 5 candidate passages' : s.chars < 4 ? 'reranked: keeping the top 2' : 'answer cites its sources'}
            </text>
          </>
        )
      }}
    </Viz>
  )
}
