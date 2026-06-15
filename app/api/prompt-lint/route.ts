import { NextRequest, NextResponse } from "next/server"
import { PROMPT_LINTER_CONFIG } from "@/lib/ai-tools/config"
import { lintPrompt, type PromptLintResult } from "@/lib/ai-tools/prompt-linter"

export const runtime = "nodejs"

interface PromptLintResponse {
  source: "local" | "huggingface"
  result: PromptLintResult
  aiSummary: string
  notice: string
}

interface RateBucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, RateBucket>()

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  if (!allowRequest(ip, Date.now())) return rateLimitedResponse()
  const body = await readBody(req)
  const prompt = parsePrompt(body)
  const result = lintPrompt(prompt)
  const aiSummary = await maybeHuggingFaceSummary(prompt, result)
  return NextResponse.json(buildResponse(result, aiSummary))
}

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"
}

function allowRequest(ip: string, now: number): boolean {
  const bucket = buckets.get(ip)
  if (!bucket || bucket.resetAt <= now) return resetBucket(ip, now)
  if (bucket.count >= PROMPT_LINTER_CONFIG.rateLimit.maxRequests) return false
  bucket.count += 1
  return true
}

function resetBucket(ip: string, now: number): boolean {
  buckets.set(ip, { count: 1, resetAt: now + PROMPT_LINTER_CONFIG.rateLimit.windowMs })
  return true
}

function rateLimitedResponse() {
  return NextResponse.json({ error: "Rate limit reached. Try again in a minute." }, { status: 429 })
}

async function readBody(req: NextRequest): Promise<unknown> {
  try {
    return await req.json()
  } catch {
    return {}
  }
}

function parsePrompt(body: unknown): string {
  if (!isRecord(body)) return ""
  return typeof body.prompt === "string" ? body.prompt : ""
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

async function maybeHuggingFaceSummary(prompt: string, result: PromptLintResult): Promise<string> {
  const token = process.env.HUGGINGFACE_API_TOKEN
  if (!token || !prompt.trim()) return ""
  try {
    return await fetchHuggingFaceSummary(token, prompt, result)
  } catch {
    return ""
  }
}

async function fetchHuggingFaceSummary(token: string, prompt: string, result: PromptLintResult): Promise<string> {
  const model = process.env.HUGGINGFACE_PROMPT_LINTER_MODEL || PROMPT_LINTER_CONFIG.hfModel
  const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, buildHfRequest(token, prompt, result))
  if (!res.ok) return ""
  return parseHfText(await res.json())
}

function buildHfRequest(token: string, prompt: string, result: PromptLintResult): RequestInit {
  return {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ inputs: hfPrompt(prompt, result), parameters: { max_new_tokens: 120, temperature: 0.2 } }),
  }
}

function hfPrompt(prompt: string, result: PromptLintResult): string {
  return `Audit this system prompt briefly. Local score: ${result.score}. Missing: ${result.issues.map(i => i.label).join(", ")}. Prompt: ${prompt.slice(0, 1800)}`
}

function parseHfText(payload: unknown): string {
  if (!Array.isArray(payload)) return ""
  const first = payload[0]
  if (!isRecord(first)) return ""
  return typeof first.generated_text === "string" ? first.generated_text.slice(0, 700) : ""
}

function buildResponse(result: PromptLintResult, aiSummary: string): PromptLintResponse {
  return {
    source: aiSummary ? "huggingface" : "local",
    result,
    aiSummary,
    notice: aiSummary ? "AI critique generated with a server-side Hugging Face token." : "Local deterministic audit used; no paid AI call required.",
  }
}
