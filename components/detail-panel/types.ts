import { Layers, Cpu, GitBranch, Database, Server, Shield, Zap } from "lucide-react"

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

export const iconMap = {
  layers: Layers,
  cpu: Cpu,
  git: GitBranch,
  database: Database,
  server: Server,
  shield: Shield,
  zap: Zap,
} as const
