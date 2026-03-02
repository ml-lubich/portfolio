"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { X, ArrowRight, Layers, Cpu, GitBranch, Database, Server, Shield, Zap } from "lucide-react"

/* ══════════════════════════════════════════════════════════════════════
 *  Detail Panel — slides in from the right when a card is selected.
 *
 *  Renders rich detail content: architecture nodes, tech stack,
 *  key highlights, and an optional animated diagram slot.
 * ══════════════════════════════════════════════════════════════════════ */

export interface DetailPanelData {
  title: string
  subtitle: string
  period?: string
  location?: string
  description: string
  highlights: string[]
  architecture?: ArchitectureNode[]
  techStack: string[]
  metrics?: { label: string; value: string }[]
  diagramType?: "pipeline" | "microservices" | "ml-pipeline" | "fullstack" | "agents" | "cicd"
  gradient: string
  accent: string
}

export interface ArchitectureNode {
  label: string
  icon: "layers" | "cpu" | "git" | "database" | "server" | "shield" | "zap"
  description: string
}

const iconMap = {
  layers: Layers,
  cpu: Cpu,
  git: GitBranch,
  database: Database,
  server: Server,
  shield: Shield,
  zap: Zap,
}

interface DetailPanelProps {
  data: DetailPanelData | null
  isOpen: boolean
  onClose: () => void
}

export function DetailPanel({ data, isOpen, onClose }: DetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handler)
      // Prevent body scroll when panel is open
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  // Scroll panel back to top when data changes
  useEffect(() => {
    if (panelRef.current && data) {
      panelRef.current.scrollTop = 0
    }
  }, [data])

  if (!data) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed right-0 top-0 z-50 h-full w-full overflow-y-auto border-l border-border/30 bg-background/95 backdrop-blur-2xl transition-[transform,visibility] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:w-[540px] lg:w-[600px] ${
          isOpen ? "translate-x-0 visible" : "translate-x-full invisible"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={data.title}
      >
        {/* Gradient accent line */}
        <div className={`absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b ${data.gradient}`} />

        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -left-20 top-1/4 h-80 w-80 rounded-full opacity-10 blur-[100px]"
          style={{ background: data.accent }}
        />
        <div
          className="pointer-events-none absolute -right-20 bottom-1/4 h-60 w-60 rounded-full opacity-8 blur-[80px]"
          style={{ background: data.accent }}
        />

        {/* Subtle grid pattern */}
        <div className="pointer-events-none absolute inset-0 circuit-grid opacity-30" />

        <div className="relative px-8 py-10 sm:px-10">
          {/* Close button */}
          <button
            onClick={onClose}
            className="group absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-secondary/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-secondary/80 hover:scale-105"
            aria-label="Close panel"
          >
            <X className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </button>

          {/* Header */}
          <div className="panel-stagger pr-12">
            {data.period && (
              <span className="inline-block rounded-full border border-border/60 bg-secondary/40 px-3 py-1 font-mono text-[11px] text-muted-foreground backdrop-blur-sm">
                {data.period}
              </span>
            )}
            <h2 className="mt-4 font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              {data.title}
            </h2>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-primary">
              {data.subtitle}
            </p>
            {data.location && (
              <p className="mt-1 text-xs text-muted-foreground">{data.location}</p>
            )}
          </div>

          {/* Divider */}
          <div className={`my-8 h-px bg-gradient-to-r ${data.gradient} opacity-20`} />

          {/* Description */}
          <div className="panel-stagger" style={{ animationDelay: "100ms" }}>
            <p className="text-sm leading-relaxed text-muted-foreground">{data.description}</p>
          </div>

          {/* Metrics */}
          {data.metrics && data.metrics.length > 0 && (
            <div
              className="panel-stagger mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3"
              style={{ animationDelay: "150ms" }}
            >
              {data.metrics.map((m) => (
                <div
                  key={m.label}
                  className="group/metric rounded-xl border border-border/40 bg-secondary/20 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-secondary/40"
                >
                  <p className="font-mono text-xl font-bold text-foreground transition-colors group-hover/metric:text-primary">
                    {m.value}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Key highlights */}
          <div className="panel-stagger mt-8" style={{ animationDelay: "200ms" }}>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Key Highlights
            </h3>
            <ul className="space-y-3">
              {data.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3">
                  <ArrowRight
                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 text-primary`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                  <span className="text-sm leading-relaxed text-foreground/80">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Architecture nodes */}
          {data.architecture && data.architecture.length > 0 && (
            <div className="panel-stagger mt-10" style={{ animationDelay: "300ms" }}>
              <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Architecture
              </h3>
              <div className="relative space-y-3">
                {/* Connecting line */}
                <div className="absolute left-5 top-8 bottom-8 w-px bg-gradient-to-b from-primary/30 via-accent/20 to-transparent" />
                {data.architecture.map((node, i) => {
                  const Icon = iconMap[node.icon]
                  return (
                    <div
                      key={i}
                      className="group/node relative flex items-start gap-4 rounded-xl border border-transparent p-3 transition-all duration-300 hover:border-border/40 hover:bg-secondary/20"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${data.gradient} shadow-lg shadow-black/20 transition-transform duration-300 group-hover/node:scale-110`}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{node.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{node.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Animated diagram */}
          {data.diagramType && (
            <div className="panel-stagger mt-10" style={{ animationDelay: "400ms" }}>
              <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                System Diagram
              </h3>
              <ArchitectureDiagram type={data.diagramType} gradient={data.gradient} accent={data.accent} />
            </div>
          )}

          {/* Tech stack */}
          <div className="panel-stagger mt-10" style={{ animationDelay: "500ms" }}>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.techStack.map((tech, i) => (
                <span
                  key={tech}
                  className="rounded-lg border border-border/50 bg-secondary/30 px-3 py-1.5 font-mono text-xs text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-secondary/60 hover:text-foreground"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════
 *  Animated Architecture Diagram — pure CSS/SVG animated diagrams
 *  that look 3D and modern. No heavy canvas, just smooth CSS.
 * ══════════════════════════════════════════════════════════════════════ */

interface DiagramProps {
  type: "pipeline" | "microservices" | "ml-pipeline" | "fullstack" | "agents" | "cicd"
  gradient: string
  accent: string
}

function ArchitectureDiagram({ type, accent }: DiagramProps) {
  const configs: Record<string, { nodes: { label: string; x: number; y: number; size?: "sm" | "md" | "lg" }[]; edges: [number, number][] }> = {
    pipeline: {
      nodes: [
        { label: "Input", x: 10, y: 50, size: "sm" },
        { label: "Transform", x: 30, y: 30, size: "md" },
        { label: "Validate", x: 30, y: 70, size: "md" },
        { label: "Process", x: 55, y: 50, size: "lg" },
        { label: "Cache", x: 75, y: 30, size: "sm" },
        { label: "Output", x: 90, y: 50, size: "sm" },
      ],
      edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 5]],
    },
    microservices: {
      nodes: [
        { label: "API Gateway", x: 50, y: 10, size: "lg" },
        { label: "Auth", x: 15, y: 35, size: "md" },
        { label: "Users", x: 40, y: 40, size: "md" },
        { label: "Orders", x: 65, y: 40, size: "md" },
        { label: "Events", x: 85, y: 35, size: "sm" },
        { label: "DB", x: 25, y: 70, size: "sm" },
        { label: "Cache", x: 50, y: 75, size: "sm" },
        { label: "Queue", x: 75, y: 70, size: "sm" },
      ],
      edges: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [2, 5], [2, 6], [3, 6], [3, 7], [4, 7]],
    },
    "ml-pipeline": {
      nodes: [
        { label: "Data Lake", x: 10, y: 50, size: "md" },
        { label: "Feature Eng", x: 30, y: 30, size: "md" },
        { label: "Training", x: 50, y: 50, size: "lg" },
        { label: "Evaluation", x: 70, y: 30, size: "md" },
        { label: "Registry", x: 70, y: 70, size: "sm" },
        { label: "Serving", x: 90, y: 50, size: "md" },
      ],
      edges: [[0, 1], [1, 2], [2, 3], [2, 4], [3, 5], [4, 5], [3, 2]],
    },
    fullstack: {
      nodes: [
        { label: "Client", x: 50, y: 8, size: "lg" },
        { label: "CDN", x: 15, y: 30, size: "sm" },
        { label: "Next.js", x: 50, y: 35, size: "lg" },
        { label: "API", x: 85, y: 30, size: "md" },
        { label: "Auth", x: 20, y: 60, size: "sm" },
        { label: "DB", x: 50, y: 65, size: "md" },
        { label: "Storage", x: 80, y: 60, size: "sm" },
        { label: "Workers", x: 50, y: 90, size: "sm" },
      ],
      edges: [[0, 1], [0, 2], [0, 3], [2, 4], [2, 5], [2, 6], [3, 5], [5, 7]],
    },
    agents: {
      nodes: [
        { label: "Orchestrator", x: 50, y: 15, size: "lg" },
        { label: "Planner", x: 20, y: 40, size: "md" },
        { label: "Researcher", x: 50, y: 45, size: "md" },
        { label: "Writer", x: 80, y: 40, size: "md" },
        { label: "Tools / MCP", x: 15, y: 70, size: "sm" },
        { label: "Vector DB", x: 50, y: 75, size: "sm" },
        { label: "Critic", x: 85, y: 70, size: "sm" },
      ],
      edges: [[0, 1], [0, 2], [0, 3], [1, 4], [2, 5], [3, 6], [6, 0], [1, 2], [2, 3]],
    },
    cicd: {
      nodes: [
        { label: "Push", x: 8, y: 50, size: "sm" },
        { label: "Build", x: 25, y: 30, size: "md" },
        { label: "Lint", x: 25, y: 70, size: "sm" },
        { label: "Test", x: 45, y: 50, size: "md" },
        { label: "Security", x: 62, y: 30, size: "sm" },
        { label: "Stage", x: 75, y: 50, size: "md" },
        { label: "Deploy", x: 92, y: 50, size: "sm" },
      ],
      edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 5], [5, 6]],
    },
  }

  const config = configs[type] || configs.pipeline

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-[hsl(220,20%,5%)] p-1">
      {/* Floating grid background */}
      <div className="absolute inset-0 circuit-grid opacity-20" />

      <svg
        viewBox="0 0 100 100"
        className="relative z-10 h-auto w-full"
        style={{ minHeight: 220 }}
      >
        <defs>
          <filter id="glow-node">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.6" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="node-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.25" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Edges — animated dashed lines */}
        {config.edges.map(([from, to], i) => {
          const a = config.nodes[from]
          const b = config.nodes[to]
          return (
            <line
              key={`e-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="url(#edge-gradient)"
              strokeWidth="0.3"
              strokeDasharray="1.5 1"
              className="diagram-edge"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          )
        })}

        {/* Data flow particles along edges */}
        {config.edges.map(([from, to], i) => {
          const a = config.nodes[from]
          const b = config.nodes[to]
          return (
            <circle
              key={`p-${i}`}
              r="0.5"
              fill={accent}
              opacity="0.7"
              className="diagram-particle"
            >
              <animateMotion
                dur={`${2 + (i % 3)}s`}
                repeatCount="indefinite"
                begin={`${i * 0.3}s`}
              >
                <mpath>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                </mpath>
              </animateMotion>
              <animate
                attributeName="opacity"
                values="0;0.8;0.8;0"
                dur={`${2 + (i % 3)}s`}
                repeatCount="indefinite"
                begin={`${i * 0.3}s`}
              />
            </circle>
          )
        })}

        {/* Nodes */}
        {config.nodes.map((node, i) => {
          const r = node.size === "lg" ? 5 : node.size === "sm" ? 3 : 4
          return (
            <g key={`n-${i}`} className="diagram-node" style={{ animationDelay: `${i * 120}ms` }}>
              {/* Outer glow ring */}
              <circle
                cx={node.x}
                cy={node.y}
                r={r + 1.5}
                fill="none"
                stroke={accent}
                strokeWidth="0.15"
                opacity="0.3"
                className="diagram-ring"
                style={{ animationDelay: `${i * 200}ms` }}
              />
              {/* Node body */}
              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill="url(#node-gradient)"
                stroke={accent}
                strokeWidth="0.25"
                filter="url(#glow-node)"
                opacity="0.9"
              />
              {/* Inner bright dot */}
              <circle cx={node.x} cy={node.y} r="0.8" fill={accent} opacity="0.6" />
              {/* Label */}
              <text
                x={node.x}
                y={node.y + r + 3}
                textAnchor="middle"
                fill="hsl(210 20% 70%)"
                fontSize="2.8"
                fontFamily="var(--font-geist-mono), monospace"
                fontWeight="500"
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Floating label */}
      <div className="absolute bottom-3 right-3 rounded-md bg-secondary/40 px-2 py-1 backdrop-blur-sm">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
          {type.replace("-", " ")}
        </span>
      </div>
    </div>
  )
}
