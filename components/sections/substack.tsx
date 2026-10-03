"use client"

import { useRef } from "react"
import { ArrowUpRight, BookOpen } from "lucide-react"
import { AnimatedSection } from "../animations/animated-section"
import { SectionHeader } from "../layout/section-header"
import { useSectionProgress } from "@/lib/use-section-progress"
import { depthOffset } from "@/lib/scroll-depth"
import { LATEST_POST, SUBSTACK_SUBSCRIBE_URL, SUBSTACK_URL } from "@/lib/substack"

/** Small, non-intrusive pointer to the Substack — one card for the latest
 *  post, and Substack's own subscribe-box embed. No feed fetch, no popup,
 *  no modal. */
export function Writing() {
  /* Scroll device: parallax-lite. The latest-post card and the subscribe
     embed drift in opposite directions (<=8px each, under the 24px gap, so
     they never touch). translateY only; wide mouse viewports only. */
  const stackRef = useRef<HTMLDivElement>(null)
  const postRef = useRef<HTMLAnchorElement>(null)
  const embedRef = useRef<HTMLDivElement>(null)
  useSectionProgress(stackRef, (p, el) => {
    const a = depthOffset(p, 0.2)
    const b = depthOffset(p, -0.2)
    if (postRef.current) postRef.current.style.transform = `translate3d(0, ${a.toFixed(1)}px, 0)`
    if (embedRef.current) embedRef.current.style.transform = `translate3d(0, ${b.toFixed(1)}px, 0)`
    el.dataset.scVerifyState = `drift:${Math.round(a)}`
  })

  return (
    <AnimatedSection id="writing" className="py-16 md:py-24">
      <div ref={stackRef} className="container mx-auto max-w-4xl px-4">
        <SectionHeader
          label="Writing"
          title={
            <>
              Essays on AI, engineering, and what{" "}
              <span className="gradient-text">actually survives production</span>
            </>
          }
          subtitle="Occasional long-form pieces on Substack — LLM agents, MLOps, and the gap between a demo and a system."
          icon={<BookOpen className="h-4 w-4" />}
          compact
        />

        <a
          ref={postRef}
          href={LATEST_POST.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-colors duration-300 hover:border-primary/40 sm:p-6"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
            Latest · {LATEST_POST.date}
          </span>
          <h3 className="text-lg font-medium leading-snug text-foreground sm:text-xl">
            {LATEST_POST.title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{LATEST_POST.description}</p>
          <span className="mt-1 inline-flex items-center gap-1 text-sm text-primary opacity-80 transition-opacity group-hover:opacity-100">
            Read on Substack <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </a>

        <div ref={embedRef} className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
          <iframe
            src={`${SUBSTACK_URL}/embed`}
            title="Subscribe to Misha Lubich on Substack"
            loading="lazy"
            width="100%"
            height="200"
            style={{ background: "transparent" }}
            className="block"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <a
            href={SUBSTACK_SUBSCRIBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-white/[0.12] px-6 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
          >
            mlubich.substack.com <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://substack.com/@mlubich"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-white/[0.12] px-6 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
          >
            @mlubich on Substack <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </AnimatedSection>
  )
}
