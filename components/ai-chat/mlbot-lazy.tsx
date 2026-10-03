"use client"

import { Component, useEffect, useState, type ReactNode } from "react"
import dynamic from "next/dynamic"
import { LAUNCHER_STACK_CLASS, LauncherButton } from "./launcher"

/* Code-split from the layout bundle: MLBot's module graph (react-markdown,
 * recharts, its own icon set) is 150KB+ of JS that has zero business in
 * every route's shared bundle — the panel starts closed, nobody has asked
 * for a chart or a markdown render yet. Measured before this change:
 * ~155KB of it showed up as fully-unused JS on first load (Lighthouse
 * `unused-javascript`) on every single page, mobile included. */
const MLBot = dynamic(() => import("./mlbot").then((m) => m.MLBot))

/** The idle-triggered chunk fetch below is a background fetch nobody asked
 *  for yet — a stale chunk hash after a redeploy, an ad-blocker rule, or a
 *  flaky mobile connection can fail it, and an uncaught error from a lazy
 *  `dynamic()` import bubbles to the nearest error boundary. Without one
 *  here that's app/error.tsx, which replaces the *entire already-rendered
 *  page* (nav, hero, everything) over a chat widget nobody tried to open.
 *  Swallow it instead: the chat affordance just stays absent. */
class ChatLoadBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error("MLBot chunk failed to load; chat disabled for this session", error)
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

/** The launcher ships in the initial bundle; the chat module (markdown,
 *  recharts) is fetched only on first intent: hover, focus, touch or click on
 *  the launcher, the hero CTA's "mlbot:open", or scrolling past the hero (where
 *  MLBot's back-to-top button takes over). Nothing loads at idle.
 *
 *  The static launcher stays mounted (same DOM node) until MLBot reports it has
 *  mounted, so a click that lands while the chunk is still loading is not lost,
 *  and it is only rendered after hydration so a pre-hydration click can't be
 *  dropped either. */
export function LazyMLBot() {
  const [hydrated, setHydrated] = useState(false)
  const [ready, setReady] = useState(false)
  const [mounted, setMounted] = useState(false)
  // Opened by an explicit tap/click/CTA, as opposed to a hover prefetch.
  const [openOnMount, setOpenOnMount] = useState(false)

  useEffect(() => setHydrated(true), [])

  useEffect(() => {
    if (ready) return
    const onScroll = () => {
      if (window.scrollY > 600) setReady(true)
    }
    const onOpenIntent = () => {
      setOpenOnMount(true)
      setReady(true)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("mlbot:open", onOpenIntent)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("mlbot:open", onOpenIntent)
    }
  }, [ready])

  const load = () => setReady(true)
  const openIntent = () => window.dispatchEvent(new Event("mlbot:open"))
  return (
    <>
      {hydrated && !mounted && (
        <div className={LAUNCHER_STACK_CLASS}>
          <LauncherButton
            onPointerEnter={load}
            onFocus={load}
            onTouchStart={load}
            // Same path as the hero CTA: handled by our listener while the
            // chunk is loading, or by MLBot's own if it mounted a tick ago.
            // Fires on pointerdown too: if hover-prefetch finishes between
            // mousedown and mouseup this node is swapped for MLBot's own and
            // the browser never emits a click. "open" is idempotent, so the
            // click that follows (and keyboard activation) is harmless.
            onPointerDown={openIntent}
            onClick={openIntent}
          />
        </div>
      )}
      {ready && (
        <ChatLoadBoundary>
          <MLBot initialOpen={openOnMount} onMounted={() => setMounted(true)} />
        </ChatLoadBoundary>
      )}
    </>
  )
}
