import { ESTIMATOR_CONFIG, type EstimatorConfig, type LaunchSpeed, type ModelTier, type ProjectType } from "./config"

export interface ProjectCostInput {
  projectType: ProjectType
  monthlyUsers: number
  requestsPerUser: number
  avgInputTokens: number
  avgOutputTokens: number
  modelTier: ModelTier
  launchSpeed: LaunchSpeed
  integrations: number
  humanReview: boolean
}

export interface ProjectCostEstimate {
  monthlyRequests: number
  llmMonthlyLow: number
  llmMonthlyHigh: number
  infraMonthlyLow: number
  infraMonthlyHigh: number
  buildWeeksLow: number
  buildWeeksHigh: number
  complexityScore: number
  stack: string[]
  assumptions: string[]
}

export function estimateProjectCost(input: ProjectCostInput, cfg: EstimatorConfig): ProjectCostEstimate {
  const tier = findModelTier(input.modelTier, cfg)
  const monthlyRequests = calcRequests(input)
  const llmMonthlyLow = calcModelCost(input, monthlyRequests, tier.perMillionInput, tier.perMillionOutput)
  const buildWeeksLow = calcBuildWeeks(input, cfg)
  return {
    monthlyRequests,
    llmMonthlyLow,
    llmMonthlyHigh: Math.ceil(llmMonthlyLow * 1.8),
    infraMonthlyLow: cfg.infraBaseMonthly[input.launchSpeed],
    infraMonthlyHigh: Math.ceil(cfg.infraBaseMonthly[input.launchSpeed] * 2.4),
    buildWeeksLow,
    buildWeeksHigh: Math.ceil(buildWeeksLow * 1.55),
    complexityScore: calcComplexity(input),
    stack: buildStack(input),
    assumptions: buildAssumptions(input),
  }
}

export function defaultProjectInput(): ProjectCostInput {
  return {
    projectType: "rag",
    monthlyUsers: 1200,
    requestsPerUser: 12,
    avgInputTokens: 1400,
    avgOutputTokens: 450,
    modelTier: "balanced",
    launchSpeed: "production",
    integrations: 2,
    humanReview: true,
  }
}

function findModelTier(modelTier: ModelTier, cfg: EstimatorConfig) {
  const tier = cfg.modelTiers.find(item => item.value === modelTier)
  if (!tier) throw new Error(`Unknown model tier: ${modelTier}`)
  return tier
}

function calcRequests(input: ProjectCostInput): number {
  return Math.max(0, Math.round(input.monthlyUsers * input.requestsPerUser))
}

function calcModelCost(input: ProjectCostInput, requests: number, inRate: number, outRate: number): number {
  const inputCost = (requests * input.avgInputTokens * inRate) / 1_000_000
  const outputCost = (requests * input.avgOutputTokens * outRate) / 1_000_000
  return Math.ceil(inputCost + outputCost)
}

function calcBuildWeeks(input: ProjectCostInput, cfg: EstimatorConfig): number {
  const base = cfg.baseBuildWeeks[input.projectType]
  const integrationLoad = input.integrations * cfg.integrationWeeks
  const reviewLoad = input.humanReview ? cfg.reviewMultiplier : 1
  return Math.ceil((base + integrationLoad) * reviewLoad)
}

function calcComplexity(input: ProjectCostInput): number {
  const review = input.humanReview ? 12 : 0
  const launch = input.launchSpeed === "enterprise" ? 24 : input.launchSpeed === "production" ? 12 : 4
  return Math.min(100, 24 + input.integrations * 8 + review + launch)
}

function buildStack(input: ProjectCostInput): string[] {
  const core = ["Next.js product surface", "Typed API routes", "observability + eval logs"]
  const retrieval = input.projectType === "rag" ? ["vector search", "citation store"] : []
  const agent = input.projectType === "agent" ? ["tool sandbox", "approval queue"] : []
  return [...core, ...retrieval, ...agent]
}

function buildAssumptions(input: ProjectCostInput): string[] {
  return [
    `${input.monthlyUsers.toLocaleString()} monthly users`,
    `${input.requestsPerUser.toLocaleString()} AI requests per user`,
    `${input.avgInputTokens.toLocaleString()} input and ${input.avgOutputTokens.toLocaleString()} output tokens per request`,
  ]
}

export const DEFAULT_ESTIMATOR_CONFIG = ESTIMATOR_CONFIG
