"use client"

/* ──────────────────────────────────────────────────────────────────────
 *  OpenSourceShowcase — public `ml-lubich` CLIs/MCP servers as a grid of
 *  live terminal demos (data: data/oss-demos.ts, card: oss-demo-card.tsx).
 *
 *  Perf contract: at most one DemoTerminal types at a time. An
 *  IntersectionObserver watches every card wrapper and tracks whichever one
 *  is nearest the viewport center; only that card's `active` prop is true,
 *  so every other card renders its final static frame instead of typing.
 *
 *  Explore opens the existing DetailPanel exactly the way projects.tsx does
 *  (selected-id state + the same fixed-overlay modal markup).
 * ────────────────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useRef, useState } from "react"
import { DetailPanel } from "../detail-panel"
import { SectionHeader } from "../layout/section-header"
import { OssDemoCard } from "./oss-demo-card"
import { ossDemos } from "@/data/oss-demos"
import { projects } from "@/data/projects"

export function OpenSourceShowcase() {
  const [activeId, setActiveId] = useState(ossDemos[0]?.id ?? "")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const cardRefs = useRef(new Map<string, HTMLDivElement>())
  const ratios = useRef(new Map<string, number>())

  const selected = projects.find((p) => p.id === selectedId) ?? null
  const isOpen = selected !== null

  const handleExplore = useCallback((id: string) => setSelectedId(id), [])
  const handleClose = useCallback(() => setSelectedId(null), [])

  useEffect(() => {
    const nodes = [...cardRefs.current.values()]
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.demoId
          if (id) ratios.current.set(id, entry.intersectionRatio)
        }
        let bestId = ""
        let bestRatio = 0
        for (const [id, ratio] of ratios.current) {
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestId = id
          }
        }
        if (bestId) setActiveId(bestId)
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: "-35% 0px -35% 0px" },
    )
    for (const node of nodes) observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="open-source" className="relative scroll-mt-24 py-5 md:py-14 lg:py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/4 top-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute right-1/4 bottom-20 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-3 md:px-4 lg:px-6">
        <SectionHeader
          className="mb-6 md:mb-10"
          label="Open Source"
          title={<>Tools I built for myself,{" "}<span className="gradient-text">then shipped for everyone</span></>}
          subtitle="Public CLIs and MCP servers, live in the terminal — one demo types at a time, the rest hold their final frame."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
          {ossDemos.map((demo) => (
            <div
              key={demo.id}
              data-demo-id={demo.id}
              ref={(node) => {
                if (node) cardRefs.current.set(demo.id, node)
                else cardRefs.current.delete(demo.id)
              }}
            >
              <OssDemoCard demo={demo} active={demo.id === activeId} onExplore={handleExplore} />
            </div>
          ))}
        </div>
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
