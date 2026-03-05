"use client"

import { useEffect, useState } from "react"

/* ── Cursor.com-style VIBGYOR rainbow spectrum ───────────────────────
 *  Full rainbow: Violet → Indigo → Blue → Green → Yellow → Orange → Red
 *  Pure, fully-saturated hex colours — no washed-out pastels.
 *  Large blurred orbs overlap into a continuous spectrum.
 * ─────────────────────────────────────────────────────────────────── */

const ORBS = [
  { x: 5,  y: 30, size: 62, color: "#FF0000", color2: "#FF4500", dur: 52, dir: 1  },  // RED
  { x: 22, y: 70, size: 58, color: "#FF7F00", color2: "#FF9900", dur: 46, dir: -1 },  // ORANGE
  { x: 40, y: 18, size: 60, color: "#FFD700", color2: "#FFFF00", dur: 50, dir: 1  },  // YELLOW
  { x: 55, y: 65, size: 58, color: "#00FF00", color2: "#32CD32", dur: 44, dir: -1 },  // GREEN
  { x: 70, y: 20, size: 62, color: "#0066FF", color2: "#0099FF", dur: 56, dir: 1  },  // BLUE
  { x: 85, y: 55, size: 56, color: "#4B0082", color2: "#6A0DAD", dur: 48, dir: -1 },  // INDIGO
  { x: 15, y: 50, size: 58, color: "#9400D3", color2: "#BF00FF", dur: 42, dir: 1  },  // VIOLET
] as const

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}

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
        const c1 = hexToRgb(orb.color)
        const c2 = hexToRgb(orb.color2)
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: `${orb.size}vmax`,
              height: `${orb.size}vmax`,
              borderRadius: "50%",
              background: [
                `radial-gradient(circle,`,
                `rgba(${c1}, 1) 0%,`,
                `rgba(${c1}, 0.85) 18%,`,
                `rgba(${c2}, 0.65) 35%,`,
                `rgba(${c2}, 0.38) 50%,`,
                `rgba(${c2}, 0.15) 65%,`,
                `rgba(${c2}, 0) 80%)`,
              ].join(" "),
              filter: "blur(6vmax)",
              willChange: "filter",
              transform: "translate(-50%, -50%)",
              opacity: mounted ? 1 : 0,
              transition: "opacity 2s ease-in-out",
              animation: `spectrum-drift-${orb.dir > 0 ? "a" : "b"} ${orb.dur}s ease-in-out infinite`,
            }}
          />
        )
      })}

      {/* No vignette — let the rainbow colors shine fully */}
    </div>
  )
}
