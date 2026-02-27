"use client"

import { GraduationCap, BookOpen, Users, Code2, Award, Briefcase } from "lucide-react"
import dynamic from "next/dynamic"
import { AnimatedSection } from "./animated-section"
import { AnimatedCounter } from "./animated-counter"

const TerminalReveal = dynamic(
  () => import("./terminal-reveal").then((mod) => mod.TerminalReveal),
  { ssr: false }
)

const ParticleField = dynamic(
  () => import("./scene-backgrounds").then((mod) => mod.ParticleField),
  { ssr: false }
)



const highlights = [
  {
    icon: GraduationCap,
    title: "Education",
    subtitleNum: "",
    subtitleText: "UC Berkeley",
    detail: "B.A. Computer Science",
    gradient: "from-primary/10 to-accent/10",
  },
  {
    icon: Briefcase,
    title: "Experience",
    subtitleNum: "",
    subtitleText: "Braintrust, Apple, Walmart",
    detail: "Fortune 500 + AI Startups",
    gradient: "from-accent/10 to-[hsl(180,70%,50%)]/10",
  },
  {
    icon: BookOpen,
    title: "Publications",
    subtitleNum: "6",
    subtitleText: " Research Papers",
    detail: "Machine Learning & Hydrology",
    gradient: "from-[hsl(180,70%,50%)]/10 to-primary/10",
  },
  {
    icon: Award,
    title: "Recognition",
    subtitleNum: "100M+",
    subtitleText: " Users Reached",
    detail: "Industry Impact",
    gradient: "from-primary/10 to-[hsl(280,75%,60%)]/10",
  },
  {
    icon: Users,
    title: "Leadership",
    subtitleNum: "",
    subtitleText: "Team Lead & Mentor",
    detail: "Cross-functional Teams",
    gradient: "from-accent/10 to-primary/10",
  },
  {
    icon: Code2,
    title: "Open Source",
    subtitleNum: "",
    subtitleText: "LangChain, CrewAI, Spring",
    detail: "Community Driven",
    gradient: "from-[hsl(280,75%,60%)]/10 to-accent/10",
  },
]

export function About() {
  return (
    <AnimatedSection id="about" className="relative py-14 sm:py-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute right-1/3 top-1/4 h-96 w-96 rounded-full bg-primary/8 blur-3xl translucent-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute left-1/3 bottom-1/4 h-96 w-96 rounded-full bg-accent/8 blur-3xl translucent-glow" style={{ animationDelay: "4s" }} />
      </div>

      {/* 3D particle network background */}
      <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true">
        <ParticleField color="#3b82f6" speed={0.12} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-10 text-center">
          <span className="inline-block font-mono text-xs uppercase tracking-widest text-primary animate-fade-in">
            About Me
          </span>
          <h2 className="mt-4 font-display text-3xl font-light text-foreground sm:text-4xl lg:text-5xl text-balance animate-fade-in-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
            Building at the intersection of{" "}
            <span className="gradient-text">AI and Engineering</span>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg animate-fade-in-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
            Senior Software Engineer specializing in AI-driven, cloud-native applications.
            Led the design and deployment of a production AI platform with multi-agent orchestration
            and RAG pipelines, achieving sub-second latency for millions of users.
          </p>
        </div>

        {/* Bio — terminal style */}
        <div className="mx-auto mb-10 max-w-4xl">
          <TerminalReveal
            title="~/about — misha.bio"
            prompt=">"
            charSpeed={18}
            linePause={350}
            startDelay={400}
            lines={[
              "Experience at Braintrust Data, Apple, Walmart, LBNL, and Honda Innovations.",
              "Built production AI platform with multi-agent orchestration serving millions.",
              "Deploying real-time ML inference and RAG pipelines at scale.",
              "Published 6 peer-reviewed papers in ML for hydrology & environmental science.",
              "Co-founded Equiverse.ml — AI-driven solutions for 5,000+ underrepresented students.",
            ]}
          />
        </div>

        {/* Highlight cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item, i) => (
            <AnimatedSection key={item.title} delay={i * 80}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-card/50 backdrop-blur-xl transition-all duration-500 hover:border-primary/40 hover:bg-card/80 glass-card-3d">
                {/* Top edge reflection */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

                {/* Corner accent */}
                <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${item.gradient} blur-2xl opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150`} />

                <div className="relative p-6">
                  <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${item.gradient} p-3 ring-1 ring-border transition-all duration-300 group-hover:scale-110 group-hover:ring-2`}>
                    <item.icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:rotate-12" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm font-medium text-primary">
                    {item.subtitleNum ? (
                      <><AnimatedCounter value={item.subtitleNum} duration={1800} />{item.subtitleText}</>
                    ) : (
                      item.subtitleText
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                    {item.detail}
                  </p>
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
