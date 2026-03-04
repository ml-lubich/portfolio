"use client"

import { useState, useCallback } from "react"
import { Briefcase, ChevronRight, MapPin, ArrowRight } from "lucide-react"
import { DetailPanel } from "../detail-panel"
import type { DetailPanelData } from "../detail-panel/types"
import { ScrollStackSection } from "../layout/scroll-stack-section"

const experiences: {
  id: string
  title: string
  company: string
  period: string
  location: string
  summary: string
  tags: string[]
  gradient: string
  accent: string
  number: string
  detail: DetailPanelData
}[] = [
    {
      id: "braintrust",
      title: "Senior Software Engineer",
      company: "Braintrust Data",
      period: "Aug 2024 \u2013 Dec 2025",
      location: "San Francisco, CA",
      summary:
        "Architected production AI platform with multi-agent orchestration, RAG pipelines, and real-time streaming \u2014 sub-second P95 latency.",
      tags: ["CrewAI", "LangGraph", "Next.js", "FastAPI", "AWS"],
      gradient: "from-primary to-accent",
      accent: "hsl(217 91% 60%)",
      number: "01",
      detail: {
        title: "Senior Software Engineer",
        subtitle: "Braintrust Data",
        period: "August 2024 \u2013 December 2025",
        location: "San Francisco, CA",
        description:
          "Led the architecture and deployment of a production AI platform powering multi-agent orchestration, real-time RAG pipelines, and full-stack AI experiences \u2014 all maintained at sub-second P95 latency serving enterprise customers.",
        highlights: [
          "Architected multi-agent orchestration with CrewAI + LangGraph, RAG pipeline (pgvector, FAISS), real-time streaming \u2014 sub-second P95 latency",
          "Built full-stack AI apps using React/Next.js, TypeScript, FastAPI, Tailwind CSS with MCP tool server integration and WebSocket streaming",
          "Designed self-improving agentic systems with feedback loops, adaptive chunking, multi-model routing (GPT-4o, Claude Sonnet 4, Gemini 2.0)",
          "Implemented LLM observability stack with LangSmith, Prometheus, Grafana and custom guardrails for prompt injection / bias detection",
          "Led migration from monolith to event-driven microservices on AWS (ECS, Lambda, RDS, S3, Bedrock) using Terraform IaC",
          "Mentored 5 engineers on AI engineering patterns \u2014 code quality scores improved from 6.2 \u2192 8.9/10",
        ],
        architecture: [
          { label: "Agent Orchestrator", icon: "cpu", description: "CrewAI + LangGraph multi-agent routing with feedback loops" },
          { label: "RAG Pipeline", icon: "database", description: "pgvector + FAISS vector search with adaptive chunking" },
          { label: "API Gateway", icon: "server", description: "FastAPI with WebSocket streaming and MCP tool integration" },
          { label: "Observability", icon: "shield", description: "LangSmith + Prometheus + Grafana with custom guardrails" },
          { label: "Infrastructure", icon: "layers", description: "AWS ECS / Lambda / Bedrock \u2014 Terraform IaC" },
        ],
        techStack: ["CrewAI", "LangGraph", "React", "Next.js", "TypeScript", "FastAPI", "pgvector", "FAISS", "AWS ECS", "Lambda", "Bedrock", "Terraform", "Prometheus", "Grafana"],
        metrics: [
          { label: "P95 Latency", value: "<1s" },
          { label: "Code Quality", value: "6.2\u21928.9" },
          { label: "Engineers Mentored", value: "5" },
        ],
        diagramType: "agents",
        gradient: "from-primary to-accent",
        accent: "hsl(217 91% 60%)",
      },
    },
    {
      id: "apple",
      title: "Software Development Engineer in Test",
      company: "Apple",
      period: "Jan 2023 \u2013 Jul 2024",
      location: "Cupertino, CA",
      summary:
        "Migrated 20+ legacy Python test scripts with AI pipelines, maintained stable APFS deployments for macOS filesystem releases impacting 100M+ users.",
      tags: ["Python", "Ansible", "Docker", "APFS", "LLM"],
      gradient: "from-accent to-[hsl(180,70%,50%)]",
      accent: "hsl(265 80% 65%)",
      number: "02",
      detail: {
        title: "Software Development Engineer in Test",
        subtitle: "Apple",
        period: "January 2023 \u2013 July 2024",
        location: "Cupertino, CA",
        description:
          "Owned the test automation strategy for APFS filesystem releases on macOS, impacting 100M+ devices. Leveraged custom AI pipelines to modernize legacy test infrastructure and prototyped LLM-powered internal tooling.",
        highlights: [
          "Migrated and optimized 20+ legacy Python test scripts using custom AI pipelines with file-safety guardrails and edge-case discovery",
          "Managed high-volume production-impacting defects, maintaining stable APFS deployments for macOS filesystem releases",
          "Implemented streamlined deployment workflows with Ansible and Docker, accelerating release cycles",
          "Authored comprehensive technical documentation and prototyped LLM-powered search tool for internal runbooks",
          "Designed modular Python test suites with dynamic parameterization for rapid test creation",
        ],
        architecture: [
          { label: "Test Framework", icon: "layers", description: "Modular Python test suites with dynamic parameterization" },
          { label: "AI Migration", icon: "cpu", description: "Custom AI pipelines for legacy script modernization" },
          { label: "CI/CD", icon: "git", description: "Ansible + Docker automated deployment workflows" },
          { label: "LLM Tooling", icon: "zap", description: "Prototype search tool for internal runbooks" },
        ],
        techStack: ["Python", "Ansible", "Docker", "APFS", "macOS", "LLM", "Pytest", "CI/CD"],
        metrics: [
          { label: "Scripts Migrated", value: "20+" },
          { label: "Users Impacted", value: "100M+" },
        ],
        diagramType: "cicd",
        gradient: "from-accent to-[hsl(180,70%,50%)]",
        accent: "hsl(265 80% 65%)",
      },
    },
    {
      id: "walmart",
      title: "Software Engineer",
      company: "Walmart",
      period: "May 2022 \u2013 Aug 2022",
      location: "Sunnyvale, CA",
      summary:
        "Engineered serverless APIs and backend services increasing throughput by 300%, built responsive UIs with Angular + Keycloak auth.",
      tags: ["Java", "Spring Boot", "AWS Lambda", "Angular", "Kafka"],
      gradient: "from-[hsl(180,70%,50%)] to-primary",
      accent: "hsl(180 70% 50%)",
      number: "03",
      detail: {
        title: "Software Engineer",
        subtitle: "Walmart",
        period: "May 2022 \u2013 August 2022",
        location: "Sunnyvale, CA",
        description:
          "Designed and optimized serverless microservices achieving a 300% throughput increase, built responsive UIs, and integrated enterprise monitoring across the Walmart e-commerce platform.",
        highlights: [
          "Designed and optimized serverless REST and gRPC APIs on AWS Lambda, RDS, and Redis \u2014 improving data-retrieval speed and reliability",
          "Engineered backend services increasing throughput by 300% using Java, Spring Boot, Hibernate with Kafka and Datadog/Grafana monitoring",
          "Created user flows in Figma and built responsive Angular frontend integrating REST APIs and Keycloak authentication",
        ],
        architecture: [
          { label: "API Gateway", icon: "server", description: "Serverless REST + gRPC on AWS Lambda" },
          { label: "Backend Services", icon: "layers", description: "Java / Spring Boot / Hibernate microservices" },
          { label: "Event Bus", icon: "zap", description: "Kafka event streaming with Datadog monitoring" },
          { label: "Data Layer", icon: "database", description: "AWS RDS + Redis caching layer" },
          { label: "Frontend", icon: "cpu", description: "Angular SPA with Keycloak auth" },
        ],
        techStack: ["Java", "Spring Boot", "Hibernate", "AWS Lambda", "RDS", "Redis", "Kafka", "Angular", "Keycloak", "Datadog", "Grafana"],
        metrics: [
          { label: "Throughput Gain", value: "+300%" },
          { label: "API Type", value: "Serverless" },
        ],
        diagramType: "microservices",
        gradient: "from-[hsl(180,70%,50%)] to-primary",
        accent: "hsl(180 70% 50%)",
      },
    },
    {
      id: "lbnl",
      title: "Software Engineer",
      company: "Lawrence Berkeley National Laboratory",
      period: "May 2021 \u2013 Aug 2021",
      location: "Berkeley, CA",
      summary:
        "Built containerized ML pipelines with scikit-learn, Docker, Airflow \u2014 saving 200+ hours annually through automated reporting.",
      tags: ["Python", "scikit-learn", "Docker", "Airflow", "MLflow"],
      gradient: "from-primary to-[hsl(280,75%,60%)]",
      accent: "hsl(280 75% 60%)",
      number: "04",
      detail: {
        title: "Software Engineer",
        subtitle: "Lawrence Berkeley National Laboratory",
        period: "May 2021 \u2013 August 2021",
        location: "Berkeley, CA",
        description:
          "Developed clustering models and end-to-end ML pipelines for scientific research, building automated visualization dashboards that saved 200+ hours of manual work annually.",
        highlights: [
          "Developed and tuned clustering models (K-Means, hierarchical, DBSCAN) with scikit-learn, NumPy and Pandas",
          "Built containerized ML pipeline with Python, Docker, Airflow and automated hyperparameter tuning (GridSearchCV, Optuna)",
          "Tracked experiments with MLflow for reproducible model versioning",
          "Built interactive visualization dashboards (Matplotlib, Plotly, Jupyter) with automated reporting pipelines",
        ],
        architecture: [
          { label: "Data Ingestion", icon: "database", description: "Pandas + NumPy data processing pipelines" },
          { label: "Model Training", icon: "cpu", description: "scikit-learn clustering with GridSearchCV / Optuna tuning" },
          { label: "Orchestration", icon: "layers", description: "Airflow DAGs for automated pipeline execution" },
          { label: "Experiment Tracking", icon: "git", description: "MLflow model registry and versioning" },
          { label: "Visualization", icon: "zap", description: "Matplotlib / Plotly dashboards with Jupyter" },
        ],
        techStack: ["Python", "scikit-learn", "Pandas", "NumPy", "Docker", "Airflow", "MLflow", "Optuna", "Matplotlib", "Plotly", "Jupyter"],
        metrics: [
          { label: "Time Saved", value: "200h/yr" },
          { label: "Pipeline", value: "End-to-End" },
        ],
        diagramType: "ml-pipeline",
        gradient: "from-primary to-[hsl(280,75%,60%)]",
        accent: "hsl(280 75% 60%)",
      },
    },
    {
      id: "honda",
      title: "Software Engineer Intern",
      company: "Honda Innovations",
      period: "Jan 2021 \u2013 May 2021",
      location: "Mountain View, CA",
      summary:
        "Engineered predictive route-optimization for medical-supply delivery using ML, automated full CI/CD pipeline with GitHub Actions + Terraform.",
      tags: ["scikit-learn", "Kafka", "GitHub Actions", "Docker", "Terraform"],
      gradient: "from-[hsl(280,75%,60%)] to-accent",
      accent: "hsl(265 80% 65%)",
      number: "05",
      detail: {
        title: "Software Engineer Intern",
        subtitle: "Honda Innovations",
        period: "January 2021 \u2013 May 2021",
        location: "Mountain View, CA",
        description:
          "Built a predictive route-optimization system for medical supply delivery using real-time telemetry and ML models, with a fully automated CI/CD pipeline deploying to AWS ECS.",
        highlights: [
          "Engineered predictive route-optimization model using scikit-learn, Pandas, NumPy, and real-time telemetry via Kafka",
          "Automated CI/CD pipeline with GitHub Actions, Docker, and Terraform deploying containerized ML model serving to AWS ECS",
          "Led capstone project applying time-series forecasting and linear-programming optimization using Python and PuLP",
        ],
        architecture: [
          { label: "Data Stream", icon: "zap", description: "Kafka real-time telemetry ingestion" },
          { label: "ML Models", icon: "cpu", description: "scikit-learn route optimization + time-series forecasting" },
          { label: "CI/CD", icon: "git", description: "GitHub Actions \u2192 Docker \u2192 Terraform \u2192 AWS ECS" },
          { label: "Serving", icon: "server", description: "Containerized ML model serving on AWS ECS" },
        ],
        techStack: ["Python", "scikit-learn", "Pandas", "NumPy", "Kafka", "GitHub Actions", "Docker", "Terraform", "AWS ECS", "PuLP"],
        metrics: [
          { label: "Optimization", value: "ML-driven" },
          { label: "Deploy", value: "Full CI/CD" },
        ],
        diagramType: "pipeline",
        gradient: "from-[hsl(280,75%,60%)] to-accent",
        accent: "hsl(265 80% 65%)",
      },
    },
  ]

export function Journey() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = experiences.find((e) => e.id === selectedId) ?? null

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }, [])

  const handleClose = useCallback(() => setSelectedId(null), [])

  const isOpen = selected !== null

  return (
    <ScrollStackSection
      id="journey"
      label="Experience"
      title={<>From Braintrust to Apple, delivering{" "}<span className="gradient-text">impactful solutions</span></>}
      subtitle="Click any role to explore architecture details, tech stack, and system diagrams."
      bgEffects={
        <>
          <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />
        </>
      }
      stickyTop={90}
      stackOffset={16}
      scrollPerCard={55}
      perspective={1200}
      activeCardId={selectedId}
      onScrollDismiss={handleClose}
      detailContent={
        <DetailPanel
          data={selected?.detail ?? null}
          isOpen={isOpen}
          onClose={handleClose}
        />
      }
      cards={experiences.map((exp) => ({
        id: exp.id,
        children: (
          <button
            onClick={() => handleSelect(exp.id)}
            className={`glass-stack-card group relative w-full overflow-hidden rounded-2xl border text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${selectedId === exp.id
              ? "border-primary/40 bg-card shadow-[0_0_40px_-8px] shadow-primary/20"
              : "border-border/40 bg-card hover:border-primary/30"
              }`}
          >
            {/* Top gradient accent strip */}
            <div className={`h-1 w-full bg-gradient-to-r ${exp.gradient} ${selectedId === exp.id ? "opacity-100" : "opacity-60 group-hover:opacity-90"} transition-opacity duration-500`} />

            {/* Ambient glow blobs */}
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-[0.07] blur-3xl transition-opacity duration-700 group-hover:opacity-[0.18]"
              style={{ background: exp.accent }}
            />
            <div
              className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-[0.08]"
              style={{ background: exp.accent }}
            />

            {/* Frosted noise overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

            <div className="relative p-6 sm:p-8">
              {/* Top row: number, icon, company, period */}
              <div className="flex items-start gap-4 sm:gap-5">
                {/* Large ghost number */}
                <span
                  className="hidden shrink-0 select-none font-mono text-6xl font-black leading-none tracking-tighter opacity-[0.06] sm:block"
                  style={{ color: exp.accent }}
                >
                  {exp.number}
                </span>

                {/* Gradient icon badge */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${exp.gradient} shadow-lg shadow-black/25 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:shadow-xl`}
                >
                  <Briefcase className="h-5 w-5 text-white" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className="text-sm font-bold uppercase tracking-wider text-primary">
                      {exp.company}
                    </p>
                    <span className="font-mono text-[11px] text-muted-foreground/60">
                      {exp.period}
                    </span>
                  </div>
                  <h3 className="mt-1 text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-xl">
                    {exp.title}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-1.5 text-muted-foreground/50">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">{exp.location}</span>
                  </div>
                </div>

                {/* Explore CTA */}
                <div className="hidden shrink-0 items-center gap-1.5 self-start rounded-lg border border-border/50 bg-secondary px-3.5 py-2 text-xs font-medium text-muted-foreground/70 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-primary sm:flex">
                  <span>Explore</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Summary */}
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground/80 sm:text-[15px]">
                {exp.summary}
              </p>

              {/* Key highlights (first 3 from detail) */}
              <div className="mt-4 space-y-2">
                {exp.detail.highlights.slice(0, 3).map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/50" />
                    <span className="text-xs leading-relaxed text-muted-foreground/60 line-clamp-1 sm:text-[13px]">
                      {h}
                    </span>
                  </div>
                ))}
              </div>

              {/* Metrics row */}
              {exp.detail.metrics && (
                <div className="mt-5 flex gap-4">
                  {exp.detail.metrics.map((m) => (
                    <div key={m.label} className="rounded-lg border border-border/50 bg-secondary px-3 py-2">
                      <p className="text-xs text-muted-foreground/50">{m.label}</p>
                      <p className="mt-0.5 text-sm font-bold text-primary">{m.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="mt-5 flex flex-wrap gap-1.5">
                {exp.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/50 bg-secondary px-3 py-1 font-mono text-[10px] text-muted-foreground/60 transition-colors group-hover:border-primary/30 group-hover:text-muted-foreground/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom edge gradient line */}
            <div className={`h-px w-full bg-gradient-to-r ${exp.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-30`} />
          </button>
        ),
      }))}
    >
      {/* Extra content after cards (if any) */}
    </ScrollStackSection>
  )
}
