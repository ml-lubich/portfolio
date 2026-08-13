import { describe, it, expect, beforeEach } from "vitest"
import {
    CHAT_LIMITS,
    checkRateLimit,
    decodeCookie,
    encodeCookie,
    clientIp,
    buildCookie,
    __resetBuckets,
    acquireSlot,
    releaseSlot,
} from "@/lib/ai/rate-limit"

/* The chat endpoint spends real money per call, so the limiter is the security
 * boundary. These tests pin the adversarial properties, not the happy path. */

beforeEach(() => __resetBuckets())

/** Drives N requests from one IP far enough apart to never trip the burst guard. */
function drive(n: number, ip: string, startAt = 0) {
    let cookie: string | undefined
    let last = checkRateLimit(ip, cookie, startAt)
    for (let i = 1; i < n; i++) {
        if (last.ok) cookie = last.cookie
        // 21s apart clears the 20s burst window every time.
        last = checkRateLimit(ip, cookie, startAt + i * 21_000)
    }
    return last
}

describe("signed cookie quota", () => {
    it("round-trips a window through encode/decode", () => {
        const w = { sid: "s1", start: 1_700_000_000_000, count: 7 }
        expect(decodeCookie(encodeCookie(w))).toEqual(w)
    })

    it("rejects a forged count (signature no longer matches)", () => {
        const honest = encodeCookie({ sid: "s1", start: 1_700_000_000_000, count: 24 })
        const [sid, start, , mac] = honest.split(".")
        // Attacker rewrites the count to 0 but keeps the original signature.
        expect(decodeCookie(`${sid}.${start}.0.${mac}`)).toBeNull()
    })

    it("rejects malformed and absent cookies", () => {
        expect(decodeCookie(undefined)).toBeNull()
        expect(decodeCookie("")).toBeNull()
        expect(decodeCookie("garbage")).toBeNull()
        expect(decodeCookie("1.2")).toBeNull()
        expect(decodeCookie("1.2.3.4")).toBeNull()
    })

    it("stops a browser at the cookie limit", () => {
        const last = drive(CHAT_LIMITS.cookie.max + 1, "1.1.1.1")
        expect(last.ok).toBe(false)
        expect(last).toMatchObject({ reason: "cookie" })
    })
})

describe("adversarial behaviour", () => {
    it("clearing cookies does NOT reset the budget — the IP floor still applies", () => {
        const ip = "2.2.2.2"
        // Every call sends no cookie at all, simulating a wipe between requests.
        let last = checkRateLimit(ip, undefined, 0)
        for (let i = 1; i <= CHAT_LIMITS.ip.max; i++) {
            last = checkRateLimit(ip, undefined, i * 21_000)
        }
        expect(last.ok).toBe(false)
        expect(last).toMatchObject({ reason: "ip" })
    })

    it("blocks a scripted hammer via the burst guard before the hourly budget", () => {
        const ip = "3.3.3.3"
        let last = checkRateLimit(ip, undefined, 0)
        for (let i = 1; i <= CHAT_LIMITS.burst.max; i++) {
            last = checkRateLimit(ip, undefined, i * 100) // 100ms apart
        }
        expect(last.ok).toBe(false)
        expect(last).toMatchObject({ reason: "burst" })
    })

    it("isolates IPs from each other", () => {
        expect(drive(CHAT_LIMITS.cookie.max + 1, "4.4.4.4").ok).toBe(false)
        expect(checkRateLimit("5.5.5.5", undefined, 0).ok).toBe(true)
    })

    it("enforces a global ceiling across every distinct IP", () => {
        let blocked: ReturnType<typeof checkRateLimit> | null = null
        for (let i = 0; i < CHAT_LIMITS.global.max + 5; i++) {
            // A fresh IP each time defeats layers 2 and 3 — only the global cap remains.
            const r = checkRateLimit(`10.0.${(i >> 8) & 255}.${i & 255}`, undefined, i * 1000)
            if (!r.ok && r.reason === "global") { blocked = r; break }
        }
        expect(blocked).not.toBeNull()
        expect(blocked).toMatchObject({ reason: "global" })
    })

    it("returns a positive retry-after whenever it blocks", () => {
        const last = drive(CHAT_LIMITS.cookie.max + 1, "6.6.6.6")
        expect(last.ok).toBe(false)
        if (!last.ok) expect(last.retryAfterSec).toBeGreaterThan(0)
    })
})

describe("windows roll over", () => {
    it("lets a blocked browser through again after the cookie window expires", () => {
        const ip = "7.7.7.7"
        const blocked = drive(CHAT_LIMITS.cookie.max + 1, ip)
        expect(blocked.ok).toBe(false)
        // Jump past every window so all three layers reset.
        const later = checkRateLimit(ip, undefined, CHAT_LIMITS.ip.windowMs + 1)
        expect(later.ok).toBe(true)
    })
})

describe("request plumbing", () => {
    it("takes the first hop from x-forwarded-for", () => {
        const h = new Headers({ "x-forwarded-for": "9.9.9.9, 10.0.0.1, 172.16.0.1" })
        expect(clientIp(h)).toBe("9.9.9.9")
    })

    it("falls back to x-real-ip, then a sentinel", () => {
        expect(clientIp(new Headers({ "x-real-ip": "8.8.8.8" }))).toBe("8.8.8.8")
        expect(clientIp(new Headers())).toBe("unknown")
    })

    it("issues an HttpOnly, SameSite cookie so page scripts cannot rewrite the quota", () => {
        const c = buildCookie("abc")
        expect(c).toContain("HttpOnly")
        expect(c).toContain("SameSite=Lax")
        expect(c).toContain("Path=/")
    })
})

/* ── Replay + concurrency guards ──────────────────────────────────────
 * A signature proves WE issued a cookie. It does not prove the cookie is
 * the LATEST one we issued. An attacker who saves an early low-count
 * cookie and replays it can otherwise reset their own quota at will. */

describe("cookie replay", () => {
    it("rejects a stale cookie replayed after the quota has advanced", () => {
        const ip = "20.20.20.20"

        // Spend a few messages, keeping the very first cookie we were handed.
        const first = checkRateLimit(ip, undefined, 0)
        expect(first.ok).toBe(true)
        const saved = first.ok ? first.cookie : ""

        let cur = saved
        for (let i = 1; i < 6; i++) {
            const r = checkRateLimit(ip, cur, i * 21_000)
            expect(r.ok).toBe(true)
            if (r.ok) cur = r.cookie
        }

        // Now replay the original low-count cookie inside the same window.
        const replay = checkRateLimit(ip, saved, 7 * 21_000)
        expect(replay.ok).toBe(false)
        expect(replay).toMatchObject({ reason: "replay" })
    })

    it("still accepts the current cookie (no false positive on normal use)", () => {
        const ip = "21.21.21.21"
        let r = checkRateLimit(ip, undefined, 0)
        for (let i = 1; i < 5; i++) {
            expect(r.ok).toBe(true)
            r = checkRateLimit(ip, r.ok ? r.cookie : undefined, i * 21_000)
        }
        expect(r.ok).toBe(true)
    })

    it("does not punish a second device behind the same IP", () => {
        const ip = "22.22.22.22"
        // Device A builds up some history.
        let a = checkRateLimit(ip, undefined, 0)
        for (let i = 1; i < 4; i++) a = checkRateLimit(ip, a.ok ? a.cookie : undefined, i * 21_000)
        expect(a.ok).toBe(true)

        // Device B arrives fresh on the same NAT — must not read as a replay.
        const b = checkRateLimit(ip, undefined, 5 * 21_000)
        expect(b.ok).toBe(true)

        // Device A keeps going with its own cookie, still fine.
        const a2 = checkRateLimit(ip, a.ok ? a.cookie : undefined, 6 * 21_000)
        expect(a2.ok).toBe(true)
    })
})

describe("concurrency guard", () => {
    it("caps simultaneous in-flight streams per IP", () => {
        const ip = "30.30.30.30"
        const slots = []
        for (let i = 0; i < CHAT_LIMITS.concurrent; i++) {
            const s = acquireSlot(ip)
            expect(s).not.toBeNull()
            slots.push(s)
        }
        // One more while the others are still open must be refused.
        expect(acquireSlot(ip)).toBeNull()

        // Releasing one frees exactly one slot.
        releaseSlot(ip)
        expect(acquireSlot(ip)).not.toBeNull()
    })

    it("isolates concurrency per IP", () => {
        const a = "31.31.31.31"
        for (let i = 0; i < CHAT_LIMITS.concurrent; i++) acquireSlot(a)
        expect(acquireSlot(a)).toBeNull()
        expect(acquireSlot("32.32.32.32")).not.toBeNull()
    })

    it("never lets a release drive the count negative", () => {
        const ip = "33.33.33.33"
        releaseSlot(ip)
        releaseSlot(ip)
        for (let i = 0; i < CHAT_LIMITS.concurrent; i++) expect(acquireSlot(ip)).not.toBeNull()
        expect(acquireSlot(ip)).toBeNull()
    })
})

describe("server-authoritative timing", () => {
    it("ignores any client-supplied clock — the window start comes from the server", () => {
        const ip = "40.40.40.40"
        const r = checkRateLimit(ip, undefined, 1_000_000)
        expect(r.ok).toBe(true)
        // A cookie claiming a far-future window must not extend the budget:
        // it is unsigned garbage and is discarded outright.
        const forged = "sid.99999999999999.0.deadbeef"
        const after = checkRateLimit(ip, forged, 1_000_001)
        expect(after.ok).toBe(true) // treated as no cookie, not as a valid future window
    })
})
