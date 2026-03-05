"use client"

import { useEffect, useState } from "react"

/* ── Cursor.com-style light spectrum ─────────────────────────────────
 *  7 large, heavily-blurred orbs that overlap and blend into a
 *  continuous rainbow spectrum across the viewport. Each orb is big
 *  enough (~55-65 vw) that neighbours merge seamlessly — no polka
 *  dots, just smooth colour fields. Bright modern hues, low enough
 *  opacity to keep text white & readable.
 * ─────────────────────────────────────────────────────────────────── */

const ORBS = [
  { x: 10,  y: 20,  size: 60, hue: 320, dur: 52, dir: 1  },  // hot pink
  { x: 30,  y: 65,  size: 58, hue: 265, dur: 46, dir: -1 },  // electric violet
  { x: 50,  y: 15,  size: 62, hue: 210, dur: 56, dir: 1  },  // vivid blue
  { x: 70,  y: 55,  size: 56, hue: 170, dur: 44, dir: -1 },  // bright teal
  { x: 85,  y: 25,  size: 58, hue: 45,  dur: 50, dir: 1  },  // warm amber
  { x: 20,  y: 80,  size: 55, hue: 140, dur: 48, dir: 1  },  // neon green
  { x: 75,  y: 80,  size: 56, hue: 350, dur: 42, dir: -1 },  // bright coral
] as const

export function BackgroundOrbs() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {ORBS.map((orb, i) => {
        const h = orb.hue
        const h2 = (h + 35) % 360
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: `${orb.size}vw`,
              height: `${orb.size}vw`,
              borderRadius: "50%",
              /* Smooth multi-stop gradient — avoids ring artifacts under dark overlays.
                 Uses same-hue zero-alpha instead of `transparent` (which is rgba(0,0,0,0)
                 and causes dark-band interpolation). */
              background: [
                `radial-gradient(circle,`,
                `hsl(${h} 100% 62% / 0.55) 0%,`,
                `hsl(${h} 100% 60% / 0.45) 15%,`,
                `hsl(${h2} 95% 57% / 0.32) 30%,`,
                `hsl(${h2} 90% 55% / 0.18) 45%,`,
                `hsl(${h2} 85% 55% / 0.08) 60%,`,
                `hsl(${h2} 80% 55% / 0) 75%)`,
              ].join(" "),
              filter: "blur(10vw)",
              willChange: "filter",
              transform: "translate(-50%, -50%)",
              opacity: mounted ? 1 : 0,
              transition: "opacity 2s ease-in-out",
              animation: `spectrum-drift-${orb.dir > 0 ? "a" : "b"} ${orb.dur}s ease-in-out infinite`,
            }}
          />
        )
      })}

      {/* Subtle vignette — soft edge darkening only */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 75% at 50% 45%, transparent 0%, hsl(220 15% 4% / 0.10) 70%, hsl(220 15% 4% / 0.35) 100%)",
          zIndex: 1,
        }}
      />
    </div>
  )
}
