"use client"

import React from "react"
import { MermaidDiagram } from "@/components/blog/mermaid-diagram"

function fromBase64Utf8(b64: string): string {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

/**
 * MDX-boundary: charts are injected as `<ChartFence b64='...' />` (literal attr only),
 * because next-mdx-remote strips attribute expressions.
 */
export function ChartFence({
  json,
  b64,
}: {
  json?: string
  b64?: string
}) {
  let payload = ""
  if (typeof json === "string" && json.length > 0) {
    payload = json
  } else if (typeof b64 === "string" && b64.length > 0) {
    try {
      payload = fromBase64Utf8(b64)
    } catch {
      payload = ""
    }
  }
  return <MermaidDiagram chart={payload} />
}
