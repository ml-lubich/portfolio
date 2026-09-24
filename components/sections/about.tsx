"use client"

import { memo } from "react"
import { GraduationCap, BookOpen, Users, Code2, Award, Briefcase } from "lucide-react"
import Image from "next/image"
import { useReducedMotion } from "framer-motion"
import { AnimatedSection } from "../animations/animated-section"
import { AnimatedCounter } from "../animations/animated-counter"
import { SectionHeader } from "../layout/section-header"
import { TerminalReveal as TerminalRevealImpl } from "../terminal/terminal-reveal"

/* memo: TerminalReveal's typing loop re-arms its timers on every render, so a
   parent re-render inside the ~300ms line pause cancels it and the typing
   stalls at the end of a line. Stable props + memo keep re-renders out.
   Static import, not dynamic({ ssr: false }): a client-only chunk mounted the
   card (435px on a phone) AFTER the section was on screen, shoving everything
   below it — the page "scrolling by itself". Its first render is deterministic
   (typing starts from useInView), so SSR is safe and it lands at full height. */
const TerminalReveal = memo(TerminalRevealImpl)

const highlights = [
  {
    icon: GraduationCap,
    title: "Education",
    subtitleNum: "",
    subtitleText: "UC Berkeley",
    detail: "B.A. Computer Science",
    backDescription: "UC Berkeley B.A. in Computer Science with a focus on machine learning, distributed systems, and algorithms. Foundation for peer-reviewed research and industry-scale engineering.",
  },
  {
    icon: Briefcase,
    title: "Experience",
    subtitleNum: "",
    subtitleText: "EchoStar, Apple, Walmart",
    detail: "Staff AI Engineer · Fortune 500 · LBNL",
    backDescription: "Staff AI Engineer at EchoStar building consumer-scale telecom AI. Before that: ML inference at Apple serving 100M+ users, cloud-native microservices at Walmart, ML pipelines at Lawrence Berkeley National Lab, and Honda Innovations.",
  },
  {
    icon: BookOpen,
    title: "Publications",
    subtitleNum: "6",
    subtitleText: " Research Papers",
    detail: "Machine Learning & Hydrology",
    backDescription: "Published 6 peer-reviewed papers applying ML to hydrology and environmental science — neural networks, clustering, and tree-based models for real-world prediction systems.",
  },
  {
    icon: Award,
    title: "Recognition",
    subtitleNum: "100M+",
    subtitleText: " Users Reached",
    detail: "Industry Impact",
    backDescription: "Deployed models and pipelines reaching 100M+ users at Apple scale. Recognized for driving 300% model performance gains and maintaining 99.9% uptime SLAs.",
  },
  {
    icon: Users,
    title: "Leadership",
    subtitleNum: "",
    subtitleText: "Team Lead & Mentor",
    detail: "Cross-functional Teams",
    backDescription: "Led cross-functional engineering teams across ML, backend, and infrastructure. Mentored junior engineers, established code review standards, and drove Agile delivery processes.",
  },
  {
    icon: Code2,
    title: "Open Source",
    subtitleNum: "",
    subtitleText: "MCP Servers + CLIs",
    detail: "imsg · imail · inotes · wa-mcp · jenkins-mcp",
    backDescription: "Maintains the agent-tool family — imsg, imail, inotes, wa-mcp, bitbucket-cli, confluence-cli, pdfify-md, jenkins-mcp — local-first CLIs that double as MCP servers for Claude, Cursor, and VS Code.",
  },
]

/* Typed into the terminal. Four short lines that each fit one row — the six
   wrapping lines this replaced read as a wall. The facts they carried that
   aren't here are in the tiles below (6 papers, the agent-tool family). */
const bio = [
  "EchoStar — Staff AI in under 3 years · consumer telecom.",
  "Before: Polaris Wireless, Apple, Walmart, LBNL, Honda Innovations.",
  "300M+ customers reached · $100M+ Walmart ad-tech revenue · 6 papers.",
  "Co-founded Equiverse.ml — tooling for 5,000+ underrepresented students.",
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
  ["building", "RAG · agents · evals"],
]

export function About() {
  // The global CSS zeroes CSS animations, but the typewriter and counter are
  // timer-driven and need their own branch: render the finished state.
  const reduce = useReducedMotion() ?? false
  return (
    <AnimatedSection id="about" className="relative section-y overflow-hidden">
      {/* Ambient wash — the same two-orb treatment #open-source uses, so the
          two sections read as one page. The old stack (three pulsing orbs on
          the looping glow keyframes, plus a WebGL particle field) is what made
          this section read as lit liquid glass next to everything else. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/4 top-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute right-1/4 bottom-20 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-3 md:px-4 lg:px-6">
        <SectionHeader
          label="About Me"
          title={<>Building at the intersection of{" "}<span className="gradient-text">AI and Engineering</span></>}
          subtitle="Staff AI Engineer at EchoStar — reached staff level in under 3 years. Consumer-scale telecom puts the same agent and RAG work in front of millions."
        />

        {/* Bio — portrait alongside the terminal (OpenClaw + claw live under #consulting).
            The frame stays 3/4 at every width (source is 1093×1439). Stretching it
            to the terminal made a wide face crop. */}
        <div className="relative mx-auto mb-10 flex max-w-5xl flex-col items-stretch gap-5 md:flex-row md:items-stretch">
          <div className="group/photo relative mx-auto aspect-[3/4] w-full max-w-[20rem] shrink-0 overflow-hidden rounded-2xl border border-border shadow-2xl shadow-black/40 md:mx-0 md:w-72 md:max-w-none lg:w-80">
            <Image
              src="/misha-desk-laptop.png"
              alt="Misha Lubich at his desk"
              width={1093}
              height={1439}
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover/photo:scale-105"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/2wBDACgcHiMeGSgjISMtKygwPGRBPDc3PHtYXUlkkYCZlo+AjIqgtObDoKrarYqMyP/L2u71////m8H////6/+b9//j/2wBDASstLTw1PHZBQXb4pYyl+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj/wAARCAAUAA8DASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAEDAv/EABYQAQEBAAAAAAAAAAAAAAAAAAABEf/EABUBAQEAAAAAAAAAAAAAAAAAAAEA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8Appyp6coLAARf/9k="
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" aria-hidden />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <TerminalReveal
              bodyMinHeight="min-h-[140px]"
              title="~/about — misha.bio"
              prompt=">"
              charSpeed={reduce ? 0 : 14}
              linePause={reduce ? 0 : 320}
              startDelay={reduce ? 0 : 400}
              lines={reduce ? bioStatic : bio}
            />

            {/* Two columns, two rows — the strip grows with the taller portrait
                instead of a single short row of four. */}
            <dl className="grid flex-1 grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border font-mono">
              {now.map(([k, v]) => (
                <div key={k} className="flex h-full flex-col justify-center bg-card px-4 py-3">
                  <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">{k}</dt>
                  <dd className="mt-1 text-xs leading-snug text-foreground/90">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Highlights — one hairline-divided panel. `gap-px` over the panel's
            border-token background is what draws the dividers; each cell is a
            flat `bg-card` tile. The plinths this replaced (rotating conic
            rings, a blurred floor-light pool, a pointer-tilted 3D cell) were
            the "liquid glass" read; a glyph in a bordered square is the same
            treatment the rest of the site uses. */}
        <div className="overflow-hidden rounded-2xl border border-border bg-border">
          <ul className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item, i) => {
              const Icon = item.icon
              return (
                <li key={item.title} className="bg-card transition-colors duration-300 hover:bg-muted/10">
                  <AnimatedSection delay={i * 60} className="h-full">
                    <div className="flex h-full flex-col px-6 py-7">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background/60">
                          <Icon className="h-[1.05rem] w-[1.05rem] text-muted-foreground" aria-hidden />
                        </span>
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
                          {item.title}
                        </p>
                      </div>

                      <p className="mt-4 font-display text-xl font-light text-foreground">
                        {item.subtitleNum ? (
                          <>{reduce ? item.subtitleNum : <AnimatedCounter value={item.subtitleNum} duration={1800} />}{item.subtitleText}</>
                        ) : (
                          item.subtitleText
                        )}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground/70">{item.detail}</p>
                    </div>
                  </AnimatedSection>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </AnimatedSection>
  )
}
