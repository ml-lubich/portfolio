/** Shared Mermaid render config — identical across MLBot sibling sites. */
export const MERMAID_RENDER_CONFIG = {
    startOnLoad: false,
    theme: "dark" as const,
    securityLevel: "strict" as const,
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
}

/** Renders trimmed Mermaid DSL into a host element. Returns false on parse/render failure. */
export async function renderMermaidInto(
    host: HTMLElement,
    renderId: string,
    source: string,
): Promise<boolean> {
    const mermaid = (await import("mermaid")).default
    mermaid.initialize(MERMAID_RENDER_CONFIG)
    try {
        const { svg } = await mermaid.render(renderId, source.trim())
        host.innerHTML = svg
        return true
    } catch {
        return false
    }
}
