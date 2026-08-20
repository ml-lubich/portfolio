"use client"

/**
 * Types a string out character by character, on the clock rather than on a
 * tick count — a `setInterval` per character drifts under load and ends up
 * finishing late on exactly the slow devices where it is most visible.
 *
 * `msPerChar <= 0` means "no typing": the caller gets the whole string on the
 * first render, which is what both SSR and reduced motion want.
 */

import { useEffect, useState } from "react"

export function typedChars(elapsedMs: number, totalChars: number, msPerChar: number): number {
    if (msPerChar <= 0) return totalChars
    if (!(elapsedMs > 0)) return 0
    return Math.min(totalChars, Math.floor(elapsedMs / msPerChar))
}

export function useTypewriter(text: string, msPerChar = 22): { shown: string; done: boolean } {
    // Starts empty on both server and client, so hydration matches; the effect
    // below fills it in on the first frame after mount.
    const [count, setCount] = useState(0)

    useEffect(() => {
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (still) {
            setCount(text.length)
            return
        }

        setCount(0)
        const start = performance.now()
        let frame = requestAnimationFrame(function tick(now) {
            const shown = typedChars(now - start, text.length, msPerChar)
            setCount(shown)
            if (shown < text.length) frame = requestAnimationFrame(tick)
        })
        return () => cancelAnimationFrame(frame)
    }, [text, msPerChar])

    return { shown: text.slice(0, count), done: count >= text.length }
}
