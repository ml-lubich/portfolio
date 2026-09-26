"use client"

import { Component, useEffect, useState, type ReactNode } from "react"
import dynamic from "next/dynamic"

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

/** Defers *fetching* that chunk past first paint, not just splitting it —
 *  `dynamic()` alone still requests the chunk the instant it mounts, which
 *  is still "on first paint" for a component rendered unconditionally in
 *  the root layout. Same idle-first shape as the hero brain
 *  (components/hero/index.tsx's `useDeferBrain`), minus the ceiling: the
 *  chat has no fold to protect and nothing to reveal, so there is no reason
 *  to force it in before the browser is actually idle. */
export function LazyMLBot() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Once MLBot itself has mounted, its own listener (mlbot.tsx) owns
    // "mlbot:open" — nothing left for this effect to do.
    if (ready) return

    const cb = () => setReady(true)
    const id =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback(cb, { timeout: 4000 })
        : window.setTimeout(cb, 300)

    // The hero CTA (components/hero/hero-actions.tsx) can ask for the panel
    // before the idle callback ever fires — a bare window event with nobody
    // listening yet, which would otherwise be a silent no-op click. Mount
    // right now instead, then replay the event once MLBot has attached its
    // own listener for it.
    const onOpenIntent = () => {
      setReady(true)
      window.setTimeout(() => window.dispatchEvent(new Event("mlbot:open")), 0)
    }
    window.addEventListener("mlbot:open", onOpenIntent)

    return () => {
      if (typeof cancelIdleCallback !== "undefined") cancelIdleCallback(id as number)
      else clearTimeout(id)
      window.removeEventListener("mlbot:open", onOpenIntent)
    }
  }, [ready])

  return <ChatLoadBoundary>{ready ? <MLBot /> : null}</ChatLoadBoundary>
}
