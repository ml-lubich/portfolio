"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { AnimatedCounter } from "../animations/animated-counter"
import { statSets, STAT_ROTATE_INTERVAL, STAT_STAGGER_DELAY, heroBeatDelay } from "./data"

/* ── Rotating Stats with staggered card animations ────────────────── */

export function RotatingStats() {
  const isMobile = useIsMobile()
  const rootRef = useRef<HTMLDivElement>(null)
  /** The rotation fades every card to zero and back. Running that off-screen
   *  means scrolling back up lands on a half-faded row of cards, which reads as
   *  broken rather than animated — so the cycle only runs while it is in view. */
  const [inView, setInView] = useState(false)
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
    const el = rootRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    const startDelay = initialMount.current ? 8000 : STAT_ROTATE_INTERVAL
    initialMount.current = false

    cycleRef.current = setTimeout(() => {
      const nextIdx = (setIndex + 1) % statSets.length
      triggerTransition(nextIdx)
    }, startDelay)

    return () => {
      if (cycleRef.current) clearTimeout(cycleRef.current)
    }
  }, [setIndex, triggerTransition, inView])

  const currentStats = statSets[setIndex]

  const getCardStyle = (phase: "idle" | "exit" | "enter") => {
    switch (phase) {
      case "exit":
        return {
          opacity: 0,
          transform: "translateY(-18px) scale(0.92) rotateX(8deg)",
          transition: "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }
      case "enter":
        return {
          opacity: 1,
          transform: "translateY(0px) scale(1) rotateX(0deg)",
          transition: "opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
        }
      case "idle":
      default:
        return {
          opacity: 1,
          transform: "translateY(0px) scale(1) rotateX(0deg)",
          transition: "opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
        }
    }
  }

  return (
    <div
      ref={rootRef}
      className="mx-auto mt-8 w-full max-w-2xl animate-fade-in-up-subtle pointer-events-auto"
      style={{ animationDelay: heroBeatDelay("stats") }}
    >
      {/* Mobile: first 2 stats only, as bare numbers on the background — no card
          chrome. Card treatment returns at sm+. Extra stats are hidden with CSS
          (not unmounted) so SSR and client markup stay identical. */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:gap-3 lg:grid-cols-4">
        {currentStats.map((stat, i) => (
          <div
            key={`card-${i}`}
            className={`group relative p-0 sm:overflow-hidden sm:rounded-2xl sm:border sm:border-[var(--line-strong)] sm:p-5 sm:glass-card-3d sm:hover:border-primary/40 sm:hover:shadow-2xl sm:hover:shadow-primary/20 sm:hover-lift sm:spotlight${i >= 2 ? " max-sm:hidden" : ""}`}
            style={{
              ...getCardStyle(cardPhases[i]),
              perspective: "600px",
              ...(isMobile
                ? {}
                : {
                    /* Themed: this used to hard-code a dark-glass gradient and a
                       black shadow, which turned into grey-on-grey cards with
                       unreadable numbers on the light page. */
                    background: "var(--glass-fill)",
                    backdropFilter: "blur(28px) saturate(2.2) brightness(1.1)",
                    WebkitBackdropFilter: "blur(28px) saturate(2.2) brightness(1.1)",
                    boxShadow: "var(--glass-shadow)",
                  }),
            }}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 max-sm:hidden" />
            <div
              className="pointer-events-none absolute inset-0 -translate-x-full bg-white/[0.08] max-sm:hidden"
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
                className="text-3xl font-display font-semibold gradient-text sm:text-3xl lg:text-4xl"
              />
              <div className="mt-1 text-[11px] font-medium text-foreground/80 sm:text-xs">
                {stat.label}
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-primary/10 blur-2xl transition-all duration-700 group-hover:scale-150 group-hover:bg-primary/20 max-sm:hidden" />
            <div className="absolute -top-8 -left-8 h-14 w-14 rounded-full bg-accent/10 blur-2xl opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-150 max-sm:hidden" />
          </div>
        ))}
      </div>

      {/* Progress dots */}
      <div className="mt-2 flex items-center justify-center gap-1">
        {statSets.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              if (i !== setIndex) triggerTransition(i)
            }}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 touch-manipulation"
            aria-label={`Show stat set ${i + 1} of ${statSets.length}`}
            aria-pressed={i === setIndex}
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-500 ${i === setIndex
                ? "w-6 bg-primary/70"
                : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
