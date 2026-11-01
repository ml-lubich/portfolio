"use client"

import { useEffect, useState } from "react"
import { Zap } from "lucide-react"
import { AGENT_STORM_EVENT } from "@/lib/agents-build"

/** Desktop-grade visual flex — skip it on touch/coarse pointers entirely. */
const DESKTOP_QUERY = "(min-width: 768px) and (hover: hover) and (pointer: fine)"

export function AgentStormTrigger() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    const sync = () => setIsDesktop(mql.matches)
    sync()
    mql.addEventListener("change", sync)
    return () => mql.removeEventListener("change", sync)
  }, [])

  if (!isDesktop) return null

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(AGENT_STORM_EVENT))}
      title="Unleash an agent storm"
      aria-label="Unleash an agent storm"
      className="group/storm inline-flex items-center gap-1.5 text-white/40 transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
    >
      <Zap className="h-3 w-3 transition-transform duration-300 group-hover/storm:scale-110" />
      <span className="font-mono text-[10px] tracking-wide">agent storm</span>
    </button>
  )
}
