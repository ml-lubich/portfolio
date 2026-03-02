"use client"

import { Github, GraduationCap, Linkedin, Mail, Phone, Sparkles } from "lucide-react"

/* ── CTA buttons ──────────────────────────────────────────────────── */

export function HeroCTAs() {
  return (
    <div
      className="mt-10 flex animate-fade-in-up flex-wrap items-center justify-center gap-3 sm:gap-4 pointer-events-auto"
      style={{ animationDelay: "1.2s", opacity: 0 }}
    >
      <a
        href="#contact"
        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30 sm:px-8 sm:py-3.5"
      >
        <span className="relative z-10 flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Get In Touch
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 transition-opacity group-hover:opacity-100" />
      </a>
      <a
        href="#ai-expertise"
        className="rounded-xl border border-border bg-secondary/50 px-6 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-secondary hover-lift sm:px-8 sm:py-3.5"
      >
        <Sparkles className="mr-2 inline-block h-4 w-4" />
        View AI Expertise
      </a>
      <a
        href="https://calendly.com/michaelle-lubich"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl border border-border bg-secondary/50 px-6 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-secondary hover-lift sm:px-8 sm:py-3.5"
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
      style={{ animationDelay: "1.5s", opacity: 0 }}
    >
      <a
        href="https://github.com/ml-lubich"
        target="_blank"
        rel="noopener noreferrer"
        className="group rounded-lg border border-border bg-secondary/30 p-2.5 text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-secondary hover:text-foreground magnetic"
        aria-label="GitHub"
      >
        <Github className="h-5 w-5 transition-transform group-hover:scale-110" />
      </a>
      <a
        href="https://www.linkedin.com/in/misha-lubich/"
        target="_blank"
        rel="noopener noreferrer"
        className="group rounded-lg border border-border bg-secondary/30 p-2.5 text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-secondary hover:text-foreground magnetic"
        aria-label="LinkedIn"
      >
        <Linkedin className="h-5 w-5 transition-transform group-hover:scale-110" />
      </a>
      <a
        href="https://scholar.google.com/citations?hl=en&user=Be6ZA78AAAAJ"
        target="_blank"
        rel="noopener noreferrer"
        className="group rounded-lg border border-border bg-secondary/30 p-2.5 text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-secondary hover:text-foreground magnetic"
        aria-label="Google Scholar"
      >
        <GraduationCap className="h-5 w-5 transition-transform group-hover:scale-110" />
      </a>
    </div>
  )
}
