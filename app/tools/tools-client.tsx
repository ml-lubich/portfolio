"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Bot, BrainCircuit, Calculator, CheckCircle2, Loader2, ShieldCheck, Sparkles, Wand2, type LucideIcon } from "lucide-react"
import { SiteLogoMark } from "@/components/site-logo-mark"
import { ESTIMATOR_CONFIG, MODEL_TIERS, PROJECT_OPTIONS, type LaunchSpeed, type ModelTier, type ProjectType } from "@/lib/ai-tools/config"
import { defaultProjectInput, estimateProjectCost, type ProjectCostEstimate, type ProjectCostInput } from "@/lib/ai-tools/estimator"
import { lintPrompt, type PromptLintResult } from "@/lib/ai-tools/prompt-linter"

type ToolTab = "estimator" | "linter"

interface PromptApiResponse {
  source: "local" | "huggingface"
  result: PromptLintResult
  aiSummary: string
  notice: string
}

const LAUNCH_SPEEDS: Array<{ value: LaunchSpeed; label: string }> = [
  { value: "prototype", label: "Prototype" },
  { value: "production", label: "Production" },
  { value: "enterprise", label: "Enterprise" },
]

const SAMPLE_PROMPT = `You are a senior AI product engineer. Given a user workflow, identify whether it is a good fit for an LLM automation. Return JSON with: verdict, risks, data_needed, and next_steps. Success means the answer is specific, auditable, and does not recommend automation when human review is required.`

export function ToolsClient() {
  const [tab, setTab] = useState<ToolTab>("estimator")
  return (
    <>
      <ToolsNav />
      <section className="relative overflow-hidden px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
        <GlowField />
        <div className="relative mx-auto max-w-6xl">
          <ToolsHero />
          <ToolTabs active={tab} onChange={setTab} />
          {tab === "estimator" ? <EstimatorPanel /> : <PromptLinterPanel />}
        </div>
      </section>
    </>
  )
}

function ToolsNav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <SiteLogoMark width={32} height={32} sizes="32px" />
          <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">← Portfolio</span>
        </Link>
        <Link href="/llm-prices" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
          LLM pricing <ArrowRight className="ml-1 inline h-3 w-3" />
        </Link>
      </div>
    </header>
  )
}

function GlowField() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-primary/[0.08] blur-[120px]" />
      <div className="absolute top-16 right-1/5 h-[340px] w-[340px] rounded-full bg-violet-500/[0.08] blur-[100px]" />
      <div className="absolute bottom-0 left-0 h-[260px] w-[260px] rounded-full bg-emerald-500/[0.06] blur-[90px]" />
    </div>
  )
}

function ToolsHero() {
  return (
    <div className="max-w-3xl">
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
        <Sparkles className="h-3.5 w-3.5" /> Free-first AI planning tools
      </span>
      <h1 className="gradient-text mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
        Plan the AI build before the invoice surprises you.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
        Estimate AI product cost, scope the build, and lint prompts with local deterministic logic. Optional Hugging Face critique stays server-side and rate-limited.
      </p>
    </div>
  )
}

function ToolTabs({ active, onChange }: { active: ToolTab; onChange: (tab: ToolTab) => void }) {
  return (
    <div className="mt-8 inline-flex rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1">
      <TabButton label="Cost estimator" Icon={Calculator} active={active === "estimator"} onClick={() => onChange("estimator")} />
      <TabButton label="Prompt linter" Icon={Wand2} active={active === "linter"} onClick={() => onChange("linter")} />
    </div>
  )
}

function TabButton({ label, Icon, active, onClick }: { label: string; Icon: LucideIcon; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={["flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-all", active ? "bg-white text-black" : "text-muted-foreground hover:text-foreground"].join(" ")}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

function EstimatorPanel() {
  const [input, setInput] = useState<ProjectCostInput>(defaultProjectInput())
  const estimate = useMemo(() => estimateProjectCost(input, ESTIMATOR_CONFIG), [input])
  const update = (patch: Partial<ProjectCostInput>) => setInput(prev => ({ ...prev, ...patch }))
  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
      <GlassCard title="AI project cost estimator" icon={<Calculator className="h-5 w-5" />}>
        <EstimatorForm input={input} onChange={update} />
      </GlassCard>
      <EstimateSummary estimate={estimate} input={input} />
    </div>
  )
}

function EstimatorForm({ input, onChange }: { input: ProjectCostInput; onChange: (patch: Partial<ProjectCostInput>) => void }) {
  return (
    <div className="space-y-5">
      <SelectField label="Project type" value={input.projectType} onChange={v => onChange({ projectType: v as ProjectType })} options={PROJECT_OPTIONS} />
      <SelectField label="Model tier" value={input.modelTier} onChange={v => onChange({ modelTier: v as ModelTier })} options={MODEL_TIERS} />
      <SelectField label="Launch bar" value={input.launchSpeed} onChange={v => onChange({ launchSpeed: v as LaunchSpeed })} options={LAUNCH_SPEEDS} />
      <RangeField label="Monthly users" value={input.monthlyUsers} min={100} max={50000} step={100} onChange={v => onChange({ monthlyUsers: v })} />
      <RangeField label="Requests per user" value={input.requestsPerUser} min={1} max={80} step={1} onChange={v => onChange({ requestsPerUser: v })} />
      <RangeField label="Integrations" value={input.integrations} min={0} max={8} step={1} onChange={v => onChange({ integrations: v })} />
      <ReviewToggle checked={input.humanReview} onChange={v => onChange({ humanReview: v })} />
    </div>
  )
}

function EstimateSummary({ estimate, input }: { estimate: ProjectCostEstimate; input: ProjectCostInput }) {
  return (
    <GlassCard title="Planning output" icon={<BrainCircuit className="h-5 w-5" />} accent>
      <div className="grid gap-3 sm:grid-cols-2">
        <Metric label="Monthly LLM" value={moneyRange(estimate.llmMonthlyLow, estimate.llmMonthlyHigh)} />
        <Metric label="Infra" value={moneyRange(estimate.infraMonthlyLow, estimate.infraMonthlyHigh)} />
        <Metric label="Build window" value={`${estimate.buildWeeksLow}–${estimate.buildWeeksHigh} weeks`} />
        <Metric label="Complexity" value={`${estimate.complexityScore}/100`} />
      </div>
      <div className="mt-5 rounded-2xl border border-white/[0.08] bg-black/20 p-4">
        <p className="text-sm font-medium text-foreground">Recommended stack</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {estimate.stack.map(item => <Pill key={item}>{item}</Pill>)}
        </div>
      </div>
      <AssumptionList estimate={estimate} projectType={input.projectType} />
    </GlassCard>
  )
}

function AssumptionList({ estimate, projectType }: { estimate: ProjectCostEstimate; projectType: ProjectType }) {
  return (
    <div className="mt-5 space-y-2 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">Assumptions for {projectType}</p>
      {estimate.assumptions.map(item => <p key={item}>• {item}</p>)}
      <p>• Conservative ranges; final quote depends on data readiness, auth, QA, and deployment controls.</p>
    </div>
  )
}

function PromptLinterPanel() {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT)
  const [remote, setRemote] = useState<PromptApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const local = useMemo(() => lintPrompt(prompt), [prompt])
  async function runCritique() {
    setLoading(true)
    setRemote(await requestPromptLint(prompt))
    setLoading(false)
  }
  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
      <PromptEditor prompt={prompt} setPrompt={setPrompt} loading={loading} runCritique={runCritique} />
      <PromptReport local={local} remote={remote} />
    </div>
  )
}

function PromptEditor({ prompt, setPrompt, loading, runCritique }: { prompt: string; setPrompt: (value: string) => void; loading: boolean; runCritique: () => void }) {
  return (
    <GlassCard title="System prompt linter" icon={<Wand2 className="h-5 w-5" />}>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        className="min-h-[320px] w-full resize-y rounded-2xl border border-white/[0.08] bg-black/30 p-4 font-mono text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary/40"
        placeholder="Paste a system prompt or instruction block..."
      />
      <button type="button" onClick={runCritique} disabled={loading} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
        Run optional AI critique
      </button>
      <p className="mt-3 text-xs text-muted-foreground/60">Works locally by default. If HUGGINGFACE_API_TOKEN is set, the server adds a rate-limited free-tier critique.</p>
    </GlassCard>
  )
}

function PromptReport({ local, remote }: { local: PromptLintResult; remote: PromptApiResponse | null }) {
  return (
    <GlassCard title="Audit report" icon={<ShieldCheck className="h-5 w-5" />} accent>
      <div className="flex items-end justify-between gap-4">
        <Metric label="Prompt score" value={`${local.score}/100`} />
        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground">{local.verdict}</span>
      </div>
      <IssueList result={local} />
      <RemoteSummary remote={remote} />
    </GlassCard>
  )
}

function IssueList({ result }: { result: PromptLintResult }) {
  return (
    <div className="mt-5 space-y-3">
      {result.issues.length === 0 ? <PassRow /> : result.issues.map(issue => <IssueRow key={issue.id} issue={issue} />)}
      <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/50">Rewrite brief</p>
        <p className="mt-2 text-sm leading-6 text-foreground/80">{result.rewrittenBrief}</p>
      </div>
    </div>
  )
}

function PassRow() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
      <CheckCircle2 className="mt-0.5 h-4 w-4" /> Prompt has the core contract pieces.
    </div>
  )
}

function IssueRow({ issue }: { issue: PromptLintResult["issues"][number] }) {
  const color = issue.severity === "critical" ? "text-rose-200 border-rose-500/20 bg-rose-500/10" : "text-amber-100 border-amber-500/20 bg-amber-500/10"
  return <div className={`rounded-2xl border p-4 text-sm ${color}`}><strong>{issue.label}:</strong> {issue.message}</div>
}

function RemoteSummary({ remote }: { remote: PromptApiResponse | null }) {
  if (!remote) return null
  return (
    <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-primary/70">{remote.source} critique</p>
      <p className="mt-2 text-sm leading-6 text-foreground/80">{remote.aiSummary || remote.notice}</p>
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground/60">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-3 text-sm text-foreground outline-none focus:border-primary/40">
        {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  )
}

function RangeField({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground/60"><span>{label}</span><span>{value.toLocaleString()}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="mt-3 w-full accent-primary" />
    </label>
  )
}

function ReviewToggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-foreground">
      Human review + audit trail
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="h-5 w-5 accent-primary" />
    </label>
  )
}

function GlassCard({ title, icon, children, accent = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; accent?: boolean }) {
  return (
    <section className={["rounded-[2rem] border p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6", accent ? "border-primary/20 bg-primary/[0.045]" : "border-white/[0.08] bg-white/[0.035]"].join(" ")}>
      <div className="mb-5 flex items-center gap-3 text-foreground"><span className="rounded-xl border border-white/[0.08] bg-white/[0.06] p-2 text-primary">{icon}</span><h2 className="text-lg font-semibold">{title}</h2></div>
      {children}
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground">{children}</span>
}

function moneyRange(low: number, high: number): string {
  return `$${low.toLocaleString()}–$${high.toLocaleString()}`
}

async function requestPromptLint(prompt: string): Promise<PromptApiResponse> {
  const res = await fetch("/api/prompt-lint", buildPromptRequest(prompt))
  if (!res.ok) return failedPromptResponse(prompt)
  return parsePromptResponse(await res.json(), prompt)
}

function buildPromptRequest(prompt: string): RequestInit {
  return { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) }
}

function failedPromptResponse(prompt: string): PromptApiResponse {
  return { source: "local", result: lintPrompt(prompt), aiSummary: "", notice: "Rate limit or AI provider unavailable; local audit still ran." }
}

function parsePromptResponse(payload: unknown, prompt: string): PromptApiResponse {
  if (!isPromptResponse(payload)) return failedPromptResponse(prompt)
  return payload
}

function isPromptResponse(value: unknown): value is PromptApiResponse {
  if (typeof value !== "object" || value === null) return false
  return "source" in value && "result" in value && "notice" in value
}
