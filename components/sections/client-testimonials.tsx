"use client"

import { useCallback, useEffect, useId, useState } from "react"
import Image from "next/image"
import { Quote, Star } from "lucide-react"
import { AnimatedSection } from "../animations/animated-section"
import { SectionHeader } from "../layout/section-header"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
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
}: {
  name: string
  avatarSrc?: string
  avatarAlt?: string
}) {
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

const AUTOPLAY_MS = 5200

export function ClientTestimonials() {
  const [api, setApi] = useState<CarouselApi>()
  const [selected, setSelected] = useState(0)
  const [paused, setPaused] = useState(false)

  const onSelect = useCallback((embla: CarouselApi | undefined) => {
    if (embla == null) return
    setSelected(embla.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (api == null) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api, onSelect])

  useEffect(() => {
    if (api == null || paused) return
    const id = window.setInterval(() => {
      api.scrollNext()
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [api, paused])

  return (
    <AnimatedSection
      id="testimonials"
      className="relative scroll-mt-28 px-3 py-12 pb-16 md:px-6 md:py-20 md:pb-24 lg:py-28 lg:pb-32"
    >
      <div className="pointer-events-none absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-primary/[0.05] blur-[90px]" aria-hidden />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-accent/[0.05] blur-[80px]" aria-hidden />

      <div className="relative mx-auto max-w-6xl">
        <SectionHeader
          icon={<Quote className="h-4 w-4 text-primary" aria-hidden />}
          label="Client work"
          title={
            <>
              Past engagements,{" "}
              <span className="gradient-text">honest feedback</span>
            </>
          }
          subtitle="Short notes from people I’ve actually shipped with—sites, product web, pragmatic AI where it earns its place, and workflow automation. Direct relationships, not paid review widgets; no fabricated dollar figures."
        />

        <div
          className="relative px-10 sm:px-14 md:px-16"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false)
          }}
        >
          <Carousel
            setApi={setApi}
            opts={{
              loop: true,
              align: "center",
              duration: 18,
              skipSnaps: false,
              dragFree: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 sm:-ml-4">
              {clientTestimonials.map((t) => (
                <CarouselItem
                  key={t.id}
                  className={cn(
                    "pl-3 sm:pl-4",
                    "basis-[88%] sm:basis-[82%] md:basis-[72%] lg:basis-[58%]",
                  )}
                >
                  <figure
                    className={cn(
                      "flex h-full min-h-[300px] flex-col rounded-2xl border border-white/[0.1] bg-gradient-to-b from-card/40 to-card/[0.12] p-6 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-[border-color,box-shadow] duration-300 sm:min-h-[340px] sm:p-8",
                      "hover:border-primary/25 hover:shadow-[0_24px_60px_-20px_hsl(var(--primary)/0.12)]",
                    )}
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <Avatar name={t.name} avatarSrc={t.avatarSrc} avatarAlt={t.avatarAlt} />
                      <StarRating rating={t.rating} />
                    </div>
                    <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground/95 sm:text-[15px]">
                      <span className="text-primary/45">“</span>
                      {t.quote}
                      <span className="text-primary/45">”</span>
                    </blockquote>
                    <figcaption className="mt-6 border-t border-white/[0.07] pt-5">
                      <cite className="not-italic">
                        <span className="block font-semibold tracking-tight text-foreground">{t.name}</span>
                        <span className="mt-1 block text-xs text-muted-foreground sm:text-sm">
                          {t.title} · {t.organization}
                        </span>
                      </cite>
                    </figcaption>
                  </figure>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              variant="outline"
              className="left-0 border-white/15 bg-background/80 text-foreground shadow-md backdrop-blur-md hover:bg-background hover:text-primary disabled:opacity-40"
            />
            <CarouselNext
              variant="outline"
              className="right-0 border-white/15 bg-background/80 text-foreground shadow-md backdrop-blur-md hover:bg-background hover:text-primary disabled:opacity-40"
            />
          </Carousel>

          <div
            className="mt-8 flex justify-center gap-2"
            role="tablist"
            aria-label="Choose testimonial"
          >
            {clientTestimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={selected === i}
                aria-label={`Show review ${i + 1}: ${t.name}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-300 ease-out",
                  selected === i
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                )}
                onClick={() => api?.scrollTo(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}
