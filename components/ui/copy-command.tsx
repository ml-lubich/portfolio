"use client"

import { useCallback, useState } from "react"
import { Check, Copy } from "lucide-react"
import { splitBrand } from "@/lib/install-cycle"

interface CopyCommandProps {
  command: string
  className?: string
}

/** Click-to-copy install line — entire row copies, not just the icon. */
export function CopyCommand({ command, className = "" }: CopyCommandProps) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(() => {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    })
  }, [command])

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy install command: ${command}`}
      className={`oss-copy-command group/cmd flex w-full items-center gap-2 overflow-hidden rounded-lg border border-white/[0.12] bg-black/50 px-3 py-2 text-left font-mono text-[12px] leading-5 transition-colors hover:border-primary/45 hover:bg-black/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60 sm:text-[13px] ${className}`}
    >
      <span className="shrink-0 text-primary/90" aria-hidden>
        $
      </span>
      <code className="min-w-0 flex-1 select-all truncate text-foreground/90">
        {splitBrand(command).map((part, i) =>
          part.brand ? (
            <span key={i} className="font-semibold text-primary/90">
              {part.text}
            </span>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </code>
      <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70 group-hover/cmd:text-primary/80">
        {copied ? (
          <>
            <Check className="h-3 w-3 text-emerald-400" aria-hidden />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" aria-hidden />
            Copy
          </>
        )}
      </span>
    </button>
  )
}
