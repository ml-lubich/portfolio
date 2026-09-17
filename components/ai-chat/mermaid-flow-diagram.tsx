"use client"

import { useEffect, useId, useRef, useState } from "react"

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
            const mermaid = (await import("mermaid")).default
            mermaid.initialize({
                startOnLoad: false,
                theme: "dark",
                securityLevel: "strict",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
            })

            try {
                const { svg } = await mermaid.render(`mlbot-mermaid-${uid}-${Date.now()}`, source.trim())
                if (cancelled || !hostRef.current) return
                hostRef.current.innerHTML = svg
            } catch {
                if (!cancelled) setFailed(true)
            }
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
