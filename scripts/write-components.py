#!/usr/bin/env python3
"""Write journey.tsx and projects.tsx with the new split-view pattern."""
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMPONENTS = os.path.join(BASE, "components")


def write(path, content):
    with open(path, "w") as f:
        f.write(content)
    print(f"  Wrote {os.path.relpath(path, BASE)}")


# ─── journey.tsx ────────────────────────────────────────────────────
write(os.path.join(COMPONENTS, "journey.tsx"), '''"use client"

import { useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { Briefcase, ChevronRight } from "lucide-react"
import { DetailPanel, type DetailPanelData } from "./detail-panel"

const ParticleField = dynamic(
  () => import("./scene-backgrounds").then((mod) => mod.ParticleField),
  { ssr: false }
)

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
    period: "Aug 2024 \\u2013 Dec 2025",
    location: "San Francisco, CA",
    summary:
      "Architected production AI platform with multi-agent orchestration, RAG pipelines, and real-time streaming \\u2014 sub-second P95 latency.",
    tags: ["CrewAI", "LangGraph", "Next.js", "FastAPI", "AWS"],
    gradient: "from-primary to-accent",
    accent: "hsl(217 91% 60%)",
    number: "01",
    detail: {
      title: "Senior Software Engineer",
      subtitle: "Braintrust Data",
      period: "August 2024 \\u2013 December 2025",
      location: "San Francisco, CA",
      description:
        "Led the architecture and deployment of a production AI platform powering multi-agent orchestration, real-time RAG pipelines, and full-stack AI experiences \\u2014 all maintained at sub-second P95 latency serving enterprise customers.",
      highlights: [
        "Architected multi-agent orchestration with CrewAI + LangGraph, RAG pipeline (pgvector, FAISS), real-time streaming \\u2014 sub-second P95 latency",
        "Built full-stack AI apps using React/Next.js, TypeScript, FastAPI, Tailwind CSS with MCP tool server integration and WebSocket streaming",
        "Designed self-improving agentic systems with feedback loops, adaptive chunking, multi-model routing (GPT-4, Claude 3.5, Gemini)",
        "Implemented LLM observability stack with LangSmith, Prometheus, Grafana and custom guardrails for prompt injection / bias detection",
        "Led migration from monolith to event-driven microservices on AWS (ECS, Lambda, RDS, S3, Bedrock) using Terraform IaC",
        "Mentored 5 engineers on AI engineering patterns \\u2014 code quality scores improved from 6.2 \\u2192 8.9/10",
      ],
      architecture: [
        { label: "Agent Orchestrator", icon: "cpu", description: "CrewAI + LangGraph multi-agent routing with feedback loops" },
        { label: "RAG Pipeline", icon: "database", description: "pgvector + FAISS vector search with adaptive chunking" },
        { label: "API Gateway", icon: "server", description: "FastAPI with WebSocket streaming and MCP tool integration" },
        { label: "Observability", icon: "shield", description: "LangSmith + Prometheus + Grafana with custom guardrails" },
        { label: "Infrastructure", icon: "layers", description: "AWS ECS / Lambda / Bedrock \\u2014 Terraform IaC" },
      ],
      techStack: ["CrewAI", "LangGraph", "React", "Next.js", "TypeScript", "FastAPI", "pgvector", "FAISS", "AWS ECS", "Lambda", "Bedrock", "Terraform", "Prometheus", "Grafana"],
      metrics: [
        { label: "P95 Latency", value: "<1s" },
        { label: "Code Quality", value: "6.2\\u21928.9" },
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
    period: "Jan 2023 \\u2013 Jul 2024",
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
      period: "January 2023 \\u2013 July 2024",
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
    period: "May 2022 \\u2013 Aug 2022",
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
      period: "May 2022 \\u2013 August 2022",
      location: "Sunnyvale, CA",
      description:
        "Designed and optimized serverless microservices achieving a 300% throughput increase, built responsive UIs, and integrated enterprise monitoring across the Walmart e-commerce platform.",
      highlights: [
        "Designed and optimized serverless REST and gRPC APIs on AWS Lambda, RDS, and Redis \\u2014 improving data-retrieval speed and reliability",
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
    period: "May 2021 \\u2013 Aug 2021",
    location: "Berkeley, CA",
    summary:
      "Built containerized ML pipelines with scikit-learn, Docker, Airflow \\u2014 saving 200+ hours annually through automated reporting.",
    tags: ["Python", "scikit-learn", "Docker", "Airflow", "MLflow"],
    gradient: "from-primary to-[hsl(280,75%,60%)]",
    accent: "hsl(280 75% 60%)",
    number: "04",
    detail: {
      title: "Software Engineer",
      subtitle: "Lawrence Berkeley National Laboratory",
      period: "May 2021 \\u2013 August 2021",
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
    period: "Jan 2021 \\u2013 May 2021",
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
      period: "January 2021 \\u2013 May 2021",
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
        { label: "CI/CD", icon: "git", description: "GitHub Actions \\u2192 Docker \\u2192 Terraform \\u2192 AWS ECS" },
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
    <section id="journey" className="relative py-14 sm:py-20">
      {/* Background FX */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      {/* 3D particle field background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-15" aria-hidden="true">
        <ParticleField color="#8b5cf6" speed={0.1} />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-12 text-center">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.25em] text-primary">
            Experience
          </span>
          <h2 className="mt-4 font-display text-3xl font-light text-foreground sm:text-4xl lg:text-5xl text-balance">
            From Braintrust to Apple, delivering{" "}
            <span className="gradient-text">impactful solutions</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Click any role to explore architecture details, tech stack, and system diagrams.
          </p>
        </div>

        {/* Card grid */}
        <div className="grid gap-4 sm:gap-5">
          {experiences.map((exp, i) => (
            <button
              key={exp.id}
              onClick={() => handleSelect(exp.id)}
              className={`group relative w-full overflow-hidden rounded-2xl border text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                selectedId === exp.id
                  ? "border-primary/50 bg-primary/[0.06] shadow-lg shadow-primary/10"
                  : "border-border/40 bg-card/60 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5"
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Gradient accent strip */}
              <div className={`absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b ${exp.gradient} transition-opacity duration-300 ${selectedId === exp.id ? "opacity-100" : "opacity-40 group-hover:opacity-70"}`} />

              <div className="relative flex items-center gap-4 py-5 pl-6 pr-5 sm:gap-5 sm:py-6 sm:pl-8 sm:pr-6">
                {/* Number */}
                <span
                  className="hidden font-mono text-4xl font-black tracking-tighter opacity-[0.07] sm:block"
                  style={{ color: exp.accent }}
                >
                  {exp.number}
                </span>

                {/* Icon */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${exp.gradient} shadow-lg shadow-black/20 transition-transform duration-500 group-hover:scale-110`}
                >
                  <Briefcase className="h-5 w-5 text-white" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className="text-sm font-bold uppercase tracking-wider text-primary">
                      {exp.company}
                    </p>
                    <span className="font-mono text-[11px] text-muted-foreground/70">
                      {exp.period}
                    </span>
                  </div>
                  <h3 className="mt-1 text-base font-medium leading-snug text-foreground transition-colors group-hover:text-primary sm:text-lg">
                    {exp.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                    {exp.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {exp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border/40 bg-secondary/30 px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground/80 transition-colors group-hover:text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className={`h-5 w-5 shrink-0 text-muted-foreground/40 transition-all duration-300 ${selectedId === exp.id ? "rotate-90 text-primary" : "group-hover:translate-x-0.5 group-hover:text-primary/60"}`} />
              </div>

              {/* Ambient glow on hover */}
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-15"
                style={{ background: exp.accent }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <DetailPanel
        data={selected?.detail ?? null}
        isOpen={isOpen}
        onClose={handleClose}
      />
    </section>
  )
}
''')


# ─── projects.tsx ───────────────────────────────────────────────────
write(os.path.join(COMPONENTS, "projects.tsx"), '''"use client"

import { useState, useCallback } from "react"
import { Sparkles, ChevronRight, ExternalLink } from "lucide-react"
import { DetailPanel, type DetailPanelData } from "./detail-panel"

const projects: {
  id: string
  name: string
  metric: string
  summary: string
  tags: string[]
  gradient: string
  accent: string
  number: string
  detail: DetailPanelData
}[] = [
  {
    id: "equiverse",
    name: "Equiverse.ml",
    metric: "5,000+ students impacted",
    summary:
      "AI-driven platform improving educational equity \\u2014 scalable, data-driven solutions enhancing resource accessibility for 5,000+ underrepresented students.",
    tags: ["AI/ML", "Python", "Data Analytics", "EdTech"],
    gradient: "from-primary to-accent",
    accent: "hsl(217 91% 60%)",
    number: "01",
    detail: {
      title: "Equiverse.ml",
      subtitle: "AI-Driven Educational Equity Platform",
      description:
        "Designed and built an AI-powered platform to improve educational equity by enhancing resource accessibility for over 5,000 underrepresented students through scalable, data-driven solutions.",
      highlights: [
        "Built ML recommendation engine matching students with resources based on need profiles",
        "Designed data pipelines processing demographic and academic data at scale",
        "Created dashboards for administrators to track equity metrics in real-time",
        "Achieved measurable improvement in resource utilization across partner schools",
      ],
      architecture: [
        { label: "Data Pipeline", icon: "database", description: "ETL pipeline for student demographic and academic data" },
        { label: "ML Engine", icon: "cpu", description: "Recommendation model for resource-student matching" },
        { label: "Analytics", icon: "layers", description: "Real-time equity metrics and reporting dashboards" },
        { label: "API Layer", icon: "server", description: "RESTful API serving predictions and analytics" },
      ],
      techStack: ["Python", "scikit-learn", "Pandas", "PostgreSQL", "Flask", "React", "D3.js"],
      metrics: [
        { label: "Students Reached", value: "5,000+" },
        { label: "Domain", value: "EdTech" },
      ],
      diagramType: "pipeline",
      gradient: "from-primary to-accent",
      accent: "hsl(217 91% 60%)",
    },
  },
  {
    id: "flyoneo",
    name: "Flyoneo.ml",
    metric: "1,500+ active users",
    summary:
      "Co-founded AI/ML startup. Led a team of 8 interns, launched MVP with 1,500+ active users.",
    tags: ["AI/ML", "Startup", "Leadership", "MVP"],
    gradient: "from-accent to-[hsl(180,70%,50%)]",
    accent: "hsl(265 80% 65%)",
    number: "02",
    detail: {
      title: "Flyoneo.ml",
      subtitle: "AI/ML Startup \\u2014 Co-Founder",
      description:
        "Co-founded a startup specializing in AI/ML-driven solutions. Led a team of 8 interns from concept to launch, successfully delivering an MVP that attracted over 1,500 active users.",
      highlights: [
        "Led product strategy and technical architecture from zero to MVP launch",
        "Managed a team of 8 interns across engineering, design, and data science",
        "Implemented core ML features driving user engagement and retention",
        "Achieved 1,500+ active users within first three months of launch",
      ],
      architecture: [
        { label: "Frontend", icon: "layers", description: "React SPA with responsive design" },
        { label: "ML Core", icon: "cpu", description: "AI/ML models powering core product features" },
        { label: "Backend", icon: "server", description: "Node.js API with authentication and data management" },
        { label: "Infrastructure", icon: "database", description: "Cloud-hosted with CI/CD automation" },
      ],
      techStack: ["React", "Node.js", "Python", "TensorFlow", "PostgreSQL", "AWS", "Docker"],
      metrics: [
        { label: "Active Users", value: "1,500+" },
        { label: "Team Size", value: "8" },
      ],
      diagramType: "fullstack",
      gradient: "from-accent to-[hsl(180,70%,50%)]",
      accent: "hsl(265 80% 65%)",
    },
  },
  {
    id: "verizon",
    name: "Verizon \\u2014 Unbiased",
    metric: "25% reduction in hiring bias",
    summary:
      "Designed ML solutions reducing hiring discrimination by 25%, improving diversity and fairness in recruitment pipelines.",
    tags: ["ML", "Bias Detection", "HR Tech", "Data Analysis"],
    gradient: "from-[hsl(180,70%,50%)] to-primary",
    accent: "hsl(180 70% 50%)",
    number: "03",
    detail: {
      title: "Verizon \\u2014 Unbiased",
      subtitle: "ML-Powered Hiring Fairness",
      description:
        "Designed technology solutions to reduce hiring discrimination by 25%, improving diversity and fairness in recruitment pipelines through machine learning bias detection.",
      highlights: [
        "Built ML models to detect and quantify bias in resume screening algorithms",
        "Designed fairness-aware scoring system reducing discrimination by 25%",
        "Created interpretable model explanations for HR stakeholders",
        "Implemented A/B testing framework to measure impact on diversity outcomes",
      ],
      architecture: [
        { label: "Bias Detection", icon: "shield", description: "ML models identifying discriminatory patterns" },
        { label: "Scoring Engine", icon: "cpu", description: "Fairness-aware candidate scoring system" },
        { label: "Analytics", icon: "layers", description: "Diversity metrics and impact dashboards" },
        { label: "Data Layer", icon: "database", description: "Anonymized candidate data processing" },
      ],
      techStack: ["Python", "scikit-learn", "Pandas", "XGBoost", "SHAP", "Fairlearn", "Jupyter"],
      metrics: [
        { label: "Bias Reduction", value: "25%" },
        { label: "Domain", value: "HR Tech" },
      ],
      diagramType: "ml-pipeline",
      gradient: "from-[hsl(180,70%,50%)] to-primary",
      accent: "hsl(180 70% 50%)",
    },
  },
  {
    id: "encrypted-fs",
    name: "Encrypted File Sharing",
    metric: "50% faster transfers",
    summary:
      "Secure file-sharing system with end-to-end encryption, achieving 50% faster data transfer speeds.",
    tags: ["Encryption", "Security", "File Systems", "Performance"],
    gradient: "from-primary to-accent",
    accent: "hsl(217 91% 60%)",
    number: "04",
    detail: {
      title: "Encrypted File Sharing",
      subtitle: "Secure High-Performance File Transfer",
      description:
        "Built a secure file-sharing system with end-to-end encryption, achieving a 50% increase in data transfer speeds through optimized chunking and parallel stream processing.",
      highlights: [
        "Implemented end-to-end AES-256 encryption with zero-knowledge architecture",
        "Optimized file chunking and parallel uploads for 50% speed improvement",
        "Built resumable transfer protocol for large file reliability",
        "Designed key exchange system using asymmetric cryptography",
      ],
      architecture: [
        { label: "Encryption", icon: "shield", description: "AES-256 end-to-end with zero-knowledge design" },
        { label: "Transfer Engine", icon: "zap", description: "Parallel chunked uploads with resumable protocol" },
        { label: "Key Exchange", icon: "git", description: "Asymmetric key management and distribution" },
        { label: "Storage", icon: "database", description: "Encrypted blob storage with deduplication" },
      ],
      techStack: ["Java", "AES-256", "RSA", "WebSocket", "Spring Boot", "Redis", "S3"],
      metrics: [
        { label: "Speed Gain", value: "+50%" },
        { label: "Encryption", value: "AES-256" },
      ],
      diagramType: "pipeline",
      gradient: "from-primary to-accent",
      accent: "hsl(217 91% 60%)",
    },
  },
  {
    id: "gitlet",
    name: "Gitlet Version Control",
    metric: "66% faster commits",
    summary:
      "Lightweight Git implementation with 66% faster commit times and optimized performance.",
    tags: ["Version Control", "Git", "System Design", "Performance"],
    gradient: "from-accent to-primary",
    accent: "hsl(265 80% 65%)",
    number: "05",
    detail: {
      title: "Gitlet Version Control",
      subtitle: "Lightweight Git Implementation",
      description:
        "Implemented a lightweight, efficient Git version control system from scratch, reducing commit times by 66% through optimized data structures and serialization.",
      highlights: [
        "Built complete Git-like VCS: init, add, commit, branch, merge, checkout, log",
        "Implemented content-addressable storage with SHA-1 hashing",
        "Optimized serialization achieving 66% faster commit performance",
        "Designed merge conflict resolution with three-way merge algorithm",
      ],
      architecture: [
        { label: "Object Store", icon: "database", description: "Content-addressable SHA-1 blob/tree/commit storage" },
        { label: "Index", icon: "layers", description: "Staging area with efficient diff computation" },
        { label: "Branching", icon: "git", description: "Branch management with three-way merge algorithm" },
        { label: "Serialization", icon: "zap", description: "Optimized object serialization/deserialization" },
      ],
      techStack: ["Java", "SHA-1", "Serialization", "File I/O", "Data Structures", "Algorithms"],
      metrics: [
        { label: "Commit Speed", value: "+66%" },
        { label: "Type", value: "Full VCS" },
      ],
      diagramType: "pipeline",
      gradient: "from-accent to-primary",
      accent: "hsl(265 80% 65%)",
    },
  },
  {
    id: "pintos",
    name: "Pintos Operating System",
    metric: "40% performance boost",
    summary:
      "Refactored core OS functionality achieving 40% performance improvement through optimized architecture.",
    tags: ["OS", "C", "System Programming", "Performance"],
    gradient: "from-[hsl(180,70%,50%)] to-accent",
    accent: "hsl(180 70% 50%)",
    number: "06",
    detail: {
      title: "Pintos Operating System",
      subtitle: "OS Kernel Development",
      description:
        "Refactored and expanded core OS functionality in the Pintos educational kernel, achieving a 40% performance improvement through optimized scheduling, memory management, and system call implementation.",
      highlights: [
        "Implemented priority scheduling with donation for deadlock prevention",
        "Built virtual memory system with page fault handling and swap",
        "Designed and implemented file system with buffer cache",
        "Optimized context switching and system call dispatch for 40% speedup",
      ],
      architecture: [
        { label: "Scheduler", icon: "cpu", description: "Priority scheduling with priority donation" },
        { label: "Virtual Memory", icon: "layers", description: "Page tables, fault handling, and swap space" },
        { label: "File System", icon: "database", description: "Indexed file system with buffer cache" },
        { label: "System Calls", icon: "server", description: "User-kernel interface with argument validation" },
      ],
      techStack: ["C", "x86 Assembly", "GDB", "Make", "QEMU", "Bochs"],
      metrics: [
        { label: "Performance", value: "+40%" },
        { label: "Type", value: "OS Kernel" },
      ],
      diagramType: "microservices",
      gradient: "from-[hsl(180,70%,50%)] to-accent",
      accent: "hsl(180 70% 50%)",
    },
  },
]

export function Projects() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = projects.find((p) => p.id === selectedId) ?? null

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }, [])

  const handleClose = useCallback(() => setSelectedId(null), [])

  const isOpen = selected !== null

  return (
    <section id="projects" className="relative py-14 sm:py-20 overflow-hidden">
      {/* Background FX */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/4 top-20 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-12 text-center">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.25em] text-primary">
            Featured Projects
          </span>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl text-balance">
            Innovative solutions that{" "}
            <span className="gradient-text">drive real-world impact</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Click any project to explore architecture, tech stack, and animated system diagrams.
          </p>
        </div>

        {/* Project cards \\u2014 2-column grid on larger screens */}
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {projects.map((project, i) => (
            <button
              key={project.id}
              onClick={() => handleSelect(project.id)}
              className={`group relative w-full overflow-hidden rounded-2xl border text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                selectedId === project.id
                  ? "border-primary/50 bg-primary/[0.06] shadow-lg shadow-primary/10"
                  : "border-border/40 bg-card/60 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5"
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Gradient accent strip */}
              <div className={`h-1 w-full bg-gradient-to-r ${project.gradient} transition-opacity duration-300 ${selectedId === project.id ? "opacity-100" : "opacity-50 group-hover:opacity-80"}`} />

              <div className="relative p-5 sm:p-6">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                      {project.name}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span className="text-xs font-semibold text-primary">{project.metric}</span>
                    </div>
                  </div>
                  <ChevronRight className={`mt-1 h-5 w-5 shrink-0 text-muted-foreground/40 transition-all duration-300 ${selectedId === project.id ? "rotate-90 text-primary" : "group-hover:translate-x-0.5 group-hover:text-primary/60"}`} />
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {project.summary}
                </p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border/40 bg-secondary/30 px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground/80 transition-colors group-hover:text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ambient glow */}
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-15"
                style={{ background: project.accent }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <DetailPanel
        data={selected?.detail ?? null}
        isOpen={isOpen}
        onClose={handleClose}
      />
    </section>
  )
}
''')

print("\\nDone! Both files written successfully.")
