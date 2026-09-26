"use client"

import Link from "next/link"
import { ossAccent } from "@/lib/theme"
import { ossAgentTools } from "@/data/oss-agent-tools"
import { CopyCommand } from "@/components/ui/copy-command"
import { CyclingInstall } from "@/components/ui/cycling-install"

export function OssToolGrid() {
  return (
    <section
      className="oss-tool-grid relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-[#071428]/95 via-[#0a1f44]/90 to-[#10306a]/85 p-4 shadow-[0_0_48px_-12px_hsl(var(--primary)/0.35)] sm:p-6"
      aria-labelledby="oss-tool-grid-heading"
    >
      <div
        className="pointer-events-none absolute -left-24 -top-16 h-56 w-80 rounded-full bg-primary/20 blur-[80px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-16 h-64 w-72 rounded-full bg-accent/15 blur-[90px]"
        aria-hidden
      />

      <header className="relative mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <p
          id="oss-tool-grid-heading"
          className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-primary"
        >
          Open-Source Agent Tools
        </p>
        <p className="font-mono text-[11px] text-muted-foreground/80 sm:text-right">
          every tool = human CLI{" "}
          <span className="font-bold text-primary">+</span> MCP / agent surface
        </p>
      </header>

      {/* One prompt that types through every tool — the panel opens on the whole
          set instead of parking on whichever card happens to come first. */}
      <CyclingInstall
        className="relative mb-5 sm:mb-6"
        items={ossAgentTools}
        accentOf={ossAccent}
      />

      <ul className="relative grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-3.5">
        {ossAgentTools.map((tool, i) => {
          const accent = ossAccent(i)
          return (
            <li key={tool.id}>
              <article
                className="oss-tool-card group/card relative flex h-full flex-col gap-2.5 rounded-2xl border border-white/[0.12] bg-[#081a36]/80 p-4 backdrop-blur-sm transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={tool.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-lg font-extrabold transition-colors hover:text-primary"
                      style={{ color: accent }}
                    >
                      {tool.displayName}
                    </Link>
                    <p className="mt-1 text-[13px] font-medium leading-snug text-foreground/90">
                      {tool.description}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-primary"
                  >
                    {tool.tag}
                  </span>
                </div>
                <CopyCommand command={tool.install} />
              </article>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
