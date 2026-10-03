'use client'
import { Viz } from './viz'
import { EVAL_CASES, EVAL_CYCLE, EVAL_GATE, EVAL_MATRIX, EVAL_SUITES, casesDone, evalGate, r1, suiteRate } from './model'

const X0 = 128, CW = 14, GAP = 2

export default function EvalScoreboard() {
  return (
    <Viz title="eval harness: llm-as-judge" desc="Four evaluation suites of 24 cases each are scored by a judge model; pass rates fill in live and a ship gate holds the release when one suite falls under the threshold." staticT={EVAL_CYCLE - 2}>
      {(t) => {
        const lt = t % EVAL_CYCLE
        const done = EVAL_SUITES.map((_, r) => casesDone(lt, r))
        const finished = done.every((n) => n >= EVAL_CASES)
        const g = evalGate(EVAL_MATRIX)
        return (
          <>
            {EVAL_SUITES.map((s, r) => {
              const y = 58 + r * 62
              const n = done[r]
              const rate = suiteRate(EVAL_MATRIX, r, n)
              const bad = n >= EVAL_CASES && rate < EVAL_GATE
              return (
                <g key={s.name}>
                  <text x="16" y={y + 20} fontSize="13.5" fill="var(--viz-fg)">{s.name}</text>
                  <text x="16" y={y + 38} fontSize="12" fill="var(--viz-muted)">{n}/{EVAL_CASES} cases</text>
                  {EVAL_MATRIX[r].map((ok, c) => {
                    const x = X0 + c * (CW + GAP)
                    const judged = c < n
                    return judged ? (
                      ok
                        ? <rect key={c} x={x} y={y + 8} width={CW} height="22" rx="3" fill="var(--viz-accent)" opacity="0.85" />
                        : <g key={c}>
                            <rect x={x} y={y + 8} width={CW} height="22" rx="3" fill="none" stroke="var(--viz-accent-2)" strokeWidth="1.6" />
                            <path d={`M${x + 3} ${y + 14}L${x + CW - 3} ${y + 24}M${x + CW - 3} ${y + 14}L${x + 3} ${y + 24}`} stroke="var(--viz-accent-2)" strokeWidth="1.4" />
                          </g>
                    ) : <rect key={c} x={x} y={y + 8} width={CW} height="22" rx="3" fill="var(--viz-border)" opacity="0.7" />
                  })}
                  <text x="584" y={y + 25} fontSize="17" fontWeight="700" textAnchor="end" fill={bad ? 'var(--viz-accent-2)' : 'var(--viz-fg)'}>{n ? rate.toFixed(2) : '--'}</text>
                </g>
              )
            })}
            {(() => {
              const gx = r1(X0 + EVAL_GATE * (24 * (CW + GAP)))
              return (
                <g>
                  <line x1={gx} x2={gx} y1="50" y2="296" stroke="var(--viz-muted)" strokeDasharray="3 4" opacity="0.7" />
                  <text x={gx} y="312" textAnchor="middle" fontSize="12" fill="var(--viz-muted)">gate {EVAL_GATE.toFixed(2)}</text>
                </g>
              )
            })()}
            <rect x="16" y="326" width="568" height="46" rx="12" fill="var(--viz-surface-2)" stroke={finished ? (g.ok ? 'var(--viz-accent)' : 'var(--viz-accent-2)') : 'var(--viz-border)'} strokeWidth={finished ? 1.6 : 1} />
            <text x="32" y="354" fontSize="14.5" fill="var(--viz-fg)">
              {!finished ? 'judge model scoring cases...' : g.ok ? '✓ ship: every suite clears the gate' : `✕ hold release: ${EVAL_SUITES[g.worst].name} ${g.worstRate.toFixed(2)} < ${EVAL_GATE.toFixed(2)}`}
            </text>
          </>
        )
      }}
    </Viz>
  )
}
