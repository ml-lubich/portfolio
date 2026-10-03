'use client'
import { Dot, Viz } from './viz'
import { ROUTE_THRESHOLD, TIERS, cascadeCost, ease, lerp, r1, routeAt, routeSavings, stopTier } from './model'

const TX = [100, 300, 500]
const BAR_W = 110

export default function ModelRouter() {
  return (
    <Viz title="model routing cascade" desc="Each request goes to the cheapest model first. If its confidence is under the threshold, the request escalates to a mid-size model and then to a frontier model. Average cost is compared with always calling the biggest model." staticT={5}>
      {(t) => {
        const s = routeAt(t)
        const savings = routeSavings(s.settled ? s.index + 1 : s.index)
        const conf = s.req.conf[s.attempt] ?? 0
        const shown = conf * s.filled
        const passed = s.settled && s.attempt === stopTier(s.req) && conf >= ROUTE_THRESHOLD
        const headX = s.arrived ? lerp(s.attempt ? TX[s.attempt - 1] : 28, TX[s.attempt], ease(s.filled * 3)) : 28
        return (
          <>
            <text x="16" y="56" fontSize="13" fill="var(--viz-muted)">request</text>
            <text x="16" y="76" fontSize="15" fontWeight="700" fill="var(--viz-fg)">{s.req.q}</text>
            {TIERS.map((tier, i) => {
              const on = s.arrived && i === s.attempt
              const skipped = i > stopTier(s.req) || (s.arrived && i > s.attempt)
              const val = i < s.attempt ? s.req.conf[i] : on ? shown : 0
              const reached = s.arrived && i <= s.attempt
              return (
                <g key={tier.name} opacity={skipped ? 0.45 : 1}>
                  <rect x={TX[i] - 70} y="104" width="140" height="132" rx="14" fill={on ? 'color-mix(in srgb, var(--viz-accent) 14%, var(--viz-surface-2))' : 'var(--viz-surface-2)'} stroke={on ? 'var(--viz-accent)' : 'var(--viz-border)'} strokeWidth={on ? 1.7 : 1} />
                  <text x={TX[i]} y="130" textAnchor="middle" fontSize="15" fill="var(--viz-fg)">{tier.name}</text>
                  <text x={TX[i]} y="149" textAnchor="middle" fontSize="12" fill="var(--viz-muted)">{tier.cost}x cost</text>
                  <rect x={TX[i] - BAR_W / 2} y="170" width={BAR_W} height="10" rx="5" fill="var(--viz-border)" />
                  <rect x={TX[i] - BAR_W / 2} y="170" width={r1(BAR_W * val)} height="10" rx="5" fill={val >= ROUTE_THRESHOLD ? 'var(--viz-accent)' : 'var(--viz-accent-2)'} />
                  <line x1={r1(TX[i] - BAR_W / 2 + BAR_W * ROUTE_THRESHOLD)} x2={r1(TX[i] - BAR_W / 2 + BAR_W * ROUTE_THRESHOLD)} y1="165" y2="185" stroke="var(--viz-fg)" />
                  <text x={TX[i]} y="208" textAnchor="middle" fontSize="13.5" fill="var(--viz-fg)">{reached ? `conf ${val.toFixed(2)}` : 'idle'}</text>
                  {reached && (i < s.attempt || s.filled >= 1) && (
                    <text x={TX[i]} y="227" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={s.req.conf[i] >= ROUTE_THRESHOLD ? 'var(--viz-accent-text)' : 'var(--viz-accent-2)'}>
                      {s.req.conf[i] >= ROUTE_THRESHOLD ? '✓ answer' : 'escalate →'}
                    </text>
                  )}
                </g>
              )
            })}
            <Dot x={headX} y={92} />
            <text x="584" y="56" textAnchor="end" fontSize="12" fill="var(--viz-muted)">confidence bar tick = {ROUTE_THRESHOLD.toFixed(2)} threshold</text>
            <rect x="16" y="262" width="568" height="86" rx="12" fill="var(--viz-surface-2)" stroke="var(--viz-border)" />
            <text x="32" y="289" fontSize="13.5" fill="var(--viz-muted)">this request <tspan fill="var(--viz-fg)" fontWeight="700">{s.settled ? `${cascadeCost(s.req)}x` : '...'}</tspan>{passed ? <tspan fill="var(--viz-accent-text)"> answered by {TIERS[s.attempt].name}</tspan> : null}</text>
            <text x="32" y="313" fontSize="13.5" fill="var(--viz-muted)">average so far <tspan fill="var(--viz-fg)" fontWeight="700">{savings.avg.toFixed(1)}x</tspan> vs always frontier <tspan fill="var(--viz-fg)" fontWeight="700">{savings.flat}x</tspan></text>
            <text x="32" y="335" fontSize="12" fill="var(--viz-muted)">a cascade pays for each tier it tries</text>
            <text x="300" y="382" textAnchor="middle" fontSize="13.5" fill="var(--viz-muted)">cheap first, escalate only when the answer is not confident enough</text>
          </>
        )
      }}
    </Viz>
  )
}
