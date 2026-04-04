"use client"

import Image from "next/image"
import { ExternalLink, Handshake } from "lucide-react"
import { AnimatedLobsterClaw } from "../animations/animated-lobster-claw"
import { AnimatedSection } from "../animations/animated-section"
import { SectionHeader } from "../layout/section-header"
import { consultingClients } from "@/data/consulting-clients"
import { navigateTo } from "@/components/nav/woosh-scroll"

export function ConsultingClients() {
  return (
    <AnimatedSection
      id="consulting"
      className="relative mx-auto max-w-6xl scroll-mt-28 px-3 py-12 pb-16 md:px-6 md:py-20 md:pb-24 lg:py-28 lg:pb-32"
    >
      <div className="pointer-events-none absolute left-1/4 top-10 h-[420px] w-[420px] rounded-full bg-accent/5 blur-[100px]" aria-hidden />
      <div className="pointer-events-none absolute bottom-10 right-1/4 h-[360px] w-[360px] rounded-full bg-primary/5 blur-[90px]" aria-hidden />

      <SectionHeader
        icon={<Handshake className="h-4 w-4 text-primary" aria-hidden />}
        label="Consulting"
        afterLabel={
          <a
            href="https://cal.com/misha-lubich"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-primary transition-colors hover:border-primary/45 hover:bg-primary/10 hover:text-foreground"
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
        subtitle="I work with small and medium-sized businesses, organizations, and individuals—not only large product teams. That includes web apps, integrations, IT execution, workflows, and automations, plus AI/ML when it genuinely fits. I keep rates approachable because this work is a passion; use the portfolio below for proof, then Contact or schedule a call when you are ready."
      />

      {/* OpenClaw first so the WebM clip is visible without scrolling past the CTAs */}
      <div className="relative mb-8 sm:mb-10" aria-label="OpenClaw consulting">
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            OpenClaw
          </p>
          <div className="flex justify-center" aria-hidden>
            <AnimatedLobsterClaw />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground/95 sm:text-base">
            <span className="font-semibold text-foreground">OpenClaw.</span>{" "}
            You heard the hype. I help people and organizations install, configure, and operate their own OpenClawinstances—channels, skills, updates, and ongoing maintenance—so your agent stack stays under your control. Competitive and affordable rates for you or your business 100% gauranteed or a refund on us!
          </p>
          <a
            href="https://cal.com/misha-lubich"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary underline decoration-primary/35 underline-offset-[6px] transition-colors hover:decoration-primary/70 sm:text-sm"
          >
            Schedule a call about OpenClaw
            <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          </a>
        </div>
      </div>

      <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          <span className="font-semibold text-foreground">Schedule a call</span>
          {" "}
          for consulting, builds, IT, and automations—done-for-you, customized to SMBs, orgs, or solo operators who need reliable help without enterprise price tags.
        </p>
        <a
          href="https://cal.com/misha-lubich"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/[0.08] px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-primary transition-colors hover:border-primary/50 hover:bg-primary/12 hover:text-foreground"
        >
          Book consulting & custom work
          <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden />
        </a>
      </div>

      <ul className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {consultingClients.map((client) => {
          const hasCover = client.coverImage != null && client.coverImage !== ""
          /** Fixed slot so cards with / without hero share the same top band height */
          const heroSlot =
            "relative z-[1] h-[220px] w-full shrink-0 overflow-hidden border-b border-white/[0.08] sm:h-[260px]"

          const baseCard =
            "glass-stack-card group relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary/30"

          const inner = (
            <>
              <div
                className={`h-1 w-full shrink-0 bg-gradient-to-r ${client.gradient} opacity-70 transition-opacity duration-500 group-hover:opacity-100`}
              />
              {hasCover ? (
                <div className={`${heroSlot} bg-black/20`}>
                  <Image
                    src={client.coverImage!}
                    alt={`${client.name} — site preview`}
                    width={1600}
                    height={900}
                    className="h-full w-full object-cover object-top"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div
                  className={`${heroSlot} flex items-center justify-center bg-gradient-to-b from-white/[0.06] via-black/20 to-black/35`}
                  aria-hidden
                >
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/45">
                    Site preview soon
                  </span>
                </div>
              )}
              <div
                className="pointer-events-none absolute -right-20 -top-20 z-0 h-64 w-64 rounded-full opacity-[0.06] blur-3xl transition-opacity duration-700 group-hover:opacity-[0.14]"
                style={{ background: client.accent }}
              />
              <div
                className="pointer-events-none absolute inset-0 z-0 opacity-[0.02] mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
              />

              <div className="relative z-[2] flex min-h-0 flex-1 flex-col space-y-4 p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary sm:text-xl">
                      {client.name}
                    </h3>
                    {client.href ? (
                      <p className="mt-1 font-mono text-xs text-muted-foreground/80">
                        {client.href.replace(/^https?:\/\//, "")}
                      </p>
                    ) : (
                      <p className="mt-1 font-mono text-xs text-primary/90">
                        {client.statusLabel ?? "In progress"}
                      </p>
                    )}
                  </div>
                  {client.href ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border/50 bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
                      Visit
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 rounded-lg border border-border/50 bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      Ask for details
                    </span>
                  )}
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground/85 sm:text-[15px]">
                  {client.summary}
                </p>

                <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                  {client.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border/50 bg-secondary px-3 py-1 font-mono text-[10px] text-muted-foreground/65 transition-colors group-hover:border-primary/25 group-hover:text-muted-foreground/85"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )

          return (
            <li key={client.id} className="flex h-full min-h-0">
              {client.href ? (
                <a
                  href={client.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${baseCard} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
                  aria-label={`${client.name} (opens in a new tab)`}
                >
                  {inner}
                </a>
              ) : (
                <button
                  type="button"
                  className={`${baseCard} w-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
                  onClick={() => navigateTo("#contact")}
                  aria-label={`Contact about ${client.name} consulting engagement`}
                >
                  {inner}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </AnimatedSection>
  )
}
