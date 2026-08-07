"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Code2,
  Database,
  ExternalLink,
  Gem,
  Globe,
  Handshake,
  Pause,
  Play,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"
import { AnimatedLobsterClaw } from "../animations/animated-lobster-claw"
import { AnimatedSection } from "../animations/animated-section"
import { SectionHeader } from "../layout/section-header"
import { ShimmerOverlay } from "../ui/shimmer-overlay"
import { consultingClients, type ConsultingClient } from "@/data/consulting-clients"
import { navigateTo } from "@/components/nav/woosh-scroll"

const CALENDAR_URL = "https://calendar.app.google/T2VGkBsBAUzGABRB7"

/** Pixels per second the rail drifts on its own */
const AUTO_SPEED = 34
/** Pointer travel (px) past which a gesture is a drag, not a card tap */
const DRAG_SLOP = 8
/** How many copies of the card set fill the rail so the wrap is never visible */
const RAIL_COPIES = 3

/** Each tag gets its own glyph so a card reads at a glance, not as a wall of pills. */
const TAG_ICON: Record<string, typeof Globe> = {
  Web: Globe,
  CRM: Database,
  "Next.js": Code2,
  Events: Calendar,
  Recruiting: Users,
  Luxury: Gem,
}

/* ────────────────────────────────────────────────────────────────
 *  ClientCard — HUD-framed front face that flips to an engagement
 *  brief on click. The flip is a 3D rotateY on a preserve-3d stage;
 *  both faces stay mounted so the back's content is in the DOM for
 *  assistive tech only while it is showing (`inert` on the hidden one).
 * ──────────────────────────────────────────────────────────────── */
function ClientCard({
  client,
  index,
  flipped,
  onFlip,
  onCoverError,
  coverErrors,
  interactive,
}: {
  client: ConsultingClient
  index: number
  flipped: boolean
  onFlip: () => void
  onCoverError: () => void
  coverErrors: number
  /** False for the duplicated rail copies — they are decorative filler. */
  interactive: boolean
}) {
  const hasCover = client.coverImage != null && client.coverImage !== "" && coverErrors < 2
  const idx = String(index + 1).padStart(2, "0")

  const face =
    "absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-white/[0.10] bg-[#0a0c14]/80 backdrop-blur-2xl [backface-visibility:hidden]"

  return (
    <div className="h-full w-full" style={{ perspective: "1600px" }}>
      <div
        className="relative h-full w-full transition-transform duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── Front ─────────────────────────────────────────── */}
        <div className={face} aria-hidden={flipped || undefined} inert={flipped}>
          {/* Scanning accent rail */}
          <div
            className={`h-[2px] w-full shrink-0 bg-gradient-to-r ${client.gradient} opacity-80`}
          />

          {hasCover ? (
            <div className="relative h-[200px] w-full shrink-0 overflow-hidden bg-black/30 sm:h-[230px]">
              <Image
                key={`${client.id}-cover-${coverErrors}`}
                src={client.coverImage!}
                alt={`${client.name} — site preview`}
                width={1600}
                height={900}
                className="h-full w-full object-cover object-top opacity-90"
                sizes="(max-width: 768px) 100vw, 420px"
                loading="lazy"
                onError={onCoverError}
              />
              {/* Readout scrim + scanlines */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0c14] via-[#0a0c14]/25 to-transparent" />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-overlay"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(180deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 4px)",
                }}
                aria-hidden
              />
              {/* Corner brackets */}
              <span className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-white/40" aria-hidden />
              <span className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-white/40" aria-hidden />
            </div>
          ) : (
            <div
              className="flex h-[200px] w-full shrink-0 items-center justify-center bg-gradient-to-b from-white/[0.05] to-black/40 sm:h-[230px]"
              aria-hidden
            >
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/45">
                Preview unavailable
              </span>
            </div>
          )}

          <ShimmerOverlay className="z-[3] rounded-2xl" />

          <div className="relative z-[2] flex min-h-0 flex-1 flex-col gap-3 p-5">
            {/* HUD strip */}
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
              <span className="text-foreground/70">{idx}</span>
              <span className="h-px flex-1 bg-white/10" aria-hidden />
              <span>{client.sector}</span>
              <span
                className="h-1.5 w-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                aria-hidden
              />
            </div>

            <div>
              <h3 className="font-display text-lg font-light text-foreground sm:text-xl">
                {client.name}
              </h3>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground/60">
                {client.href ? client.href.replace(/^https?:\/\//, "").replace(/\/$/, "") : client.statusLabel ?? "In progress"}
              </p>
            </div>

            <p className="line-clamp-3 text-[13px] leading-relaxed text-muted-foreground/80">
              {client.summary}
            </p>

            {client.impact?.length ? (
              <ul className="flex flex-col gap-1.5">
                {client.impact.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-foreground/75"
                  >
                    <Zap className="h-3 w-3 shrink-0 text-foreground/50" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-auto flex items-center justify-between gap-3 pt-2">
              <div className="flex gap-1.5">
                {client.tags.map((tag) => {
                  const Icon = TAG_ICON[tag] ?? Sparkles
                  return (
                    <span
                      key={tag}
                      title={tag}
                      className="inline-flex items-center gap-1 rounded-md border border-white/[0.10] bg-white/[0.04] px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/65"
                    >
                      <Icon className="h-3 w-3 shrink-0" aria-hidden />
                      {tag}
                    </span>
                  )
                })}
              </div>
              <button
                type="button"
                tabIndex={interactive ? undefined : -1}
                onClick={onFlip}
                aria-label={`Show engagement details for ${client.name}`}
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/[0.12] bg-white/[0.05] px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-foreground/75 transition-colors hover:border-white/35 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                Details
                <ChevronDown className="h-3 w-3 -rotate-90" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {/* ── Back — engagement brief ────────────────────────── */}
        <div
          className={`${face} [transform:rotateY(180deg)]`}
          aria-hidden={!flipped || undefined}
          inert={!flipped}
        >
          <div className={`h-[2px] w-full shrink-0 bg-gradient-to-r ${client.gradient}`} />
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-[0.14] blur-3xl"
            style={{ background: client.accent }}
            aria-hidden
          />

          <div className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
              <span className="text-foreground/70">{idx}</span>
              <span className="h-px flex-1 bg-white/10" aria-hidden />
              <span>Engagement</span>
            </div>

            <h3 className="font-display text-lg font-light text-foreground sm:text-xl">
              {client.name}
            </h3>

            <p className="text-[13px] leading-relaxed text-muted-foreground/85">{client.summary}</p>

            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
                What I built
              </p>
              <ul className="flex flex-col gap-2">
                {client.deliverables.map((item) => (
                  <li key={item} className="flex gap-2 text-[13px] leading-relaxed text-muted-foreground/80">
                    <span
                      className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-foreground/50"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                tabIndex={interactive ? undefined : -1}
                onClick={onFlip}
                aria-label={`Back to the ${client.name} card`}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.12] bg-white/[0.05] px-2.5 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-foreground/75 transition-colors hover:border-white/35 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                <ArrowLeft className="h-3 w-3" aria-hidden />
                Back
              </button>
              {client.href ? (
                <a
                  href={client.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={interactive ? undefined : -1}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-white/[0.10] px-2.5 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-white/[0.18] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  Visit site
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              ) : (
                <button
                  type="button"
                  tabIndex={interactive ? undefined : -1}
                  onClick={() => navigateTo("#contact")}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-white/[0.10] px-2.5 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-white/[0.18]"
                >
                  Contact
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ConsultingClients() {
  /**
   * Per-client cover load failure count. The first failure remounts the image
   * (via a changing key) so a transient load error refetches instead of
   * sticking; only a second failure falls back to the styled "Preview
   * unavailable" slot.
   */
  const [coverErrorCounts, setCoverErrorCounts] = useState<Record<string, number>>({})
  const [carouselPaused, setCarouselPaused] = useState(false)
  const [flippedId, setFlippedId] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  /* ── Rail: rAF auto-drift + pointer drag with momentum ───────── */
  const railRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const rafRef = useRef(0)
  const lastTimeRef = useRef(0)
  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragOffsetRef = useRef(0)
  const dragDistRef = useRef(0)
  const velocityRef = useRef(0)
  const lastPointerXRef = useRef(0)
  const lastPointerTimeRef = useRef(0)
  const offscreenRef = useRef(false)
  const [dragging, setDragging] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  /* A flipped card must not slide out from under the pointer while it is
     being read, so the drift halts for the toggle, a flip, or a drag.
     Reduced-motion visitors get a rail they scroll themselves, never one
     that moves on its own. */
  const drifting = !carouselPaused && flippedId === null && !reducedMotion

  const wrapOffset = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const setWidth = el.scrollWidth / RAIL_COPIES
    if (setWidth === 0) return
    while (offsetRef.current < -setWidth) offsetRef.current += setWidth
    while (offsetRef.current > 0) offsetRef.current -= setWidth
  }, [])

  const animate = useCallback(
    (time: number) => {
      if (offscreenRef.current) {
        rafRef.current = 0
        return
      }
      if (lastTimeRef.current === 0) lastTimeRef.current = time
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = time

      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current) > 0.5) {
          offsetRef.current += velocityRef.current * dt
          velocityRef.current *= 0.94
        } else {
          velocityRef.current = 0
        }
        if (drifting) offsetRef.current -= AUTO_SPEED * dt
      }

      wrapOffset()
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${offsetRef.current}px,0,0)`
      }
      rafRef.current = requestAnimationFrame(animate)
    },
    [drifting, wrapOffset],
  )

  useEffect(() => {
    const root = railRef.current
    const start = () => {
      if (!rafRef.current) {
        lastTimeRef.current = 0
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    if (!root || typeof IntersectionObserver === "undefined") {
      start()
      return () => {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        offscreenRef.current = !entry.isIntersecting
        if (entry.isIntersecting) start()
        else {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = 0
        }
      },
      { threshold: 0, rootMargin: "120px" },
    )
    io.observe(root)
    return () => {
      io.disconnect()
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [animate])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true
    setDragging(true)
    dragDistRef.current = 0
    velocityRef.current = 0
    dragStartXRef.current = e.clientX
    dragOffsetRef.current = offsetRef.current
    lastPointerXRef.current = e.clientX
    lastPointerTimeRef.current = performance.now()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - dragStartXRef.current
    offsetRef.current = dragOffsetRef.current + dx
    dragDistRef.current = Math.max(dragDistRef.current, Math.abs(dx))

    const now = performance.now()
    const dt = (now - lastPointerTimeRef.current) / 1000
    if (dt > 0) velocityRef.current = (e.clientX - lastPointerXRef.current) / dt
    lastPointerXRef.current = e.clientX
    lastPointerTimeRef.current = now
  }, [])

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false
    setDragging(false)
  }, [])

  /** A drag that ends over a card must not also flip or follow that card. */
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (dragDistRef.current > DRAG_SLOP) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  const noteCoverError = useCallback((id: string) => {
    setCoverErrorCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
  }, [])

  const renderSet = (copy: number) =>
    consultingClients.map((client, i) => (
      <li
        key={`${copy}-${client.id}`}
        className="h-[560px] w-[320px] shrink-0 sm:w-[380px] lg:w-[400px]"
      >
        <ClientCard
          client={client}
          index={i}
          interactive={copy === 0}
          flipped={copy === 0 && flippedId === client.id}
          onFlip={() =>
            setFlippedId((cur) => (cur === client.id ? null : client.id))
          }
          coverErrors={coverErrorCounts[client.id] ?? 0}
          onCoverError={() => noteCoverError(client.id)}
        />
      </li>
    ))

  return (
    <AnimatedSection
      id="consulting"
      className="relative scroll-mt-28 py-8 pb-10 md:py-20 md:pb-24 lg:py-28 lg:pb-32"
    >
      <div className="pointer-events-none absolute left-1/4 top-10 h-[420px] w-[420px] rounded-full bg-accent/5 blur-[100px]" aria-hidden />
      <div className="pointer-events-none absolute bottom-10 right-1/4 h-[360px] w-[360px] rounded-full bg-primary/5 blur-[90px]" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-3 md:px-6">
        <SectionHeader
          compact
          icon={<Handshake className="h-4 w-4 text-primary" aria-hidden />}
          label="Consulting"
          afterLabel={
            <a
              href={CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary transition-colors hover:border-primary/45 hover:bg-primary/10 hover:text-foreground"
            >
              Schedule a call
              <ExternalLink className="h-3 w-3 opacity-80" aria-hidden />
            </a>
          }
          title={
            <>
              Client work, automations, and{" "}
              <span className="gradient-text">live product sites</span>
            </>
          }
          subtitle="Web apps, integrations, IT execution, workflows, and automations for SMBs, organizations, and solo operators — plus AI/ML when it genuinely fits."
        />

        {/* OpenClaw — compact inline pitch */}
        <div className="mx-auto mb-4 flex max-w-2xl flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <div className="shrink-0 scale-[0.55] sm:scale-[0.6]" aria-hidden>
            <AnimatedLobsterClaw />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              OpenClaw
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground/85">
              I install, configure, and operate your own OpenClaw instances — channels, skills,
              updates, and maintenance — so your agent stack stays under your control.
            </p>
            <a
              href={CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary underline decoration-primary/35 underline-offset-4 transition-colors hover:decoration-primary/70"
            >
              Schedule a call about OpenClaw
              <ExternalLink className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
            </a>
          </div>
        </div>

        {/* Collapsible consulting detail — collapsed by default so the work below leads */}
        <div className="mx-auto mb-6 max-w-2xl text-center">
          <button
            type="button"
            onClick={() => setDetailsOpen((open) => !open)}
            aria-expanded={detailsOpen}
            aria-controls="consulting-details"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {detailsOpen ? "Hide details" : "How I work & rates"}
            <ChevronDown
              className={`h-3 w-3 transition-transform duration-300 ${detailsOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>

          <div
            id="consulting-details"
            hidden={!detailsOpen}
            className="mt-4 space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-left"
          >
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              I work with small and medium-sized businesses, organizations, and individuals — not
              only large product teams. That covers web apps, integrations, IT execution, workflows,
              and automations, plus AI/ML when it genuinely fits. Rates stay approachable because
              this work is a passion; use the portfolio below for proof, then book a call when
              you&apos;re ready.
            </p>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Done-for-you consulting, builds, IT, and automations, customized to SMBs, orgs, or
              solo operators who need reliable help without enterprise price tags.
            </p>
            <a
              href={CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/[0.08] px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary transition-colors hover:border-primary/50 hover:bg-primary/[0.14] hover:text-foreground"
            >
              Book consulting &amp; custom work
              <ExternalLink className="h-3 w-3 opacity-80" aria-hidden />
            </a>
          </div>
        </div>

        {/* Rail controls */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/45">
            Drag to explore · tap a card for details
          </p>
          <button
            type="button"
            onClick={() => setCarouselPaused((p) => !p)}
            aria-pressed={carouselPaused}
            aria-label={carouselPaused ? "Resume client carousel" : "Pause client carousel"}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {carouselPaused ? <Play className="h-3 w-3" aria-hidden /> : <Pause className="h-3 w-3" aria-hidden />}
            {carouselPaused ? "Play" : "Pause"}
          </button>
        </div>
      </div>

      {/* Full-bleed rail — breaks the max-w container so cards run edge to edge */}
      <div
        ref={railRef}
        className="client-carousel relative w-full overflow-hidden"
        data-paused={drifting ? "false" : "true"}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent sm:w-24" aria-hidden />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent sm:w-24" aria-hidden />

        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClickCapture={onClickCapture}
          className={`client-carousel-track flex w-max will-change-transform ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          style={{ touchAction: "pan-y" }}
        >
          {Array.from({ length: RAIL_COPIES }, (_, copy) => (
            <ul
              key={copy}
              className="flex items-stretch gap-4 pl-4 md:gap-6 md:pl-6"
              aria-hidden={copy > 0 || undefined}
              inert={copy > 0}
            >
              {renderSet(copy)}
            </ul>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
