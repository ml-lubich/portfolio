'use client'
import { Viz } from './viz'
import { CURVE, CURVE_CYCLE, EPOCHS, epochAt, r1 } from './model'

const X0 = 44, X1 = 584
const sx = (e: number) => r1(X0 + ((X1 - X0) * e) / EPOCHS)
const yLoss = (v: number) => 56 + (1 - v / 2.1) * 130
const yAcc = (v: number) => 214 + (1 - (v - 0.4) / 0.6) * 66
const line = (key: 'train' | 'val' | 'acc', n: number, y: (v: number) => number) =>
  CURVE.slice(0, n + 1).map((d, i) => `${i ? 'L' : 'M'}${sx(i)} ${r1(y(d[key]))}`).join('')

export default function TrainingCurve() {
  return (
    <Viz title="training run" desc="A training dashboard: training and validation loss fall over 50 epochs while accuracy rises, with a rolling log of the latest epochs." staticT={CURVE_CYCLE - 1}>
      {(t) => {
        const n = epochAt(t)
        const d = CURVE[n]
        const from = Math.max(1, n - 2)
        const rows = CURVE.slice(from, n + 1).map((r, i) => ({ e: from + i, r }))
        return (
          <>
            <text x="16" y="50" fontSize="12.5" fill="var(--viz-fg)">epoch {n}/{EPOCHS}</text>
            <text x="584" y="50" fontSize="12.5" textAnchor="end" fill="var(--viz-muted)">lr={d.lr.toExponential(1)}</text>
            {[56, 121, 186].map((y) => <line key={y} x1={X0} x2={X1} y1={y} y2={y} stroke="var(--viz-border)" strokeDasharray="2 5" />)}
            <line x1={X0} x2={X1} y1="280" y2="280" stroke="var(--viz-border)" />
            <text x="4" y="72" fontSize="12" fill="var(--viz-muted)">loss</text>
            <text x="4" y="230" fontSize="12" fill="var(--viz-muted)">acc</text>
            {[0, 25, 50].map((e) => <text key={e} x={sx(e)} y="296" textAnchor={e === 0 ? 'start' : e === 50 ? 'end' : 'middle'} fontSize="12" fill="var(--viz-muted)">{e}</text>)}
            <path d={line('val', n, yLoss)} fill="none" stroke="var(--viz-accent-2)" strokeWidth="2" strokeLinejoin="round" />
            <path d={line('train', n, yLoss)} fill="none" stroke="var(--viz-accent)" strokeWidth="2" strokeLinejoin="round" />
            <path d={line('acc', n, yAcc)} fill="none" stroke="var(--viz-fg)" strokeWidth="1.8" strokeLinejoin="round" />
            <circle cx={sx(n)} cy={r1(yLoss(d.train))} r="8" fill="var(--viz-accent)" opacity="0.22" />
            <circle cx={sx(n)} cy={r1(yLoss(d.train))} r="3.2" fill="var(--viz-accent)" />
            <g transform="translate(300 40)" fontSize="12" fill="var(--viz-muted)">
              <rect width="12" height="3" y="4" fill="var(--viz-accent)" /><text x="17" y="10">train</text>
              <rect x="62" width="12" height="3" y="4" fill="var(--viz-accent-2)" /><text x="79" y="10">val</text>
              <rect x="118" width="12" height="3" y="4" fill="var(--viz-fg)" /><text x="135" y="10">acc</text>
            </g>
            <rect x="16" y="308" width="568" height="78" rx="10" fill="var(--viz-surface-2)" stroke="var(--viz-border)" />
            {rows.map(({ e, r }, i) => (
              <text key={e} x="28" y={331 + i * 21} fontSize="12" fill={i === rows.length - 1 ? 'var(--viz-fg)' : 'var(--viz-muted)'}>
                {`epoch ${e}  loss=${r.train.toFixed(3)}  val=${r.val.toFixed(3)}  acc=${r.acc.toFixed(3)}`}
              </text>
            ))}
          </>
        )
      }}
    </Viz>
  )
}
