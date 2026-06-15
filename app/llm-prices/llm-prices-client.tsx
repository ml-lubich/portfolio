"use client"

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react"
import Link from "next/link"
import {
  Search, X, Calculator, ChevronDown, ChevronUp,
  ArrowUpDown, ArrowUp, ArrowDown, Zap, RefreshCw,
} from "lucide-react"
import { SiteLogoMark } from "@/components/site-logo-mark"

/* ── Types ─────────────────────────────────────────────────────────── */

export interface PriceEntry {
  id: string
  vendor: string
  name: string
  input: number
  output: number
  input_cached: number | null
}

export interface PricesData {
  updated_at: string
  prices: PriceEntry[]
}

export type SortKey = "name" | "input" | "output"
export type SortDir = "asc" | "desc"

interface CalcState {
  input: string
  cached: string
  output: string
}

/* ── Vendor config ──────────────────────────────────────────────────── */

export const VENDOR_ACCENTS: Record<string, string> = {
  anthropic:   "#c084fc",
  openai:      "#34d399",
  google:      "#60a5fa",
  amazon:      "#f59e0b",
  xai:         "#fb923c",
  mistral:     "#22d3ee",
  deepseek:    "#6ee7b7",
  meta:        "#818cf8",
  minimax:     "#f472b6",
  moonshot:    "#a78bfa",
  "moonshot-ai": "#a78bfa",
  alibaba:     "#facc15",
  kimi:        "#a78bfa",
}

export const VENDOR_LABELS: Record<string, string> = {
  anthropic:   "Anthropic",
  openai:      "OpenAI",
  google:      "Google",
  amazon:      "Amazon",
  xai:         "xAI",
  mistral:     "Mistral",
  deepseek:    "DeepSeek",
  meta:        "Meta",
  minimax:     "MiniMax",
  moonshot:    "Moonshot AI",
  "moonshot-ai": "Moonshot AI",
  alibaba:     "Alibaba",
  kimi:        "Kimi",
}

export function vendorAccent(v: string): string {
  return VENDOR_ACCENTS[v.toLowerCase()] ?? "#94a3b8"
}

export function vendorLabel(v: string): string {
  const lv = v.toLowerCase()
  return VENDOR_LABELS[lv] ?? (v.charAt(0).toUpperCase() + v.slice(1))
}

/* ── Formatting helpers ─────────────────────────────────────────────── */

export function fmtPrice(n: number | null): string {
  if (n === null) return "—"
  if (n === 0) return "$0"
  if (n < 0.001) return `$${n.toFixed(5)}`
  if (n < 0.01) return `$${n.toFixed(4)}`
  if (n < 1)   return `$${n.toFixed(3)}`
  if (n < 10)  return `$${n.toFixed(2)}`
  return `$${n.toFixed(0)}`
}

export function fmtCalcCost(n: number): string {
  if (n === 0) return "$0.00"
  if (n < 0.000001) return `$${n.toFixed(8)}`
  if (n < 0.001)    return `$${n.toFixed(6)}`
  if (n < 0.01)     return `$${n.toFixed(5)}`
  if (n < 1)        return `$${n.toFixed(4)}`
  return `$${n.toFixed(2)}`
}

export function fmtDate(iso: string): string {
  try {
    return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
    })
  } catch {
    return iso
  }
}

/* ── Calc helpers ───────────────────────────────────────────────────── */

export function parseTokens(s: string): number {
  const cleaned = s.replace(/,/g, "").replace(/[kK]$/, "000").replace(/[mM]$/, "000000")
  const n = parseFloat(cleaned)
  return isFinite(n) && n >= 0 ? n : 0
}

export function calcCost(entry: PriceEntry, inp: number, cac: number, out: number): number {
  const cachedCost = cac > 0 && entry.input_cached !== null
    ? (cac * entry.input_cached) / 1_000_000
    : 0
  return (inp * entry.input) / 1_000_000 + cachedCost + (out * entry.output) / 1_000_000
}

function hasCalcInput(calc: CalcState): boolean {
  return parseTokens(calc.input) > 0 || parseTokens(calc.output) > 0
}

function calcCostFromState(entry: PriceEntry, calc: CalcState): number {
  return calcCost(entry, parseTokens(calc.input), parseTokens(calc.cached), parseTokens(calc.output))
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      Live
    </span>
  )
}

function SortIcon({ sortKey, active, dir }: { sortKey: SortKey; active: SortKey; dir: SortDir }) {
  if (active !== sortKey) return <ArrowUpDown className="h-3.5 w-3.5 opacity-30" />
  return dir === "asc"
    ? <ArrowUp className="h-3.5 w-3.5 text-primary" />
    : <ArrowDown className="h-3.5 w-3.5 text-primary" />
}

function VendorChip({ vendor }: { vendor: string }) {
  const color = vendorAccent(vendor)
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap"
      style={{ background: `${color}14`, color, border: `1px solid ${color}30` }}
    >
      {vendorLabel(vendor)}
    </span>
  )
}

/* ── Calculator panel ───────────────────────────────────────────────── */

interface CalcPanelProps {
  calc: CalcState
  onChange: (next: CalcState) => void
  onClear: () => void
}

function CalcField({
  label, value, placeholder, onChange,
}: { label: string; value: string; placeholder: string; onChange: (v: string) => void }) {
  return (
    <div className="flex min-w-[120px] flex-1 flex-col gap-1">
      <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/40 focus:outline-none transition-colors"
      />
    </div>
  )
}

function CalcPanel({ calc, onChange, onClear }: CalcPanelProps) {
  return (
    <div className="border-t border-white/[0.06] bg-white/[0.015] px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end gap-3">
          <CalcField label="Input tokens"  value={calc.input}  placeholder="e.g. 1000" onChange={v => onChange({ ...calc, input: v })} />
          <CalcField label="Cached tokens" value={calc.cached} placeholder="e.g. 500"  onChange={v => onChange({ ...calc, cached: v })} />
          <CalcField label="Output tokens" value={calc.output} placeholder="e.g. 500"  onChange={v => onChange({ ...calc, output: v })} />
          {hasCalcInput(calc) && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1.5 self-end rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-white/[0.14] hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground/50">
          Supports k / m suffixes (e.g. 1k = 1,000 · 1m = 1,000,000). Cost = (tokens ÷ 1M) × rate.
        </p>
      </div>
    </div>
  )
}

/* ── Table header ───────────────────────────────────────────────────── */

/* Column widths — shared between header and row so they stay in sync. */
const COL_RANK    = "hidden w-7 shrink-0 sm:block"
const COL_VENDOR  = "hidden w-28 shrink-0 sm:block"
const COL_INPUT   = "w-28 shrink-0 sm:w-36"
const COL_OUTPUT  = "w-16 shrink-0 sm:w-20"
const COL_CALC    = "w-20 shrink-0 sm:w-24"
const ROW_GAP     = "gap-2 sm:gap-4"

function TableHeader({ showCalcCol }: { showCalcCol: boolean }) {
  return (
    <div className={`flex items-center ${ROW_GAP} border-b border-white/[0.06] px-4 py-2 sm:px-6`}>
      <span className={`${COL_RANK} text-right font-mono text-[10px] uppercase tracking-widest text-muted-foreground/30`}>#</span>
      <span className={`${COL_VENDOR} text-[10px] uppercase tracking-widest text-muted-foreground/30`}>Vendor</span>
      <span className="flex-1 text-[10px] uppercase tracking-widest text-muted-foreground/30">Model</span>
      <span className={`${COL_INPUT} text-right text-[10px] uppercase tracking-widest text-muted-foreground/30`}>
        Input <span className="text-muted-foreground/20 hidden sm:inline">(Cached)</span>
      </span>
      <span className={`${COL_OUTPUT} text-right text-[10px] uppercase tracking-widest text-muted-foreground/30`}>Output</span>
      {showCalcCol && (
        <span className={`${COL_CALC} text-right text-[10px] uppercase tracking-widest text-primary/60`}>Est. Cost</span>
      )}
    </div>
  )
}

/* ── Model row ──────────────────────────────────────────────────────── */

interface RowProps {
  entry: PriceEntry
  calc: CalcState
  showCalcCol: boolean
  index: number
}

function CostTierColor(cost: number): string {
  if (cost < 0.001) return "#34d399"
  if (cost < 0.01)  return "#60a5fa"
  if (cost < 0.1)   return "#f59e0b"
  return "#fb923c"
}

function ModelRow({ entry, calc, showCalcCol, index }: RowProps) {
  const accent = vendorAccent(entry.vendor)
  const cost = showCalcCol ? calcCostFromState(entry, calc) : null

  return (
    <div className={`group relative flex items-center ${ROW_GAP} border-b border-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.025] sm:px-6`}>
      {/* Vendor accent strip on hover */}
      <div
        className="absolute left-0 top-0 h-full w-0.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: accent }}
      />

      {/* Rank */}
      <span className={`${COL_RANK} text-right font-mono text-[11px] text-muted-foreground/30`}>
        {index + 1}
      </span>

      {/* Vendor chip — fixed width matches header */}
      <div className={COL_VENDOR}>
        <VendorChip vendor={entry.vendor} />
      </div>

      {/* Model name + mobile vendor chip */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground/90 transition-colors group-hover:text-foreground">
          {entry.name}
        </p>
        <div className="mt-0.5 sm:hidden">
          <VendorChip vendor={entry.vendor} />
        </div>
      </div>

      {/* Input cost + cached */}
      <div className={`${COL_INPUT} text-right`}>
        <span className="font-mono text-sm text-foreground/80">{fmtPrice(entry.input)}</span>
        {entry.input_cached !== null && (
          <span className="hidden font-mono text-[11px] text-muted-foreground/45 sm:block">
            {fmtPrice(entry.input_cached)} cached
          </span>
        )}
      </div>

      {/* Output cost */}
      <div className={`${COL_OUTPUT} text-right`}>
        <span className="font-mono text-sm text-foreground/80">{fmtPrice(entry.output)}</span>
      </div>

      {/* Calculator estimated cost */}
      {showCalcCol && cost !== null && (
        <div className={`${COL_CALC} text-right`}>
          <span className="font-mono text-sm font-semibold" style={{ color: CostTierColor(cost) }}>
            {fmtCalcCost(cost)}
          </span>
        </div>
      )}
    </div>
  )
}

/* ── Control bar ────────────────────────────────────────────────────── */

interface ControlBarProps {
  search: string
  onSearch: (v: string) => void
  vendors: string[]
  activeVendor: string
  onVendor: (v: string) => void
  sortKey: SortKey
  sortDir: SortDir
  onSort: (k: SortKey) => void
  isCalcOpen: boolean
  onCalcToggle: () => void
  count: number
  total: number
}

function ControlBar({
  search, onSearch, vendors, activeVendor, onVendor,
  sortKey, sortDir, onSort, isCalcOpen, onCalcToggle, count, total,
}: ControlBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="sticky top-14 z-30 border-b border-white/[0.06] bg-background/90 backdrop-blur-xl">
      <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">

        {/* Row 1: search + calc toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search models..."
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none transition-colors"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => { onSearch(""); inputRef.current?.focus() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onCalcToggle}
            className={[
              "flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200",
              isCalcOpen
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:border-white/[0.14] hover:text-foreground",
            ].join(" ")}
          >
            <Calculator className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Calculator</span>
            {isCalcOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Row 2: vendor pills */}
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <VendorPill label="All" active={activeVendor === "all"} onClick={() => onVendor("all")} />
          {vendors.map(v => (
            <VendorPill
              key={v}
              label={vendorLabel(v)}
              active={activeVendor === v}
              accent={vendorAccent(v)}
              onClick={() => onVendor(activeVendor === v ? "all" : v)}
            />
          ))}
        </div>

        {/* Row 3: sort + count */}
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-0.5">
            <span className="mr-1 text-[11px] text-muted-foreground/50">Sort:</span>
            {(["name", "input", "output"] as SortKey[]).map(k => (
              <button
                type="button"
                key={k}
                onClick={() => onSort(k)}
                className={[
                  "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                  sortKey === k ? "text-primary" : "text-muted-foreground/60 hover:text-foreground",
                ].join(" ")}
              >
                {k.charAt(0).toUpperCase() + k.slice(1)}
                <SortIcon sortKey={k} active={sortKey} dir={sortDir} />
              </button>
            ))}
          </div>
          <span className="shrink-0 font-mono text-[11px] text-muted-foreground/40">
            {count === total ? `${total} models` : `${count} / ${total}`}
          </span>
        </div>

      </div>
    </div>
  )
}

function VendorPill({ label, active, accent, onClick }: {
  label: string; active: boolean; accent?: string; onClick: () => void
}) {
  const base = "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-all duration-200 cursor-pointer"
  if (active && accent) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={base}
        style={{ borderColor: `${accent}60`, background: `${accent}14`, color: accent }}
      >
        {label}
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        base,
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-white/[0.08] text-muted-foreground hover:border-white/[0.14] hover:text-foreground",
      ].join(" ")}
    >
      {label}
    </button>
  )
}

/* ── Page nav ───────────────────────────────────────────────────────── */

function PageNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 40) }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={[
        "fixed left-0 right-0 top-0 z-50 transition-all duration-500",
        scrolled ? "bg-background/80 backdrop-blur-xl" : "bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
            <SiteLogoMark width={32} height={32} sizes="32px" />
          </div>
          <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
            ← Portfolio
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-primary/60" />
          <span className="text-sm font-medium text-foreground/80">LLM Pricing</span>
        </div>
      </div>
    </header>
  )
}

/* ── Hero ───────────────────────────────────────────────────────────── */

function Hero({ updatedAt, count }: { updatedAt: string; count: number }) {
  return (
    <section className="relative overflow-hidden pb-6 pt-24 sm:pt-28">
      <div className="pointer-events-none absolute -top-32 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/[0.04] blur-[100px]" />
      <div className="pointer-events-none absolute -top-20 right-1/3 h-[300px] w-[300px] rounded-full bg-violet-500/[0.04] blur-[80px]" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <LiveBadge />
          {updatedAt && (
            <span className="text-[11px] text-muted-foreground/50">Updated {fmtDate(updatedAt)}</span>
          )}
        </div>
        <h1 className="gradient-text mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          LLM Pricing
        </h1>
        <p className="mt-2 text-sm text-muted-foreground/70 sm:text-base">
          Per-million-token pricing across{" "}
          <span className="font-semibold text-foreground/80">{count} models</span>{" "}
          from all major providers. Refreshes hourly.
        </p>
      </div>
    </section>
  )
}

/* ── Main client component ──────────────────────────────────────────── */

export function LlmPricesClient({ data }: { data: PricesData | null }) {
  const [search, setSearch]     = useState("")
  const [vendor, setVendor]     = useState("all")
  const [sortKey, setSortKey]   = useState<SortKey>("name")
  const [sortDir, setSortDir]   = useState<SortDir>("asc")
  const [calcOpen, setCalcOpen] = useState(false)
  const [calc, setCalc]         = useState<CalcState>({ input: "", cached: "", output: "" })

  const vendors = useMemo(() => {
    if (!data) return []
    return [...new Set(data.prices.map(p => p.vendor.toLowerCase()))].sort()
  }, [data])

  const handleSort = useCallback((k: SortKey) => {
    setSortKey(prev => {
      if (prev === k) setSortDir(d => d === "asc" ? "desc" : "asc")
      else setSortDir("asc")
      return k
    })
  }, [])

  const filtered = useMemo(() => {
    if (!data) return []
    const rows = data.prices.filter(p => {
      const matchVendor = vendor === "all" || p.vendor.toLowerCase() === vendor
      const q = search.toLowerCase()
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q)
      return matchVendor && matchSearch
    })
    return [...rows].sort((a, b) => {
      let cmp = 0
      if (sortKey === "name")   cmp = a.name.localeCompare(b.name)
      if (sortKey === "input")  cmp = a.input - b.input
      if (sortKey === "output") cmp = a.output - b.output
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [data, search, vendor, sortKey, sortDir])

  const showCalcCol = calcOpen && hasCalcInput(calc)

  if (!data) {
    return (
      <>
        <PageNav />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Loading pricing data…</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageNav />
      <Hero updatedAt={data.updated_at} count={data.prices.length} />

      <ControlBar
        search={search}
        onSearch={setSearch}
        vendors={vendors}
        activeVendor={vendor}
        onVendor={setVendor}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        isCalcOpen={calcOpen}
        onCalcToggle={() => setCalcOpen(o => !o)}
        count={filtered.length}
        total={data.prices.length}
      />

      {/* Calculator */}
      <div
        className={[
          "overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          calcOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <CalcPanel
          calc={calc}
          onChange={setCalc}
          onClear={() => setCalc({ input: "", cached: "", output: "" })}
        />
      </div>

      {/* Model list */}
      <div id="model-list" className="mx-auto max-w-5xl pb-16 sm:px-4 md:px-6">
        <div className="border-x border-white/[0.04] sm:rounded-2xl sm:border">
          <TableHeader showCalcCol={showCalcCol} />
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Search className="h-8 w-8 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground/50">No models match your search.</p>
              <button
                type="button"
                onClick={() => { setSearch(""); setVendor("all") }}
                className="mt-1 text-xs text-primary/70 underline underline-offset-2 hover:text-primary"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filtered.map((entry, i) => (
              <ModelRow key={entry.id} entry={entry} calc={calc} showCalcCol={showCalcCol} index={i} />
            ))
          )}
          <div className="border-t border-white/[0.04] px-4 py-3 sm:px-6">
            <p className="text-[11px] text-muted-foreground/35">
              Prices per million tokens (USD). Cached input price shown below where available.
              Token counts differ by model — estimates only.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
