"use client"

/**
 * Publishes normalised pointer position (-1..1) as `--px` / `--py` CSS vars
 * on a container, so children can tilt with pure CSS transforms.
 *
 * Desktop only, by design: the listener is never attached unless the device
 * has a fine pointer and the user has not asked for reduced motion. Touch
 * devices keep the existing flat rendering and pay nothing — same scaling
 * and mobile-performance rules as before.
 *
 * Writes are coalesced into one rAF per frame, and the values go straight to
 * CSS custom properties rather than React state, so pointer movement never
 * triggers a re-render.
 */

import { useEffect, useRef } from "react"

export function usePointerTilt<T extends HTMLElement>() {
    const ref = useRef<T>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (!fine || still) return

        let frame = 0
        let px = 0
        let py = 0

        const apply = () => {
            frame = 0
            el.style.setProperty("--px", px.toFixed(3))
            el.style.setProperty("--py", py.toFixed(3))
        }

        const onMove = (e: PointerEvent) => {
            const r = el.getBoundingClientRect()
            if (!r.width || !r.height) return
            // Clamp so a pointer far outside the box does not over-rotate it.
            px = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2))
            py = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2))
            if (!frame) frame = requestAnimationFrame(apply)
        }

        const onLeave = () => {
            px = 0
            py = 0
            if (!frame) frame = requestAnimationFrame(apply)
        }

        el.addEventListener("pointermove", onMove, { passive: true })
        el.addEventListener("pointerleave", onLeave, { passive: true })
        return () => {
            el.removeEventListener("pointermove", onMove)
            el.removeEventListener("pointerleave", onLeave)
            if (frame) cancelAnimationFrame(frame)
        }
    }, [])

    return ref
}
