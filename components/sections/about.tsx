"use client"

import { useState, useCallback, useRef } from "react"
import { GraduationCap, BookOpen, Users, Code2, Award, Briefcase } from "lucide-react"
import dynamic from "next/dynamic"
import { AnimatedSection } from "../animations/animated-section"
import { AnimatedCounter } from "../animations/animated-counter"
import { SectionHeader } from "../layout/section-header"
import { lightGradients as lg, hex } from "@/lib/theme"

const TerminalReveal = dynamic(
  () => import("../terminal/terminal-reveal").then((mod) => mod.TerminalReveal),
  { ssr: false }
)

const ParticleField = dynamic(
  () => import("../three/scene-backgrounds").then((mod) => mod.ParticleField),
  { ssr: false }
)

/* ── Tilt + horizontal glass-shine card wrapper ── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [shine, setShine] = useState({ x: 50, opacity: 0 })

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    setTilt({ x: (y - 0.5) * -10, y: (x - 0.5) * 10 })
    setShine({ x: x * 100, opacity: 1 })
  }, [])

  const handleLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 })
    setShine({ x: 50, opacity: 0 })
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.x || tilt.y ? 1.04 : 1})`,
        transition: "transform 0.15s ease-out",
        willChange: "transform",
      }}
    >
      {children}
      {/* Horizontal glass shine band — tracks mouse X */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-2xl"
        style={{
          background: `linear-gradient(105deg, transparent ${shine.x - 18}%, hsla(0,0%,100%,0.02) ${shine.x - 8}%, hsla(0,0%,100%,0.12) ${shine.x - 1}%, hsla(0,0%,100%,0.12) ${shine.x + 1}%, hsla(0,0%,100%,0.02) ${shine.x + 8}%, transparent ${shine.x + 18}%)`,
          opacity: shine.opacity,
          transition: "opacity 0.25s ease-out",
        }}
      />
    </div>
  )
}



const highlights = [
  {
    icon: GraduationCap,
    title: "Education",
    subtitleNum: "",
    subtitleText: "UC Berkeley",
    detail: "B.A. Computer Science",
    gradient: lg.primaryToAccent,
    backDescription: "UC Berkeley B.A. in Computer Science with a focus on machine learning, distributed systems, and algorithms. Foundation for peer-reviewed research and industry-scale engineering.",
  },
  {
    icon: Briefcase,
    title: "Experience",
    subtitleNum: "",
    subtitleText: "Braintrust, Apple, Walmart",
    detail: "Fortune 500 + AI Startups",
    gradient: lg.accentToCyan,
    backDescription: "Built production AI platforms at Braintrust, led ML inference pipelines at Apple serving 100M+ users, and architected cloud-native microservices at Walmart at enterprise scale.",
  },
  {
    icon: BookOpen,
    title: "Publications",
    subtitleNum: "6",
    subtitleText: " Research Papers",
    detail: "Machine Learning & Hydrology",
    gradient: lg.cyanToPrimary,
    backDescription: "Published 6 peer-reviewed papers applying ML to hydrology and environmental science — neural networks, clustering, and tree-based models for real-world prediction systems.",
  },
  {
    icon: Award,
    title: "Recognition",
    subtitleNum: "100M+",
    subtitleText: " Users Reached",
    detail: "Industry Impact",
    gradient: lg.primaryToMagenta,
    backDescription: "Deployed models and pipelines reaching 100M+ users at Apple scale. Recognized for driving 300% model performance gains and maintaining 99.9% uptime SLAs.",
  },
  {
    icon: Users,
    title: "Leadership",
    subtitleNum: "",
    subtitleText: "Team Lead & Mentor",
    detail: "Cross-functional Teams",
    gradient: lg.accentToPrimary,
    backDescription: "Led cross-functional engineering teams across ML, backend, and infrastructure. Mentored junior engineers, established code review standards, and drove Agile delivery processes.",
  },
  {
    icon: Code2,
    title: "Open Source",
    subtitleNum: "",
    subtitleText: "LangChain, CrewAI, Spring",
    detail: "Community Driven",
    gradient: lg.magentaToAccent,
    backDescription: "Active contributor to LangChain, CrewAI, and Spring ecosystems. Built open-source MCP tool servers, agent templates, and shared knowledge through community talks and demos.",
  },
]

export function About() {
  return (
    <AnimatedSection id="about" className="relative py-14 sm:py-20 overflow-hidden">
      {/* Ambient background orbs — constant, overlapping, smoothly drifting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute right-1/4 top-1/4 h-[32rem] w-[32rem] rounded-full bg-primary/[0.06] blur-[80px] translucent-glow" style={{ animationDelay: "-3s" }} />
        <div className="absolute left-1/4 bottom-1/4 h-[32rem] w-[32rem] rounded-full bg-accent/[0.06] blur-[80px] translucent-glow-alt" style={{ animationDelay: "-10s" }} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[28rem] w-[28rem] rounded-full bg-primary/[0.04] blur-[90px] translucent-glow" style={{ animationDelay: "-7s" }} />
      </div>

      {/* 3D particle network background */}
      <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true">
        <ParticleField color={hex.primary} speed={0.12} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          label="About Me"
          title={<>Building at the intersection of{" "}<span className="gradient-text">AI and Engineering</span></>}
          subtitle="Senior Software Engineer specializing in AI-driven, cloud-native applications. Led the design and deployment of a production AI platform with multi-agent orchestration and RAG pipelines, achieving sub-second latency for millions of users."
        />

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
              <TiltCard className="relative h-full">
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-card/25 backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/15">
                  {/* Top edge reflection */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                  {/* Animated corner glow */}
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150" />

                  <div className="relative p-6">
                    <div className="mb-4 inline-flex rounded-xl bg-primary p-3 ring-1 ring-white/[0.06] transition-all duration-300 group-hover:scale-110">
                      <item.icon className="h-5 w-5 text-primary-foreground transition-transform duration-300 group-hover:rotate-12" />
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
                    <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                  </div>

                  {/* Shimmer effect */}
                  <div className="absolute inset-0 shimmer opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
              </TiltCard>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
