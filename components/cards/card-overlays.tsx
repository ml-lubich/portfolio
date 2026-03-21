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
