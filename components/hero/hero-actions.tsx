"use client"

import { BriefcaseBusiness, Mail, Phone } from "lucide-react"
import { navigateTo } from "@/components/nav/woosh-scroll"
import { SocialIcons } from "@/components/social-icons"

/* ── CTA buttons ──────────────────────────────────────────────────── */

export function HeroCTAs() {
  return (
    <div
      className="hero-ctas mt-7 flex animate-fade-in-up flex-wrap items-center justify-center gap-3 pointer-events-auto sm:mt-10 lg:justify-start"
      style={{ animationDelay: "0.35s", opacity: 0 }}
    >
      <button
        type="button"
        onClick={() => navigateTo("#contact")}
        className="group relative overflow-hidden rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-white/10 transition-all hover:scale-105 hover:shadow-xl hover:shadow-white/20 sm:px-8 sm:py-3.5 cursor-pointer"
      >
        <span className="relative z-10 flex items-center gap-2 text-black">
          <Mail className="h-4 w-4 text-black" />
          Discuss a Project
        </span>
        <div className="absolute inset-0 bg-white/80 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
      <button
        type="button"
        onClick={() => navigateTo("#consulting")}
        className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl border border-white/[0.10] bg-card/30 px-6 py-3 text-sm font-semibold text-foreground shadow-[inset_0_1px_0_0_hsla(0,0%,100%,0.1)] shadow-sm shadow-black/25 ring-1 ring-inset ring-white/[0.06] backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 hover:border-primary/35 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-primary/15 glass-card-3d spotlight hover-lift sm:px-8 sm:py-3.5"
      >
        <BriefcaseBusiness className="relative z-10 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span className="relative z-10">View Client Work</span>
      </button>
      <a
        href="https://calendar.app.google/T2VGkBsBAUzGABRB7"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-white/[0.10] bg-card/30 px-6 py-3 text-sm font-semibold text-foreground shadow-[inset_0_1px_0_0_hsla(0,0%,100%,0.1)] shadow-sm shadow-black/25 ring-1 ring-inset ring-white/[0.06] backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 hover:border-primary/35 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-primary/15 glass-card-3d spotlight hover-lift sm:px-8 sm:py-3.5"
      >
        <Phone className="relative z-10 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span className="relative z-10">Book a Consultation</span>
      </a>
    </div>
  )
}

export function HeroProof() {
  return (
    <blockquote
      className="mx-auto mt-6 max-w-xl animate-fade-in-up text-sm leading-relaxed text-foreground/75 sm:text-base"
      style={{ animationDelay: "0.48s", opacity: 0 }}
    >
      “Incredible work—can’t believe you did that so fast.”
      <footer className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
        Perry Barrow · W3 Sourcing
      </footer>
    </blockquote>
  )
}

/* ── Social links ─────────────────────────────────────────────────── */

export function SocialLinks() {
  return (
    <div
      className="hero-socials mt-4 flex animate-fade-in-up items-center justify-center gap-3 pointer-events-auto sm:mt-6 lg:justify-start"
      style={{ animationDelay: "0.5s", opacity: 0 }}
    >
      <SocialIcons size="md" />
    </div>
  )
}
