"use client"

import React from "react"
import Image from "next/image"
import { MermaidDiagram } from "@/components/blog/mermaid-diagram"
import { ChartFence } from "@/components/blog/chart-fence"

/* ──────────────────────────────────────────────────────────────────────
 *  Custom MDX Components — drop-in rich elements for blog posts.
 *
 *  Usage in any .mdx file:
 *
 *    <Callout type="warning">Watch out for this!</Callout>
 *    <Video src="https://youtube.com/embed/..." />
 *    <Figure src="/images/diagram.png" alt="Architecture" caption="System overview" />
 *    <CodeSandbox id="abc123" />
 *
 *  These map to beautiful, animated components automatically.
 * ────────────────────────────────────────────────────────────────────── */

// ── Callout / Admonition ───────────────────────────────────────────

type CalloutType = "info" | "warning" | "tip" | "danger"

const calloutStyles: Record<CalloutType, { border: string; bg: string; icon: string; iconColor: string }> = {
    info: {
        border: "border-blue-500/30",
        bg: "bg-blue-500/[0.06]",
        icon: "💡",
        iconColor: "text-blue-400",
    },
    warning: {
        border: "border-amber-500/30",
        bg: "bg-amber-500/[0.06]",
        icon: "⚠️",
        iconColor: "text-amber-400",
    },
    tip: {
        border: "border-emerald-500/30",
        bg: "bg-emerald-500/[0.06]",
        icon: "✨",
        iconColor: "text-emerald-400",
    },
    danger: {
        border: "border-red-500/30",
        bg: "bg-red-500/[0.06]",
        icon: "🚨",
        iconColor: "text-red-400",
    },
}

export function Callout({
    type = "info",
    title,
    children,
}: {
    type?: CalloutType
    title?: string
    children: React.ReactNode
}) {
    const style = calloutStyles[type]
    return (
        <div
            className={`my-6 rounded-xl border ${style.border} ${style.bg} p-5 backdrop-blur-sm`}
        >
            <div className="flex items-start gap-3">
                <span className={`text-lg ${style.iconColor} mt-0.5`} aria-hidden="true">{style.icon}</span>
                <div className="flex-1 text-sm leading-relaxed text-foreground/90">
                    {title && (
                        <p className="mb-1 font-semibold text-foreground">{title}</p>
                    )}
                    {children}
                </div>
            </div>
        </div>
    )
}

// ── Video Embed ────────────────────────────────────────────────────

export function Video({
    src,
    title = "Video",
    caption,
}: {
    src: string
    title?: string
    caption?: string
}) {
    // Auto-convert YouTube watch URLs to embed URLs
    let embedSrc = src
    if (src.includes("youtube.com/watch")) {
        const url = new URL(src)
        const videoId = url.searchParams.get("v")
        if (videoId) embedSrc = `https://www.youtube.com/embed/${videoId}`
    } else if (src.includes("youtu.be/")) {
        const videoId = src.split("youtu.be/")[1]?.split("?")[0]
        if (videoId) embedSrc = `https://www.youtube.com/embed/${videoId}`
    }

    return (
        <figure className="my-8">
            <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-black/20 shadow-lg">
                <div className="aspect-video">
                    <iframe
                        src={embedSrc}
                        title={title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                        loading="lazy"
                    />
                </div>
            </div>
            {caption && (
                <figcaption className="mt-3 text-center text-sm text-muted-foreground/70">
                    {caption}
                </figcaption>
            )}
        </figure>
    )
}

// ── Figure / Image ─────────────────────────────────────────────────

export function Figure({
    src,
    alt,
    caption,
    width = 1200,
    height = 630,
}: {
    src: string
    alt: string
    caption?: string
    width?: number
    height?: number
}) {
    // External URLs use regular img, local use Next Image
    const isExternal = src.startsWith("http")

    return (
        <figure className="my-8">
            <div className="overflow-hidden rounded-xl border border-white/[0.06] shadow-lg">
                {isExternal ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={src}
                        alt={alt}
                        loading="lazy"
                        className="w-full object-cover"
                    />
                ) : (
                    <Image
                        src={src}
                        alt={alt}
                        width={width}
                        height={height}
                        className="w-full object-cover"
                        loading="lazy"
                    />
                )}
            </div>
            {caption && (
                <figcaption className="mt-3 text-center text-sm text-muted-foreground/70">
                    {caption}
                </figcaption>
            )}
        </figure>
    )
}

// ── CodeSandbox Embed ──────────────────────────────────────────────

export function CodeSandbox({
    id,
    title = "Interactive Demo",
}: {
    id: string
    title?: string
}) {
    return (
        <div className="my-8 overflow-hidden rounded-xl border border-white/[0.06] shadow-lg">
            <iframe
                src={`https://codesandbox.io/embed/${id}?fontsize=14&hidenavigation=1&theme=dark`}
                title={title}
                allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                className="h-[500px] w-full"
                loading="lazy"
            />
        </div>
    )
}

// ── Tweet Embed ────────────────────────────────────────────────────

export function Tweet({ id }: { id: string }) {
    return (
        <div className="my-8 flex justify-center">
            <div className="w-full max-w-lg rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm">
                <blockquote
                    className="twitter-tweet"
                    data-theme="dark"
                    data-dnt="true"
                >
                    <a href={`https://twitter.com/x/status/${id}`}>Loading tweet...</a>
                </blockquote>
                <script async src="https://platform.twitter.com/widgets.js" />
            </div>
        </div>
    )
}

// ── Step / Process Component ───────────────────────────────────────

export function Steps({ children }: { children: React.ReactNode }) {
    return (
        <div className="my-8 space-y-4 border-l-2 border-primary/20 pl-6">
            {children}
        </div>
    )
}

export function Step({
    number,
    title,
    children,
}: {
    number: number
    title: string
    children: React.ReactNode
}) {
    return (
        <div className="relative">
            <div className="absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-bold text-primary">
                {number}
            </div>
            <div>
                <h4 className="mb-1 font-semibold text-foreground">{title}</h4>
                <div className="text-sm text-muted-foreground leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    )
}

// ── Mermaid wrapper for MDX ────────────────────────────────────────
// (In MDX you can use ```mermaid code fences OR this component)

export function Mermaid({ chart }: { chart: string }) {
    return <MermaidDiagram chart={chart} />
}

// ── Collapsible / Details ──────────────────────────────────────────

export function Collapsible({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <details className="my-6 group rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
            <summary className="cursor-pointer px-5 py-3 text-sm font-medium text-foreground transition-colors hover:text-primary select-none">
                <span className="ml-1">{title}</span>
            </summary>
            <div className="border-t border-white/[0.04] px-5 py-4 text-sm leading-relaxed text-foreground/90">
                {children}
            </div>
        </details>
    )
}

// ── Export mapping for MDXRemote ────────────────────────────────────

/**
 * Default components map passed to MDXRemote.
 * Maps standard HTML elements to styled versions + custom components.
 */
export const mdxComponents = {
    // Custom components (use as <Callout>, <Video>, etc. in MDX)
    Callout,
    Video,
    Figure,
    CodeSandbox,
    Tweet,
    Steps,
    Step,
    Mermaid,
    ChartFence,
    Collapsible,

    // Override default HTML elements for beautiful prose styling
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h1 className="mt-12 mb-4 text-3xl font-bold tracking-tight text-foreground" {...props} />
    ),
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2 className="mt-10 mb-3 text-2xl font-semibold tracking-tight text-foreground" {...props} />
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3 className="mt-8 mb-2 text-xl font-semibold text-foreground" {...props} />
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p className="mb-4 text-base leading-relaxed text-foreground/85" {...props} />
    ),
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a
            className="text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary/60"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
        />
    ),
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
        <ul className="my-4 ml-6 list-disc space-y-1.5 text-foreground/85" {...props} />
    ),
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
        <ol className="my-4 ml-6 list-decimal space-y-1.5 text-foreground/85" {...props} />
    ),
    li: (props: React.HTMLAttributes<HTMLLIElement>) => (
        <li className="text-base leading-relaxed" {...props} />
    ),
    blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
        <blockquote
            className="my-6 border-l-2 border-primary/30 pl-4 italic text-muted-foreground"
            {...props}
        />
    ),
    hr: () => <hr className="my-10 border-white/[0.06]" />,
    table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
        <div className="blog-table-wrap">
            <table className={`blog-table ${className ?? ""}`.trim()} {...props} />
        </div>
    ),
    th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
        <th className="border-b border-white/[0.06] bg-white/[0.02] px-4 py-2 text-left font-medium text-foreground" {...props} />
    ),
    td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
        <td className="border-b border-white/[0.04] px-4 py-2 text-foreground/80" {...props} />
    ),
    code: (props: React.HTMLAttributes<HTMLElement> & { className?: string }) => {
        // Inline code (no className means not inside a code block)
        if (!props.className) {
            return (
                <code
                    className="rounded-md border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 text-[0.85em] font-mono text-primary/90"
                    {...props}
                />
            )
        }
        // Block code — no extra styling, inherits from pre/.blog-code-block
        return <code className={props.className} {...props} />
    },
    pre: (props: React.HTMLAttributes<HTMLPreElement> & { children?: React.ReactNode }) => {
        // Intercept fenced chart JSON (```mermaid / ```chart). MDX may emit extra text
        // nodes beside <code>, so never use Children.only — it throws and skips charts.
        const normalizeCodeBlockText = (value: React.ReactNode): string => {
            if (value == null || typeof value === "boolean") return ""
            if (typeof value === "string" || typeof value === "number") return String(value)
            if (Array.isArray(value)) return value.map(normalizeCodeBlockText).join("")
            if (React.isValidElement(value)) {
                return normalizeCodeBlockText(
                    (value.props as { children?: React.ReactNode }).children
                )
            }
            return ""
        }

        const findCodeChild = (
            nodes: React.ReactNode
        ): React.ReactElement<{
            className?: string
            children?: React.ReactNode
        }> | undefined => {
            for (const c of React.Children.toArray(nodes)) {
                if (!React.isValidElement(c)) continue
                if (typeof c.type === "string" && c.type === "code") {
                    return c as React.ReactElement<{
                        className?: string
                        children?: React.ReactNode
                    }>
                }
                const inner = (c.props as { children?: React.ReactNode }).children
                const nested = findCodeChild(inner)
                if (nested) return nested
            }
            return undefined
        }

        const chartFenceLang = (className: string | undefined): boolean =>
            typeof className === "string" &&
            /language-(?:mermaid|chart)(?:\s|$)/.test(className)

        const isBlogChartPayload = (text: string): boolean => {
            const t = text.trim()
            if (!t.startsWith("{")) return false
            try {
                const obj = JSON.parse(t) as { type?: string }
                return (
                    obj.type === "pipeline" ||
                    obj.type === "comparison" ||
                    obj.type === "pie" ||
                    obj.type === "tree"
                )
            } catch {
                return false
            }
        }

        const codeChild = findCodeChild(props.children)
        const childClassName = codeChild
            ? (codeChild.props as { className?: string }).className
            : undefined
        const blockText = codeChild
            ? normalizeCodeBlockText(
                (codeChild.props as { children?: React.ReactNode }).children
            )
            : normalizeCodeBlockText(props.children)

        const payloadFallbackLang = (className: string | undefined): boolean => {
            if (className == null || className === "") return true
            return /language-(json|text|txt|plaintext)(?:\s|$)/.test(className)
        }

        const shouldRenderChart =
            blockText.trim().length > 0 &&
            isBlogChartPayload(blockText) &&
            (chartFenceLang(childClassName) || payloadFallbackLang(childClassName))

        if (shouldRenderChart) {
            return <MermaidDiagram chart={blockText} />
        }

        // Extract language for label badge
        const langMatch = typeof childClassName === "string"
            ? /language-(\w+)/.exec(childClassName)
            : null

        return (
            <pre
                className="blog-code-block"
                {...(langMatch ? { "data-lang": langMatch[1] } : {})}
                {...props}
            />
        )
    },
    strong: (props: React.HTMLAttributes<HTMLElement>) => (
        <strong className="font-semibold text-foreground" {...props} />
    ),
    em: (props: React.HTMLAttributes<HTMLElement>) => (
        <em className="italic text-foreground/80" {...props} />
    ),
    img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
        <figure className="my-6">
            <div className="overflow-hidden rounded-xl border border-white/[0.06] shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full object-cover" loading="lazy" alt="" {...props} />
            </div>
            {props.alt && (
                <figcaption className="mt-2 text-center text-sm text-muted-foreground/70">
                    {props.alt}
                </figcaption>
            )}
        </figure>
    ),
}
