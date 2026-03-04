import { forwardRef } from "react"
import { overlays } from "@/lib/theme"

/* ── Holographic edge glow ── */
export const GlowOverlay = forwardRef<HTMLDivElement>(function GlowOverlay(_props, ref) {
  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
      style={{
        opacity: 0,
        background: overlays.glowRadial,
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
          overlays.scanLines,
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
