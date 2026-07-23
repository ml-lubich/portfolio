"use client"

import { useId, useState } from "react"
import Image from "next/image"
import { Pause, Play, Quote, Star } from "lucide-react"
import { AnimatedSection } from "../animations/animated-section"
import { SectionHeader } from "../layout/section-header"
import { clientTestimonials } from "@/data/client-testimonials"
import { cn } from "@/lib/utils"

const STAR_CLASS =
  "h-4 w-4 shrink-0 sm:h-[1.125rem] sm:w-[1.125rem] text-transparent"
const STAR_GLOW =
  "drop-shadow-[0_0_5px_rgba(232,196,90,0.35)] sm:drop-shadow-[0_0_6px_rgba(232,196,90,0.4)]"

function StarRating({ rating }: { rating: 4 | 4.5 | 5 }) {
  const uid = useId().replace(/:/g, "")
  const goldId = `${uid}-star-gold`
  const steelId = `${uid}-star-steel`

  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  const label = `${rating} out of 5 — direct engagement feedback`

  return (
    <div className="relative flex items-center gap-2.5">
      <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden focusable="false">
        <defs>
          <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff9ed" />
            <stop offset="28%" stopColor="#f3df8a" />
            <stop offset="55%" stopColor="#d4a21a" />
            <stop offset="82%" stopColor="#a67c14" />
            <stop offset="100%" stopColor="#5c4512" />
          </linearGradient>
          <linearGradient id={steelId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(150,155,170,0.42)" />
            <stop offset="48%" stopColor="rgba(72,74,84,0.5)" />
            <stop offset="100%" stopColor="rgba(38,40,48,0.55)" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex items-center gap-1" role="img" aria-label={label}>
        {Array.from({ length: full }, (_, i) => (
          <Star
            key={`f-${i}`}
            className={cn(STAR_CLASS, STAR_GLOW)}
            fill={`url(#${goldId})`}
            stroke="rgba(28,24,18,0.42)"
            strokeWidth={0.65}
            aria-hidden
          />
        ))}
        {half ? (
          <span
            className="relative inline-flex h-4 w-4 shrink-0 sm:h-[1.125rem] sm:w-[1.125rem]"
            aria-hidden
          >
            <Star
              className={cn(STAR_CLASS, "absolute inset-0 h-full w-full")}
              fill={`url(#${steelId})`}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={0.55}
            />
            <span className="absolute inset-y-0 left-0 w-[50%] overflow-hidden">
              <Star
                className={cn(STAR_CLASS, STAR_GLOW)}
                fill={`url(#${goldId})`}
                stroke="rgba(28,24,18,0.42)"
                strokeWidth={0.65}
              />
            </span>
          </span>
        ) : null}
        {Array.from({ length: empty }, (_, i) => (
          <Star
            key={`e-${i}`}
            className={cn(STAR_CLASS, "opacity-[0.92]")}
            fill={`url(#${steelId})`}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={0.55}
            aria-hidden
          />
        ))}
      </div>
      <span className="bg-gradient-to-br from-[#fff6e0] via-[#e8c547] to-[#7a5612] bg-clip-text font-mono text-[11px] font-semibold tabular-nums text-transparent drop-shadow-[0_0_12px_rgba(212,162,26,0.2)] sm:text-xs">
        {rating}
      </span>
    </div>
  )
}

function Avatar({
  name,
  avatarSrc,
  avatarAlt,
  siteImageSrc,
  siteImageAlt,
}: {
  name: string
  avatarSrc?: string
  avatarAlt?: string
  siteImageSrc?: string
  siteImageAlt?: string
}) {
  if (siteImageSrc != null && siteImageSrc !== "") {
    return (
      <div className="relative h-14 w-[7.5rem] shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/20 ring-1 ring-primary/15 sm:h-16 sm:w-[9.5rem]">
        <Image
          src={siteImageSrc}
          alt={siteImageAlt ?? `${name} — website preview`}
          width={640}
          height={400}
          className="h-full w-full object-cover object-left-top"
          sizes="152px"
        />
      </div>
    )
  }
  if (avatarSrc != null && avatarSrc !== "") {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/10 bg-black/20 ring-2 ring-primary/20 sm:h-16 sm:w-16">
        <Image
          src={avatarSrc}
          alt={avatarAlt ?? name}
          width={128}
          height={128}
          className="h-full w-full object-cover"
          sizes="64px"
        />
      </div>
    )
  }
  const words = name.split(/\s+/).filter(Boolean)
  const initials =
    words.length >= 2
      ? `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase()
      : (words[0]?.[0]?.toUpperCase() ?? "?")
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-primary/10 font-mono text-sm font-bold text-primary sm:h-16 sm:w-16 sm:text-base"
      aria-hidden
    >
      {initials || "?"}
    </div>
  )
}

export function ClientTestimonials() {
  const [paused, setPaused] = useState(false)

  const cards = clientTestimonials.map((t) => (
    <li key={t.id} className="flex w-[320px] shrink-0 sm:w-[420px] lg:w-[460px]">
      <figure className="flex h-full min-h-[310px] w-full flex-col rounded-2xl bg-white/[0.035] p-5 ring-1 ring-inset ring-white/[0.07] transition-colors hover:bg-white/[0.05] sm:min-h-[330px] sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <Avatar
            name={t.name}
            avatarSrc={t.avatarSrc}
            avatarAlt={t.avatarAlt}
            siteImageSrc={t.siteImageSrc}
            siteImageAlt={t.siteImageAlt}
          />
          <StarRating rating={t.rating} />
        </div>
        <blockquote className="line-clamp-[8] flex-1 text-sm leading-7 text-muted-foreground/90">
          <span className="text-foreground/35">“</span>
          {t.quote}
          <span className="text-foreground/35">”</span>
        </blockquote>
        <figcaption className="mt-6 border-t border-white/[0.06] pt-4">
          <cite className="not-italic">
            <span className="block font-medium tracking-tight text-foreground">{t.name}</span>
            <span className="mt-1 block text-xs text-muted-foreground/65">
              {t.title} · {t.organization}
            </span>
          </cite>
        </figcaption>
      </figure>
    </li>
  ))

  return (
    <AnimatedSection
      id="testimonials"
      className="relative scroll-mt-28 overflow-hidden py-10 md:py-16 lg:py-20"
    >
      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeader
          icon={<Quote className="h-4 w-4 text-primary" aria-hidden />}
          label="Client proof"
          title={
            <>
              Trusted by teams that{" "}
              <span className="gradient-text">expect quality</span>
            </>
          }
          subtitle="Direct feedback from founders and operators I’ve shipped with—real relationships, real products, and accountable delivery."
        />

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-pressed={paused}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {paused ? <Play className="h-3 w-3" aria-hidden /> : <Pause className="h-3 w-3" aria-hidden />}
            {paused ? "Play" : "Pause"}
          </button>
        </div>
      </div>

      <div
        className="client-carousel relative"
        data-paused={paused ? "true" : "false"}
        style={{ "--carousel-duration": `${clientTestimonials.length * 18}s` } as React.CSSProperties}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent sm:w-24" aria-hidden />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent sm:w-24" aria-hidden />
        <div className="client-carousel-track flex w-max items-stretch">
          <ul className="flex items-stretch gap-4 pl-4 md:gap-5 md:pl-6">
            {cards}
          </ul>
          <ul
            className="flex items-stretch gap-4 pl-4 md:gap-5 md:pl-6"
            aria-hidden="true"
            inert
          >
            {cards}
          </ul>
        </div>
      </div>
    </AnimatedSection>
  )
}
