'use client'
import { useEffect, useRef, useState } from 'react'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * rAF clock in seconds. Runs only while the node is on screen and the tab is
 * visible, and never under prefers-reduced-motion. Returns `staticT` until the
 * first animated frame so SSR and first client render match (and reduced-motion
 * visitors keep a meaningful still frame).
 */
export function useClock(staticT = 0) {
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(staticT)
  useEffect(() => {
    const node = ref.current
    if (!node || reducedMotion()) return
    let visible = false, raf = 0, last = 0, elapsed = 0
    const tick = (now: number) => {
      if (last) {
        elapsed += Math.min((now - last) / 1000, 0.1)
        setT(elapsed)
      }
      last = now
      raf = requestAnimationFrame(tick)
    }
    const sync = () => {
      const run = visible && !document.hidden
      if (run && !raf) { last = 0; raf = requestAnimationFrame(tick) }
      else if (!run && raf) { cancelAnimationFrame(raf); raf = 0 }
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync() })
    io.observe(node)
    document.addEventListener('visibilitychange', sync)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      cancelAnimationFrame(raf)
    }
  }, [])
  return [ref, t] as const
}

/** Live on-screen + tab-visible flag, plus whether motion is reduced. */
export function useRunning() {
  const ref = useRef<HTMLDivElement>(null)
  const [running, setRunning] = useState(false)
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (reducedMotion()) { setReduced(true); return }
    let visible = false
    const sync = () => setRunning(visible && !document.hidden)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync() })
    io.observe(node)
    document.addEventListener('visibilitychange', sync)
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', sync) }
  }, [])
  return [ref, running, reduced] as const
}
