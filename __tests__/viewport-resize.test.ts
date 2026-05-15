/**
 * Tests for `subscribeWidthResize` — the iOS-Safari flicker fix that
 * filters out URL-bar show/hide resize events (height-only changes).
 */

import { describe, it, expect, vi } from "vitest"
import { subscribeWidthResize } from "@/lib/viewport-resize"

interface FakeWindow {
    innerWidth: number
    innerHeight: number
    addEventListener: (type: string, handler: () => void, opts?: unknown) => void
    removeEventListener: (type: string, handler: () => void) => void
    fire: () => void
}

function makeFakeWindow(width: number, height: number): FakeWindow {
    const listeners: Array<() => void> = []
    return {
        innerWidth: width,
        innerHeight: height,
        addEventListener: (type, handler) => {
            if (type === "resize") listeners.push(handler)
        },
        removeEventListener: (type, handler) => {
            if (type !== "resize") return
            const i = listeners.indexOf(handler)
            if (i >= 0) listeners.splice(i, 1)
        },
        fire: () => {
            for (const l of [...listeners]) l()
        },
    }
}

describe("subscribeWidthResize", () => {
    it("does not invoke handler on subscribe", () => {
        const win = makeFakeWindow(1024, 768)
        const handler = vi.fn()
        subscribeWidthResize(handler, { target: win as unknown as Window })
        expect(handler).not.toHaveBeenCalled()
    })

    it("ignores resize events that change only height (iOS URL bar)", () => {
        const win = makeFakeWindow(390, 844)
        const handler = vi.fn()
        subscribeWidthResize(handler, { target: win as unknown as Window })

        // Simulate iOS Safari collapsing the address bar — height shrinks, width unchanged
        win.innerHeight = 800
        win.fire()
        win.innerHeight = 844
        win.fire()

        expect(handler).not.toHaveBeenCalled()
    })

    it("invokes handler when width actually changes (orientation / window resize)", () => {
        const win = makeFakeWindow(390, 844)
        const handler = vi.fn()
        subscribeWidthResize(handler, { target: win as unknown as Window })

        win.innerWidth = 844 // landscape rotation
        win.fire()
        expect(handler).toHaveBeenCalledTimes(1)

        // Another height-only change — still ignored
        win.innerHeight = 390
        win.fire()
        expect(handler).toHaveBeenCalledTimes(1)

        // Another width change
        win.innerWidth = 390
        win.fire()
        expect(handler).toHaveBeenCalledTimes(2)
    })

    it("returned unsubscribe removes the listener", () => {
        const win = makeFakeWindow(1024, 768)
        const handler = vi.fn()
        const unsubscribe = subscribeWidthResize(handler, { target: win as unknown as Window })

        unsubscribe()
        win.innerWidth = 1280
        win.fire()
        expect(handler).not.toHaveBeenCalled()
    })

    it("returns a no-op unsubscribe when window is unavailable (SSR)", () => {
        const handler = vi.fn()
        const unsubscribe = subscribeWidthResize(handler, {
            target: undefined as unknown as Window,
        })
        // Should not throw
        expect(() => unsubscribe()).not.toThrow()
        expect(handler).not.toHaveBeenCalled()
    })
})
