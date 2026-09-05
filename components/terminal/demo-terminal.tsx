"use client"

import { useEffect, useRef, useState } from "react"
import { highlight } from "./syntax-highlight"
import type { Line } from "./types"
import {
  computeDemoTerminalFrame,
  getDemoTerminalTypedLength,
  type DemoDisplayLine,
} from "@/lib/demo-terminal"

interface DemoTerminalProps {
  lines: Line[]
  /** Gate: only advance the typing loop while true. Lets a container run one terminal at a time. */
  active?: boolean
  /** Fires once, when the full script has been revealed. */
  onDone?: () => void
  /** ms per revealed character. */
  charSpeed?: number
  className?: string
}

function renderLine(line: Line, dl: DemoDisplayLine, blink: boolean) {
  switch (line.t) {
    case "cmd":
      return (
        <div key={dl.index} className="flex items-start gap-2 min-h-[1.35em]">
          <span className="text-emerald-400 shrink-0 select-none">❯</span>
          <span className="text-foreground/90 whitespace-pre-wrap break-words">
            {dl.text}
            {blink && <span className="animate-[terminal-blink_1s_step-end_infinite] text-emerald-400">▊</span>}
          </span>
        </div>
      )
    case "out":
      return (
        <div key={dl.index} className={`pl-5 whitespace-pre-wrap break-words min-h-[1.35em] ${line.c ?? "text-muted-foreground"}`}>
          {dl.text}
        </div>
      )
    case "code":
      return (
        <div key={dl.index} className="flex items-start min-h-[1.35em]">
          <pre className="m-0 flex-1 min-w-0 whitespace-pre-wrap break-words font-mono leading-relaxed text-foreground/80">
            <code className="font-mono">
              {dl.done ? highlight(dl.text) : (
                <>
                  {dl.text}
                  {blink && <span className="animate-[terminal-blink_1s_step-end_infinite] text-emerald-400">▊</span>}
                </>
              )}
            </code>
          </pre>
        </div>
      )
    case "hdr":
      return <div key={dl.index} className="text-muted-foreground/60 italic text-xs mt-2 mb-1">{dl.text}</div>
    case "gap":
      return <div key={dl.index} className="h-1" />
  }
}

/**
 * Scroll-gated, typed-text terminal for the OSS showcase. Wraps the pure
 * scheduler in lib/demo-terminal.ts with an IntersectionObserver + rAF loop.
 * `prefers-reduced-motion` skips the animation and renders the final frame.
 */
export function DemoTerminal({ lines, active = true, onDone, charSpeed = 28, className = "" }: DemoTerminalProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const total = getDemoTerminalTypedLength(lines)
  const reducedMotion = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ).current
  const [revealed, setRevealed] = useState(reducedMotion ? total : 0)
  const [visible, setVisible] = useState(false)
  const doneFiredRef = useRef(false)

  // Scroll gate — skipped entirely under reduced motion (static frame already set).
  useEffect(() => {
    if (reducedMotion) return
    const el = wrapRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [reducedMotion])

  // Typing loop — only runs while visible and active, resumes from wherever `revealed` left off.
  useEffect(() => {
    if (reducedMotion || !visible || !active) return
    let cancelled = false
    let r = revealed
    let acc = 0
    let last = performance.now()

    const tick = (now: number) => {
      if (cancelled || r >= total) return
      acc += now - last
      last = now
      const step = Math.floor(acc / charSpeed)
      if (step > 0) {
        acc -= step * charSpeed
        r = Math.min(total, r + step)
        setRevealed(r)
      }
      if (r < total) requestAnimationFrame(tick)
    }

    const raf = requestAnimationFrame(tick)
    return () => { cancelled = true; cancelAnimationFrame(raf) }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `revealed` is read once per (re)start, not a trigger
  }, [reducedMotion, visible, active, total, charSpeed])

  useEffect(() => {
    if (revealed >= total && !doneFiredRef.current) {
      doneFiredRef.current = true
      onDone?.()
    }
  }, [revealed, total, onDone])

  // Only the active card animates its own `revealed` progress. Every other
  // card renders its final frame outright — matching the documented contract
  // ("the rest hold their final frame") and, just as importantly, keeping
  // every non-active card's height fixed instead of frozen mid-type whenever
  // a mass-mount (portfolio:mount-all, or a fast programmatic scroll) shifts
  // `active` away before a card finishes typing.
  const frame = computeDemoTerminalFrame(lines, active ? revealed : total)

  return (
    <div ref={wrapRef} className={`font-mono text-sm leading-relaxed ${className}`}>
      {frame.displayLines.map((dl, i) => {
        const line = lines[dl.index]
        const blink = i === frame.displayLines.length - 1 && !dl.done
        return renderLine(line, dl, blink)
      })}
    </div>
  )
}
