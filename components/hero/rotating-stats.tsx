"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { AnimatedCounter } from "../animations/animated-counter"
import { statSets, STAT_ROTATE_INTERVAL, STAT_STAGGER_DELAY } from "./data"

/* ── Rotating Stats with staggered card animations ────────────────── */

export function RotatingStats() {
  const [setIndex, setSetIndex] = useState(0)
  const [prevSetIndex, setPrevSetIndex] = useState(-1)
  const [cardPhases, setCardPhases] = useState<("idle" | "exit" | "enter")[]>([
    "idle", "idle", "idle", "idle",
  ])
  const [counterKeys, setCounterKeys] = useState([0, 0, 0, 0])
  const cycleRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const initialMount = useRef(true)

  const triggerTransition = useCallback((nextIndex: number) => {
    // Phase 1: Exit cards one by one (left to right)
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        setCardPhases((prev) => {
          const next = [...prev]
          next[i] = "exit"
          return next
        })
      }, i * STAT_STAGGER_DELAY)
    }

    // Phase 2: After all cards have exited, switch data & enter
    const totalExitTime = 4 * STAT_STAGGER_DELAY + 400
    setTimeout(() => {
      setPrevSetIndex(setIndex)
      setSetIndex(nextIndex)
      setCounterKeys((prev) => prev.map((k) => k + 1))

      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          setCardPhases((prev) => {
            const next = [...prev]
            next[i] = "enter"
            return next
          })
        }, i * STAT_STAGGER_DELAY)
      }

      setTimeout(() => {
        setCardPhases(["idle", "idle", "idle", "idle"])
      }, 4 * STAT_STAGGER_DELAY + 600)
    }, totalExitTime)
  }, [setIndex])

  useEffect(() => {
    const startDelay = initialMount.current ? 8000 : STAT_ROTATE_INTERVAL
    initialMount.current = false

    cycleRef.current = setTimeout(() => {
      const nextIdx = (setIndex + 1) % statSets.length
      triggerTransition(nextIdx)
    }, startDelay)

    return () => {
      if (cycleRef.current) clearTimeout(cycleRef.current)
    }
  }, [setIndex, triggerTransition])

  const currentStats = statSets[setIndex]

  const getCardStyle = (phase: "idle" | "exit" | "enter") => {
    switch (phase) {
      case "exit":
        return {
          opacity: 0,
          transform: "translateY(-18px) scale(0.92) rotateX(8deg)",
          filter: "blur(6px)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }
      case "enter":
        return {
          opacity: 1,
          transform: "translateY(0px) scale(1) rotateX(0deg)",
          filter: "blur(0px)",
          transition: "all 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
        }
      case "idle":
      default:
        return {
          opacity: 1,
          transform: "translateY(0px) scale(1) rotateX(0deg)",
          filter: "blur(0px)",
          transition: "all 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
        }
    }
  }

  return (
    <div
      className="mx-auto mt-8 w-full max-w-2xl animate-fade-in-up pointer-events-auto"
      style={{ animationDelay: "0.65s", opacity: 0 }}
    >
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {currentStats.map((stat, i) => (
          <div
            key={`card-${i}`}
            className="group relative overflow-hidden rounded-xl border border-white/[0.08] p-3 sm:p-4 glass-card-3d hover:border-primary/20 hover:shadow-lg hover:shadow-primary/10 hover-lift spotlight"
            style={{
              ...getCardStyle(cardPhases[i]),
              perspective: "600px",
              background: "hsla(220, 20%, 16%, 0.35)",
              backdropFilter: "blur(24px) saturate(1.6)",
              WebkitBackdropFilter: "blur(24px) saturate(1.6)",
              boxShadow: "0 2px 16px -4px hsla(0,0%,0%,0.25), inset 0 1px 0 0 hsla(0,0%,100%,0.06)",
            }}
          >
            <div className="absolute inset-0 rounded-xl bg-primary/[0.04] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div
              className="pointer-events-none absolute inset-0 -translate-x-full bg-white/[0.04]"
              style={{
                animation: cardPhases[i] === "enter"
                  ? `shimmer-sweep 0.8s ${i * 0.1}s ease-out forwards`
                  : "none",
              }}
            />
            <div className="relative z-10">
              <AnimatedCounter
                key={`counter-${i}-${counterKeys[i]}`}
                value={stat.value}
                duration={1800}
                className="text-xl font-display font-light gradient-text sm:text-2xl lg:text-3xl"
              />
              <div className="mt-1 text-[11px] font-medium text-muted-foreground sm:text-xs">
                {stat.label}
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-primary/5 blur-2xl transition-all duration-700 group-hover:scale-150 group-hover:bg-primary/10" />
            <div className="absolute -top-8 -left-8 h-14 w-14 rounded-full bg-accent/5 blur-2xl opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-150" />
          </div>
        ))}
      </div>

      {/* Progress dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {statSets.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (i !== setIndex) triggerTransition(i)
            }}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === setIndex
              ? "w-6 bg-primary/60"
              : "w-1.5 bg-muted-foreground/20 hover:bg-muted-foreground/40"
              }`}
            aria-label={`Show stat set ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
