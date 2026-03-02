import { forwardRef } from "react"

/* ── Holographic edge glow ── */
export const GlowOverlay = forwardRef<HTMLDivElement>(function GlowOverlay(_props, ref) {
  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
      style={{
        opacity: 0,
        background: "radial-gradient(circle at 50% 50%, hsla(217,91%,60%,0.2), transparent 60%)",
        mixBlendMode: "screen",
      }}
    />
  )
})

/* ── Glass specular‑highlight shine ── */
export const ShineOverlay = forwardRef<HTMLDivElement>(function ShineOverlay(_props, ref) {
  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 z-10"
      style={{
        opacity: 0,
        transition: "opacity 0.4s ease-out, background 0.15s ease-out",
        borderRadius: "inherit",
        mixBlendMode: "overlay",
      }}
    />
  )
})

/* ── Scan‑line overlay ── */
export const ScanOverlay = forwardRef<HTMLDivElement>(function ScanOverlay(_props, ref) {
  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 z-10"
      style={{
        opacity: 0,
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, hsla(217,91%,60%,0.03) 2px, hsla(217,91%,60%,0.03) 4px)",
        backgroundSize: "100% 4px",
        transition: "opacity 0.5s",
      }}
    />
  )
})

/* ── Corner tech brackets ── */
export function CornerBrackets() {
  return (
    <>
      <div className="pointer-events-none absolute left-2 top-2 z-10 h-4 w-4 border-l border-t border-primary/20" />
      <div className="pointer-events-none absolute right-2 top-2 z-10 h-4 w-4 border-r border-t border-primary/20" />
      <div className="pointer-events-none absolute bottom-2 left-2 z-10 h-4 w-4 border-b border-l border-primary/20" />
      <div className="pointer-events-none absolute bottom-2 right-2 z-10 h-4 w-4 border-b border-r border-primary/20" />
    </>
  )
}
