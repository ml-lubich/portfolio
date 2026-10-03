'use client'
import { Viz } from './viz'
import { GATE_X, GUARD_REQS, GUARD_SPAWN, GUARD_STAGES, TRACK_X0, TRACK_X1, guardPos, guardTally, r1 } from './model'

const LANES = [96, 160, 224]

export default function GuardrailPipeline() {
  return (
    <Viz title="guardrail filter pipeline" desc="Requests flow through an input filter, a policy check, the model and an output check. Some pass, some are redacted, and some are blocked or refused at the stage that catches them." staticT={9.5}>
      {(t) => {
        const cur = Math.floor(t / GUARD_SPAWN)
        const items = []
        for (let i = cur - 8; i <= cur; i++) {
          const p = i >= 0 ? guardPos(i, t) : null
          if (p) items.push({ i, p })
        }
        const tally = guardTally(t)
        const recent = items.filter(({ p }) => p.done).slice(-1)[0]
        return (
          <>
            {GATE_X.map((x, k) => (
              <g key={k}>
                <line x1={x} x2={x} y1="50" y2="266" stroke="var(--viz-border)" strokeWidth="1.6" />
                <rect x={x - 50} y="42" width="100" height="22" rx="7" fill="var(--viz-surface-2)" stroke="var(--viz-border)" />
                <text x={x} y="57.5" textAnchor="middle" fontSize="11.5" fill="var(--viz-fg)">{GUARD_STAGES[k]}</text>
              </g>
            ))}
            {LANES.map((y) => <line key={y} x1={TRACK_X0} x2={TRACK_X1} y1={y} y2={y} stroke="var(--viz-border)" strokeDasharray="2 6" />)}
            {items.map(({ i, p }) => {
              const y = LANES[p.lane]
              const bad = p.req.fate === 'block' && p.done
              const red = p.req.fate === 'redact' && p.x > GATE_X[0]
              const col = bad ? 'var(--viz-accent-2)' : 'var(--viz-accent)'
              return (
                <g key={i} opacity={r1(p.fade)}>
                  <circle cx={r1(p.x)} cy={y} r="6" fill={col} />
                  {bad && <text x={r1(p.x)} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--viz-surface)">✕</text>}
                  <text x={r1(Math.min(520, Math.max(80, p.x)))} y={y - 12} textAnchor="middle" fontSize="12" fill="var(--viz-fg)">{red ? p.req.text.replace(/\S+@\S+/, '[email]') : p.req.text}</text>
                </g>
              )
            })}
            <g fontSize="13.5">
              <rect x="16" y="284" width="568" height="46" rx="12" fill="var(--viz-surface-2)" stroke="var(--viz-border)" />
              <text x="32" y="312" fill="var(--viz-muted)">passed <tspan fill="var(--viz-fg)" fontWeight="700">{tally.pass}</tspan></text>
              <text x="170" y="312" fill="var(--viz-muted)">redacted <tspan fill="var(--viz-fg)" fontWeight="700">{tally.redact}</tspan></text>
              <text x="330" y="312" fill="var(--viz-muted)">blocked <tspan fill="var(--viz-accent-2)" fontWeight="700">{tally.block}</tspan></text>
            </g>
            <text x="300" y="360" textAnchor="middle" fontSize="14" fill="var(--viz-fg)">{recent ? recent.p.req.why : GUARD_REQS[0].why}</text>
            <text x="300" y="384" textAnchor="middle" fontSize="12" fill="var(--viz-muted)">last decision, counts over the most recent {GUARD_REQS.length} requests</text>
          </>
        )
      }}
    </Viz>
  )
}
