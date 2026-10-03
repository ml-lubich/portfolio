'use client'
import { Dot, Viz } from './viz'
import { AGENT_STEP, WORKERS, agentState, clamp01, ease, r1, span } from './model'

const CX = 300, CY = 205
const POS = WORKERS.map((w, i) => {
  const a = ((-90 + i * 72) * Math.PI) / 180
  return { ...w, x: r1(CX + 205 * Math.cos(a)), y: r1(CY + 115 * Math.sin(a)) }
})
const PHASES = ['plan', 'delegate', 'tool call', 'approval', 'merge'] as const
const PHASE_ORDER = ['plan', 'delegate', 'tool', 'gate', 'merge'] as const

export default function AgentGraph() {
  return (
    <Viz title="multi-agent run" desc="An orchestrator plans, delegates to five worker agents, each tool call passes an approval gate (read-only tools auto-approve, writes wait for a human, one is denied), then results merge." staticT={AGENT_STEP * 2 + 0.7 * AGENT_STEP}>
      {(t) => {
        const s = agentState(t)
        const w = POS[s.active]
        const k = ease(s.packet)
        const px = CX + (w.x - CX) * k
        const py = CY + (w.y - CY) * k
        // gate diamond fades in after the tool call starts and out as the result merges
        const gateOp = clamp01(Math.min(span(s.p, 0.34, 0.46), 1 - span(s.p, 0.9, 1)))
        const mx = (CX + w.x) / 2, my = (CY + w.y) / 2
        const gated = s.worker.gate !== 'auto'
        const gateColor = s.verdict === 'denied' ? 'var(--viz-accent-2)' : 'var(--viz-accent)'
        const say =
          s.phase === 'plan' ? 'plan: split the task'
          : s.phase === 'delegate' ? `delegate to ${w.name.toLowerCase()}`
          : s.phase === 'tool' ? `calls ${w.tool}`
          : s.phase === 'gate' ? (s.verdict === 'waiting' ? 'waiting for approval' : s.verdict === 'denied' ? 'denied, replanning' : gated ? 'approved by human' : 'auto-approved (read-only)')
          : s.verdict === 'denied' ? 'step skipped, plan revised' : 'result merged'
        return (
          <>
            {POS.map((k, i) => (
              <line key={k.name} x1={CX} y1={CY} x2={k.x} y2={k.y} stroke={i === s.active ? 'var(--viz-accent)' : 'var(--viz-border)'} strokeWidth={i === s.active ? 1.8 : 1.2} strokeDasharray={i === s.active ? undefined : '4 6'} />
            ))}
            {POS.map((k, i) => {
              const on = i === s.active
              return (
                <g key={k.name}>
                  <rect x={r1(k.x - 54)} y={r1(k.y - 19)} width="108" height="38" rx="12"
                    fill={on ? 'color-mix(in srgb, var(--viz-accent) 16%, var(--viz-surface-2))' : 'var(--viz-surface-2)'}
                    stroke={on ? 'var(--viz-accent)' : 'var(--viz-border)'} strokeWidth={on ? 1.6 : 1} />
                  <text x={k.x} y={r1(k.y + 5)} textAnchor="middle" fontSize="14" fill="var(--viz-fg)">{k.name}</text>
                </g>
              )
            })}
            <rect x={CX - 70} y={CY - 26} width="140" height="52" rx="16" fill="color-mix(in srgb, var(--viz-accent-2) 16%, var(--viz-surface-2))" stroke="var(--viz-accent-2)" strokeWidth="1.6" />
            <text x={CX} y={CY + 5} textAnchor="middle" fontSize="14.5" fontWeight="600" fill="var(--viz-fg)">Orchestrator</text>
            {s.packet > 0 && s.packet < 1 && <g opacity={r1(clamp01(Math.min(s.packet, 1 - s.packet) * 6))}><Dot x={r1(px)} y={r1(py)} /></g>}
            {gateOp > 0 && (
              <g opacity={r1(gateOp)} transform={`translate(${r1(mx)} ${r1(my)})`}>
                <path d="M0 -17L17 0L0 17L-17 0Z" fill="var(--viz-surface)" stroke={s.phase === 'gate' ? gateColor : 'var(--viz-border)'} strokeWidth="1.8" />
                <text y="5" textAnchor="middle" fontSize="15" fontWeight="700" fill={s.phase === 'gate' ? gateColor : 'var(--viz-muted)'}>
                  {s.verdict === 'waiting' ? '?' : s.verdict === 'denied' ? '✕' : '✓'}
                </text>
              </g>
            )}
            <rect x="130" y="334" width="340" height="28" rx="9" fill="var(--viz-surface-2)" stroke="var(--viz-border)" />
            <text x="300" y="353" textAnchor="middle" fontSize="13.5" fill="var(--viz-fg)">{say}</text>
            <g fontSize="12.5" textAnchor="middle">
              {PHASES.map((ph, i) => (
                <text key={ph} x={80 + i * 110} y="386" fill={PHASE_ORDER[i] === s.phase ? 'var(--viz-accent-text)' : 'var(--viz-muted)'} fontWeight={PHASE_ORDER[i] === s.phase ? 700 : 400}>{ph}</text>
              ))}
            </g>
          </>
        )
      }}
    </Viz>
  )
}
