"use client"

import dynamic from "next/dynamic"
import { useRef, useState, type KeyboardEvent } from "react"
import { AnimatedSection } from "../animations/animated-section"
import { SectionHeader } from "../layout/section-header"
import { VIZ_VARS } from "./theme"

/* Each visual is its own chunk and only the selected one is mounted, so the
 * lab never runs more than one SVG loop (plus the terminal) at a time. The
 * placeholder has the same 3:2 box as <Viz>, so loading causes no shift. */
const Placeholder = () => <div className="aspect-[3/2] w-full rounded-2xl border" style={{ borderColor: "var(--viz-border)", background: "var(--viz-surface)" }} />
const AgentGraph = dynamic(() => import("./agent-graph"), { loading: Placeholder })
const RagTrace = dynamic(() => import("./rag-trace"), { loading: Placeholder })
const RagPipeline = dynamic(() => import("./rag-pipeline"), { loading: Placeholder })
const EvalScoreboard = dynamic(() => import("./eval-scoreboard"), { loading: Placeholder })
const LatencyWaterfall = dynamic(() => import("./latency-waterfall"), { loading: Placeholder })
const GuardrailPipeline = dynamic(() => import("./guardrail-pipeline"), { loading: Placeholder })
const ModelRouter = dynamic(() => import("./model-router"), { loading: Placeholder })
const TrainingCurve = dynamic(() => import("./training-curve"), { loading: Placeholder })
const Terminal = dynamic(() => import("./terminal"), { loading: () => <div className="h-full min-h-[15rem] w-full rounded-2xl border" style={{ borderColor: "var(--viz-border)", background: "var(--viz-surface)" }} /> })

const TABS = [
  { id: "agents", label: "Agent orchestration", View: AgentGraph, note: "An orchestrator plans, hands work to specialist agents, and every tool call passes an approval gate: reads go through, writes wait for a human, and a denied step triggers a replan." },
  { id: "trace", label: "Retrieval trace", View: RagTrace, note: "One question, five candidate passages scored by vector similarity, then reranked. The answer streams with citations that point back to the passages it used." },
  { id: "rag", label: "RAG pipeline", View: RagPipeline, note: "Ingest, chunk, embed, index, retrieve, generate, evaluate. Hover a stage to read what it does." },
  { id: "evals", label: "Eval harness", View: EvalScoreboard, note: "A judge model scores each suite case by case. Pass rates fill in live, and a ship gate holds the release when any suite misses the threshold." },
  { id: "latency", label: "Streaming latency", View: LatencyWaterfall, note: "Where the time goes in one streamed answer: guard, retrieval, prefill, then decode. Playback is slowed down so the bars are readable." },
  { id: "guard", label: "Guardrails", View: GuardrailPipeline, note: "Requests pass an input filter, a policy check, the model and an output check. Injection, out-of-scope asks and ungrounded answers stop at the stage that catches them." },
  { id: "router", label: "Model routing", View: ModelRouter, note: "Try the cheap model first and escalate only when its confidence is low. The cascade pays for each tier it tries, so the savings are real but not free." },
  { id: "train", label: "Training run", View: TrainingCurve, note: "Loss falls and accuracy climbs over 50 epochs while the log scrolls the latest rows." },
] as const

export function AILab() {
  const [active, setActive] = useState(0)
  const btns = useRef<(HTMLButtonElement | null)[]>([])
  const View = TABS[active].View

  const onKey = (e: KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0
    if (!d) return
    e.preventDefault()
    const next = (active + d + TABS.length) % TABS.length
    setActive(next)
    btns.current[next]?.focus()
  }

  return (
    <AnimatedSection id="ai-lab" className="py-16 md:py-24">
      <div className="container mx-auto max-w-6xl px-4" style={VIZ_VARS}>
        <SectionHeader
          label="AI engineering lab"
          title={<>Agents, retrieval and evals, <span className="gradient-text">in motion</span></>}
          subtitle="Illustrative simulations of the patterns behind production agent and RAG systems. Every number here is simulated."
          compact
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-stretch">
          <div>
            <div role="tablist" aria-label="AI engineering visuals" className="mb-4 flex flex-wrap gap-x-2 gap-y-2" onKeyDown={onKey}>
              {TABS.map((tab, i) => {
                const on = i === active
                return (
                  <button
                    key={tab.id}
                    ref={(el) => { btns.current[i] = el }}
                    role="tab"
                    id={`ai-lab-tab-${tab.id}`}
                    aria-selected={on}
                    aria-controls="ai-lab-panel"
                    tabIndex={on ? 0 : -1}
                    onClick={() => setActive(i)}
                    className="rounded-full border px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    style={{
                      borderColor: on ? "var(--viz-accent)" : "var(--viz-border)",
                      background: on ? "color-mix(in srgb, var(--viz-accent) 14%, transparent)" : "transparent",
                      color: on ? "var(--viz-fg)" : "var(--viz-muted)",
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
            <div id="ai-lab-panel" role="tabpanel" aria-labelledby={`ai-lab-tab-${TABS[active].id}`}>
              <View />
            </div>
            {/* Every note shares one grid cell: the tallest sets the height, so switching tabs never shifts the page. */}
            <div className="mt-4 grid text-sm" style={{ color: "var(--viz-muted)" }} aria-live="polite">
              {TABS.map((tab, i) => (
                <p key={tab.id} className="max-w-prose" style={{ gridArea: "1 / 1", visibility: i === active ? "visible" : "hidden" }} aria-hidden={i !== active}>{tab.note}</p>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-4">
            <div className="min-h-[15rem] flex-1"><Terminal /></div>
            <p className="max-w-prose text-sm" style={{ color: "var(--viz-muted)" }}>
              Sketches, not screenshots: the data is generated from a fixed seed, and nothing on this page is a measurement of a real system.
            </p>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}
