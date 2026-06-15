import { PROMPT_LINTER_CONFIG } from "./config"

export type PromptSeverity = "pass" | "warning" | "critical"

export interface PromptIssue {
  id: string
  label: string
  severity: PromptSeverity
  message: string
  recommendation: string
}

export interface PromptLintResult {
  score: number
  verdict: string
  issues: PromptIssue[]
  strengths: string[]
  recommendations: string[]
  quickWins: string[]
  rewrittenBrief: string
}

interface PromptCheck {
  id: string
  label: string
  severity: PromptSeverity
  pattern: RegExp
  message: string
  recommendation: string
}

const CHECKS: PromptCheck[] = [
  { id: "role", label: "Role", severity: "critical", pattern: /you are|act as|role:/i, message: "Name the assistant role before giving tasks.", recommendation: "Start with a concrete persona, seniority, and domain boundary." },
  { id: "input", label: "Inputs", severity: "critical", pattern: /input|context|provided|given/i, message: "Define what information the model receives.", recommendation: "List the exact fields, files, or context blocks the model may use." },
  { id: "output", label: "Output", severity: "critical", pattern: /output|return|format|respond|json|schema/i, message: "Specify the response format or schema.", recommendation: "Use bullets, JSON keys, or a named section order so output is inspectable." },
  { id: "constraints", label: "Constraints", severity: "warning", pattern: /must|must not|do not|never|only/i, message: "Add hard constraints and non-goals.", recommendation: "State what the model must avoid, when to stop, and what is out of scope." },
  { id: "success", label: "Success criteria", severity: "warning", pattern: /success|done|pass|acceptable|criteria|verify/i, message: "Say how a good answer will be judged.", recommendation: "Add pass/fail criteria so the response can be reviewed without guessing." },
  { id: "examples", label: "Examples", severity: "warning", pattern: /example|e\.g\.|sample/i, message: "Include one concrete example for calibration.", recommendation: "Show one tiny input/output example, especially for structured responses." },
  { id: "failure", label: "Failure mode", severity: "warning", pattern: /if.*missing|cannot|clarify|ask|blocked|unknown/i, message: "Define what to do when information is missing.", recommendation: "Tell the model whether to ask one question, return a blocked state, or make a safe assumption." },
  { id: "tone", label: "Tone", severity: "warning", pattern: /tone|concise|direct|friendly|professional|terse/i, message: "Set communication tone and verbosity.", recommendation: "Add a one-line tone rule so output matches the audience." },
]

export function lintPrompt(prompt: string): PromptLintResult {
  const trimmed = prompt.trim().slice(0, PROMPT_LINTER_CONFIG.maxPromptChars)
  const issues = CHECKS.filter(check => !check.pattern.test(trimmed)).map(toIssue)
  const score = calcScore(trimmed, issues)
  return {
    score,
    verdict: verdictForScore(score),
    issues,
    strengths: buildStrengths(trimmed, issues),
    recommendations: buildRecommendations(issues),
    quickWins: buildQuickWins(trimmed, issues),
    rewrittenBrief: rewriteBrief(trimmed, issues),
  }
}

function toIssue(check: PromptCheck): PromptIssue {
  return { id: check.id, label: check.label, severity: check.severity, message: check.message, recommendation: check.recommendation }
}

function calcScore(prompt: string, issues: PromptIssue[]): number {
  const penalty = issues.reduce((sum, issue) => sum + severityPenalty(issue.severity), 0)
  const lengthPenalty = prompt.split(/\s+/).length < PROMPT_LINTER_CONFIG.minSpecificWords ? 8 : 0
  return Math.max(0, Math.min(100, 100 - penalty - lengthPenalty))
}

function severityPenalty(severity: PromptSeverity): number {
  return severity === "critical" ? 18 : 10
}

function verdictForScore(score: number): string {
  if (score >= 88) return "Production-grade"
  if (score >= 72) return "Strong draft"
  return "Needs tighter instructions"
}

function buildStrengths(prompt: string, issues: PromptIssue[]): string[] {
  const missing = new Set(issues.map(issue => issue.id))
  const present = CHECKS.filter(check => !missing.has(check.id)).map(check => `${check.label} is explicit`)
  return prompt ? present : ["Paste a prompt to start the audit"]
}

function buildRecommendations(issues: PromptIssue[]): string[] {
  const top = issues.slice(0, 5).map(issue => issue.recommendation)
  return top.length > 0 ? top : ["Keep the current contract and add examples as new edge cases appear."]
}

function buildQuickWins(prompt: string, issues: PromptIssue[]): string[] {
  if (!prompt) return ["Paste a real prompt", "Add role + output format", "Run the audit again"]
  const wins = issues.slice(0, 3).map(issue => `Add ${issue.label.toLowerCase()}`)
  return wins.length > 0 ? wins : ["Add one negative example", "Add expected edge-case handling", "Name the reviewer audience"]
}

function rewriteBrief(prompt: string, issues: PromptIssue[]): string {
  const missing = issues.slice(0, 5).map(issue => issue.label.toLowerCase()).join(", ") || "edge-case polish"
  const seed = prompt.split(/\s+/).slice(0, 36).join(" ")
  return `Rewrite with ${missing}. Use this structure: role → input contract → task → output format → constraints → success criteria → example. Source: ${seed}`
}
