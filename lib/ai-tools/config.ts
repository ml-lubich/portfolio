export type ProjectType = "chatbot" | "rag" | "automation" | "dashboard" | "agent"
export type ModelTier = "lean" | "balanced" | "frontier"
export type LaunchSpeed = "prototype" | "production" | "enterprise"

export interface ProjectOption {
  value: ProjectType
  label: string
  description: string
}

export interface ModelTierOption {
  value: ModelTier
  label: string
  perMillionInput: number
  perMillionOutput: number
}

export interface EstimatorConfig {
  baseBuildWeeks: Record<ProjectType, number>
  integrationWeeks: number
  reviewMultiplier: number
  infraBaseMonthly: Record<LaunchSpeed, number>
  modelTiers: ModelTierOption[]
}

export const PROJECT_OPTIONS: ProjectOption[] = [
  { value: "chatbot", label: "Support chatbot", description: "Guided chat with handoff and analytics." },
  { value: "rag", label: "RAG knowledge assistant", description: "Search, retrieve, cite, and answer from private docs." },
  { value: "automation", label: "Workflow automation", description: "Summarize, classify, route, and draft operational work." },
  { value: "dashboard", label: "AI dashboard", description: "Decision surface with ingestion, scoring, and review." },
  { value: "agent", label: "Agent workflow", description: "Multi-step tool use with approvals and audit trails." },
]

export const MODEL_TIERS: ModelTierOption[] = [
  { value: "lean", label: "Lean open/free tier", perMillionInput: 0.25, perMillionOutput: 0.8 },
  { value: "balanced", label: "Balanced production", perMillionInput: 3, perMillionOutput: 12 },
  { value: "frontier", label: "Frontier model", perMillionInput: 15, perMillionOutput: 75 },
]

export const ESTIMATOR_CONFIG: EstimatorConfig = {
  baseBuildWeeks: { chatbot: 3, rag: 5, automation: 4, dashboard: 6, agent: 8 },
  integrationWeeks: 0.75,
  reviewMultiplier: 1.22,
  infraBaseMonthly: { prototype: 35, production: 180, enterprise: 650 },
  modelTiers: MODEL_TIERS,
}

export const PROMPT_LINTER_CONFIG = {
  maxPromptChars: 6000,
  minSpecificWords: 80,
  hfModel: "HuggingFaceH4/zephyr-7b-beta",
  rateLimit: { maxRequests: 8, windowMs: 60_000 },
} as const
