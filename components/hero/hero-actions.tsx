"use client"

import { Mail, MessageSquare, BrainCircuit, FileDown, CalendarDays } from "lucide-react"
import { navigateTo } from "@/components/nav/woosh-scroll"
import { SocialIcons } from "@/components/social-icons"
import { heroBeatDelay } from "./data"

/* ── CTA buttons ──────────────────────────────────────────────────────
   Three weights, not five equal boxes: one filled pill (contact), one
   glass pill (MLBot — the site's signature), and a quiet text row for the
   rest. Pills share the nav's `rounded-full` language. Every hover utility
   is mirrored on focus-visible so keyboard visitors see the same lift;
   reduced motion is handled by the global duration/delay reset in
   `app/globals.css` — no JS timers here. */

const PILL =
  "inline-flex h-12 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 text-sm font-semibold transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:rounded-full active:translate-y-0 sm:px-7"

const PRIMARY = `${PILL} bg-white text-background shadow-[0_14px_34px_-14px_rgb(var(--white-rgb)/0.55)] hover:shadow-[0_18px_44px_-14px_rgb(var(--white-rgb)/0.7)] focus-visible:shadow-[0_18px_44px_-14px_rgb(var(--white-rgb)/0.7)]`

const SECONDARY = `${PILL} border border-white/[0.18] bg-white/[0.06] text-foreground backdrop-blur-md hover:border-white/30 hover:bg-white/[0.11] focus-visible:border-white/30 focus-visible:bg-white/[0.11]`

const TERTIARY =
  "inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground underline-offset-[5px] decoration-1 transition-colors duration-150 hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline"

export function HeroCTAs() {
  return (
    <div
      className="mt-10 flex animate-fade-in-up flex-col items-center gap-5 pointer-events-auto"
      style={{ animationDelay: heroBeatDelay("ctas"), opacity: 0 }}
    >
      {/* Phones: the two pills split one row edge to edge; sm+ they hug. */}
      <div className="grid w-full max-w-sm grid-cols-2 gap-2.5 sm:flex sm:w-auto sm:max-w-none sm:gap-3">
        <button
          type="button"
          data-weight="primary"
          onClick={() => navigateTo("#contact")}
          className={PRIMARY}
        >
          <Mail className="h-4 w-4 shrink-0" aria-hidden />
          Get In Touch
        </button>
        <button
          type="button"
          data-weight="secondary"
          onClick={() => window.dispatchEvent(new Event("mlbot:open"))}
          className={SECONDARY}
        >
          <MessageSquare className="h-4 w-4 shrink-0" aria-hidden />
          Ask MLBot
        </button>
      </div>

      {/* Quiet row. The faint wash keeps 13px text legible where the brain
          mesh is densest; it disappears into the page rather than reading as
          a third box. */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-full bg-background/45 px-5 py-1.5 backdrop-blur-sm">
        <button type="button" data-weight="tertiary" onClick={() => navigateTo("#ai-expertise")} className={TERTIARY}>
          <BrainCircuit className="h-3.5 w-3.5 shrink-0" aria-hidden />
          View AI Expertise
        </button>
        <a
          href="/resume_mlubich.pdf"
          target="_blank"
          rel="noopener noreferrer"
          download="Misha_Lubich_Resume.pdf"
          data-weight="tertiary"
          className={TERTIARY}
        >
          <FileDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Download Resume
        </a>
        <a
          href="https://calendar.app.google/T2VGkBsBAUzGABRB7"
          target="_blank"
          rel="noopener noreferrer"
          data-weight="tertiary"
          className={TERTIARY}
        >
          <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Schedule Call
        </a>
      </div>
    </div>
  )
}

/* ── Social links ─────────────────────────────────────────────────── */

export function SocialLinks() {
  return (
    <div
      className="mt-6 flex animate-fade-in-up items-center justify-center gap-3 pointer-events-auto"
      style={{ animationDelay: heroBeatDelay("social"), opacity: 0 }}
    >
      <SocialIcons size="md" />
    </div>
  )
}
