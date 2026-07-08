"use client"

import dynamic from "next/dynamic"
import { AnimatedSection } from "../animations/animated-section"
import { SectionHeader } from "../layout/section-header"
import { ShimmerOverlay } from "../ui/shimmer-overlay"
import { gradients as g } from "@/lib/theme"
const TerminalReveal = dynamic(
  () => import("../terminal/terminal-reveal").then((mod) => mod.TerminalReveal),
  { ssr: false }
)
import { TechOrbit } from "../animations/tech-orbit"
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

        {/* Orbiting tech stack — a storm of pills; tap one to reveal shipped proof */}
        <AnimatedSection delay={100} className="relative z-10 mb-10 md:mb-16">
          <TechOrbit />
        </AnimatedSection>

        {/* AI Domains — Step-by-step cards */}
        <div className="relative">
          {/* Vertical connector line (visible on lg) */}
          <div className="absolute left-1/2 top-0 bottom-0 hidden w-px -translate-x-1/2 bg-primary/20 lg:block" aria-hidden="true" />

          <div className="grid gap-5 md:gap-8 lg:grid-cols-2">
            {aiDomains.map((domain, i) => (
              <AnimatedSection key={domain.title} delay={i * 150}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.04] bg-card/30 backdrop-blur-xl transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/15 glass-card-3d spotlight">
                  {/* Top edge light */}
                  <div className="absolute inset-x-0 top-0 h-px bg-white/[0.06]" />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-primary/[0.03] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <ShimmerOverlay className="rounded-2xl" />

                  {/* Top accent */}
                  <div className={`h-1 w-full bg-primary`} />

                  <div className="relative p-5 md:p-8">
                    {/* Step number + icon header */}
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className={`rounded-xl bg-primary p-3 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20`}>
                          <domain.icon className="h-6 w-6 text-primary-foreground transition-all duration-500 group-hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.3)]" />
                        </div>
                        {/* Step number badge */}
                        <div className={`absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground ring-2 ring-background transition-transform duration-500 group-hover:scale-110`}>
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-display font-medium text-foreground transition-colors duration-300 group-hover:text-primary">{domain.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {domain.description}
                        </p>
                      </div>
                    </div>

                    {/* Details — always visible */}
                    <div className="mt-6 space-y-3">
                      <div className="h-px bg-white/[0.06]" />
                      {domain.details.map((detail, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.04] hover:translate-x-1"
                          style={{ transitionDelay: `${idx * 50}ms` }}
                        >
                          <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary transition-shadow duration-300 group-hover:shadow-[0_0_6px_1px_hsl(var(--primary)/0.4)]`} />
                          <p className="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground">{detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
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
