"use client"

import React, { useEffect, useId, useRef, useState } from "react"
import { mermaidTheme, hex } from "@/lib/theme"

/* ── Mermaid initialisation (once per page) ─────────────────────────── */
let mermaidInitialised = false

interface MermaidDiagramProps {
  chart: string
  className?: string
}

export function MermaidDiagram({ chart, className = "" }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>("")
  const [error, setError] = useState<string>("")
  // Stable, SSR-safe unique id — no randomness during render
  const reactId = useId()
  const idRef = useRef(`mermaid-${reactId.replace(/:/g, "")}`)

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default

        // Initialise once globally to avoid Mermaid re-init warnings
        if (!mermaidInitialised) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            themeVariables: {
              darkMode: true,
              background: mermaidTheme.background,
              primaryColor: mermaidTheme.primaryColor,
              primaryTextColor: mermaidTheme.primaryTextColor,
              primaryBorderColor: mermaidTheme.primaryBorderColor,
              lineColor: mermaidTheme.lineColor,
              secondaryColor: mermaidTheme.secondaryColor,
              tertiaryColor: mermaidTheme.tertiaryColor,
              fontFamily: "var(--font-geist-sans), sans-serif",
              fontSize: "14px",
              nodeBorder: mermaidTheme.nodeBorder,
              mainBkg: mermaidTheme.mainBkg,
              clusterBkg: mermaidTheme.clusterBkg,
              clusterBorder: mermaidTheme.clusterBorder,
              titleColor: mermaidTheme.titleColor,
              edgeLabelBackground: mermaidTheme.edgeLabelBackground,
              nodeTextColor: mermaidTheme.nodeTextColor,
            },
            flowchart: {
              htmlLabels: true,
              curve: "basis",
              padding: 15,
            },
          })
          mermaidInitialised = true
        }

        const { svg: rendered } = await mermaid.render(idRef.current, chart.trim())
        if (!cancelled) {
          setSvg(rendered)
          setError("")
        }
      } catch (_err) {
        if (!cancelled) {
          setError("Failed to render diagram")
        }
      }
    }

    render()
    return () => { cancelled = true }
  }, [chart])

  if (error) {
    return (
      <div className={`rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400 ${className}`}>
        {error}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`my-8 flex justify-center overflow-x-auto rounded-xl border border-white/[0.06] bg-[${mermaidTheme.background}] p-6 ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
