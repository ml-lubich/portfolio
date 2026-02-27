"use client"

import React, { useEffect, useRef, useState } from "react"

interface MermaidDiagramProps {
  chart: string
  className?: string
}

export function MermaidDiagram({ chart, className = "" }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>("")
  const [error, setError] = useState<string>("")
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 9)}`)

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            darkMode: true,
            background: "#0c0e1a",
            primaryColor: "#1e3a5f",
            primaryTextColor: "#e2e8f0",
            primaryBorderColor: "#3b82f6",
            lineColor: "#3b82f6",
            secondaryColor: "#1e5f3a",
            tertiaryColor: "#3b1e5f",
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontSize: "14px",
            nodeBorder: "#3b82f6",
            mainBkg: "#1e3a5f",
            clusterBkg: "#0f172a",
            clusterBorder: "#1e293b",
            titleColor: "#e2e8f0",
            edgeLabelBackground: "#0c0e1a",
            nodeTextColor: "#e2e8f0",
          },
          flowchart: {
            htmlLabels: true,
            curve: "basis",
            padding: 15,
          },
        })

        const { svg: rendered } = await mermaid.render(idRef.current, chart.trim())
        if (!cancelled) {
          setSvg(rendered)
          setError("")
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to render diagram")
          console.error("Mermaid render error:", err)
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
      className={`my-8 flex justify-center overflow-x-auto rounded-xl border border-white/[0.06] bg-[#0c0e1a] p-6 ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
