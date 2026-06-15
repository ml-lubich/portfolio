import { PROMPT_LINTER_CONFIG } from "./config"

export type PromptSeverity = "pass" | "warning" | "critical"

export interface PromptIssue {
  id: string
  label: string
  severity: PromptSeverity
  message: string
}

export interface PromptLintResult {
  score: number
  verdict: string
  issues: PromptIssue[]
  strengths: string[]
  rewrittenBrief: string
}

interface PromptCheck {
  id: string
  label: string
  severity: PromptSeverity
  pattern: RegExp
  message: string
}

const CHECKS: PromptCheck[] = [
  { id: "role", label: "Role", severity: "critical", pattern: /you are|act as|role:/i, message: "Name the assistant role before giving tasks." },
  { id: "input", label: "Inputs", severity: "critical", pattern: /input|context|provided|given/i, message: "Define what information the model receives." },
  { id: "output", label: "Output", severity: "critical", pattern: /output|return|format|respond/i, message: "Specify the response format or schema." },
  { id: "constraints", label: "Constraints", severity: "warning", pattern: /must|must not|do not|never|only/i, message: "Add hard constraints and non-goals." },
  { id: "success", label: "Success criteria", severity: "warning", pattern: /success|done|pass|acceptable|criteria/i, message: "Say how a good answer will be judged." },
  { id: "examples", label: "Examples", severity: "warning", pattern: /example|e\.g\.|sample/i, message: "Include one concrete example for calibration." },
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
    rewrittenBrief: rewriteBrief(trimmed, issues),
  }
}

function toIssue(check: PromptCheck): PromptIssue {
  return { id: check.id, label: check.label, severity: check.severity, message: check.message }
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
  if (score >= 86) return "Ship-ready"
  if (score >= 70) return "Strong with minor gaps"
  return "Needs tighter instructions"
}

function buildStrengths(prompt: string, issues: PromptIssue[]): string[] {
  const missing = new Set(issues.map(issue => issue.id))
  const present = CHECKS.filter(check => !missing.has(check.id)).map(check => `${check.label} is explicit`)
  return prompt ? present : ["Paste a prompt to start the audit"]
}

function rewriteBrief(prompt: string, issues: PromptIssue[]): string {
  const missing = issues.map(issue => issue.label.toLowerCase()).join(", ") || "minor polish"
  const seed = prompt.split(/\s+/).slice(0, 36).join(" ")
  return `Tighten this prompt by adding ${missing}. Keep the task bounded, state inputs, define output format, and include one success criterion. Source: ${seed}`
}
