"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { AnimatedSection } from "./animated-section"
import { Brain, Code2, Database, Zap, Target, Sparkles, TrendingUp, Shield } from "lucide-react"

const Brain3D = dynamic(
  () => import("./brain-3d").then((mod) => mod.Brain3D),
  { ssr: false }
)

const aiDomains = [
  {
    icon: Brain,
    title: "Machine Learning & Deep Learning",
    description: "Architecting and deploying production-grade ML models using PyTorch, TensorFlow, and scikit-learn. Experience with neural networks, CNNs, RNNs, and transformers.",
    details: [
      "Designed ML pipelines reducing inference time by 300%",
      "Built custom neural architectures for hydrology prediction",
      "Deployed models serving 100M+ users at scale",
    ],
    gradient: "from-primary via-accent to-[hsl(180,70%,50%)]",
  },
  {
    icon: Sparkles,
    title: "Large Language Models & NLP",
    description: "Fine-tuning and deploying LLMs for production use cases. Expertise in prompt engineering, RAG architectures, and semantic search systems.",
    details: [
      "Built RAG systems with vector databases (Pinecone, Weaviate)",
      "Fine-tuned GPT and BERT models for domain-specific tasks",
      "Implemented semantic search at scale with 95%+ accuracy",
    ],
    gradient: "from-accent via-[hsl(280,75%,60%)] to-primary",
  },
  {
    icon: Target,
    title: "Computer Vision & Generative AI",
    description: "End-to-end CV pipelines from data augmentation to deployment. Experience with GANs, diffusion models, and real-time object detection.",
    details: [
      "Built real-time video analysis systems processing 30fps",
      "Trained custom object detection models (YOLO, R-CNN)",
      "Implemented generative models for image synthesis",
    ],
    gradient: "from-[hsl(180,70%,50%)] via-primary to-accent",
  },
  {
    icon: TrendingUp,
    title: "MLOps & Model Deployment",
    description: "Building scalable ML infrastructure with CI/CD pipelines, model versioning, and monitoring. Expertise in Kubernetes, Docker, and cloud ML platforms.",
    details: [
      "Designed MLOps pipelines reducing deployment time by 60%",
      "Implemented A/B testing frameworks for model evaluation",
      "Built real-time monitoring dashboards with Prometheus & Grafana",
    ],
    gradient: "from-primary via-[hsl(200,80%,55%)] to-accent",
  },
]

const metrics = [
  { icon: Zap, value: "300%", label: "Model Performance Gains", color: "text-primary" },
  { icon: Database, value: "10M+", label: "Training Samples Processed", color: "text-accent" },
  { icon: Shield, value: "99.9%", label: "Model Uptime SLA", color: "text-[hsl(180,70%,50%)]" },
  { icon: Code2, value: "15+", label: "Production ML Systems", color: "text-[hsl(280,75%,60%)]" },
]

export function AIExpertise() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <AnimatedSection id="ai-expertise" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 dot-pattern opacity-30" aria-hidden="true" />
      <div className="absolute top-20 right-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" aria-hidden="true" />
      <div className="absolute bottom-20 left-10 h-96 w-96 rounded-full bg-accent/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} aria-hidden="true" />

      {/* 3D Floating Brain — background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-25 sm:opacity-30" aria-hidden="true">
        <Brain3D className="h-full w-full max-h-[700px] max-w-[700px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
            <Brain className="h-4 w-4" />
            AI/ML Expertise
          </span>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-5xl text-balance">
            Building the future with{" "}
            <span className="gradient-text">Artificial Intelligence</span>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Deep expertise in machine learning, deep learning, and AI systems engineering.
            From research to production, I architect scalable AI solutions that drive real-world impact.
          </p>
        </div>

        {/* Metrics grid */}
        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, i) => (
            <AnimatedSection key={metric.label} delay={i * 100}>
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover-lift spotlight">
                <metric.icon className={`mb-4 h-8 w-8 ${metric.color}`} />
                <div className="text-3xl font-bold text-foreground">{metric.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{metric.label}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* AI Domains - Interactive cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {aiDomains.map((domain, i) => (
            <AnimatedSection key={domain.title} delay={i * 150}>
              <div
                className={`group relative h-full overflow-hidden rounded-2xl border transition-all duration-500 cursor-pointer hover-lift ${activeIndex === i
                    ? "border-primary/40 bg-card/80 glow-blue scale-[1.02]"
                    : "border-border bg-card hover:border-primary/20"
                  }`}
                onClick={() => setActiveIndex(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setActiveIndex(i)
                }}
                role="button"
                tabIndex={0}
                aria-expanded={activeIndex === i}
              >
                {/* Gradient top accent */}
                <div className={`h-1 w-full bg-gradient-to-r ${domain.gradient}`} />

                <div className="p-8">
                  {/* Icon and title */}
                  <div className="flex items-start gap-4">
                    <div className={`rounded-xl bg-gradient-to-br ${domain.gradient} p-3`}>
                      <domain.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground">{domain.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {domain.description}
                      </p>
                    </div>
                  </div>

                  {/* Expandable details */}
                  <div
                    className={`transition-all duration-500 ${activeIndex === i
                        ? "mt-6 max-h-96 opacity-100"
                        : "max-h-0 opacity-0 overflow-hidden"
                      }`}
                  >
                    <div className="space-y-3">
                      {domain.details.map((detail, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3"
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
          ))}
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
