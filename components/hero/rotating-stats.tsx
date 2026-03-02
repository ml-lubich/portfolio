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
      className="mx-auto mt-14 w-full max-w-4xl animate-fade-in-up pointer-events-auto"
      style={{ animationDelay: "1.8s", opacity: 0 }}
    >
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {currentStats.map((stat, i) => (
          <div
            key={`card-${i}`}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-card/20 p-6 sm:p-7 backdrop-blur-xl hover:border-primary/30 hover:shadow-xl hover:shadow-primary/15 hover-lift spotlight glass-card-3d"
            style={{
              ...getCardStyle(cardPhases[i]),
              perspective: "600px",
            }}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.04] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
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
                className="text-3xl font-display font-light gradient-text sm:text-4xl lg:text-5xl"
              />
              <div className="mt-2 text-sm font-medium text-muted-foreground sm:text-base">
                {stat.label}
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all duration-700 group-hover:scale-150 group-hover:bg-primary/10" />
            <div className="absolute -top-10 -left-10 h-20 w-20 rounded-full bg-accent/5 blur-2xl opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-150" />
          </div>
        ))}
      </div>

      {/* Progress dots */}
      <div className="mt-5 flex items-center justify-center gap-2">
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
