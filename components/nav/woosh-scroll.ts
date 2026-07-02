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

export function wooshScrollTo(targetY: number, onSettle?: () => void) {
  // Cancel any in-flight animation so two scrolls never fight.
  // A superseded animation's onSettle is dropped with its timeout.
  cancelActiveWoosh()

  const startY = window.scrollY
  const distance = targetY - startY
  if (Math.abs(distance) < 2) {
    onSettle?.()
    return
  }

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
    onSettle?.()
  }, duration + 50)
}

/** Generation counter: a new navigateTo() call invalidates any pending
 *  layout-stability poll from a previous call (its woosh is already
 *  cancelled, but the pending timer would otherwise revive it and fight
 *  the new navigation). */
let navigationId = 0

/**
 * Native compositor-thread smooth scroll for anchor navigation.
 * The rAF-driven woosh spring starves when the main thread is busy —
 * "portfolio:mount-all" boots several WebGL canvases right before the
 * scroll, and under that jank the spring's ticks coalesce into visible
 * teleports. window.scrollTo({behavior: "smooth"}) animates on the
 * compositor thread, so it stays one continuous motion regardless of
 * main-thread load. Completion is detected via "scrollend" with a
 * timeout fallback for browsers that lack the event.
 */
function smoothScrollTo(targetY: number, thisNavigation: number, onDone: () => void) {
  cancelActiveWoosh()
  isProgrammaticScroll = true
  let finished = false
  function finishOnce() {
    if (finished) return
    finished = true
    window.removeEventListener("scrollend", finishOnce)
    isProgrammaticScroll = false
    if (thisNavigation !== navigationId) return // superseded mid-scroll
    onDone()
  }
  window.addEventListener("scrollend", finishOnce)
  window.scrollTo({ top: targetY, behavior: "smooth" })
  setTimeout(finishOnce, 2000)
}

const LAYOUT_POLL_MS = 100
/**
 * Consecutive unchanged polls required before layout counts as "stable".
 * Deliberately more than a handful of polls: at least one section
 * (GitHub stats) renders a short skeleton, kicks off an async data fetch,
 * then swaps in much taller real content once it resolves — the skeleton
 * itself holds still for a while, so a too-short stable window declares
 * "stable" on the skeleton and lands short of any target below it.
 */
const LAYOUT_STABLE_POLLS = 15
const LAYOUT_STABLE_CAP_MS = 5000

/**
 * Poll for the target id to exist AND document.documentElement.scrollHeight
 * to stop changing for LAYOUT_STABLE_POLLS consecutive polls — i.e. every
 * LazySection dispatched by "portfolio:mount-all" has finished mounting and
 * expanding. Hard-capped at LAYOUT_STABLE_CAP_MS so a section that never
 * appears can't stall navigation forever. Aborts silently (no onReady call)
 * if a newer navigateTo() has superseded this one.
 */
function waitForStableLayout(id: string, thisNavigation: number, onReady: () => void) {
  const start = performance.now()
  let lastHeight = document.documentElement.scrollHeight
  let stablePolls = 0

  function poll() {
    if (thisNavigation !== navigationId) return // superseded

    const height = document.documentElement.scrollHeight
    stablePolls = height === lastHeight ? stablePolls + 1 : 0
    lastHeight = height

    const ready = !!document.getElementById(id) && stablePolls >= LAYOUT_STABLE_POLLS
    const timedOut = performance.now() - start >= LAYOUT_STABLE_CAP_MS
    if (ready || timedOut) {
      onReady()
      return
    }
    setTimeout(poll, LAYOUT_POLL_MS)
  }
  poll()
}

/**
 * Scroll to an anchor href with the woosh effect — ONE continuous motion,
 * no stop-and-go. Before measuring anything, every LazySection is told to
 * mount immediately ("portfolio:mount-all") and we wait for layout to
 * settle, so the document has already reached its final height BEFORE the
 * single scroll starts. (Previously the code chased a moving target with
 * repeated re-scrolls as sections expanded mid-animation — visible as a
 * stop-and-go "chase" on every click.)
 */
export function navigateTo(href: string, callback?: () => void) {
  const thisNavigation = ++navigationId
  if (href.startsWith("/")) {
    callback?.()
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

  const finish = () => {
    history.pushState(null, "", `#${id}`)
    callback?.()
  }

  /** Absolute Y for the target, clamped to the scrollable range. */
  function measureTargetY(target: Element): number {
    const rawY = target.getBoundingClientRect().top + window.scrollY - 80
    const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    return Math.min(Math.max(rawY, 0), maxY)
  }

  /** Fires once layout is stable (or the hard cap trips): the single scroll. */
  function scrollOnce() {
    const el = document.getElementById(id)
    if (el) {
      smoothScrollTo(measureTargetY(el), thisNavigation, finish)
      return
    }
    // Id never appeared — fall back to its LazySection wrapper, which is
    // always in the DOM (data-section is set regardless of mount state).
    const wrapper = document.querySelector(`[data-section="${id}"]`)
    if (wrapper) {
      smoothScrollTo(measureTargetY(wrapper), thisNavigation, finish)
      return
    }
    // Neither exists — nothing to scroll to.
    window.location.hash = id
    callback?.()
  }

  window.dispatchEvent(new Event("portfolio:mount-all"))
  waitForStableLayout(id, thisNavigation, scrollOnce)
}
