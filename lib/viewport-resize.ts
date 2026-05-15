/**
 * ─── Viewport Resize Helpers ──────────────────────────────────────────
 * iOS Safari (and Android Chrome) fire `resize` events whenever the URL
 * bar collapses or expands during scroll. Those events change only the
 * visual viewport height, never the width. Naively reacting to every
 * `resize` re-initializes canvases (clearing them → visible flash) and
 * thrashes layout-driven hooks → manifests as flicker / "random refresh"
 * on mobile.
 *
 * `subscribeWidthResize` filters those nuisance events: the handler only
 * runs when `window.innerWidth` actually changed since the last fire.
 *
 * Pure DOM helper, no React. Safe to import from server code (it only
 * touches `window` inside the returned subscribe function).
 */

export type WidthResizeHandler = () => void

export interface WidthResizeOptions {
    /** Optional override window for testing. Defaults to global `window`. */
    target?: Window
}

/**
 * Subscribe to width-only resize events. Returns an unsubscribe function.
 * The handler does NOT fire on subscribe — callers should run their
 * initial layout pass synchronously themselves.
 */
export function subscribeWidthResize(
    handler: WidthResizeHandler,
    options: WidthResizeOptions = {},
): () => void {
    const win = options.target ?? (typeof window !== "undefined" ? window : undefined)
    if (!win) {
        return () => {}
    }
    let lastWidth = win.innerWidth
    const onResize = () => {
        const nextWidth = win.innerWidth
        if (nextWidth === lastWidth) return
        lastWidth = nextWidth
        handler()
    }
    win.addEventListener("resize", onResize, { passive: true })
    return () => {
        win.removeEventListener("resize", onResize)
    }
}
