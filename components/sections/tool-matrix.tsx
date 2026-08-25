"use client"

import { AnimatedSection } from "../animations/animated-section"
import { SectionHeader } from "../layout/section-header"
import {
  MATRIX_COLUMNS,
  toolMatrix,
  type MatrixValue,
} from "@/data/tool-matrix"

function Cell({ value }: { value: MatrixValue }) {
  if (value === true) {
    return (
      <span className="inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
        yes
      </span>
    )
  }
  if (value === "partial") {
    return (
      <span className="inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-200">
        partial
      </span>
    )
  }
  return (
    <span className="inline-flex rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-muted-foreground">
      —
    </span>
  )
}

export function ToolMatrix() {
  return (
    <section id="tool-matrix" className="relative section-y px-4 md:px-8" aria-labelledby="tool-matrix-heading">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection>
          <SectionHeader
            label="Open source · agent tooling"
            title={
              <>
                CLI / MCP <span className="gradient-text">comparison</span>
              </>
            }
            subtitle="Honest matrix across the local-first agent family. bitbucket-cli stays CLI-branded (not *-mcp). Values are conservative — partial means real but incomplete."
          />
        </AnimatedSection>

        <AnimatedSection className="mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <caption id="tool-matrix-heading" className="sr-only">
              Comparison of open-source CLI and MCP tools
            </caption>
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Tool</th>
                {MATRIX_COLUMNS.map((col) => (
                  <th key={col.key} className="px-3 py-3 font-medium">
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 font-medium">vs market</th>
              </tr>
            </thead>
            <tbody>
              {toolMatrix.map((row) => (
                <tr key={row.id} className="border-b border-white/[0.06] last:border-0">
                  <td className="px-4 py-3 font-medium">
                    <a
                      href={row.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      {row.name}
                    </a>
                  </td>
                  <td className="px-3 py-3">
                    <Cell value={row.localFirst} />
                  </td>
                  <td className="px-3 py-3">
                    <Cell value={row.cli} />
                  </td>
                  <td className="px-3 py-3">
                    <Cell value={row.mcp} />
                  </td>
                  <td className="px-3 py-3">
                    <Cell value={row.agentSchema} />
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{row.tdd}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{row.distribution}</td>
                  <td className="max-w-[16rem] px-4 py-3 text-xs text-muted-foreground">{row.vsMarket}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AnimatedSection>
      </div>
    </section>
  )
}
