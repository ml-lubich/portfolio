"use client"

import figlet from "figlet/browser"
import { Check, Copy, Download, Settings2, Sparkles } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { FIGLET_FONTS } from "@/data/figlet-fonts"
import { THEDRAW_FONTS } from "@/data/thedraw-fonts"

const COLORS = ["#8b5cf6", "#3b82f6", "#06b6d4", "#22c55e", "#eab308", "#f97316", "#ec4899"]
type Layout = "default" | "full" | "fitted" | "controlled smushing"
type FontMode = "figlet" | "thedraw"

export function TaagGenerator() {
  const [text, setText] = useState("Hello")
  const [font, setFont] = useState("Isometric1")
  const [mode, setMode] = useState<FontMode>("figlet")
  const [output, setOutput] = useState("")
  const [color, setColor] = useState(true)
  const [width, setWidth] = useState(80)
  const [layout, setLayout] = useState<Layout>("default")
  const [verticalLayout, setVerticalLayout] = useState<Layout>("default")
  const [printDirection, setPrintDirection] = useState<0 | 1 | -1>(0)
  const [showHardBlanks, setShowHardBlanks] = useState(false)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [testAll, setTestAll] = useState(false)
  const [copied, setCopied] = useState(false)
  const [customName, setCustomName] = useState("")
  const [customTdf, setCustomTdf] = useState<File | null>(null)
  const [error, setError] = useState("")

  useEffect(() => { figlet.defaults({ fontPath: "/api/taag-fonts", fetchFontIfMissing: true }) }, [])
  useEffect(() => {
    let active = true
    if (!text) { setOutput(""); return }
    const timer = window.setTimeout(() => {
      if (mode === "thedraw") {
        const form = new FormData()
        form.set("text", text)
        form.set("font", font)
        form.set("width", String(width))
        if (customTdf) form.set("fontFile", customTdf)
        void fetch("/api/thedraw", { method: "POST", body: form })
          .then(async (response) => ({ response, body: await response.json() as { art?: string; error?: string } }))
          .then(({ response, body }) => {
            if (!active) return
            if (!response.ok) { setError(body.error ?? "TheDraw render failed."); setOutput("") }
            else { setError(""); setOutput(body.art ?? "") }
          })
          .catch(() => { if (active) { setError("Could not render this TheDraw font."); setOutput("") } })
      } else {
        figlet.text(text, { font, width, horizontalLayout: layout, verticalLayout, printDirection, showHardBlanks }, (err, result) => {
          if (!active) return
          if (err) { setError(err.message); setOutput("") }
          else { setError(""); setOutput(result ?? "") }
        })
      }
    }, 80)
    return () => { active = false; window.clearTimeout(timer) }
  }, [text, font, mode, width, layout, verticalLayout, printDirection, showHardBlanks, customTdf])

  const previewFonts = useMemo(() => testAll ? (mode === "figlet" ? FIGLET_FONTS : THEDRAW_FONTS) : [], [testAll, mode])

  async function copyOutput(value = output) {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  function downloadOutput() {
    const blob = new Blob([output + "\n"], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `taag-${font.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function loadCustomFont(file?: File) {
    if (!file) return
    if (mode === "thedraw") {
      if (!file.name.toLowerCase().endsWith(".tdf") || file.size > 1024 * 1024) { setError("Choose a .tdf file under 1 MB."); return }
      setCustomTdf(file)
      setCustomName(file.name.replace(/\.tdf$/i, ""))
      setFont(file.name.replace(/\.tdf$/i, ""))
      setError("")
      return
    }
    const name = file.name.replace(/\.flf$/i, "")
    try {
      figlet.parseFont(name, await file.text())
      setCustomName(name)
      setFont(name)
      setError("")
    } catch { setError("That file could not be read as a FIGlet .flf font.") }
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#17171c] shadow-[0_35px_120px_-50px_rgba(83,74,255,.35)]">
      <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(250px,.92fr)_minmax(0,1fr)]">
        <div>
          <label htmlFor="taag-mode" className="mb-2 block text-sm font-medium text-white/80">Font format</label>
          <select id="taag-mode" value={mode} onChange={(event) => { const nextMode = event.target.value as FontMode; setMode(nextMode); setCustomName(""); setCustomTdf(null); setFont(nextMode === "figlet" ? "Isometric1" : "bleach"); setTestAll(false) }} className="mb-4 h-11 w-full rounded-xl border border-white/15 bg-[#24242b] px-4 text-white outline-none focus:border-cyan-300"><option value="figlet">FIGlet</option><option value="thedraw">TheDraw · ANSI color</option></select>
          <label htmlFor="taag-font" className="mb-2 block text-sm font-medium text-white/80">ASCII art font</label>
          <select id="taag-font" value={font} onChange={(event) => { setFont(event.target.value); if (event.target.value !== "custom") { setCustomTdf(null); setCustomName("") } }} className="h-14 w-full rounded-xl border border-white/15 bg-[#24242b] px-4 text-lg text-white outline-none focus:border-cyan-300">
            {customName && <option value={customName}>{customName} · custom</option>}
            {(mode === "figlet" ? FIGLET_FONTS : THEDRAW_FONTS).map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => setOptionsOpen((value) => !value)} aria-expanded={optionsOpen} className="rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5"><Settings2 className="mr-2 inline size-4"/>Options</button>
            <button type="button" onClick={() => setTestAll((value) => !value)} aria-pressed={testAll} className="rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5"><Sparkles className="mr-2 inline size-4"/>{testAll ? "Hide all fonts" : "Test all"}</button>
          </div>
          {optionsOpen && <div className="mt-3 grid gap-4 rounded-xl border border-white/10 bg-black/15 p-4">
            <label className="text-sm text-white/80">Width <span className="float-right font-mono">{width}</span><input type="range" min="20" max="160" value={width} onChange={(event) => setWidth(Number(event.target.value))} className="mt-3 block w-full accent-cyan-300"/></label>
            <label className="text-sm text-white/80">Horizontal layout<select value={layout} onChange={(event) => setLayout(event.target.value as Layout)} className="mt-2 block h-10 w-full rounded-lg border border-white/10 bg-[#24242b] px-3"><option value="default">Default</option><option value="full">Full width</option><option value="fitted">Fitted</option><option value="controlled smushing">Smushed</option></select></label>
            <label className="text-sm text-white/80">Vertical layout<select value={verticalLayout} onChange={(event) => setVerticalLayout(event.target.value as Layout)} className="mt-2 block h-10 w-full rounded-lg border border-white/10 bg-[#24242b] px-3"><option value="default">Default</option><option value="full">Full height</option><option value="fitted">Fitted</option><option value="controlled smushing">Smushed</option></select></label>
            <label className="text-sm text-white/80">Print direction<select value={printDirection} onChange={(event) => setPrintDirection(Number(event.target.value) as 0 | 1 | -1)} className="mt-2 block h-10 w-full rounded-lg border border-white/10 bg-[#24242b] px-3"><option value={0}>Font default</option><option value={1}>Left to right</option><option value={-1}>Right to left</option></select></label>
            <label className="flex items-center gap-2 text-sm text-white/80"><input type="checkbox" checked={showHardBlanks} onChange={(event) => setShowHardBlanks(event.target.checked)} className="accent-cyan-300"/>Show hard blanks</label>
            <label className="text-sm text-white/80">Load a custom {mode === "figlet" ? "FIGfont (.flf)" : "TheDraw font (.tdf)"}<input type="file" accept={mode === "figlet" ? ".flf,text/plain" : ".tdf,application/octet-stream"} onChange={(event) => void loadCustomFont(event.target.files?.[0])} className="mt-2 block w-full text-xs text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white"/></label>
          </div>}
        </div>
        <div>
          <label htmlFor="taag-input" className="mb-2 block text-sm font-medium text-white/80">Input text</label>
          <textarea id="taag-input" value={text} onChange={(event) => setText(event.target.value.slice(0, 120))} rows={4} maxLength={120} className="w-full resize-y rounded-xl border border-white/15 bg-[#24242b] p-4 text-lg text-white outline-none placeholder:text-white/30 focus:border-cyan-300" placeholder="Type something…" />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4 sm:px-7">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-white/80"><input type="checkbox" checked={color} onChange={(event) => setColor(event.target.checked)} className="size-5 accent-cyan-300"/>Color</label>
        <div className="flex gap-2"><button type="button" onClick={() => void copyOutput()} className="rounded-full border border-white/15 p-3 text-white/80 hover:bg-white/10" aria-label="Copy ASCII art">{copied ? <Check className="size-4"/> : <Copy className="size-4"/>}</button><button type="button" onClick={downloadOutput} className="rounded-full border border-white/15 p-3 text-white/80 hover:bg-white/10" aria-label="Download ASCII art"><Download className="size-4"/></button></div>
      </div>
      <div className="min-h-[240px] overflow-x-auto bg-black p-5 sm:p-8">
        {error ? <p role="alert" className="font-mono text-sm text-rose-300">{error}</p> : <pre className="w-max min-w-full font-mono text-[10px] leading-[1.15] sm:text-xs"><code>{mode === "thedraw" ? renderAnsi(output, color) : output.split("\n").map((line, row) => <span className="block whitespace-pre" key={row}>{Array.from(line).map((character, index) => <span key={index} style={{ color: color ? COLORS[index % COLORS.length] : "#f1f5f9" }}>{character}</span>)}</span>)}</code></pre>}
      </div>
      {testAll && <div className="grid max-h-[32rem] gap-2 overflow-auto border-t border-white/10 bg-[#111116] p-5 sm:grid-cols-3 lg:grid-cols-5">{previewFonts.map((name) => mode === "figlet" ? <FontPreview key={name} font={name} text={text || "Hello"} onSelect={() => { setFont(name); setTestAll(false) }} /> : <button type="button" key={name} onClick={() => { setFont(name); setCustomName(""); setCustomTdf(null); setTestAll(false) }} className="rounded-lg border border-white/10 px-3 py-2 text-left font-mono text-xs text-white/70 hover:border-cyan-300">{name}</button>)}</div>}
      <p className="border-t border-white/10 px-5 py-3 font-mono text-[10px] text-white/40 sm:px-7">{mode === "thedraw" ? "TheDraw ANSI" : "FIGlet"} · {customName === font ? "custom font" : font} · {text.length}/120 chars · {mode === "figlet" ? "local in your browser" : "rendered on this site"}</p>
    </div>
  )
}

const ANSI_COLORS = ["#000000", "#aa0000", "#00aa00", "#aa5500", "#0000aa", "#aa00aa", "#00aaaa", "#aaaaaa", "#555555", "#ff5555", "#55ff55", "#ffff55", "#5555ff", "#ff55ff", "#55ffff", "#ffffff"]

function renderAnsi(input: string, enabled: boolean) {
  if (!enabled) return input.replace(/\x1b\[[0-9;]*m/g, "")
  const chunks: Array<{ text: string; color: string; background: string }> = []
  let color = "#cccccc"
  let background = "transparent"
  for (const part of input.split(/(\x1b\[[0-9;]*m)/g)) {
    if (part.startsWith("\x1b[")) {
      for (const code of part.slice(2, -1).split(";").map(Number)) {
        if (code === 0) { color = "#cccccc"; background = "transparent" }
        else if (code >= 30 && code <= 37) color = ANSI_COLORS[code - 30]
        else if (code >= 90 && code <= 97) color = ANSI_COLORS[code - 90 + 8]
        else if (code >= 40 && code <= 47) background = ANSI_COLORS[code - 40]
        else if (code >= 100 && code <= 107) background = ANSI_COLORS[code - 100 + 8]
      }
    } else if (part) chunks.push({ text: part, color, background })
  }
  return chunks.map((chunk, index) => <span key={index} style={{ color: chunk.color, backgroundColor: chunk.background }}>{chunk.text}</span>)
}

function FontPreview({ font, text, onSelect }: { font: string; text: string; onSelect: () => void }) {
  const [preview, setPreview] = useState("")
  useEffect(() => {
    let active = true
    figlet.text(text, { font, width: 40 }, (_err, result) => { if (active) setPreview(result ?? "") })
    return () => { active = false }
  }, [font, text])
  return <button type="button" onClick={onSelect} className="overflow-hidden rounded-xl border border-white/10 p-3 text-left hover:border-cyan-300"><span className="font-mono text-[10px] text-cyan-200">{font}</span><pre className="mt-2 max-h-20 overflow-hidden font-mono text-[8px] leading-tight text-white/65">{preview || "Loading font…"}</pre></button>
}
