"use client"

import { Github, GraduationCap, Linkedin, Mail, Phone, Sparkles } from "lucide-react"
import { navigateTo } from "@/components/nav/woosh-scroll"

/* ── CTA buttons ──────────────────────────────────────────────────── */

export function HeroCTAs() {
  return (
    <div
      className="mt-10 flex animate-fade-in-up flex-wrap items-center justify-center gap-3 sm:gap-4 pointer-events-auto"
      style={{ animationDelay: "0.35s", opacity: 0 }}
    >
      <button
        type="button"
        onClick={() => navigateTo("#contact")}
        className="group relative overflow-hidden rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-white/10 transition-all hover:scale-105 hover:shadow-xl hover:shadow-white/20 sm:px-8 sm:py-3.5 cursor-pointer"
      >
        <span className="relative z-10 flex items-center gap-2 text-black">
          <Mail className="h-4 w-4 text-black" />
          Get In Touch
        </span>
        <div className="absolute inset-0 bg-white/80 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
      <button
        type="button"
        onClick={() => navigateTo("#ai-expertise")}
        className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl border border-white/[0.10] bg-card/30 px-6 py-3 text-sm font-semibold text-foreground shadow-[inset_0_1px_0_0_hsla(0,0%,100%,0.1)] shadow-sm shadow-black/25 ring-1 ring-inset ring-white/[0.06] backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 hover:border-primary/35 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-primary/15 glass-card-3d spotlight hover-lift sm:px-8 sm:py-3.5"
      >
        <Sparkles className="relative z-10 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span className="relative z-10">View AI Expertise</span>
      </button>
      <a
        href="https://calendar.app.google/T2VGkBsBAUzGABRB7"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-white/[0.10] bg-card/30 px-6 py-3 text-sm font-semibold text-foreground shadow-[inset_0_1px_0_0_hsla(0,0%,100%,0.1)] shadow-sm shadow-black/25 ring-1 ring-inset ring-white/[0.06] backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 hover:border-primary/35 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-primary/15 glass-card-3d spotlight hover-lift sm:px-8 sm:py-3.5"
      >
        <Phone className="relative z-10 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span className="relative z-10">Schedule Call</span>
      </a>
    </div>
  )
}

/* ── Social links ─────────────────────────────────────────────────── */

export function SocialLinks() {
  return (
    <div
      className="mt-6 flex animate-fade-in-up items-center justify-center gap-3 pointer-events-auto"
      style={{ animationDelay: "0.5s", opacity: 0 }}
    >
      <a
        href="https://github.com/ml-lubich"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.05] text-white/80 backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/[0.1] hover:text-white magnetic"
        aria-label="GitHub"
      >
        <Github className="h-5 w-5 transition-transform group-hover:scale-110" />
      </a>
      <a
        href="https://www.linkedin.com/in/misha-lubich/"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.05] text-white/80 backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/[0.1] hover:text-white magnetic"
        aria-label="LinkedIn"
      >
        <Linkedin className="h-5 w-5 transition-transform group-hover:scale-110" />
      </a>
      <a
        href="https://scholar.google.com/citations?hl=en&user=Be6ZA78AAAAJ"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.05] text-white/80 backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/[0.1] hover:text-white magnetic"
        aria-label="Google Scholar"
      >
        <GraduationCap className="h-5 w-5 transition-transform group-hover:scale-110" />
      </a>
    </div>
  )
}
