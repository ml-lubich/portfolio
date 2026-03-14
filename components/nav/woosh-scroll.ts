/* ── Spring-physics "woosh" smooth scroll ─────────────────────────── */

/**
 * Global flag: true while a programmatic (woosh) scroll is in progress.
 * Other scroll-driven components (e.g. navbar hide/show) should check
 * this and skip their reactions to avoid visual glitches.
 */
export let isProgrammaticScroll = false

/** Cancel handle for the currently-running woosh animation, if any. */
let activeRafId: number | null = null
let activeTimeoutId: ReturnType<typeof setTimeout> | null = null

/** Immediately stop any in-flight woosh animation. */
function cancelActiveWoosh() {
  if (activeRafId !== null) {
    cancelAnimationFrame(activeRafId)
    activeRafId = null
  }
  if (activeTimeoutId !== null) {
    clearTimeout(activeTimeoutId)
    activeTimeoutId = null
  }
  isProgrammaticScroll = false
  document.documentElement.style.scrollBehavior = ""
}

export function wooshScrollTo(targetY: number) {
  // Cancel any in-flight animation so two scrolls never fight
  cancelActiveWoosh()

  const startY = window.scrollY
  const distance = targetY - startY
  if (Math.abs(distance) < 2) return

  const duration = Math.min(900, Math.max(400, Math.abs(distance) * 0.35))
  let startTime: number | null = null
  let cancelled = false

  function springEase(t: number): number {
    return 1 - Math.pow(1 - t, 3) * Math.cos(t * Math.PI * 0.5)
  }

  function tick(now: number) {
    if (cancelled) return
    if (!startTime) startTime = now
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = springEase(progress)

    window.scrollTo(0, startY + distance * eased)

    if (progress < 1) {
      activeRafId = requestAnimationFrame(tick)
    } else {
      // Animation finished naturally
      activeRafId = null
    }
  }

  // Signal that JS is driving the scroll
  isProgrammaticScroll = true
  document.documentElement.style.scrollBehavior = "auto"
  activeRafId = requestAnimationFrame(tick)

  activeTimeoutId = setTimeout(() => {
    cancelled = true
    document.documentElement.style.scrollBehavior = ""
    if (activeRafId !== null) {
      cancelAnimationFrame(activeRafId)
      activeRafId = null
    }
    activeTimeoutId = null
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

  // Bare "#" or empty → scroll to top
  if (!id) {
    wooshScrollTo(0)
    history.pushState(null, "", window.location.pathname)
    callback?.()
    return
  }

  function scrollToElement() {
    const el = id ? document.getElementById(id) : null
    if (el) {
      const targetY = el.getBoundingClientRect().top + window.scrollY - 80
      wooshScrollTo(targetY)
      if (id) history.pushState(null, "", `#${id}`)
      callback?.()
      return
    }

    // Element not yet in DOM — look for a LazySection wrapper with
    // a matching data-section attribute.  Scroll there first (which
    // triggers the IntersectionObserver), then wait for the real
    // element to mount and do one precise adjustment.
    const wrapper = document.querySelector(`[data-section="${id}"]`)
    if (wrapper) {
      const wrapperY = wrapper.getBoundingClientRect().top + window.scrollY - 80
      wooshScrollTo(wrapperY)

      // Poll briefly for the real element to appear after lazy-load
      let retries = 0
      const maxRetries = 20
      const poll = () => {
        const found = document.getElementById(id)
        if (found) {
          // Element mounted — do a quick adjustment if needed
          const finalY = found.getBoundingClientRect().top + window.scrollY - 80
          if (Math.abs(finalY - window.scrollY) > 4) {
            wooshScrollTo(finalY)
          }
          history.pushState(null, "", `#${id}`)
          callback?.()
          return
        }
        retries++
        if (retries >= maxRetries) {
          // Give up — wrapper scroll position is close enough
          history.pushState(null, "", `#${id}`)
          callback?.()
          return
        }
        setTimeout(poll, 100)
      }
      // Start polling after a short delay to let IntersectionObserver fire
      setTimeout(poll, 150)
      return
    }

    // No wrapper either — fall back to progressive scroll discovery.
    // (Should rarely happen now that LazySection carries data-section.)
    cancelActiveWoosh()
    isProgrammaticScroll = true
    document.documentElement.style.scrollBehavior = "auto"

    let attempts = 0
    const maxAttempts = 20
    const step = () => {
      const found = document.getElementById(id)
      if (found) {
        isProgrammaticScroll = false
        document.documentElement.style.scrollBehavior = ""
        const targetY = found.getBoundingClientRect().top + window.scrollY - 80
        wooshScrollTo(targetY)
        if (id) history.pushState(null, "", `#${id}`)
        callback?.()
        return
      }
      attempts++
      if (attempts >= maxAttempts) {
        isProgrammaticScroll = false
        document.documentElement.style.scrollBehavior = ""
        callback?.()
        return
      }
      window.scrollTo(0, window.scrollY + window.innerHeight * 0.6)
      setTimeout(step, 100)
    }
    step()
  }

  scrollToElement()
}
