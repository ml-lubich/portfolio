"use client"

/* ──────────────────────────────────────────────────────────────────────
 *  OpenSourceShowcase — public `ml-lubich` CLIs/MCP servers.
 *
 *  Nine simultaneous terminal transcripts read as a wall of text, so the
 *  section now features one tool at a time: a glyph rail selects the tool and
 *  a single panel (oss-demo-card.tsx) shows its mesh signature, gauges, and
 *  live demo. That makes the "one demo types at a time" perf contract literal
 *  — only the featured card is mounted with `active`.
 *
 *  The rail advances on its own while the section is on screen; any manual
 *  pick stops the rotation so a visitor is never yanked off what they chose.
 *
 *  Explore opens the existing DetailPanel exactly the way projects.tsx does
 *  (selected-id state + the same fixed-overlay modal markup).
 * ────────────────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useRef, useState } from "react"
import {
  BookOpen,
  FileStack,
  GitBranch,
  GitPullRequest,
  Mail,
  MessageSquare,
  MessagesSquare,
  NotebookPen,
  Terminal,
} from "lucide-react"
import { DetailPanel } from "../detail-panel"
import { SectionHeader } from "../layout/section-header"
import { OssDemoCard } from "./oss-demo-card"
import { ossDemos } from "@/data/oss-demos"
import { projects } from "@/data/projects"

/** Seconds each tool holds the panel before the rail advances on its own */
const ROTATE_MS = 9000

const TOOL_ICON: Record<string, typeof Terminal> = {
  "imsg-mcp": MessageSquare,
  "imail-mcp": Mail,
  "inotes-mcp": NotebookPen,
  "wa-mcp": MessagesSquare,
  "bitbucket-cli": GitPullRequest,
  twig: GitBranch,
  "confluence-cli": FileStack,
  "like-fable": BookOpen,
}

export function OpenSourceShowcase() {
  const [activeId, setActiveId] = useState(ossDemos[0]?.id ?? "")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  /** Set once the visitor picks a tool — the rail then stops auto-advancing. */
  const [pinned, setPinned] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const onScreenRef = useRef(false)

  const selected = projects.find((p) => p.id === selectedId) ?? null
  const isOpen = selected !== null

  const handleExplore = useCallback((id: string) => setSelectedId(id), [])
  const handleClose = useCallback(() => setSelectedId(null), [])

  const activeDemo = ossDemos.find((d) => d.id === activeId) ?? ossDemos[0]

  /* Only rotate while the section is actually on screen — an off-screen timer
     would burn frames re-typing a terminal nobody is looking at. */
  useEffect(() => {
    const root = sectionRef.current
    if (!root || typeof IntersectionObserver === "undefined") {
      onScreenRef.current = true
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreenRef.current = entry.isIntersecting
      },
      { threshold: 0.15 },
    )
    io.observe(root)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (pinned || ossDemos.length < 2) return
    const timer = window.setInterval(() => {
      if (!onScreenRef.current) return
      setActiveId((current) => {
        const i = ossDemos.findIndex((d) => d.id === current)
        return ossDemos[(i + 1) % ossDemos.length].id
      })
    }, ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [pinned])

  const pick = useCallback((id: string) => {
    setPinned(true)
    setActiveId(id)
  }, [])

  return (
    <section ref={sectionRef} id="open-source" className="relative scroll-mt-24 section-y">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/4 top-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute right-1/4 bottom-20 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-3 md:px-4 lg:px-6">
        <SectionHeader
          compact
          className="mb-6 md:mb-8"
          label="Open Source"
          title={<>Tools I built for myself,{" "}<span className="gradient-text">then shipped for everyone</span></>}
          subtitle="Public CLIs and MCP servers. Pick one to run its demo."
        />

        {/* The old Value-maxxing section said this in six paragraphs. One line
            carries it just as well, right above the tools it describes. */}
        <p className="mb-6 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70 md:mb-8">
          Value-maxxing<span className="text-muted-foreground/40">,</span> not{" "}
          <span className="gradient-text">tokenmaxxing</span>
        </p>

        {/* Tool rail — glyph tiles, one active */}
        <ul
          className="mb-5 flex flex-wrap justify-center gap-2"
          aria-label="Open source tools"
        >
          {ossDemos.map((demo) => {
            const Icon = TOOL_ICON[demo.id] ?? Terminal
            const isActive = demo.id === activeId
            return (
              <li key={demo.id}>
                <button
                  type="button"
                  onClick={() => pick(demo.id)}
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60 ${
                    isActive
                      ? "border-white/35 bg-white/[0.10] text-foreground"
                      : "border-white/[0.08] bg-white/[0.02] text-muted-foreground/55 hover:border-white/25 hover:text-foreground/85"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {demo.id}
                </button>
              </li>
            )
          })}
        </ul>

        {activeDemo && (
          <OssDemoCard
            key={activeDemo.id}
            demo={activeDemo}
            active={activeDemo.id === activeId}
            onExplore={handleExplore}
          />
        )}
      </div>

      {/* Detail panel — identical modal pattern to components/sections/projects.tsx */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close details"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="relative z-[1] flex max-h-[86vh] w-full max-w-4xl flex-col">
            <DetailPanel data={selected?.detail ?? null} isOpen={isOpen} onClose={handleClose} />
          </div>
        </div>
      )}
    </section>
  )
}
