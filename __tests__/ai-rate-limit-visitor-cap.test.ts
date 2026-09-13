import { describe, expect, it } from "vitest"

import { CHAT_LIMITS, checkRateLimit } from "@/lib/ai/rate-limit"

/**
 * Misha's requirement, verbatim: "limit response to like 10-15 per person per
 * unique IP ... just so that we don't have some kind of automation of using it.
 * That's very important."
 *
 * The pre-existing config missed this in a way the comments hid. rate-limit.ts
 * described the IP layer as a "floor … tighter than the cookie limit: wiping
 * cookies lands you here", but shipped cookie=25/h against ip=40/h. The IP layer
 * was the LOOSER of the two, so clearing cookies did not land you on a floor —
 * it bought you 15 extra requests. The existing bypass test passed anyway,
 * because it only asserted that an IP ceiling exists, never that reaching it
 * cost you more than the cookie path.
 *
 * These tests pin the property rather than the numbers: a cookie wipe must not
 * be worth doing.
 */

/** Drives n requests from one IP, discarding the cookie every time — a wipe-and-retry bot. */
function driveCookieless(ip: string, n: number, startAt = 0) {
    let last = checkRateLimit(ip, undefined, startAt)
    for (let i = 1; i < n; i++) last = checkRateLimit(ip, undefined, startAt + i * 21_000)
    return last
}

describe("per-visitor cap", () => {
    it("caps a single browser in the 10-15 band Misha asked for", () => {
        expect(CHAT_LIMITS.cookie.max).toBeGreaterThanOrEqual(10)
        expect(CHAT_LIMITS.cookie.max).toBeLessThanOrEqual(15)
    })

    it("caps a single IP in the 10-15 band too", () => {
        expect(CHAT_LIMITS.ip.max).toBeGreaterThanOrEqual(10)
        expect(CHAT_LIMITS.ip.max).toBeLessThanOrEqual(15)
    })

    it("makes clearing cookies not worth doing", () => {
        // The whole point of the IP layer. If ip.max sits far above cookie.max,
        // the cheapest possible bypass — clear cookies, reload — is rewarded.
        // A few spare requests is tolerable slack; a 60% budget increase is not.
        const gain = CHAT_LIMITS.ip.max - CHAT_LIMITS.cookie.max
        expect(gain, "wiping cookies must not meaningfully raise the budget").toBeLessThanOrEqual(3)
    })

    it("actually stops a cookie-wiping bot at the IP ceiling", () => {
        const ip = "203.0.113.77"
        const last = driveCookieless(ip, CHAT_LIMITS.ip.max + 1, 1_000_000)
        expect(last.ok).toBe(false)
        if (!last.ok) expect(last.reason).toBe("ip")
    })
})
