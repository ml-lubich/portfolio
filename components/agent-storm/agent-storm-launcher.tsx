"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState } from "react"
import { createTrigger } from "@/lib/agent-storm/trigger"

// Loaded on first trigger only: nothing of the storm ships in the initial bundle.
const AgentStorm = dynamic(() => import("./agent-storm"), { ssr: false })

/** Typed keyword. "agents" already starts the cursor egg (components/easter), so this one is "spawn". */
export const STORM_KEYWORD = "spawn"

export function AgentStormLauncher() {
  const [seed, setSeed] = useState<number | null>(null)
  const chip = useRef<HTMLButtonElement>(null)

  const open = useCallback(() => setSeed((s) => s ?? (Date.now() >>> 0)), [])
  const close = useCallback(() => {
    setSeed(null)
    chip.current?.focus()
  }, [])

  useEffect(() => {
    const t = createTrigger({ keyword: STORM_KEYWORD, onFire: open })
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      t.press(e.key, e.target as HTMLElement)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <>
      <button
        ref={chip}
        type="button"
        onClick={open}
        data-agent-storm-chip
        className="fixed bottom-3 left-3 z-40 rounded-full border border-border bg-card/80 px-3 py-1.5 font-mono text-[11px] text-muted-foreground backdrop-blur transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        ▲ spawn agents
      </button>
      {seed !== null && <AgentStorm initialSeed={seed} onClose={close} />}
    </>
  )
}
