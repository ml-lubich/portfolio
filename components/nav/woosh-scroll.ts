/* ── Spring-physics "woosh" smooth scroll ─────────────────────────── */

/**
 * Global flag: true while a programmatic (woosh) scroll is in progress.
 * Other scroll-driven components (e.g. navbar hide/show) should check
 * this and skip their reactions to avoid visual glitches.
 */
export let isProgrammaticScroll = false

export function wooshScrollTo(targetY: number) {
  const startY = window.scrollY
  const distance = targetY - startY
  if (Math.abs(distance) < 2) return

  const duration = Math.min(1200, Math.max(600, Math.abs(distance) * 0.4))
  let startTime: number | null = null
  let rafId: number

  function springEase(t: number): number {
    return 1 - Math.pow(1 - t, 3) * Math.cos(t * Math.PI * 0.5)
  }

  function tick(now: number) {
    if (!startTime) startTime = now
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = springEase(progress)

    window.scrollTo(0, startY + distance * eased)

    if (progress < 1) {
      rafId = requestAnimationFrame(tick)
    }
  }

  // Signal that JS is driving the scroll
  isProgrammaticScroll = true
  document.documentElement.style.scrollBehavior = "auto"
  rafId = requestAnimationFrame(tick)

  setTimeout(() => {
    document.documentElement.style.scrollBehavior = ""
    cancelAnimationFrame(rafId)
    isProgrammaticScroll = false
  }, duration + 50)
}

/** Scroll to an anchor href with the woosh effect.
 *  If the target element isn't in the DOM yet (e.g. inside a LazySection),
 *  we progressively scroll down to trigger lazy-loading, then retry.
 */
export function navigateTo(href: string, callback?: () => void) {
  if (href.startsWith("/")) {
    window.location.href = href
    return
  }
  const id = href.replace("#", "")

  function scrollToElement() {
    const el = id ? document.getElementById(id) : null
    if (el) {
      const targetY = el.getBoundingClientRect().top + window.scrollY - 80
      wooshScrollTo(targetY)
      if (id) history.pushState(null, "", `#${id}`)
      callback?.()
      return
    }

    // Element not yet in DOM — scroll down in steps to trigger LazySection observers
    let attempts = 0
    const maxAttempts = 20
    const step = () => {
      const found = document.getElementById(id)
      if (found) {
        const targetY = found.getBoundingClientRect().top + window.scrollY - 80
        wooshScrollTo(targetY)
        if (id) history.pushState(null, "", `#${id}`)
        callback?.()
        return
      }
      attempts++
      if (attempts >= maxAttempts) {
        // Give up — scroll to bottom as fallback
        callback?.()
        return
      }
      // Nudge scroll down to trigger intersection observers
      window.scrollBy({ top: window.innerHeight, behavior: "auto" })
      requestAnimationFrame(() => setTimeout(step, 60))
    }
    step()
  }

  scrollToElement()
}
