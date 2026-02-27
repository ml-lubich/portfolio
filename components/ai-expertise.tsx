"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { AnimatedSection } from "./animated-section"
import { AnimatedCounter } from "./animated-counter"
import { AnimatedBars } from "./animated-bars"
import { ScrollMiniBar } from "./scroll-mini-bar"
const TerminalReveal = dynamic(
  () => import("./terminal-reveal").then((mod) => mod.TerminalReveal),
  { ssr: false }
)
import { Brain, Code2, Database, Zap, Target, Sparkles, TrendingUp, Shield, ChevronDown } from "lucide-react"

const Brain3D = dynamic(
  () => import("./brain-3d").then((mod) => mod.Brain3D),
  { ssr: false }
)

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
    gradient: "from-primary via-accent to-[hsl(180,70%,50%)]",
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
    gradient: "from-accent via-[hsl(280,75%,60%)] to-primary",
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
    gradient: "from-[hsl(180,70%,50%)] via-primary to-accent",
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
    gradient: "from-primary via-[hsl(200,80%,55%)] to-accent",
  },
]

const metrics = [
  { icon: Zap, value: "300%", label: "Model Performance Gains", color: "text-primary", bar: 95, gradient: "from-primary to-accent" },
  { icon: Database, value: "10M+", label: "Training Samples Processed", color: "text-accent", bar: 88, gradient: "from-accent to-[hsl(280,75%,60%)]" },
  { icon: Shield, value: "99.9%", label: "Model Uptime SLA", color: "text-[hsl(180,70%,50%)]", bar: 99, gradient: "from-[hsl(180,70%,50%)] to-primary" },
  { icon: Code2, value: "15+", label: "Production ML Systems", color: "text-[hsl(280,75%,60%)]", bar: 78, gradient: "from-[hsl(280,75%,60%)] to-accent" },
]

const techBars = [
  { label: "PyTorch / TensorFlow / scikit-learn", value: 95, display: "Expert", gradient: "from-primary to-accent" },
  { label: "LLMs & RAG Systems", value: 94, display: "Expert", gradient: "from-accent to-[hsl(280,75%,60%)]" },
  { label: "Multi-Agent Orchestration", value: 92, display: "Expert", gradient: "from-[hsl(180,70%,50%)] to-primary" },
  { label: "MLOps & AWS", value: 90, display: "Expert", gradient: "from-[hsl(280,75%,60%)] to-accent" },
  { label: "Guardrails & Observability", value: 88, display: "Advanced", gradient: "from-primary to-[hsl(180,70%,50%)]" },
]

export function AIExpertise() {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set([0]))

  const toggleCard = (index: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <AnimatedSection id="ai-expertise" className="relative py-14 sm:py-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 dot-pattern opacity-30" aria-hidden="true" />
      <div className="absolute top-20 right-10 h-96 w-96 rounded-full bg-primary/8 blur-3xl translucent-glow" aria-hidden="true" />
      <div className="absolute bottom-20 left-10 h-96 w-96 rounded-full bg-accent/8 blur-3xl translucent-glow" style={{ animationDelay: "2.5s" }} aria-hidden="true" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/[0.03] blur-[100px] translucent-glow" style={{ animationDelay: "1.2s" }} aria-hidden="true" />

      {/* 3D Floating Brain — background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-25 sm:opacity-30" aria-hidden="true">
        <Brain3D className="h-full w-full max-h-[700px] max-w-[700px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
            <Brain className="h-4 w-4" />
            AI/ML Expertise
          </span>
          <h2 className="mt-4 font-display text-3xl font-light text-foreground sm:text-5xl text-balance">
            Building the future with{" "}
            <span className="gradient-text">Artificial Intelligence</span>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Deep expertise in machine learning, deep learning, and AI systems engineering.
            From research to production, I architect scalable AI solutions that drive real-world impact.
          </p>
        </div>

        {/* Terminal summary */}
        <div className="mx-auto mb-10 max-w-3xl">
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

        {/* Metrics grid — rolling numbers + mini bar */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, i) => (
            <AnimatedSection key={metric.label} delay={i * 100}>
              <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-card/60 p-6 backdrop-blur-xl transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/15 glass-card-3d spotlight">
                {/* Top edge light */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.03] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <metric.icon className={`relative mb-3 h-8 w-8 ${metric.color} transition-transform duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_currentColor]`} />
                <AnimatedCounter
                  value={metric.value}
                  duration={2000}
                  className="text-3xl font-display font-light text-foreground"
                />
                <div className="mt-1.5 text-sm text-muted-foreground">{metric.label}</div>
                {/* Mini progress bar — scroll-driven */}
                <ScrollMiniBar value={metric.bar} gradient={metric.gradient} />
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Proficiency bars */}
        <AnimatedSection delay={200}>
          <div className="mb-16 rounded-2xl border border-white/[0.08] bg-card/50 p-8 backdrop-blur-xl frosted-panel">
            <h3 className="mb-6 text-lg font-bold text-foreground">Core Proficiency</h3>
            <AnimatedBars bars={techBars} duration={1600} stagger={150} />
          </div>
        </AnimatedSection>

        {/* AI Domains - Expandable cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {aiDomains.map((domain, i) => {
            const isExpanded = expandedCards.has(i)
            return (
              <AnimatedSection key={domain.title} delay={i * 150}>
                <div
                  className={`group relative h-full overflow-hidden rounded-2xl border transition-all duration-500 ${isExpanded
                    ? "border-primary/40 bg-card/80 glow-blue"
                    : "border-border bg-card hover:border-primary/20"
                    }`}
                >
                  {/* Gradient top accent */}
                  <div className={`h-1 w-full bg-gradient-to-r ${domain.gradient}`} />

                  {/* Clickable header */}
                  <button
                    className="w-full cursor-pointer p-8 pb-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-t-2xl"
                    onClick={() => toggleCard(i)}
                    aria-expanded={isExpanded}
                    aria-controls={`ai-domain-details-${i}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`rounded-xl bg-gradient-to-br ${domain.gradient} p-3 transition-transform duration-300 ${isExpanded ? "scale-110" : "group-hover:scale-105"}`}>
                        <domain.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-xl font-display font-medium text-foreground">{domain.title}</h3>
                          <ChevronDown
                            className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180 text-primary" : "group-hover:text-foreground"}`}
                          />
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {domain.description}
                        </p>
                        {!isExpanded && (
                          <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary/70 transition-colors group-hover:text-primary">
                            <ChevronDown className="h-3 w-3" />
                            Click to see details
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expandable details */}
                  <div
                    id={`ai-domain-details-${i}`}
                    className={`grid transition-all duration-500 ease-in-out ${isExpanded
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-3 px-8 pb-8">
                        <div className="mb-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                        {domain.details.map((detail, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3 transition-all duration-300 ${isExpanded ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
                            style={{ transitionDelay: isExpanded ? `${idx * 80}ms` : "0ms" }}
                          >
                            <div className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r ${domain.gradient}`} />
                            <p className="text-sm text-foreground">{detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            )
          })}
        </div>

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
