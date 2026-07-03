"use client"

import { useCallback, useRef, useState } from "react"
import { motion, useReducedMotion, useSpring } from "framer-motion"
import { ExternalLink, Flame, Trophy } from "lucide-react"

/* ── tokscale — live AI token usage (single source of truth) ──────── */

export const TOKSCALE_PROFILE_URL = "https://tokscale.ai/u/ml-lubich"
export const TOKSCALE_LEADERBOARD_URL = "https://tokscale.ai/leaderboard"
const TOKSCALE_EMBED_URL = "https://tokscale.ai/api/embed/ml-lubich/svg?sort=cost&compact=1"

/** Idle float loop — gentle bob with a slow 3D sway. Runs only while not hovered. */
const FLOAT_KEYFRAMES = {
  y: [0, -12, 0],
  rotateX: [3, -2.5, 3],
  rotateY: [-4, 4, -4],
}
const FLOAT_TRANSITION = { duration: 7, repeat: Infinity, ease: "easeInOut" as const }

/** Hover pose — the float settles flat, lifts and swells so only the spring tilt moves. */
const HOVER_POSE = { y: -10, scale: 1.02, rotateX: 0, rotateY: 0 }
const HOVER_TRANSITION = { type: "spring" as const, stiffness: 220, damping: 26 }

const TILT_SPRING = { stiffness: 260, damping: 28 }

/** Live tokscale embed, centered right under the hero brain — a floating 3D panel
 *  with pointer-tracked spring tilt (desktop) and a pulsing emerald aura so it reads
 *  as a hero centerpiece rather than a footnote. Links to the tokscale profile.
 *  Pointer math reads the static scene wrapper (never the transforming card) and the
 *  idle float pauses while hovered, so the tilt can't fight the bob and jitter. */
export function TokscaleHeroBadge() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const reduce = useReducedMotion() ?? false
  const tiltX = useSpring(0, TILT_SPRING)
  const tiltY = useSpring(0, TILT_SPRING)

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLAnchorElement>) => {
      if (reduce || e.pointerType !== "mouse") return
      const rect = sceneRef.current?.getBoundingClientRect()
      if (!rect) return
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      tiltX.set(-py * 10)
      tiltY.set(px * 14)
    },
    [reduce, tiltX, tiltY]
  )

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent<HTMLAnchorElement>) => {
      if (reduce || e.pointerType !== "mouse") return
      setHovered(true)
    },
    [reduce]
  )

  const handlePointerLeave = useCallback(() => {
    setHovered(false)
    tiltX.set(0)
    tiltY.set(0)
  }, [tiltX, tiltY])

  return (
    <div
      className="mt-12 flex animate-fade-in-up justify-center pointer-events-auto sm:mt-20"
      style={{ animationDelay: "0.62s", opacity: 0 }}
    >
      <div ref={sceneRef} className="tokscale-3d-scene relative">
        <div className="tokscale-aura absolute -inset-3 rounded-[1.5rem]" aria-hidden="true" />
        <motion.div
          className="relative"
          style={{ transformStyle: "preserve-3d" }}
          animate={reduce ? { y: 0, rotateX: 0, rotateY: 0 } : hovered ? HOVER_POSE : FLOAT_KEYFRAMES}
          transition={hovered || reduce ? HOVER_TRANSITION : FLOAT_TRANSITION}
        >
          <motion.a
            href={TOKSCALE_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Live AI token usage tracked by tokscale"
            onPointerMove={handlePointerMove}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 900 }}
            className="group relative block overflow-hidden rounded-2xl border border-emerald-400/25 bg-[hsla(222,20%,7%,0.72)] p-2.5 shadow-[0_18px_50px_-12px_rgba(16,185,129,0.3),0_8px_24px_-8px_rgba(0,0,0,0.5)] backdrop-blur-md transition-[border-color,box-shadow] duration-500 hover:border-emerald-300/50 hover:shadow-[0_24px_64px_-12px_rgba(16,185,129,0.45),0_8px_24px_-8px_rgba(0,0,0,0.5)]"
          >
            <div
              className="absolute inset-x-4 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent"
              aria-hidden="true"
            />
            <div className="tokscale-sheen absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={TOKSCALE_EMBED_URL}
              alt="Misha Lubich — live AI token usage tracked by tokscale"
              width={540}
              height={190}
              loading="lazy"
              className="relative h-auto w-[min(92vw,420px)] max-w-full rounded-xl sm:w-[460px] lg:w-[540px]"
            />
            {/* Wordless "in progress" strip — tokens are burning right now; the green bar
                sweeps through the panel like an indeterminate progress indicator. */}
            <span className="relative mt-2 flex items-center px-1 pb-0.5">
              <span className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-emerald-500/15">
                <span
                  data-tokscale-scan
                  aria-hidden="true"
                  className="tokscale-scan-bar absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-emerald-500/10 via-emerald-400 to-emerald-500/10"
                />
              </span>
            </span>
          </motion.a>
        </motion.div>
      </div>
    </div>
  )
}

/** Full glass card for the GitHub-stats section: live tokscale embed + links. */
export function TokscaleCard() {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.03] bg-white/[0.01] p-4 backdrop-blur-2xl transition-all duration-500 hover:border-emerald-400/25 hover:bg-white/[0.025] glass-card-3d sm:p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-400/50 via-primary/40 to-accent/40 opacity-60" />
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl opacity-0 transition-all duration-700 group-hover:scale-150 group-hover:opacity-100" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Flame className="h-4 w-4 text-emerald-400" />
            <h3 className="text-lg font-bold text-foreground">AI Token Usage</h3>
          </div>
          <p className="mb-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Tokens burned shipping AI in production — auto-tracked across Claude Code, Codex,
            Gemini &amp; more via tokscale.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={TOKSCALE_LEADERBOARD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-emerald-400/30 hover:bg-white/[0.08] hover:text-foreground"
            >
              <Trophy className="h-3.5 w-3.5 text-emerald-400/80" />
              Global leaderboard
              <ExternalLink className="h-3 w-3 text-muted-foreground/50" />
            </a>
            <a
              href={TOKSCALE_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-emerald-400/30 hover:bg-white/[0.08] hover:text-foreground"
            >
              Full stats
              <ExternalLink className="h-3 w-3 text-muted-foreground/50" />
            </a>
          </div>
        </div>

        <a
          href={TOKSCALE_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Full tokscale stats for ml-lubich"
          className="shrink-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={TOKSCALE_EMBED_URL}
            alt="Misha Lubich — AI token usage tracked by tokscale"
            width={460}
            height={162}
            loading="lazy"
            className="h-auto w-full max-w-[460px] rounded-xl border border-white/[0.06] transition-transform duration-500 group-hover:scale-[1.01]"
          />
        </a>
      </div>
    </div>
  )
}
