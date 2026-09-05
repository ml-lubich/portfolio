"use client"

import { useState, useCallback, useRef, memo } from "react"
import { GraduationCap, BookOpen, Users, Code2, Award, Briefcase } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { useReducedMotion } from "framer-motion"
import { AnimatedSection } from "../animations/animated-section"
import { AnimatedCounter } from "../animations/animated-counter"
import { SectionHeader } from "../layout/section-header"
import { ShimmerOverlay } from "../ui/shimmer-overlay"
import { lightGradients as lg, hex } from "@/lib/theme"

/* memo: TerminalReveal's typing loop re-arms its timers on every render, so a
   parent re-render inside the ~300ms line pause cancels it and the typing
   stalls at the end of a line. Stable props + memo keep re-renders out. */
const TerminalReveal = memo(
  dynamic(() => import("../terminal/terminal-reveal").then((mod) => mod.TerminalReveal), { ssr: false }),
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
            "conic-gradient(from 0deg, transparent 0deg, rgb(var(--white-rgb) / 0.85) 60deg, transparent 150deg, rgba(169,207,214,0.7) 250deg, transparent 340deg)",
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
            "repeating-conic-gradient(from 0deg, rgb(var(--white-rgb) / 0.6) 0deg 2deg, transparent 2deg 18deg)",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))",
          animation: "holo-spin 26s linear infinite reverse",
        }}
        aria-hidden
      />
      {/* Glass core, lifted toward the viewer */}
      <div
        className="absolute inset-[9px] flex items-center justify-center rounded-[34%] bg-gradient-to-br from-white/[0.16] via-white/[0.06] to-white/[0.02] shadow-xl shadow-black/40 ring-1 ring-inset ring-white/20 backdrop-blur-md transition-transform duration-500 group-hover:scale-105"
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
    subtitleText: "EchoStar, Apple, Walmart",
    detail: "Staff AI Engineer · Fortune 500 · LBNL",
    gradient: lg.accentToCyan,
    backDescription: "Staff AI Engineer at EchoStar building consumer-scale telecom AI. Before that: ML inference at Apple serving 100M+ users, cloud-native microservices at Walmart, ML pipelines at Lawrence Berkeley National Lab, and Honda Innovations.",
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
    subtitleText: "MCP Servers + CLIs",
    detail: "imsg · imail · inotes · wa-mcp · jenkins-mcp",
    gradient: lg.magentaToAccent,
    backDescription: "Maintains the agent-tool family — imsg, imail, inotes, wa-mcp, bitbucket-cli, confluence-cli, pdfify-md, jenkins-mcp — local-first CLIs that double as MCP servers for Claude, Cursor, and VS Code.",
  },
]

/* Typed into the terminal. Opens on the current role so the first line a
   visitor reads is the one that matters. */
const bio = [
  "Staff AI Engineer @ EchoStar — building the AI pipelines behind consumer-scale telecom.",
  "Before that: Polaris Wireless, Apple, Walmart, LBNL, and Honda Innovations.",
  "Shipped production multi-agent orchestration, RAG, and real-time ML inference serving millions.",
  "Published 6 peer-reviewed papers on ML for hydrology & environmental science.",
  "Maintains the agent-tool family — imsg, imail, inotes, wa-mcp, jenkins-mcp — as MCP servers + CLIs.",
  "Co-founded Equiverse.ml — AI-driven tooling for 5,000+ underrepresented students.",
]
/* Non-string lines skip TerminalReveal's per-character loop, so this reveals
   the whole bio at once for reduced-motion visitors. Built once: the memo
   above only holds if the prop is referentially stable. */
const bioStatic = bio.map((l, i) => <span key={i}>{l}</span>)

/* Static "now" strip under the terminal — the facts that don't need typing. */
const now = [
  ["now", "EchoStar · Staff AI Engineer"],
  ["where", "SF Bay Area"],
  ["since", "Sep 2026"],
  ["building", "RAG · agents · evals at telecom scale"],
]

export function About() {
  // The global CSS zeroes CSS animations, but the typewriter and counter are
  // timer-driven and need their own branch: render the finished state.
  const reduce = useReducedMotion() ?? false
  return (
    <AnimatedSection id="about" className="relative section-y overflow-hidden">
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
          subtitle="Staff AI Engineer at EchoStar, building AI pipelines for consumer-scale telecom. Chose it over offers and final rounds at Anduril and Mach Industries — consumer-grade telecom puts the same agent and RAG work in front of millions of everyday customers. Previously shipped production AI at Apple and Walmart."
        />

        {/* Bio — portrait alongside the terminal (OpenClaw + claw live under #consulting) */}
        <div className="relative mx-auto mb-10 flex max-w-5xl flex-col items-stretch gap-5 md:flex-row">
          {/* min-h floors the row: the terminal beside it starts two lines tall
              and types its way down, and without a floor the photo squashed to
              a letterbox that cut the face off for the first few seconds. */}
          {/* Stacked (mobile): the source's own 4:5 ratio, so nothing crops.
              Side-by-side (md+): fills the terminal's height, with min-h so the
              row never collapses while the terminal is still typing itself out. */}
          <div className="group/photo relative mx-auto aspect-[4/5] w-full max-w-[20rem] shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-2xl shadow-black/50 md:mx-0 md:aspect-auto md:h-auto md:min-h-[22rem] md:w-72 md:max-w-none lg:w-80">
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

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {/* flex-1 + h-full: the terminal takes whatever height the row has
                above the strip, so the card never stops short of the portrait. */}
            <div className="flex-1">
              <TerminalReveal
                className="h-full"
                title="~/about — misha.bio"
                prompt=">"
                charSpeed={reduce ? 0 : 14}
                linePause={reduce ? 0 : 320}
                startDelay={reduce ? 0 : 400}
                lines={reduce ? bioStatic : bio}
              />
            </div>

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.06] font-mono sm:grid-cols-4">
              {now.map(([k, v]) => (
                <div key={k} className="bg-background/70 px-4 py-3 backdrop-blur-xl">
                  <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">{k}</dt>
                  <dd className="mt-1 text-xs leading-snug text-foreground/90">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Highlights — one instrument panel, hairline-divided, no cards.
            The `gap-px` over a faint panel background is what draws the
            dividing hairlines; each cell is transparent glass, not a card. */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.05]">
          <ul className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item, i) => (
              <li key={item.title} className="bg-background/70 backdrop-blur-xl transition-colors duration-500 hover:bg-background/50">
                <AnimatedSection delay={i * 80} className="h-full">
                  <HoloCell className="group h-full px-6 py-10">
                    <GlyphPlinth icon={item.icon} />

                    <div style={{ transform: "translateZ(12px)" }}>
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
                        {item.title}
                      </p>
                      <p className="mt-2 font-display text-xl font-light text-foreground sm:text-2xl">
                        {item.subtitleNum ? (
                          <>{reduce ? item.subtitleNum : <AnimatedCounter value={item.subtitleNum} duration={1800} />}{item.subtitleText}</>
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
