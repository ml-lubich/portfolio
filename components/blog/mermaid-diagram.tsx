"use client"

import React from "react"
import { BlogChart } from "@/components/blog/charts/blog-chart"

/**
 * MermaidDiagram — renders "mermaid" JSON chart definitions.
 * In this blog, mermaid blocks contain JSON matching the BlogChart schema
 * (tree, pipeline, comparison, pie), not actual Mermaid DSL.
 * This delegates to the existing BlogChart renderer.
 */
export function MermaidDiagram({ chart }: { chart: string }) {
  return <BlogChart json={chart} />
}
