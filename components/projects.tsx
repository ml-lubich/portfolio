"use client"

import { ExternalLink, Sparkles } from "lucide-react"
import { ScrollStackCards } from "./scroll-stack-cards"

const projects = [
  {
    name: "Equiverse.ml",
    metric: "5,000+ students impacted",
    description:
      "AI-driven platform to improve educational equity, enhancing resource accessibility for over 5,000 underrepresented students through scalable, data-driven solutions.",
    tags: ["AI/ML", "Python", "Data Analytics", "Educational Technology"],
    gradient: "from-primary to-accent",
    accent: "hsl(217 91% 60%)",
    number: "01",
  },
  {
    name: "Flyoneo.ml",
    metric: "1,500+ active users",
    description:
      "Co-founded startup specializing in AI/ML-driven solutions. Led a team of 8 interns, successfully launching an MVP with over 1,500 active users.",
    tags: ["AI/ML", "Startup", "Team Leadership", "MVP Development"],
    gradient: "from-accent to-[hsl(180,70%,50%)]",
    accent: "hsl(265 80% 65%)",
    number: "02",
  },
  {
    name: "Verizon - Unbiased",
    metric: "25% reduction in hiring bias",
    description:
      "Designed technology solutions to reduce hiring discrimination by 25%, improving diversity and fairness in recruitment pipelines.",
    tags: ["Machine Learning", "Bias Detection", "HR Technology", "Data Analysis"],
    gradient: "from-[hsl(180,70%,50%)] to-primary",
    accent: "hsl(180 70% 50%)",
    number: "03",
  },
  {
    name: "Encrypted File Sharing",
    metric: "50% faster transfers",
    description:
      "Built a secure file-sharing system with end-to-end encryption, achieving a 50% increase in data transfer speeds.",
    tags: ["Encryption", "Security", "File Systems", "Performance"],
    gradient: "from-primary to-accent",
    accent: "hsl(217 91% 60%)",
    number: "04",
  },
  {
    name: "Gitlet Version Control",
    metric: "66% faster commits",
    description:
      "Implemented a lightweight, efficient Git version control system, reducing commit times by 66% and enhancing performance.",
    tags: ["Version Control", "Git", "System Design", "Performance"],
    gradient: "from-accent to-primary",
    accent: "hsl(265 80% 65%)",
    number: "05",
  },
  {
    name: "Pintos Operating System",
    metric: "40% performance boost",
    description:
      "Refactored and expanded core OS functionality, achieving a 40% performance improvement through optimized code architecture.",
    tags: ["Operating Systems", "C", "System Programming", "Performance"],
    gradient: "from-[hsl(180,70%,50%)] to-accent",
    accent: "hsl(180 70% 50%)",
    number: "06",
  },
]

export function Projects() {
  const stackCards = projects.map((project) => ({
    id: project.name,
    children: (
      <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/20 transition-all duration-500 hover:border-primary/40">
        {/* Gradient accent strip */}
        <div className={`h-1 w-full bg-gradient-to-r ${project.gradient}`} />

        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-15 blur-3xl transition-opacity duration-700 group-hover:opacity-35"
          style={{ background: project.accent }}
        />

        <div className="relative p-6 sm:p-8 md:p-10">
          {/* Top row: number + metric */}
          <div className="flex items-center justify-between">
            <span
              className="font-mono text-5xl font-black tracking-tighter opacity-10"
              style={{ color: project.accent }}
            >
              {project.number}
            </span>
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-4 py-1.5 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-xs font-semibold text-primary">
                {project.metric}
              </span>
            </div>
          </div>

          {/* Title + Description */}
          <div className="mt-4 flex items-start justify-between gap-4">
            <h3 className="text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-primary sm:text-2xl">
              {project.name}
            </h3>
            <ExternalLink className="h-5 w-5 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary group-hover:opacity-100" />
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-foreground/90 sm:text-base">
            {project.description}
          </p>

          {/* Tags */}
          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/60 bg-secondary/40 px-3 py-1 font-mono text-xs text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-primary/30 hover:bg-secondary/80 hover:text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Hover gradient overlay */}
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-5`}
        />
        {/* Shimmer effect */}
        <div className="absolute inset-0 shimmer opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    ),
  }))

  return (
    <section id="projects" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background FX */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/4 top-20 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-20 text-center">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.25em] text-primary">
            Featured Projects
          </span>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl text-balance">
            Innovative solutions that{" "}
            <span className="gradient-text">drive real-world impact</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            From AI-powered educational platforms to secure systems engineering,
            here&apos;s a selection of projects showcasing scalable solutions
            across domains.
          </p>
        </div>

        {/* ★ Scroll-stacking cards */}
        <ScrollStackCards
          cards={stackCards}
          stickyTop={100}
          stackOffset={25}
          scrollPerCard={45}
        />
      </div>
    </section>
  )
}
