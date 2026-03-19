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
        className="rounded-xl border border-white/[0.12] bg-white/[0.06] px-6 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/[0.1] hover-lift sm:px-8 sm:py-3.5 cursor-pointer"
      >
        <Sparkles className="mr-2 inline-block h-4 w-4" />
        View AI Expertise
      </button>
      <a
        href="https://cal.com/misha-lubich"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl border border-white/[0.12] bg-white/[0.06] px-6 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/[0.1] hover-lift sm:px-8 sm:py-3.5"
      >
        <Phone className="mr-2 inline-block h-4 w-4" />
        Schedule Call
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
