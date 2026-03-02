/* ── Spring-physics "woosh" smooth scroll ─────────────────────────── */

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

  document.documentElement.style.scrollBehavior = "auto"
  rafId = requestAnimationFrame(tick)

  setTimeout(() => {
    document.documentElement.style.scrollBehavior = ""
    cancelAnimationFrame(rafId)
  }, duration + 50)
}

/** Scroll to an anchor href with the woosh effect */
export function navigateTo(href: string, callback?: () => void) {
  if (href.startsWith("/")) {
    window.location.href = href
    return
  }
  const id = href.replace("#", "")
  const el = id ? document.getElementById(id) : null
  const targetY = el ? el.getBoundingClientRect().top + window.scrollY - 80 : 0

  wooshScrollTo(targetY)
  if (id) history.pushState(null, "", `#${id}`)
  callback?.()
}
