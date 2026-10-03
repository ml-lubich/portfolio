'use client'
import { Viz } from './viz'
import { SPANS, TOKENS, TOTAL_MS, TTFT_MS, WATERFALL_CYCLE, playheadMs, r1, spanFill, tokensAt, tokensPerSecond } from './model'

const X0 = 130, X1 = 576
const sx = (ms: number) => X0 + ((X1 - X0) * ms) / TOTAL_MS

export default function LatencyWaterfall() {
  return (
    <Viz title="token streaming latency waterfall" desc="A request timeline: input guard, retrieval, prompt build, queue and prefill, then decode streaming tokens while the output guard filters in parallel. Time to first token and tokens per second are read off the bars." staticT={WATERFALL_CYCLE - 1}>
      {(t) => {
        const ms = playheadMs(t)
        const toks = tokensAt(ms)
        const px = r1(sx(ms))
        return (
          <>
            {[0, 500, 1000, 1500, 2000, 2500].map((m) => (
              <g key={m}>
                <line x1={r1(sx(m))} x2={r1(sx(m))} y1="42" y2="262" stroke="var(--viz-border)" strokeDasharray="2 5" />
                <text x={r1(sx(m))} y="278" textAnchor="middle" fontSize="12" fill="var(--viz-muted)">{m}</text>
              </g>
            ))}
            <text x="584" y="294" textAnchor="end" fontSize="12" fill="var(--viz-muted)">ms (slowed down for viewing)</text>
            {SPANS.map((s, i) => {
              const y = 48 + i * 36
              const f = spanFill(s, ms)
              const w = (sx(s.end) - sx(s.start)) * f
              const stream = s.id === 'decode'
              return (
                <g key={s.id}>
                  <text x="16" y={y + 17} fontSize="13" fill={f > 0 ? 'var(--viz-fg)' : 'var(--viz-muted)'}>{s.label}</text>
                  <rect x={r1(sx(s.start))} y={y + 3} width={r1(Math.max(w, 0))} height="20" rx="4" fill={stream ? 'var(--viz-accent)' : s.id === 'guard-out' ? 'var(--viz-accent-2)' : 'color-mix(in srgb, var(--viz-accent) 55%, var(--viz-surface-2))'} />
                  {stream && Array.from({ length: Math.floor(toks / 2) }, (_, k) => (
                    <line key={k} x1={r1(sx(s.start) + ((sx(s.end) - sx(s.start)) * (k * 2)) / TOKENS)} x2={r1(sx(s.start) + ((sx(s.end) - sx(s.start)) * (k * 2)) / TOKENS)} y1={y + 3} y2={y + 23} stroke="var(--viz-surface)" strokeWidth="1.2" opacity="0.6" />
                  ))}
                </g>
              )
            })}
            <line x1={px} x2={px} y1="42" y2="262" stroke="var(--viz-fg)" strokeWidth="1.2" opacity="0.8" />
            {ms >= TTFT_MS && (
              <g>
                <line x1={r1(sx(TTFT_MS))} x2={r1(sx(TTFT_MS))} y1="42" y2="262" stroke="var(--viz-accent-text)" strokeWidth="1.6" />
                <text x={r1(sx(TTFT_MS)) - 6} y="56" textAnchor="end" fontSize="12.5" fontWeight="700" fill="var(--viz-accent-text)">first token</text>
              </g>
            )}
            <g fontSize="14">
              <rect x="16" y="310" width="568" height="62" rx="12" fill="var(--viz-surface-2)" stroke="var(--viz-border)" />
              <text x="32" y="337" fill="var(--viz-muted)">time to first token <tspan fill="var(--viz-fg)" fontWeight="700">{ms >= TTFT_MS ? `${TTFT_MS} ms` : '--'}</tspan></text>
              <text x="32" y="360" fill="var(--viz-muted)">streaming <tspan fill="var(--viz-fg)" fontWeight="700">{ms >= TTFT_MS ? `${tokensPerSecond()} tok/s` : '--'}</tspan></text>
              <text x="570" y="337" textAnchor="end" fill="var(--viz-muted)">tokens <tspan fill="var(--viz-fg)" fontWeight="700">{toks}/{TOKENS}</tspan></text>
              <text x="570" y="360" textAnchor="end" fill="var(--viz-muted)">total <tspan fill="var(--viz-fg)" fontWeight="700">{ms >= TOTAL_MS ? `${TOTAL_MS} ms` : '--'}</tspan></text>
            </g>
          </>
        )
      }}
    </Viz>
  )
}
