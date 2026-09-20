"use client"

import { useEffect, useId, useRef, useState } from "react"

import { renderMermaidInto } from "@/lib/ai/mermaid-diagram"

/**
 * Renders real Mermaid DSL (graph TD, flowchart LR, …) inside MLBot.
 * BlogChart JSON fences stay on BlogChart — this is for when the model
 * emits native Mermaid instead.
 */
export function MermaidFlowDiagram({ source }: { source: string }) {
    const hostRef = useRef<HTMLDivElement>(null)
    const uid = useId().replace(/:/g, "")
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        let cancelled = false
        const host = hostRef.current
        if (!host) return

        setFailed(false)
        host.replaceChildren()

        void (async () => {
            const ok = await renderMermaidInto(host, `mlbot-mermaid-${uid}-${Date.now()}`, source)
            if (!cancelled) setFailed(!ok)
        })()

        return () => {
            cancelled = true
        }
    }, [source, uid])

    if (failed) {
        return (
            <pre className="mlbot-mermaid-fallback my-2 max-w-full overflow-x-auto rounded-xl border border-white/10 bg-black/25 p-3 text-[12px] leading-relaxed text-foreground/80">
                {source.trim()}
            </pre>
        )
    }

    return (
        <div className="mlbot-mermaid my-2 max-w-full overflow-x-auto rounded-xl border border-white/10 bg-black/25 p-3">
            <div ref={hostRef} className="min-w-[min(100%,28rem)] [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-none" />
        </div>
    )
}
