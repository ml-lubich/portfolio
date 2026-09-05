"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { X } from "lucide-react"

/* ── Data ─────────────────────────────────────────────────────────────
 * Each orbit = one layer of the stack. Tools ride that orbit; clicking any
 * pill opens the right-side panel with that layer's real, attributable proof
 * (no self-graded percentages). */

interface OrbitGroup {
  key: string
  label: string
  /** raw HSL triple, e.g. "180 70% 50%" */
  color: string
  blurb: string
  tools: string[]
  details: string[]
  /* geometry — filled in below */
  rxF: number
  ryF: number
  cyOff: number
  speed: number
  phase: number
}

const GROUPS: OrbitGroup[] = [
  {
    key: "foundation",
    label: "Foundation ML",
    color: "180 70% 50%",
    blurb: "Production ML & deep learning with PyTorch, TensorFlow, and scikit-learn.",
    tools: ["PyTorch", "TensorFlow", "scikit-learn"],
    details: [
      "Containerized ML pipelines with Docker, Airflow & MLflow, with automated hyperparameter tuning",
      "Neural networks, clustering, and tree-based models for environmental science & production",
      "Models and pipelines deployed serving 100M+ users at Apple scale",
      "6 peer-reviewed papers applying ML to hydrology and environmental science",
    ],
    rxF: 0, ryF: 0, cyOff: 0, speed: 0, phase: 0,
  },
  {
    key: "llm",
    label: "LLMs",
    color: "280 75% 62%",
    blurb: "Fine-tuning & multi-model routing across frontier and open models.",
    tools: ["GPT-4o", "Claude", "Gemini", "Llama 4", "Mistral"],
    details: [
      "Fine-tuning & deploying GPT-4o, Claude Sonnet 4, Gemini 2.0, Llama 4, Mistral for production",
      "Prompt engineering and multi-model routing across cost/latency/quality tiers",
      "Self-improving agentic retrieval systems with adaptive strategy selection",
    ],
    rxF: 0, ryF: 0, cyOff: 0, speed: 0, phase: 0,
  },
  {
    key: "rag",
    label: "RAG Systems",
    color: "200 80% 58%",
    blurb: "Retrieval at scale across vector stores with re-ranking.",
    tools: ["pgvector", "FAISS", "Pinecone", "Weaviate"],
    details: [
      "RAG architectures with pgvector, FAISS, Pinecone & Weaviate — adaptive chunking",
      "Retrieval re-ranking and hybrid search for grounded, low-hallucination generation",
      "Sub-second retrieval latency across production knowledge bases",
    ],
    rxF: 0, ryF: 0, cyOff: 0, speed: 0, phase: 0,
  },
  {
    key: "agents",
    label: "Multi-Agent",
    color: "340 78% 60%",
    blurb: "Autonomous multi-agent orchestration with shared state graphs.",
    tools: ["CrewAI", "LangGraph", "MCP"],
    details: [
      "Production multi-agent orchestration with CrewAI, LangGraph & shared state graphs",
      "MCP tool-server integration for context-engineered autonomous agents",
      "Self-correction loops and circuit-breaker alerting for guardrail violations",
    ],
    rxF: 0, ryF: 0, cyOff: 0, speed: 0, phase: 0,
  },
  {
    key: "cloud",
    label: "MLOps & Cloud",
    color: "45 90% 58%",
    blurb: "Scalable ML infrastructure on AWS with Terraform IaC.",
    tools: ["AWS", "Kubernetes", "Docker", "Terraform", "Bedrock"],
    details: [
      "AWS ECS, Lambda, RDS, S3, Bedrock — Terraform IaC, CI/CD, model versioning with MLflow",
      "Led migration from monolithic to event-driven microservices on AWS",
      "99.9% uptime SLA across 15+ production ML systems with Kubernetes & Docker",
    ],
    rxF: 0, ryF: 0, cyOff: 0, speed: 0, phase: 0,
  },
  {
    key: "observability",
    label: "Observability",
    color: "150 60% 50%",
    blurb: "Full-stack evaluation, monitoring, and tracing for LLM systems.",
    tools: ["MLflow", "LangSmith", "Prometheus", "Grafana", "OpenTelemetry"],
    details: [
      "Real-time dashboards with Prometheus, Grafana & OpenTelemetry",
      "Automated LLM evaluation with RAGAS & DeepEval in CI/CD quality gates",
      "End-to-end tracing across LLM chains, retrieval, and agent execution with drift detection",
    ],
    rxF: 0, ryF: 0, cyOff: 0, speed: 0, phase: 0,
  },
]

/* Assign each orbit its geometry: concentric elliptical rings, alternating
 * spin direction, scattered vertically into a cloud. */
GROUPS.forEach((g, gi) => {
  g.rxF = 0.17 + gi * 0.05
  g.ryF = g.rxF * 0.42
  g.cyOff = (gi % 2 ? -1 : 1) * 0.035 * Math.ceil(gi / 2)
  g.speed = (gi % 2 ? -1 : 1) * (0.5 + gi * 0.07)
  g.phase = gi * 0.9
})

interface OrbitNode {
  tool: string
  group: OrbitGroup
  baseAngle: number
}

const NODES: OrbitNode[] = GROUPS.flatMap((g) =>
  g.tools.map((tool, i) => ({
    tool,
    group: g,
    baseAngle: g.phase + (i * Math.PI * 2) / g.tools.length,
  }))
)

/* ── Component ────────────────────────────────────────────────────────── */

export function TechOrbit() {
  const fieldRef = useRef<HTMLDivElement>(null)
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([])
  const rafRef = useRef<number>(0)
  const timeRef = useRef<number>(0)
  const lastRef = useRef<number | null>(null)
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 })
  const selectedKeyRef = useRef<string | null>(null)
  const hoverKeyRef = useRef<string | null>(null)

  const [selected, setSelected] = useState<{ group: OrbitGroup; tool: string } | null>(null)

  /* keep the ref in sync so the rAF loop can read selection without re-subscribing */
  selectedKeyRef.current = selected?.group.key ?? null

  /* ── measure the field ──────────────────────────────────────────── */
  useEffect(() => {
    const el = fieldRef.current
    if (!el) return
    const measure = () => {
      sizeRef.current = { w: el.clientWidth, h: el.clientHeight }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* ── orbit animation loop ───────────────────────────────────────── */
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const frame = (now: number) => {
      const { w, h } = sizeRef.current
      if (w && h) {
        if (lastRef.current === null) lastRef.current = now
        const dt = Math.min(48, now - lastRef.current)
        lastRef.current = now
        if (!reduce) timeRef.current += dt * 0.00019

        const cx = w / 2
        const cy = h / 2
        const t = timeRef.current
        const activeKey = selectedKeyRef.current
        const hoverKey = hoverKeyRef.current

        for (let idx = 0; idx < NODES.length; idx++) {
          const el = pillRefs.current[idx]
          if (!el) continue
          const node = NODES[idx]
          const g = node.group
          const theta = node.baseAngle + t * g.speed
          const rx = w * g.rxF
          const ry = w * g.ryF
          const x = cx + rx * Math.cos(theta)
          const y = cy + g.cyOff * h + ry * Math.sin(theta)
          const front = (Math.sin(theta) + 1) / 2 // 0 = far, 1 = near

          const isActive = activeKey === g.key || hoverKey === g.key
          const dimmed = activeKey !== null && !isActive

          let scale = 0.62 + front * 0.5
          let opacity = 0.4 + front * 0.6
          if (isActive) {
            scale += 0.12
            opacity = 1
          } else if (dimmed) {
            opacity *= 0.28
          }

          el.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px) scale(${scale.toFixed(3)})`
          el.style.opacity = opacity.toFixed(3)
          el.style.zIndex = String(Math.round(front * 100) + (isActive ? 200 : 0))
          el.style.filter = front < 0.4 && !isActive ? `blur(${((0.4 - front) * 3).toFixed(2)}px)` : "none"
        }
      }
      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const close = useCallback(() => setSelected(null), [])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-card/25 backdrop-blur-xl frosted-panel">
      {/* header */}
      <div className="flex items-center justify-between px-5 pt-5 md:px-8 md:pt-7">
        <h3 className="text-lg font-bold text-foreground">The stack, in orbit</h3>
        <span className="hidden text-xs text-muted-foreground/70 sm:block">
          Tap any tool to see what I&apos;ve shipped with it
        </span>
      </div>

      {/* orbit field */}
      <div
        ref={fieldRef}
        className="relative h-[420px] w-full md:h-[540px]"
        aria-label="Orbiting technology stack"
      >
        {/* faint concentric guide rings */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {GROUPS.map((g) => (
            <div
              key={g.key}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border"
              style={{
                width: `${g.rxF * 200}%`,
                height: `${g.ryF * 200}%`,
                marginTop: `${g.cyOff * 100}%`,
                borderColor: `hsl(${g.color} / ${selected?.group.key === g.key ? 0.35 : 0.06})`,
                transition: "border-color 0.4s ease",
              }}
            />
          ))}
        </div>

        {/* center label */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
          aria-hidden="true"
        >
          <div className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground/60">
            AI / ML
          </div>
          <div className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground/60">
            Stack
          </div>
        </div>

        {/* pills */}
        {NODES.map((node, idx) => {
          const isActive = selected?.group.key === node.group.key
          return (
            <button
              key={`${node.group.key}-${node.tool}`}
              ref={(el) => {
                pillRefs.current[idx] = el
              }}
              type="button"
              onClick={() => setSelected({ group: node.group, tool: node.tool })}
              onMouseEnter={() => {
                hoverKeyRef.current = node.group.key
              }}
              onMouseLeave={() => {
                if (hoverKeyRef.current === node.group.key) hoverKeyRef.current = null
              }}
              className="absolute left-0 top-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-colors duration-300 will-change-transform"
              style={{
                opacity: 0,
                color: `hsl(${node.group.color})`,
                borderColor: `hsl(${node.group.color} / ${isActive ? 0.7 : 0.25})`,
                background: `hsl(${node.group.color} / ${isActive ? 0.16 : 0.07})`,
                boxShadow: isActive ? `0 0 20px -2px hsl(${node.group.color} / 0.5)` : "none",
              }}
            >
              {node.tool}
            </button>
          )
        })}
      </div>

      {/* ── right-side detail panel ─────────────────────────────────── */}
      {/* backdrop */}
      <div
        className="absolute inset-0 z-[250] bg-background/40 backdrop-blur-[2px] transition-opacity duration-300"
        style={{
          opacity: selected ? 1 : 0,
          pointerEvents: selected ? "auto" : "none",
        }}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        className="absolute inset-y-0 right-0 z-[260] flex w-[86%] max-w-sm flex-col border-l border-white/[0.08] bg-card/80 backdrop-blur-2xl transition-transform duration-500"
        style={{
          transform: selected ? "translateX(0)" : "translateX(100%)",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        role="dialog"
        aria-modal="false"
        aria-hidden={!selected}
      >
        {/* colored edge */}
        <div
          className="absolute inset-y-0 left-0 w-1"
          style={{ background: selected ? `hsl(${selected.group.color})` : "transparent" }}
        />

        {selected && (
          <div className="flex h-full flex-col overflow-y-auto p-6 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div
                  className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: `hsl(${selected.group.color})` }}
                >
                  {selected.group.label}
                </div>
                <h4 className="mt-1 font-display text-2xl font-medium text-foreground">
                  {selected.tool}
                </h4>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-full border border-white/10 p-1.5 text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {selected.group.blurb}
            </p>

            {/* sibling tools in the same layer */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {selected.group.tools.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelected({ group: selected.group, tool: t })}
                  className="rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors"
                  style={{
                    color: `hsl(${selected.group.color})`,
                    borderColor: `hsl(${selected.group.color} / ${t === selected.tool ? 0.6 : 0.2})`,
                    background: `hsl(${selected.group.color} / ${t === selected.tool ? 0.14 : 0.05})`,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="my-5 h-px bg-white/[0.06]" />

            {/* proof points */}
            <div className="space-y-2.5">
              {selected.group.details.map((detail, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3"
                >
                  <div
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: `hsl(${selected.group.color})` }}
                  />
                  <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
