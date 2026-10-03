'use client'
import { useEffect, useState, type ReactNode } from 'react'
import { MONO } from './theme'
import { typedLength } from './model'
import { useRunning } from './use-viz'

const CODE = `# agent loop with an approval gate (illustrative)
async def run(task: str) -> str:
    plan = await planner.plan(task)
    for step in plan.steps:
        call = await worker.act(step)
        if call.tool in WRITE_TOOLS:
            await approvals.require(call)
        result = await tools.invoke(call)
        trace.log(step, call, result)
    return await critic.merge(trace)
`
const TOKEN = /(#.*)|("[^"\n]*"?)|\b(async|await|def|for|in|if|return)\b|\b(\d[\d.e-]*)\b|\b(planner|worker|approvals|tools|trace|critic)\b/g
const COLOR = ['', 'var(--viz-muted)', 'var(--viz-accent-text)', 'var(--viz-accent-2)', 'var(--viz-fg)', 'var(--viz-accent-text)']

function highlight(src: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  for (const m of src.matchAll(TOKEN)) {
    const i = m.index ?? 0
    if (i > last) out.push(src.slice(last, i))
    const k = m.findIndex((g, j) => j > 0 && g !== undefined)
    out.push(<span key={i} style={{ color: COLOR[k] }}>{m[0]}</span>)
    last = i + m[0].length
  }
  out.push(src.slice(last))
  return out
}

/** Types the script, holds the finished frame ~2.3s, restarts: loops forever, paused off-screen. */
export default function Terminal() {
  const [ref, running, reduced] = useRunning()
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setTick((v) => v + 1), 26)
    return () => clearInterval(id)
  }, [running])
  const shown = reduced ? CODE.length : typedLength(tick, CODE.length)
  return (
    <div ref={ref} className="w-full overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-surface)' }}>
      <p className="sr-only">Decorative code sample: an agent loop in Python where write tools wait for an approval. Illustrative.</p>
      <div className="flex items-center justify-between border-b px-4 py-2 text-xs" style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-surface-2)', color: 'var(--viz-muted)', fontFamily: MONO }} aria-hidden="true">
        <span>agent.py</span>
        <span>illustrative</span>
      </div>
      <pre className="m-0 grid overflow-hidden px-4 py-3 text-[11px] leading-[1.6] sm:text-[12.5px]" style={{ fontFamily: MONO, color: 'var(--viz-fg)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }} aria-hidden="true">
        <code style={{ gridArea: '1 / 1', visibility: 'hidden' }}>{CODE}</code>
        <code style={{ gridArea: '1 / 1' }}>
          {highlight(CODE.slice(0, shown))}
          <span className="animate-pulse motion-reduce:animate-none" style={{ color: 'var(--viz-accent-text)' }}>▌</span>
        </code>
      </pre>
    </div>
  )
}
