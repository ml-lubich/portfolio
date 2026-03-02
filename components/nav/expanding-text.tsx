"use client"

/* ── Anthropic-style expanding text (character wave on hover) ── */

export function ExpandingText({ text, className }: { text: string; className?: string }) {
  const chars = text.split("")
  return (
    <span className={`inline-flex ${className ?? ""}`} aria-label={text}>
      {chars.map((char, i) => (
        <span
          key={`${char}-${i}`}
          className="inline-block transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:translate-y-[-1px] group-hover/link:scale-[1.08]"
          style={{
            transitionDelay: `${i * 25}ms`,
            ...(char === " " ? { width: "0.25em" } : {}),
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  )
}
