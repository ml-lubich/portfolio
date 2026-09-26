/**
 * OssDemoMedia — "real output, no mockups" proof beneath a tool's terminal.
 *
 * Two shapes, chosen by `OssMedia.kind`:
 *   - pdf-compare: source markdown beside the PDF page it actually rendered to
 *   - eval-table: a labeled eval-harness scorecard plus the guardrails it enforces
 *
 * Static server-rendered markup — no motion, no client state — since this is
 * evidence, not a demo, and shares the card's existing tokens (bg-black/*,
 * border-white/[0.0x], font-mono) rather than introducing new ones.
 */

import Image from "next/image"
import type { OssMedia } from "@/data/oss-demos"

export function OssDemoMedia({ media }: { media: OssMedia }) {
  if (media.kind === "pdf-compare") {
    return (
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-black/30 p-3 sm:p-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60">
          {media.caption}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="min-w-0 overflow-hidden rounded-lg border border-white/[0.08] bg-black/40">
            <div className="border-b border-white/[0.06] px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/50">
              source · sample.md
            </div>
            <pre className="max-h-64 overflow-auto p-2.5">
              <code className="font-mono text-[10.5px] leading-relaxed text-foreground/80">
                {media.sourceSnippet}
              </code>
            </pre>
          </div>
          <div className="min-w-0 overflow-hidden rounded-lg border border-white/[0.08] bg-white">
            <div className="border-b border-black/10 bg-black/[0.03] px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wider text-black/50">
              rendered · page 1
            </div>
            <Image
              src={media.imageUrl}
              alt={media.imageAlt}
              width={637}
              height={900}
              className="h-auto w-full"
              sizes="(max-width: 640px) 100vw, 320px"
              loading="lazy"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={media.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80 transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60"
          >
            View sample.md
          </a>
          <a
            href={media.pdfUrl}
            download
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80 transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60"
          >
            Download PDF
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-black/30 p-3 sm:p-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse font-mono text-[10.5px]">
          <thead>
            <tr className="text-left text-muted-foreground/50">
              <th className="border-b border-white/[0.08] pb-1.5 pr-3 font-normal uppercase tracking-wider">
                case
              </th>
              <th className="border-b border-white/[0.08] pb-1.5 font-normal uppercase tracking-wider">
                result
              </th>
            </tr>
          </thead>
          <tbody>
            {media.rows.map((row) => (
              <tr key={row.case}>
                <td className="py-1 pr-3 text-foreground/75">{row.case}</td>
                <td
                  className={
                    row.result === "PASS"
                      ? "py-1 font-semibold text-emerald-400"
                      : "py-1 font-semibold text-amber-400"
                  }
                >
                  {row.result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2.5 font-mono text-[11px] font-semibold text-foreground/90">{media.summaryLine}</p>
      <ul className="mt-3 space-y-1.5 border-t border-white/[0.06] pt-3">
        {media.guardrails.map((g) => (
          <li key={g} className="flex gap-2 text-[11px] leading-relaxed text-muted-foreground/75">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" aria-hidden />
            {g}
          </li>
        ))}
      </ul>
    </div>
  )
}
