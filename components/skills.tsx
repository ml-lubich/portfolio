"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { AnimatedSection } from "./animated-section"
import { AnimatedBars } from "./animated-bars"
import { getSkillIcon } from "./skill-icons"
import { CodeParticles } from "./code-particles"
import { SectionHeader } from "./section-header"

const ParticleField = dynamic(
  () => import("./scene-backgrounds").then((mod) => mod.ParticleField),
  { ssr: false }
)



const skillCategories = [
  {
    category: "Languages",
    items: ["Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "C++", "SQL", "YAML"],
  },
  {
    category: "AI/ML Engineering",
    items: ["LLM APIs", "Agentic Workflows", "RAG Architectures", "Multi-Agent Orchestration", "MCP Tool Servers", "Vector Databases", "Fine-tuning", "Prompt Engineering", "Guardrails & Safety", "LLM Observability", "PyTorch", "TensorFlow", "scikit-learn"],
  },
  {
    category: "Frameworks & Frontend",
    items: ["Spring Boot", "Spring Cloud", "Spring Security", "Hibernate", "React", "Angular", "Next.js", "FastAPI", "Tailwind CSS", "Material UI"],
  },
  {
    category: "Cloud & DevOps",
    items: ["AWS", "GCP", "Azure", "Kubernetes", "Docker", "Terraform", "GitHub Actions", "Jenkins", "Vercel", "Azure DevOps"],
  },
  {
    category: "Databases & Messaging",
    items: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Oracle", "DynamoDB", "Pinecone", "Apache Kafka", "RabbitMQ"],
  },
  {
    category: "Methodologies & Testing",
    items: ["Agile/Scrum", "TDD", "Domain-Driven Design", "MLOps", "CI/CD", "JUnit", "Jest", "Selenium", "SonarQube"],
  },
]

const proficiencyBars = [
  { label: "Python", value: 97, display: "Expert", gradient: "from-primary to-accent" },
  { label: "Java / Spring Boot", value: 93, display: "Expert", gradient: "from-accent to-[hsl(280,75%,60%)]" },
  { label: "TypeScript / JavaScript", value: 93, display: "Expert", gradient: "from-[hsl(180,70%,50%)] to-primary" },
  { label: "AI/ML & LLM Systems", value: 95, display: "Expert", gradient: "from-[hsl(280,75%,60%)] to-accent" },
  { label: "Cloud & Infrastructure", value: 90, display: "Expert", gradient: "from-primary to-[hsl(180,70%,50%)]" },
  { label: "Rust / Go / C++", value: 72, display: "Proficient", gradient: "from-accent to-primary" },
]

function SkillTag({ item, idx }: { item: string; idx: number }) {
  const [hovered, setHovered] = useState(false)
  const icon = getSkillIcon(item)

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group/tag relative inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition-all duration-300 animate-slide-up cursor-default
        ${hovered
          ? "border-primary/60 bg-primary/10 text-foreground shadow-lg shadow-primary/20 scale-110 skill-tag-shine"
          : "border-border bg-secondary/50 text-muted-foreground hover:scale-105 hover:border-primary/40 hover:bg-secondary hover:text-foreground hover:shadow-md hover:shadow-primary/10"
        }`}
      style={{ animationDelay: `${idx * 50}ms`, opacity: 0 }}
    >
      {icon && (
        <span className={`transition-opacity ${hovered ? "opacity-100" : "opacity-60 group-hover/tag:opacity-100"}`}>
          {icon}
        </span>
      )}
      {item}

      {/* Glow ring */}
      {hovered && (
        <span className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-primary/40 animate-pulse" />
      )}

      {/* Code particles */}
      <CodeParticles skill={item} isHovered={hovered} />
    </span>
  )
}

export function Skills() {
  return (
    <AnimatedSection id="skills" className="relative py-14 sm:py-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-primary/8 blur-3xl translucent-glow" />
        <div className="absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-accent/8 blur-3xl translucent-glow" style={{ animationDelay: "2s" }} />
      </div>

      {/* 3D particle field background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-15" aria-hidden="true">
        <ParticleField color="#3b82f6" speed={0.1} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          label="Technical Skills"
          title={<>Comprehensive expertise across the{" "}<span className="gradient-text">full technology stack</span></>}
          subtitle="Deep proficiency in modern AI/ML frameworks, cloud infrastructure, and full-stack development with a focus on building production-grade scalable systems."
        />

        {/* Proficiency bars */}
        <AnimatedSection delay={100}>
          <div className="mb-12 rounded-2xl border border-white/[0.04] bg-card/25 p-8 backdrop-blur-xl frosted-panel">
            <h3 className="mb-6 text-lg font-bold text-foreground">Overall Proficiency</h3>
            <AnimatedBars bars={proficiencyBars} duration={1600} stagger={120} />
          </div>
        </AnimatedSection>

        {/* Skills grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skillCategories.map((cat, i) => (
            <AnimatedSection key={cat.category} delay={i * 80}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.04] bg-card/25 backdrop-blur-xl p-6 transition-all duration-500 hover:border-primary/40 hover:bg-card/50 glass-card-3d">
                {/* Top edge reflection */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-accent/0 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:from-primary/5 group-hover:via-accent/5 group-hover:to-primary/5 group-hover:opacity-100" />

                {/* Animated corner accent */}
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150" />

                <div className="relative">
                  <h3 className="mb-5 text-base font-bold text-foreground transition-colors group-hover:text-primary sm:text-lg">
                    {cat.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((item, idx) => (
                      <SkillTag key={item} item={item} idx={idx} />
                    ))}
                  </div>
                </div>

                {/* Shimmer effect */}
                <div className="absolute inset-0 shimmer opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
