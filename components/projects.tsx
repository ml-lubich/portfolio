"use client"

import { useState, useCallback } from "react"
import { Sparkles, ChevronRight, ArrowRight } from "lucide-react"
import { DetailPanel, type DetailPanelData } from "./detail-panel"
import { ScrollStackCards } from "./scroll-stack-cards"

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
        "AI-driven platform improving educational equity \u2014 scalable, data-driven solutions enhancing resource accessibility for 5,000+ underrepresented students.",
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
        subtitle: "AI/ML Startup \u2014 Co-Founder",
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
      name: "Verizon \u2014 Unbiased",
      metric: "25% reduction in hiring bias",
      summary:
        "Designed ML solutions reducing hiring discrimination by 25%, improving diversity and fairness in recruitment pipelines.",
      tags: ["ML", "Bias Detection", "HR Tech", "Data Analysis"],
      gradient: "from-[hsl(180,70%,50%)] to-primary",
      accent: "hsl(180 70% 50%)",
      number: "03",
      detail: {
        title: "Verizon \u2014 Unbiased",
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
          <h2 className="mt-4 font-display text-3xl font-light text-foreground sm:text-4xl lg:text-5xl text-balance">
            Innovative solutions that{" "}
            <span className="gradient-text">drive real-world impact</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Click any project to explore architecture, tech stack, and animated system diagrams.
          </p>
        </div>

        {/* Stacking glass cards with 3D scroll effect */}
        <ScrollStackCards
          cards={projects.map((project) => ({
            id: project.id,
            children: (
              <button
                onClick={() => handleSelect(project.id)}
                className={`glass-stack-card group relative w-full overflow-hidden rounded-2xl border text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  selectedId === project.id
                    ? "border-primary/40 bg-white/[0.08] dark:bg-white/[0.06] shadow-[0_0_40px_-8px] shadow-primary/20"
                    : "border-white/[0.08] bg-white/[0.04] dark:bg-white/[0.03] hover:border-white/[0.15] hover:bg-white/[0.07]"
                }`}
                style={{ backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)" }}
              >
                {/* Top gradient accent strip */}
                <div className={`h-1 w-full bg-gradient-to-r ${project.gradient} ${selectedId === project.id ? "opacity-100" : "opacity-60 group-hover:opacity-90"} transition-opacity duration-500`} />

                {/* Ambient glow blobs */}
                <div
                  className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-[0.07] blur-3xl transition-opacity duration-700 group-hover:opacity-[0.18]"
                  style={{ background: project.accent }}
                />
                <div
                  className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-[0.08]"
                  style={{ background: project.accent }}
                />

                {/* Frosted noise overlay */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

                <div className="relative p-6 sm:p-8">
                  {/* Top row: number + name + metric */}
                  <div className="flex items-start gap-4 sm:gap-5">
                    {/* Large ghost number */}
                    <span
                      className="hidden shrink-0 select-none font-mono text-6xl font-black leading-none tracking-tighter opacity-[0.06] sm:block"
                      style={{ color: project.accent }}
                    >
                      {project.number}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary sm:text-xl">
                        {project.name}
                      </h3>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary">{project.metric}</span>
                      </div>
                    </div>

                    {/* Explore CTA */}
                    <div className="hidden shrink-0 items-center gap-1.5 self-start rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-muted-foreground/70 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:text-primary sm:flex">
                      <span>Explore</span>
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground/80 sm:text-[15px]">
                    {project.summary}
                  </p>

                  {/* Key highlights (first 3 from detail) */}
                  <div className="mt-4 space-y-2">
                    {project.detail.highlights.slice(0, 3).map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/50" />
                        <span className="text-xs leading-relaxed text-muted-foreground/60 line-clamp-1 sm:text-[13px]">
                          {h}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Metrics row */}
                  {project.detail.metrics && (
                    <div className="mt-5 flex gap-4">
                      {project.detail.metrics.map((m) => (
                        <div key={m.label} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
                          <p className="text-xs text-muted-foreground/50">{m.label}</p>
                          <p className="mt-0.5 text-sm font-bold text-primary">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1 font-mono text-[10px] text-muted-foreground/60 transition-colors group-hover:border-white/[0.12] group-hover:text-muted-foreground/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom edge gradient line */}
                <div className={`h-px w-full bg-gradient-to-r ${project.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-30`} />
              </button>
            ),
          }))}
          stickyTop={90}
          stackOffset={16}
          scrollPerCard={55}
          perspective={1200}
        />
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
