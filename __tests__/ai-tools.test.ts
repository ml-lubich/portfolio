import { describe, expect, it } from "vitest"
import fs from "fs"
import path from "path"
import { ESTIMATOR_CONFIG } from "../lib/ai-tools/config"
import { defaultProjectInput, estimateProjectCost } from "../lib/ai-tools/estimator"
import { lintPrompt } from "../lib/ai-tools/prompt-linter"

const ROOT = path.resolve(__dirname, "..")

describe("AI project cost estimator", () => {
  it("computes monthly request volume from users and usage", () => {
    expect(estimateProjectCost(defaultProjectInput(), ESTIMATOR_CONFIG).monthlyRequests).toBe(14400)
  })

  it("estimates default balanced monthly LLM cost", () => {
    expect(estimateProjectCost(defaultProjectInput(), ESTIMATOR_CONFIG).llmMonthlyLow).toBe(139)
  })

  it("adds agent workflow controls to the stack", () => {
    const input = { ...defaultProjectInput(), projectType: "agent" as const }
    expect(estimateProjectCost(input, ESTIMATOR_CONFIG).stack).toContain("approval queue")
  })
})

describe("system prompt linter", () => {
  it("flags a vague prompt as weak", () => {
    expect(lintPrompt("Make this better").score).toBeLessThan(60)
  })

  it("scores a bounded system prompt as strong", () => {
    expect(lintPrompt(strongPrompt()).score).toBeGreaterThanOrEqual(86)
  })

  it("returns rewrite guidance for missing prompt pieces", () => {
    expect(lintPrompt("Summarize this").rewrittenBrief).toContain("output")
  })

  it("returns actionable recommendations", () => {
    expect(lintPrompt("Summarize this").recommendations[0]).toContain("persona")
  })

  it("returns quick wins for the UI", () => {
    expect(lintPrompt("Summarize this").quickWins).toContain("Add role")
  })
})

describe("AI tools route wiring", () => {
  it("exposes the tools page file", () => {
    expect(fs.existsSync(path.join(ROOT, "app/tools/page.tsx"))).toBe(true)
  })

  it("adds AI Tools to the nav live tools", () => {
    expect(fs.readFileSync(path.join(ROOT, "components/nav/nav-links.ts"), "utf-8")).toContain("/tools")
  })

  it("includes tools in the sitemap", () => {
    expect(fs.readFileSync(path.join(ROOT, "app/sitemap.ts"), "utf-8")).toContain("${SITE_URL}/tools")
  })
})

describe("prompt linter API", () => {
  it("keeps the Hugging Face token server-side", () => {
    expect(fs.readFileSync(path.join(ROOT, "app/api/prompt-lint/route.ts"), "utf-8")).toContain("HUGGINGFACE_API_TOKEN")
  })

  it("documents the optional Hugging Face env var", () => {
    expect(fs.readFileSync(path.join(ROOT, ".env.example"), "utf-8")).toContain("HUGGINGFACE_API_TOKEN")
  })

  it("uses the shared rate limit config", () => {
    expect(fs.readFileSync(path.join(ROOT, "app/api/prompt-lint/route.ts"), "utf-8")).toContain("rateLimit.maxRequests")
  })
})

function strongPrompt(): string {
  return [
    "You are a senior AI product engineer.",
    "Given workflow context and input examples, decide whether automation is safe.",
    "Return JSON output with verdict, risks, data_needed, and next_steps.",
    "You must not recommend automation without human review for high-risk cases.",
    "If context is missing, ask one clarifying question before continuing.",
    "Tone should be concise, direct, and professional for an executive reviewer.",
    "Success criteria: answer is specific, auditable, and includes one example.",
    "Example input: workflow notes. Example output: JSON verdict with risks.",
  ].join(" ")
}
