"use client"

import { useEffect, useRef, useState } from "react"
import { DemoTerminal } from "@/components/terminal/demo-terminal"
import { getHeroFloatingDemo } from "@/lib/hero-floating-demo"
import { revealMotion } from "@/lib/reveal-stagger"

/** Faux window-chrome traffic lights — own colors, not a copied asset. */
const CHROME_DOTS = ["#ff6259", "#febc2e", "#2bc840"]

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])
  return reduced
}

/**
 * Glass "floating callout" demo card — faux terminal chrome typing a real
 * command pulled from data/oss-demos.ts (never fabricated copy). Chrome
 * dots stagger in first, then the card itself settles with a fade-up-blur;
 * both routes through lib/reveal-stagger.ts so the timing is one tested
 * function, not per-element literals.
 */
export function HeroFloatingTerminalCard() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const reducedMotion = useReducedMotion()
  const lines = getHeroFloatingDemo()

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true)
      return
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setVisible(true)
        io.disconnect()
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reducedMotion])

  const card = revealMotion("visual", 0, reducedMotion)

  return (
    <div
      ref={ref}
      /* mb clears the absolutely-positioned "Explore" scroll cue pinned to
         the hero's own bottom padding — the cue's offset from the section's
         padding edge is a fixed constant, independent of how tall the flow
         content above it grows, so this card needs its own fixed reserve
         rather than relying on the section's shared pb-16/md:pb-24. */
      className="hero-floating-terminal mx-auto mt-10 mb-24 w-full max-w-sm text-left sm:mb-28"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : `translateY(${card.distancePx}px)`,
        filter: visible ? "none" : `blur(${card.blurPx}px)`,
        transitionDelay: `${card.delayMs}ms`,
      }}
    >
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/45 shadow-2xl ring-1 ring-white/[0.06] backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
          {CHROME_DOTS.map((color, i) => {
            const dot = revealMotion("badge", i, reducedMotion)
            return (
              <span
                key={color}
                className="hero-floating-terminal-dot h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: color,
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : `translateY(${dot.distancePx}px)`,
                  transitionDelay: `${dot.delayMs}ms`,
                }}
              />
            )
          })}
          <span className="ml-2 select-none font-mono text-[11px] text-white/40">~/oss</span>
        </div>
        <div className="px-4 py-3">
          <DemoTerminal lines={lines} active={visible} className="text-[12.5px] sm:text-[13px]" />
        </div>
      </div>
    </div>
  )
}
