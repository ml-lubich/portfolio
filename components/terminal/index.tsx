"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { AnimatedSection } from "../animations/animated-section"
import { AnimatedText } from "../animations/animated-text"
import { Terminal, Clock, Zap, Activity, Play } from "lucide-react"
import { sessions } from "./session-data"
import { highlight } from "./syntax-highlight"
import type { DisplayLine } from "./types"
import { terminalChrome } from "@/lib/theme"

const S = sessions

export function LiveTerminal() {
  const [lines, setLines] = useState<DisplayLine[]>([])
  const [activeSession, setActiveSession] = useState(0)
  const [totalChars, setTotalChars] = useState(0)
  const [linesCount, setLinesCount] = useState(0)
  const [visible, setVisible] = useState(false)
  const [wpm, setWpm] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)
  const jumpRef = useRef<number | null>(null)

  // Shuffle
  const shuffle = useCallback(() => {
    const a = Array.from({ length: S.length }, (_, i) => i)
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }, [])

  // Visibility
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Jump handler
  const jumpTo = useCallback((idx: number) => {
    jumpRef.current = idx
  }, [])

  // Engine — single rAF loop
  useEffect(() => {
    if (!visible) return

    let order = shuffle()
    let orderPos = 0
    let si = order[0] ?? 0
    let li = 0
    let ch = 0
    let isTyping = false
    let waitUntil = performance.now() + 200
    let localLines: DisplayLine[] = []
    let tc = 0
    let lc = 0
    let wpmStart = performance.now()

    const flush = () => {
      setLines([...localLines])
      setTotalChars(tc)
      setLinesCount(lc)
      setActiveSession(si)
    }

    const startSession = (idx: number) => {
      si = idx; li = 0; ch = 0; isTyping = false
      localLines = []; lc = 0; wpmStart = performance.now()
      flush()
    }

    const tick = (now: number) => {
      if (jumpRef.current !== null) {
        startSession(jumpRef.current)
        jumpRef.current = null
        waitUntil = now + 150
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      if (now < waitUntil) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const session = S[si]
      if (!session) { rafRef.current = requestAnimationFrame(tick); return }

      if (li >= session.lines.length) {
        waitUntil = now + 500
        orderPos++
        if (orderPos >= order.length) { order = shuffle(); orderPos = 0 }
        startSession(order[orderPos] ?? 0)
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const line = session.lines[li]

      if (!isTyping) {
        waitUntil = now + (line.d ?? 20)
        isTyping = true; ch = 0
        localLines.push({ si, li, text: "", done: false })
        flush()
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const full = line.s
      const typed = line.t === "cmd" || line.t === "code"

      if (typed && ch < full.length) {
        const burst = Math.min(1 + Math.floor(Math.random() * 2), full.length - ch)
        ch += burst; tc += burst
        localLines[localLines.length - 1] = { si, li, text: full.slice(0, ch), done: false }
        flush()
        waitUntil = now + 25 + Math.random() * 35
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      if (!typed) tc += full.length
      localLines[localLines.length - 1] = { si, li, text: full, done: true }
      li++; lc++; isTyping = false
      flush()
      waitUntil = now + 80 + Math.random() * 120
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    const iv = setInterval(() => {
      const mins = (performance.now() - wpmStart) / 60000
      if (mins > 0.005) setWpm(Math.min(Math.round(tc / 5 / mins), 260))
    }, 500)

    return () => { cancelAnimationFrame(rafRef.current); clearInterval(iv) }
  }, [visible, shuffle])

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const cur = S[activeSession]

  const renderLine = useCallback((dl: DisplayLine, idx: number, last: boolean) => {
    const ld = S[dl.si]?.lines[dl.li]
    if (!ld) return null
    const blink = last && !dl.done

    switch (ld.t) {
      case "cmd":
        return (
          <div className="flex items-start gap-2 min-h-[1.35em]">
            <span className="text-emerald-400 shrink-0 select-none">❯</span>
            <span className="text-foreground/90">
              {dl.text}
              {blink && <span className="animate-[pulse_0.5s_ease-in-out_infinite] text-primary">▊</span>}
            </span>
          </div>
        )
      case "out":
        return <div className={`pl-5 ${ld.c ?? "text-muted-foreground"} min-h-[1.35em]`}>{dl.text}</div>
      case "code":
        return (
          <div className="flex items-start min-h-[1.35em]">
            <span className="text-muted-foreground/25 select-none w-5 text-right mr-2 text-[11px] leading-relaxed shrink-0">{dl.li}</span>
            <span className="text-foreground/80">
              {dl.done ? highlight(dl.text) : <>{dl.text}{blink && <span className="animate-[pulse_0.5s_ease-in-out_infinite] text-primary">▊</span>}</>}
            </span>
          </div>
        )
      case "hdr":
        return <div className="text-muted-foreground/35 italic text-xs mt-2 mb-1">{dl.text}</div>
      case "gap":
        return <div className="h-1" />
      default:
        return <div className="text-muted-foreground">{dl.text}</div>
    }
  }, [])

  return (
    <AnimatedSection id="terminal" className="pt-8 pb-16 sm:pt-12 sm:pb-20 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto relative" ref={wrapRef}>
        {/* Header */}
        <AnimatedSection className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-4">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium tracking-wide">Live Terminal</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent mb-2">
            <AnimatedText text="A Day in My Life" variant="blur-slide" stagger={70} duration={800} />
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            <AnimatedText text="Building AI agents, deploying models, shipping production systems — live." variant="fade-up" delay={300} stagger={25} duration={600} />
          </p>
        </AnimatedSection>

        {/* Session tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {S.map((s, i) => (
            <button
              key={i}
              onClick={() => jumpTo(i)}
              className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                transition-all duration-150 whitespace-nowrap cursor-pointer
                hover:bg-primary/10 hover:text-primary active:scale-95
                ${i === activeSession
                  ? "bg-primary/15 text-primary border border-primary/30 shadow-sm shadow-primary/10"
                  : "text-muted-foreground/50 border border-transparent hover:border-primary/20"
                }
              `}
            >
              <span className="text-sm">{s.icon}</span>
              <span className="hidden sm:inline">{s.time}</span>
            </button>
          ))}
        </div>

        {/* Terminal window */}
        <div className={`rounded-xl border border-border bg-[${terminalChrome.bg}] shadow-2xl shadow-black/30 overflow-hidden`}>
          {/* Title bar */}
          <div className={`flex items-center justify-between px-4 py-2.5 bg-[${terminalChrome.headerBg}] border-b border-border`}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className={`w-3 h-3 rounded-full bg-[${terminalChrome.dotClose}]`} />
                <div className={`w-3 h-3 rounded-full bg-[${terminalChrome.dotMinimize}]`} />
                <div className={`w-3 h-3 rounded-full bg-[${terminalChrome.dotExpand}]`} />
              </div>
              <span className="ml-3 text-xs text-muted-foreground/50 font-mono truncate max-w-[280px]">
                misha@dev ~ {cur?.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] shrink-0">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400/60" />
                <span className="font-mono text-yellow-400/60">{wpm} WPM</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-primary/40" />
                <span className="font-mono text-primary/40">{totalChars.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400/60 font-mono">LIVE</span>
              </div>
            </div>
          </div>

          {/* Info bar */}
          <div className="px-4 py-1 bg-primary/[0.03] border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px]">
              <Clock className="w-3 h-3 text-primary/30" />
              <span className="font-mono text-foreground/50">{cur?.icon} {cur?.time} — {cur?.label}</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/25">{linesCount} lines</span>
          </div>

          {/* Body */}
          <div
            ref={scrollRef}
            className="p-4 font-mono text-[13px] leading-relaxed h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent"
          >
            {lines.length === 0 && visible && (
              <div className="text-muted-foreground/20 animate-pulse flex items-center gap-2">
                <Play className="w-3 h-3" /> Loading session...
              </div>
            )}
            {lines.map((dl, idx) => (
              <div key={`${dl.si}-${dl.li}-${idx}`}>
                {renderLine(dl, idx, idx === lines.length - 1)}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className={`px-4 py-1 bg-[${terminalChrome.footerBg}] border-t border-border/30 flex items-center justify-between text-[10px] font-mono text-muted-foreground/25`}>
            <span>SESSION {activeSession + 1}/{S.length}</span>
            <span>zsh — 80×24</span>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}
