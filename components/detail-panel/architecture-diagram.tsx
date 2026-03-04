import { diagramConfigs } from "./diagram-configs"
import { archDiagram } from "@/lib/theme"

interface DiagramProps {
  type: "pipeline" | "microservices" | "ml-pipeline" | "fullstack" | "agents" | "cicd"
  gradient: string
  accent: string
}

export function ArchitectureDiagram({ type, accent }: DiagramProps) {
  const config = diagramConfigs[type] || diagramConfigs.pipeline

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border/30 bg-[${archDiagram.bg}] p-1`}>
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
                fill={archDiagram.labelFill}
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
