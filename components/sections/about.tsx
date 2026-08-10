"use client"

import { useState, useCallback, useRef } from "react"
import { GraduationCap, BookOpen, Users, Code2, Award, Briefcase } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { AnimatedSection } from "../animations/animated-section"
import { AnimatedCounter } from "../animations/animated-counter"
import { SectionHeader } from "../layout/section-header"
import { ShimmerOverlay } from "../ui/shimmer-overlay"
import { lightGradients as lg, hex } from "@/lib/theme"

const TerminalReveal = dynamic(
  () => import("../terminal/terminal-reveal").then((mod) => mod.TerminalReveal),
  { ssr: false }
)

const ParticleField = dynamic(
  () => import("../three/scene-backgrounds").then((mod) => mod.ParticleField),
  { ssr: false }
)

/* ── HoloCell — card-less instrument-panel cell.
 *  The whole cell tips in 3D toward the pointer and the glyph plinth lifts off
 *  the panel on the Z axis, so depth comes from the transform rather than from
 *  a bordered card sitting on the page. ── */
function HoloCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false })
  const lastTouchRef = useRef(0)

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (Date.now() - lastTouchRef.current < 500) return
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    setTilt({ x: (y - 0.5) * -9, y: (x - 0.5) * 12, active: true })
  }, [])

  const reset = useCallback(() => setTilt({ x: 0, y: 0, active: false }), [])

  const handleTouchEnd = useCallback(() => {
    lastTouchRef.current = Date.now()
    reset()
  }, [reset])

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onTouchEnd={handleTouchEnd}
      className={className}
      style={{ perspective: "900px", transformStyle: "preserve-3d" }}
    >
      <div
        className="flex h-full flex-col items-center justify-start gap-5 text-center"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${tilt.active ? 24 : 0}px)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.2s ease-out",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  )
}

/* ── Glyph plinth — rotating hairline ring around a floating glass core ── */
function GlyphPlinth({ icon: Icon }: { icon: typeof GraduationCap }) {
  return (
    <div className="relative h-[4.5rem] w-[4.5rem]" style={{ transformStyle: "preserve-3d" }}>
      {/* Rotating conic ring — masked down to a hairline circle */}
      <div
        className="absolute inset-0 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.85) 60deg, transparent 150deg, rgba(169,207,214,0.7) 250deg, transparent 340deg)",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
          animation: "holo-spin 11s linear infinite",
        }}
        aria-hidden
      />
      {/* Counter-rotating outer tick ring */}
      <div
        className="absolute -inset-2 rounded-full opacity-25 transition-opacity duration-500 group-hover:opacity-50"
        style={{
          background:
            "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.6) 0deg 2deg, transparent 2deg 18deg)",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))",
          animation: "holo-spin 26s linear infinite reverse",
        }}
        aria-hidden
      />
      {/* Glass core, lifted toward the viewer */}
      <div
        className="absolute inset-[9px] flex items-center justify-center rounded-[34%] bg-gradient-to-br from-white/[0.16] via-white/[0.06] to-white/[0.02] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] ring-1 ring-inset ring-white/20 backdrop-blur-md transition-transform duration-500 group-hover:scale-105"
        style={{ transform: "translateZ(30px)" }}
      >
        <Icon className="h-6 w-6 text-foreground/90" aria-hidden />
      </div>
      {/* Floor light pooling under the plinth */}
      <div
        className="pointer-events-none absolute -bottom-3 left-1/2 h-3 w-16 -translate-x-1/2 rounded-[50%] bg-white/25 blur-md opacity-40 transition-opacity duration-500 group-hover:opacity-80"
        aria-hidden
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
    subtitleText: "Apple, Walmart, LBNL",
    detail: "Fortune 500 + National Labs",
    gradient: lg.accentToCyan,
    backDescription: "Led ML inference pipelines at Apple serving 100M+ users, architected cloud-native microservices at Walmart, and built ML pipelines at Lawrence Berkeley National Lab.",
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
    <AnimatedSection id="about" className="relative py-9 md:py-14 lg:py-20 overflow-hidden">
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

      <div className="relative mx-auto max-w-7xl px-3 md:px-4 lg:px-6">
        <SectionHeader
          label="About Me"
          title={<>Building at the intersection of{" "}<span className="gradient-text">AI and Engineering</span></>}
          subtitle="Senior Software Engineer specializing in AI-driven, cloud-native applications. Led the design and deployment of a production AI platform with multi-agent orchestration and RAG pipelines, achieving sub-second latency for millions of users."
        />

        {/* Bio — portrait alongside the terminal (OpenClaw + claw live under #consulting) */}
        <div className="relative mx-auto mb-10 flex max-w-5xl flex-col items-stretch gap-5 md:flex-row">
          {/* min-h floors the row: the terminal beside it starts two lines tall
              and types its way down, and without a floor the photo squashed to
              a letterbox that cut the face off for the first few seconds. */}
          {/* Stacked (mobile): the source's own 4:5 ratio, so nothing crops.
              Side-by-side (md+): fills the terminal's height, with min-h so the
              row never collapses while the terminal is still typing itself out. */}
          <div className="group/photo relative aspect-[4/5] shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-2xl shadow-black/50 md:aspect-auto md:h-auto md:min-h-[22rem] md:w-72 lg:w-80">
            <Image
              src="/misha-desk-laptop.png"
              alt="Misha Lubich at his desk"
              width={640}
              height={800}
              /* Absolute so the photo never drives the row height — it fills
                 whatever height the terminal beside it sets. */
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/photo:scale-105"
              style={{ objectPosition: "center 20%" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" aria-hidden />
          </div>

          <div className="min-w-0 flex-1">
            <TerminalReveal
            title="~/about — misha.bio"
            prompt=">"
            charSpeed={18}
            linePause={350}
            startDelay={400}
            lines={[
              "Experience at Apple, Walmart, LBNL, and Honda Innovations.",
              "Built production AI platform with multi-agent orchestration serving millions.",
              "Deploying real-time ML inference and RAG pipelines at scale.",
              "Published 6 peer-reviewed papers in ML for hydrology & environmental science.",
              "Co-founded Equiverse.ml — AI-driven solutions for 5,000+ underrepresented students.",
            ]}
            />
          </div>
        </div>

        {/* Highlights — one instrument panel, hairline-divided, no cards.
            The `gap-px` over a faint panel background is what draws the
            dividing hairlines; each cell is transparent glass, not a card. */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.05]">
          <ul className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item, i) => (
              <li key={item.title} className="bg-background/70 backdrop-blur-xl">
                <AnimatedSection delay={i * 80} className="h-full">
                  <HoloCell className="group h-full px-6 py-10">
                    <GlyphPlinth icon={item.icon} />

                    <div style={{ transform: "translateZ(12px)" }}>
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
                        {item.title}
                      </p>
                      <p className="mt-2 font-display text-xl font-light text-foreground sm:text-2xl">
                        {item.subtitleNum ? (
                          <><AnimatedCounter value={item.subtitleNum} duration={1800} />{item.subtitleText}</>
                        ) : (
                          item.subtitleText
                        )}
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground/70">{item.detail}</p>
                    </div>
                  </HoloCell>
                </AnimatedSection>
              </li>
            ))}
          </ul>

          {/* Shimmer sweeps the whole panel — always on, independent of hover */}
          <ShimmerOverlay className="rounded-3xl" />
        </div>
      </div>
    </AnimatedSection>
  )
}
