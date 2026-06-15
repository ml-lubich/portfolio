"use client"

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
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

type SortKey = "name" | "input" | "output"
type SortDir = "asc" | "desc"

interface CalcState {
  input: string
  cached: string
  output: string
}

/* ── Vendor config ──────────────────────────────────────────────────── */

const VENDOR_ACCENTS: Record<string, string> = {
  anthropic:  "#c084fc",
  openai:     "#34d399",
  google:     "#60a5fa",
  amazon:     "#f59e0b",
  xai:        "#fb923c",
  mistral:    "#22d3ee",
  deepseek:   "#6ee7b7",
  meta:       "#818cf8",
  minimax:    "#f472b6",
  moonshot:   "#a78bfa",
  alibaba:    "#facc15",
  kimi:       "#a78bfa",
}

const VENDOR_LABELS: Record<string, string> = {
  anthropic: "Anthropic",
  openai:    "OpenAI",
  google:    "Google",
  amazon:    "Amazon",
  xai:       "xAI",
  mistral:   "Mistral",
  deepseek:  "DeepSeek",
  meta:      "Meta",
  minimax:   "MiniMax",
  moonshot:  "Moonshot",
  alibaba:   "Alibaba",
  kimi:      "Kimi",
}

function vendorAccent(v: string): string {
  return VENDOR_ACCENTS[v.toLowerCase()] ?? "#94a3b8"
}

function vendorLabel(v: string): string {
  const lv = v.toLowerCase()
  return VENDOR_LABELS[lv] ?? (v.charAt(0).toUpperCase() + v.slice(1))
}

/* ── Formatting helpers ─────────────────────────────────────────────── */

function fmtPrice(n: number | null): string {
  if (n === null) return "—"
  if (n === 0) return "$0"
  if (n < 0.01) return `$${n.toFixed(4)}`
  if (n < 1)   return `$${n.toFixed(3)}`
  if (n < 10)  return `$${n.toFixed(2)}`
  return `$${n.toFixed(0)}`
}

function fmtCalcCost(n: number): string {
  if (n === 0) return "$0.00"
  if (n < 0.001) return `$${n.toFixed(6)}`
  if (n < 0.01)  return `$${n.toFixed(5)}`
  if (n < 1)     return `$${n.toFixed(4)}`
  return `$${n.toFixed(2)}`
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
    })
  } catch {
    return iso
  }
}

/* ── Calc helpers ───────────────────────────────────────────────────── */

function parseTokens(s: string): number {
  const n = parseFloat(s.replace(/,/g, "").replace(/[kK]$/, "000").replace(/[mM]$/, "000000"))
  return isFinite(n) && n >= 0 ? n : 0
}

function calcCost(entry: PriceEntry, calc: CalcState): number {
  const inp = parseTokens(calc.input)
  const cac = parseTokens(calc.cached)
  const out = parseTokens(calc.output)
  const cachedCost = cac > 0 && entry.input_cached !== null ? (cac * entry.input_cached) / 1_000_000 : 0
  return (inp * entry.input) / 1_000_000 + cachedCost + (out * entry.output) / 1_000_000
}

function hasCalcInput(calc: CalcState): boolean {
  return parseTokens(calc.input) > 0 || parseTokens(calc.output) > 0
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
      className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{ background: `${color}14`, color, border: `1px solid ${color}30` }}
    >
      {vendorLabel(vendor)}
    </span>
  )
}

interface CalcPanelProps {
  calc: CalcState
  onChange: (next: CalcState) => void
  onClear: () => void
}

function CalcPanel({ calc, onChange, onClear }: CalcPanelProps) {
  function field(key: keyof CalcState, label: string, placeholder: string) {
    return (
      <div key={key} className="flex flex-col gap-1">
        <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
        <input
          type="text"
          value={calc[key]}
          onChange={e => onChange({ ...calc, [key]: e.target.value })}
          placeholder={placeholder}
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/40 focus:outline-none focus:ring-0 transition-colors"
        />
      </div>
    )
  }

  return (
    <div className="border-t border-white/[0.06] bg-white/[0.015] px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end gap-3 sm:gap-4">
          {field("input",  "Input tokens",  "e.g. 1000")}
          {field("cached", "Cached tokens", "e.g. 500")}
          {field("output", "Output tokens", "e.g. 500")}
          {hasCalcInput(calc) && (
            <button
              onClick={onClear}
              className="mb-0 flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-white/[0.14] hover:text-foreground"
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

/* ── Model row ──────────────────────────────────────────────────────── */

interface RowProps {
  entry: PriceEntry
  calc: CalcState
  showCalcCol: boolean
  index: number
}

function ModelRow({ entry, calc, showCalcCol, index }: RowProps) {
  const accent = vendorAccent(entry.vendor)
  const cost = showCalcCol ? calcCost(entry, calc) : null

  return (
    <div
      className="group relative flex items-center gap-3 border-b border-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.025] sm:px-6 sm:gap-4"
      style={{ animationDelay: `${Math.min(index * 12, 240)}ms` }}
    >
      {/* Vendor accent strip */}
      <div
        className="absolute left-0 top-0 h-full w-0.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: accent }}
      />

      {/* Rank */}
      <span className="hidden w-6 shrink-0 text-right font-mono text-[11px] text-muted-foreground/30 sm:block">
        {index + 1}
      </span>

      {/* Vendor chip */}
      <div className="hidden shrink-0 sm:block">
        <VendorChip vendor={entry.vendor} />
      </div>

      {/* Model name */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
          {entry.name}
        </p>
        <div className="mt-0.5 sm:hidden">
          <VendorChip vendor={entry.vendor} />
        </div>
      </div>

      {/* Input cost */}
      <div className="w-20 shrink-0 text-right">
        <span className="font-mono text-sm text-foreground/80">
          {fmtPrice(entry.input)}
        </span>
        {entry.input_cached !== null && (
          <span className="ml-1 font-mono text-[11px] text-muted-foreground/50">
            ({fmtPrice(entry.input_cached)})
          </span>
        )}
      </div>

      {/* Output cost */}
      <div className="w-16 shrink-0 text-right">
        <span className="font-mono text-sm text-foreground/80">
          {fmtPrice(entry.output)}
        </span>
      </div>

      {/* Calc cost */}
      {showCalcCol && cost !== null && (
        <div className="w-20 shrink-0 text-right">
          <span
            className="font-mono text-sm font-semibold"
            style={{ color: cost < 0.001 ? "#34d399" : cost < 0.01 ? "#60a5fa" : cost < 0.1 ? "#f59e0b" : "#fb923c" }}
          >
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
        {/* Search + calc toggle */}
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
                onClick={() => { onSearch(""); inputRef.current?.focus() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
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

        {/* Vendor pills */}
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onVendor("all")}
            className={[
              "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-all duration-200",
              activeVendor === "all"
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-white/[0.08] text-muted-foreground hover:border-white/[0.14] hover:text-foreground",
            ].join(" ")}
          >
            All
          </button>
          {vendors.map(v => {
            const accent = vendorAccent(v)
            const active = activeVendor === v
            return (
              <button
                key={v}
                onClick={() => onVendor(active ? "all" : v)}
                className="shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-all duration-200"
                style={active
                  ? { borderColor: `${accent}60`, background: `${accent}14`, color: accent }
                  : { borderColor: "rgba(255,255,255,0.08)", color: "#6b7280" }
                }
              >
                {vendorLabel(v)}
              </button>
            )
          })}
        </div>

        {/* Sort + count */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-muted-foreground/50">Sort:</span>
            {(["name", "input", "output"] as SortKey[]).map(k => (
              <button
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
            {count === total ? `${total} models` : `${count} / ${total} models`}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── Column headers ─────────────────────────────────────────────────── */

function TableHeader({ showCalcCol }: { showCalcCol: boolean }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-2 sm:px-6 sm:gap-4">
      <span className="hidden w-6 shrink-0 text-right font-mono text-[10px] uppercase tracking-widest text-muted-foreground/30 sm:block">#</span>
      <span className="hidden w-24 shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground/30 sm:block">Vendor</span>
      <span className="flex-1 text-[10px] uppercase tracking-widest text-muted-foreground/30">Model</span>
      <span className="w-20 shrink-0 text-right text-[10px] uppercase tracking-widest text-muted-foreground/30">
        Input <span className="text-muted-foreground/20">(Cached)</span>
      </span>
      <span className="w-16 shrink-0 text-right text-[10px] uppercase tracking-widest text-muted-foreground/30">Output</span>
      {showCalcCol && (
        <span className="w-20 shrink-0 text-right text-[10px] uppercase tracking-widest text-primary/60">Est. Cost</span>
      )}
    </div>
  )
}

/* ── Page header nav ────────────────────────────────────────────────── */

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
        <Link href="/" className="flex items-center gap-2.5 group">
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

/* ── Main client component ──────────────────────────────────────────── */

interface LlmPricesClientProps {
  data: PricesData | null
}

export function LlmPricesClient({ data }: LlmPricesClientProps) {
  const [search, setSearch]       = useState("")
  const [vendor, setVendor]       = useState("all")
  const [sortKey, setSortKey]     = useState<SortKey>("name")
  const [sortDir, setSortDir]     = useState<SortDir>("asc")
  const [calcOpen, setCalcOpen]   = useState(false)
  const [calc, setCalc]           = useState<CalcState>({ input: "", cached: "", output: "" })

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

  const handleVendor = useCallback((v: string) => {
    setVendor(v)
  }, [])

  const handleCalcClear = useCallback(() => {
    setCalc({ input: "", cached: "", output: "" })
  }, [])

  const filtered = useMemo(() => {
    if (!data) return []
    let rows = data.prices.filter(p => {
      const matchVendor = vendor === "all" || p.vendor.toLowerCase() === vendor
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.vendor.toLowerCase().includes(search.toLowerCase())
      return matchVendor && matchSearch
    })

    rows = [...rows].sort((a, b) => {
      let cmp = 0
      if (sortKey === "name")   cmp = a.name.localeCompare(b.name)
      if (sortKey === "input")  cmp = a.input - b.input
      if (sortKey === "output") cmp = a.output - b.output
      return sortDir === "asc" ? cmp : -cmp
    })

    return rows
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

      {/* Hero */}
      <section className="relative overflow-hidden pb-6 pt-24">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute -top-32 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/[0.04] blur-[100px]" />
        <div className="pointer-events-none absolute -top-20 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/[0.04] blur-[80px]" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <LiveBadge />
                {data.updated_at && (
                  <span className="text-[11px] text-muted-foreground/50">
                    Updated {fmtDate(data.updated_at)}
                  </span>
                )}
              </div>
              <h1 className="gradient-text text-3xl font-bold tracking-tight sm:text-4xl">
                LLM Pricing
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground/70">
                Per-million-token pricing across {data.prices.length} models from all major providers.
              </p>
            </div>

            {/* Summary chips */}
            <div className="flex flex-wrap gap-2">
              {vendors.slice(0, 6).map(v => (
                <button
                  key={v}
                  onClick={() => { setVendor(v); document.querySelector("#model-list")?.scrollIntoView({ behavior: "smooth", block: "start" }) }}
                  className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[11px] text-muted-foreground/60 transition-colors hover:border-white/[0.10] hover:text-foreground"
                  style={{ borderLeftColor: vendorAccent(v), borderLeftWidth: "2px" }}
                >
                  {vendorLabel(v)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Controls + table */}
      <ControlBar
        search={search}
        onSearch={setSearch}
        vendors={vendors}
        activeVendor={vendor}
        onVendor={handleVendor}
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
          "overflow-hidden transition-all duration-300 ease-fluid",
          calcOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <CalcPanel calc={calc} onChange={setCalc} onClear={handleCalcClear} />
      </div>

      {/* Model list */}
      <div id="model-list" className="mx-auto max-w-5xl">
        <div className="rounded-none border-x border-white/[0.04] sm:mx-4 sm:mb-6 sm:rounded-2xl md:mx-6">
          <TableHeader showCalcCol={showCalcCol} />
          <div className="divide-y-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <Search className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground/50">No models match your search.</p>
                <button
                  onClick={() => { setSearch(""); setVendor("all") }}
                  className="mt-1 text-xs text-primary/70 hover:text-primary underline underline-offset-2"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filtered.map((entry, i) => (
                <ModelRow
                  key={entry.id}
                  entry={entry}
                  calc={calc}
                  showCalcCol={showCalcCol}
                  index={i}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-4 py-3 sm:px-6">
            <p className="text-[11px] text-muted-foreground/35">
              Prices shown per million tokens (USD). Input cached price shown in parentheses where available.
              Token counts differ by model — costs are estimates only.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
