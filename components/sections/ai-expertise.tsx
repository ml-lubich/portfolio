"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatedSection } from "../animations/animated-section"
import { type BarItem } from "../animations/animated-bars"
import { SectionHeader } from "../layout/section-header"
import { ShimmerOverlay } from "../ui/shimmer-overlay"
import { gradients as g } from "@/lib/theme"
const TerminalReveal = dynamic(
  () => import("../terminal/terminal-reveal").then((mod) => mod.TerminalReveal),
  { ssr: false }
)
import { NeuralConstellation } from "../three/neural-constellation"
import { Brain, Sparkles, Target, TrendingUp } from "lucide-react"

const aiDomains = [
  {
    icon: Brain,
    title: "Machine Learning & Deep Learning",
    description: "Architecting and deploying production-grade ML models using PyTorch, TensorFlow, and scikit-learn. Experience with neural networks, clustering, and tree-based models for environmental science.",
    details: [
      "Built containerized ML pipelines with Docker, Airflow, MLflow and automated hyperparameter tuning",
      "Published 6 peer-reviewed papers on ML for hydrology and environmental science",
      "Deployed models and pipelines serving 100M+ users at Apple scale",
    ],
    gradient: g.primaryViaAccentToCyan,
  },
  {
    icon: Sparkles,
    title: "Large Language Models & RAG",
    description: "Fine-tuning and deploying LLMs for production use cases. Expertise in prompt engineering, RAG architectures with pgvector and FAISS, and multi-model routing (GPT-4o, Claude Sonnet 4, Gemini 2.0).",
    details: [
      "Built RAG systems with pgvector, FAISS, and vector databases (Pinecone, Weaviate)",
      "Designed self-improving agentic systems with adaptive chunking and retrieval re-ranking",
      "Implemented comprehensive LLM observability with LangSmith, Prometheus, Grafana",
    ],
    gradient: g.accentViaMagentaToPrimary,
  },
  {
    icon: Target,
    title: "Agentic AI & Multi-Agent Systems",
    description: "Building autonomous multi-agent systems with CrewAI, LangGraph, and MCP tool servers. Designing feedback loops, shared state graphs, and self-improving review policies.",
    details: [
      "Architected production multi-agent orchestration with CrewAI and LangGraph",
      "Built MCP tool server integration for context-engineered autonomous agents",
      "Designed self-correction loops and circuit-breaker alerting for guardrail violations",
    ],
    gradient: g.cyanViaPrimaryToAccent,
  },
  {
    icon: TrendingUp,
    title: "MLOps & Cloud Infrastructure",
    description: "Building scalable ML infrastructure on AWS (ECS, Lambda, RDS, S3, Bedrock) with Terraform IaC, CI/CD pipelines, model versioning with MLflow, and A/B testing frameworks.",
    details: [
      "Led migration from monolithic to event-driven microservices on AWS using Terraform",
      "Established automated LLM evaluation with RAGAS and DeepEval",
      "Built real-time monitoring dashboards with Prometheus, Grafana, and OpenTelemetry",
    ],
    gradient: g.primaryViaSkyToAccent,
  },
]

const metrics = [
  { value: "300%", label: "Model Performance Gains" },
  { value: "10M+", label: "Training Samples Processed" },
  { value: "99.9%", label: "Model Uptime SLA" },
  { value: "15+", label: "Production ML Systems" },
]

const techBars: BarItem[] = [
  {
    label: "PyTorch / TensorFlow / scikit-learn",
    value: 95,
    display: "Expert",
    gradient: g.primaryToAccent,
    details: [
      "Built containerized ML pipelines with Docker, Airflow, MLflow & automated hyperparameter tuning",
      "Neural networks, clustering, and tree-based models for environmental science & production systems",
      "Deployed models and pipelines serving 100M+ users at Apple scale",
      "Published 6 peer-reviewed papers applying ML to hydrology and environmental science",
    ],
  },
  {
    label: "LLMs & RAG Systems",
    value: 94,
    display: "Expert",
    gradient: g.magentaToAccent,
    details: [
      "Fine-tuning & deploying GPT-4o, Claude Sonnet 4, Gemini 2.0, Llama 4, Mistral for production",
      "RAG architectures with pgvector, FAISS, Pinecone, Weaviate — adaptive chunking & re-ranking",
      "Prompt engineering, multi-model routing, and self-improving agentic retrieval systems",
      "Comprehensive LLM observability with LangSmith, Prometheus, Grafana dashboards",
    ],
  },
  {
    label: "Multi-Agent Orchestration",
    value: 92,
    display: "Expert",
    gradient: g.cyanToPrimary,
    details: [
      "Production multi-agent orchestration with CrewAI, LangGraph, and shared state graphs",
      "MCP tool server integration for context-engineered autonomous agents",
      "Designed feedback loops, self-correction, and circuit-breaker alerting for guardrail violations",
      "Built self-improving review policies and adaptive agent routing",
    ],
  },
  {
    label: "MLOps & AWS Infrastructure",
    value: 90,
    display: "Expert",
    gradient: g.primaryToMagenta,
    details: [
      "AWS ECS, Lambda, RDS, S3, Bedrock — Terraform IaC, CI/CD, model versioning with MLflow",
      "Led migration from monolithic to event-driven microservices on AWS",
      "A/B testing frameworks and automated LLM evaluation with RAGAS & DeepEval",
      "99.9% uptime SLA across 15+ production ML systems with K8s & Docker",
    ],
  },
  {
    label: "Guardrails & Observability",
    value: 88,
    display: "Advanced",
    gradient: g.primaryToCyan,
    details: [
      "Real-time monitoring dashboards with Prometheus, Grafana, and OpenTelemetry",
      "Circuit-breaker alerting for guardrail violations and drift detection",
      "Automated quality gates in CI/CD for model performance regression",
      "End-to-end tracing across LLM chains, retrieval, and agent execution",
    ],
  },
]

/* ── DomainRing — the four AI domains suspended on a rotating 3D carousel.
 *
 *  Stacked cards ate most of a screen each and read as a flat list. Here the
 *  panels sit on a ring in real 3D space (preserve-3d, one rotateY step per
 *  panel), floating over a vertex mesh that echoes the hero brain's wireframe.
 *  One panel faces the viewer at a time; the rest angle away, so the section
 *  costs one viewport instead of four.
 * ── */

/** Gap between a panel's edge and the ring radius, in px */
const RING_PADDING = 60

function RingMesh() {
  /* Static wireframe — deterministic so SSR and client agree. */
  const { nodes, edges } = useMemo(() => {
    const pts = Array.from({ length: 26 }, (_, i) => {
      const a = (i / 26) * Math.PI * 2
      const r = 18 + ((i * 37) % 23)
      return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r * 0.55 }
    })
    const lines: [number, number][] = []
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) < 15) lines.push([i, j])
      }
    }
    return { nodes: pts, edges: lines }
  }, [])

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.30]"
      aria-hidden
    >
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="rgba(223,226,236,0.35)"
          strokeWidth={0.12}
        />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={0.35} fill="rgba(255,255,255,0.8)">
          <animate
            attributeName="opacity"
            values="0.2;0.9;0.2"
            dur="4s"
            begin={`${(i % 8) * 0.5}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  )
}

function DomainRing() {
  const [index, setIndex] = useState(0)
  const [radius, setRadius] = useState(360)
  const stageRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const count = aiDomains.length
  const step = 360 / count

  /* The ring only reads correctly when its radius matches the panel width —
     too small and neighbours punch through the front panel. */
  useEffect(() => {
    const measure = () => {
      const w = panelRef.current?.offsetWidth
      if (w) setRadius(Math.round(w / 2 / Math.tan(Math.PI / count)) + RING_PADDING)
    }
    measure()
    if (typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(measure)
    if (stageRef.current) ro.observe(stageRef.current)
    return () => ro.disconnect()
  }, [count])

  const go = useCallback((delta: number) => setIndex((i) => i + delta), [])

  /** Active panel is the ring position congruent to `index`, so it keeps
   *  spinning the same direction instead of unwinding on wrap. */
  const activeSlot = ((index % count) + count) % count

  const dragStartXRef = useRef(0)
  const isDraggingRef = useRef(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true
    dragStartXRef.current = e.clientX
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    const dx = e.clientX - dragStartXRef.current
    if (Math.abs(dx) > 40) {
      go(dx < 0 ? 1 : -1)
    }
  }, [go])

  return (
    <div className="relative">
      <RingMesh />

      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-[600px] sm:h-[520px] cursor-grab active:cursor-grabbing touch-pan-y select-none"
        style={{ perspective: "1800px", touchAction: "pan-y" }}
      >
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: `translateZ(-${radius}px) rotateY(${-index * step}deg)`,
            transition: "transform 900ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {aiDomains.map((domain, i) => {
            const isActive = i === activeSlot
            return (
              <article
                key={domain.title}
                ref={i === 0 ? panelRef : undefined}
                aria-hidden={!isActive || undefined}
                inert={!isActive}
                className={`absolute left-1/2 top-0 w-[min(88vw,560px)] overflow-hidden rounded-3xl border bg-[#0a0c14]/85 backdrop-blur-2xl transition-[opacity,border-color,box-shadow] duration-700 ${
                  isActive
                    ? "border-white/25 opacity-100 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.95)]"
                    : "pointer-events-none border-white/[0.08] opacity-35"
                }`}
                style={{
                  transform: `translateX(-50%) rotateY(${i * step}deg) translateZ(${radius}px)`,
                }}
              >
                <div className={`h-[2px] w-full bg-gradient-to-r ${domain.gradient}`} />
                <ShimmerOverlay className="rounded-3xl" />

                {/* Corner brackets */}
                <span className="pointer-events-none absolute left-4 top-5 h-4 w-4 border-l border-t border-white/30" aria-hidden />
                <span className="pointer-events-none absolute bottom-4 right-4 h-4 w-4 border-b border-r border-white/30" aria-hidden />

                <div className="relative p-6 sm:p-8">
                  <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
                    <span className="text-foreground/70">{String(i + 1).padStart(2, "0")}</span>
                    <span className="h-px flex-1 bg-white/10" aria-hidden />
                    <span>Domain</span>
                  </div>

                  <div className="mt-5 flex items-start gap-4">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 text-primary">
                      <domain.icon className="h-6 w-6" aria-hidden />
                    </div>
                    <h3 className="font-display text-lg font-light leading-snug text-foreground sm:text-xl">
                      {domain.title}
                    </h3>
                  </div>

                  <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground/80">
                    {domain.description}
                  </p>

                  <ul className="mt-5 space-y-2.5">
                    {domain.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex items-start gap-3 rounded-xl border border-primary/15 bg-secondary/40 px-3.5 py-2.5"
                      >
                        <span
                          className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_1px_hsl(var(--primary)/0.6)]"
                          aria-hidden
                        />
                        <span className="text-[12.5px] leading-relaxed text-foreground/85">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {/* Ring controls */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous AI domain"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-muted-foreground transition-[color,background-color,border-color] duration-150 hover:border-white/30 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        <div className="flex items-center gap-2">
          {aiDomains.map((domain, i) => (
            <button
              key={domain.title}
              type="button"
              onClick={() => go(i - activeSlot)}
              aria-label={`Show ${domain.title}`}
              aria-current={i === activeSlot}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeSlot ? "w-7 bg-foreground/80" : "w-1.5 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next AI domain"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-muted-foreground transition-[color,background-color,border-color] duration-150 hover:border-white/30 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}

export function AIExpertise() {
  return (
    <AnimatedSection id="ai-expertise" className="relative py-6 md:py-14 lg:py-20">
      {/* Background effects */}
      <div className="absolute inset-0 dot-pattern opacity-30" aria-hidden="true" />



      <div className="relative mx-auto max-w-7xl px-3 md:px-6">
        <SectionHeader
          icon={<Brain className="h-4 w-4" />}
          label="AI/ML Expertise"
          title={<>Building the future with{" "}<span className="gradient-text">Artificial Intelligence</span></>}
          subtitle="Deep expertise in machine learning, deep learning, and AI systems engineering. From research to production, I architect scalable AI solutions that drive real-world impact."
        />

        {/* Terminal summary */}
        <div className="mx-auto mb-4 max-w-3xl md:mb-10">
          <TerminalReveal
            title="~/ai — stack.summary"
            prompt="$"
            charSpeed={16}
            linePause={300}
            startDelay={500}
            lines={[
              "Loading AI/ML stack...",
              "PyTorch 2.6 ✓  TensorFlow 2.18 ✓  scikit-learn 1.6 ✓",
              "LLM fine-tuning: GPT-4o, Claude Sonnet 4, Gemini 2.0, Llama 4, Mistral",
              "RAG pipelines: pgvector, FAISS, Pinecone, Weaviate — deployed at scale",
              "Agents: CrewAI, LangGraph, MCP tool servers — production multi-agent",
              "Infrastructure: AWS, K8s, Docker, Terraform, MLflow — 99.9% uptime",
              "Status: All systems operational ✓",
            ]}
          />
        </div>

        {/* Neural constellation — telemetry readouts + interactive skill graph */}
        <AnimatedSection delay={100} className="relative z-10 mb-10 md:mb-16">
          <NeuralConstellation bars={techBars} metrics={metrics} />
        </AnimatedSection>

        {/* AI Domains — suspended 3D ring */}
        <AnimatedSection delay={100}>
          <DomainRing />
        </AnimatedSection>

        {/* Bottom CTA */}
        <AnimatedSection delay={600}>
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-6 py-3 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Open to consulting on AI/ML projects
            </div>
          </div>
        </AnimatedSection>
      </div>
    </AnimatedSection>
  )
}
