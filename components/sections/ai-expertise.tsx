"use client"

import { AnimatedSection } from "../animations/animated-section"
import { SectionHeader } from "../layout/section-header"
import { TerminalReveal } from "../terminal/terminal-reveal"
import { Brain, PencilRuler, Rocket, Search, ShieldCheck, Sparkles, Target, TrendingUp } from "lucide-react"

const aiDomains = [
  {
    icon: Brain,
    title: "Machine Learning",
    description: "Production ML systems built with PyTorch, TensorFlow, and scikit-learn, grounded in six peer-reviewed research papers.",
    details: ["Containerized training pipelines", "Models deployed at Apple scale", "Environmental ML research"],
  },
  {
    icon: Sparkles,
    title: "LLMs & Retrieval",
    description: "Practical RAG, model routing, evaluation, and observability for systems that need to work beyond the demo.",
    details: ["pgvector and FAISS retrieval", "Adaptive chunking and re-ranking", "End-to-end evaluation"],
  },
  {
    icon: Target,
    title: "Agentic Systems",
    description: "Autonomous workflows with explicit state, feedback loops, tool boundaries, and production guardrails.",
    details: ["LangGraph orchestration", "MCP tool integrations", "Self-correction and alerting"],
  },
  {
    icon: TrendingUp,
    title: "MLOps & Infrastructure",
    description: "Reliable delivery on AWS using containers, infrastructure as code, automated releases, and measurable operations.",
    details: ["AWS and Terraform", "CI/CD and model versioning", "Prometheus and OpenTelemetry"],
  },
]

const deliveryProcess = [
  { icon: Search, title: "Discover", text: "Map the real workflow, constraints, and success criteria." },
  { icon: PencilRuler, title: "Design", text: "Prototype the riskiest path and make trade-offs explicit." },
  { icon: Rocket, title: "Ship", text: "Deliver in small production-ready increments with direct feedback." },
  { icon: ShieldCheck, title: "Harden", text: "Measure, observe, document, and remove operational surprises." },
]

export function AIExpertise() {
  return (
    <AnimatedSection id="ai-expertise" className="relative py-10 md:py-16 lg:py-20">
      <div className="relative mx-auto max-w-5xl px-4 md:px-6">
        <SectionHeader
          label="AI Engineering"
          title={<>Production systems, <span className="text-foreground/65">not prototypes</span></>}
          subtitle="Research depth and hands-on delivery across models, retrieval, agents, and the infrastructure that keeps them reliable."
        />

        <TerminalReveal
          className="mx-auto mb-8 max-w-3xl md:mb-10"
          title="~/delivery — current engagement"
          prompt="❯"
          charSpeed={14}
          linePause={220}
          lines={[
            "inspect workflow --find-bottlenecks",
            "prototype highest-risk path",
            "ship production slice --with-observability",
            "measure outcome && iterate",
            "status: reliable, documented, owned",
          ]}
        />

        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {aiDomains.map((domain, i) => (
            <AnimatedSection key={domain.title} delay={i * 80}>
              <article className="group h-full rounded-xl bg-white/[0.035] p-5 ring-1 ring-inset ring-white/[0.055] transition-colors hover:bg-white/[0.05] sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-foreground/80">
                    <domain.icon className="h-4 w-4" aria-hidden />
                  </div>
                  <h3 className="text-base font-medium tracking-[-0.01em] text-foreground sm:text-lg">
                    {domain.title}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground/80">
                  {domain.description}
                </p>
                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/[0.055] pt-4">
                  {domain.details.map((detail) => (
                    <li key={detail} className="text-xs text-muted-foreground/65">
                      {detail}
                    </li>
                  ))}
                </ul>
              </article>
            </AnimatedSection>
          ))}
        </div>

        <div className="mt-12 md:mt-16">
          <div className="mb-6 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Delivery process</p>
            <h3 className="mt-2 text-2xl font-medium tracking-[-0.025em] text-foreground">From ambiguity to a system that holds up</h3>
          </div>
          <div className="relative grid gap-3 md:grid-cols-4">
            <div className="absolute left-[12.5%] right-[12.5%] top-[1.1rem] hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" aria-hidden />
            {deliveryProcess.map((step, index) => (
              <AnimatedSection key={step.title} delay={index * 80} className="relative">
                <div className="h-full rounded-xl bg-white/[0.025] p-4 ring-1 ring-inset ring-white/[0.05]">
                  <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background text-muted-foreground ring-1 ring-white/10">
                    <step.icon className="h-4 w-4" aria-hidden />
                  </div>
                  <p className="mt-4 text-sm font-medium text-foreground">{step.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground/65">{step.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}
