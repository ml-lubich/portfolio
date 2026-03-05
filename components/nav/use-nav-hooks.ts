"use client"

import { useState, useEffect, useRef } from "react"

/* ── Active section tracker (IntersectionObserver) ────────────────── */

export function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState("")
  const currentId = useRef("")

  useEffect(() => {
    const visibleRatios = new Map<string, number>()
    const observerMap = new Map<string, IntersectionObserver>()
    let mutationRef: MutationObserver | null = null

    function updateBest() {
      let best = ""
      let bestRatio = 0
      visibleRatios.forEach((ratio, sId) => {
        if (ratio > bestRatio) {
          bestRatio = ratio
          best = sId
        }
      })
      // Only trigger re-render when the active section actually changes
      if (best && best !== currentId.current) {
        currentId.current = best
        setActiveId(best)
      }
    }

    function observeSection(id: string) {
      if (observerMap.has(id)) return
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          visibleRatios.set(id, entry.intersectionRatio)
          updateBest()
        },
        // Fewer thresholds = fewer callbacks, still accurate for section tracking
        { threshold: [0, 0.25, 0.5, 1] },
      )
      observer.observe(el)
      observerMap.set(id, observer)
    }

    sectionIds.forEach(observeSection)

    // Watch for lazily-rendered sections appearing in the DOM
    mutationRef = new MutationObserver(() => {
      sectionIds.forEach(observeSection)
      // Disconnect once all sections are observed — no more DOM watching needed
      if (observerMap.size >= sectionIds.length) {
        mutationRef?.disconnect()
        mutationRef = null
      }
    })
    mutationRef.observe(document.body, { childList: true, subtree: true })

    return () => {
      mutationRef?.disconnect()
      observerMap.forEach((o) => o.disconnect())
    }
  }, [sectionIds])

  return activeId
}

/* ── Scroll progress (0→1) for the whole page ────────────────────── */

export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId: number
    function update() {
      const docH = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docH > 0 ? Math.min(window.scrollY / docH, 1) : 0)
    }
    function onScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return progress
}
