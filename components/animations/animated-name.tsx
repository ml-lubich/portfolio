"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface AnimatedNameProps {
  /** The text to animate */
  name: string
  /** Additional class names for the wrapper */
  className?: string
  /** Trigger mode: 'mount' plays once on viewport entry, 'hover' replays on hover */
  trigger?: "mount" | "hover"
  /** Delay before the animation starts (ms) */
  delay?: number
  /** Duration of the expansion (ms) */
  duration?: number
  /** Apply a metallic shiny gradient effect */
  metallic?: boolean
  /** Fires once when the expand animation starts (after `delay` in `mount` mode). */
  onReveal?: () => void
}

/**
 * Animated name component inspired by the Anthropic logo animation.
 *
 * Each letter starts collapsed to the horizontal center of the word,
 * then expands outward to its natural position with a staggered,
 * spring‐like ease and a simultaneous opacity fade‐in.
 *
 * "mount" mode: plays once when the element scrolls into view.
 * "hover" mode: starts visible, replays the expand on each hover.
 */
export function AnimatedName({
  name,
  className = "",
  trigger = "mount",
  delay = 0,
  duration = 975,
  metallic = false,
  onReveal,
}: AnimatedNameProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const onRevealRef = useRef(onReveal)
  onRevealRef.current = onReveal
  // "hover" mode starts expanded (visible); "mount" mode starts collapsed
  const [expanded, setExpanded] = useState(trigger === "hover")
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Split name into characters, preserving spaces
  const chars = name.split("")
  const totalChars = chars.length
  const midpoint = (totalChars - 1) / 2

  // On mount trigger — play once when the element enters the viewport
  useEffect(() => {
    if (trigger !== "mount") return

    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true)
          setTimeout(() => {
            onRevealRef.current?.()
            setExpanded(true)
          }, delay)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [trigger, delay, hasBeenVisible])

  // Hover → re‑collapse then re‑expand to replay the animation
  const handleMouseEnter = useCallback(() => {
    if (trigger !== "hover") return
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    // Collapse instantly (no transition)
    setExpanded(false)
    // Re-expand after a brief tick so the browser registers the collapsed state
    hoverTimeoutRef.current = setTimeout(() => setExpanded(true), 30)
  }, [trigger])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="sr-only">{name}</span>
      <span
        ref={containerRef}
        className={`animated-name-root${metallic ? " animated-name-metallic" : ""}`}
        aria-hidden="true"
        onMouseEnter={handleMouseEnter}
        style={
          {
            "--name-duration": `${duration}ms`,
          } as React.CSSProperties
        }
      >
      {chars.map((char, i) => {
        // Distance from center: -1 (far left) to +1 (far right)
        const normalizedOffset = (i - midpoint) / midpoint || 0
        // Collapse amount: how far (in em) the letter moves toward center
        // Outer letters move more, inner letters barely move
        const collapseDistance = normalizedOffset * -0.55
        // Stagger: letters further from center animate slightly later
        const staggerDelay = Math.abs(normalizedOffset) * 80 // 0-80ms

        const isSpace = char === " "

        return (
          <span
            key={`${char}-${i}`}
            className="animated-name-char"
            style={
              {
                "--collapse-x": `${collapseDistance}em`,
                "--stagger": `${staggerDelay}ms`,
                ...(isSpace ? { width: "0.3em", display: "inline-block" } : {}),
              } as React.CSSProperties
            }
            data-expanded={expanded ? "true" : "false"}
          >
            {char}
          </span>
        )
      })}
      </span>
    </span>
  )
}
