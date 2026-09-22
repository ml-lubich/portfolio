import { describe, it, expect, beforeEach } from "vitest"
import {
    CHAT_LIMITS,
    checkRateLimit,
    decodeCookie,
    encodeCookie,
    clientIp,
    buildCookie,
    acquireSlot,
    COOKIE_NAME,
    __resetBuckets,
} from "@/lib/ai/rate-limit"

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Adversarial Rate Limiting, Quota & Stream Mock Security Test Suite
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 100% mocked, deterministic, zero network calls, $0 cost.
 * Verifies defensive guarantees against:
 * 1. Burst hammering & rapid-fire request spikes
 * 2. Signed cookie quota enforcement & signature tampering
 * 3. Cookie deletion / clearing (IP floor containment)
 * 4. Stale cookie replay attacks & session high-water mark validation
 * 5. Concurrent SSE streams & in-flight connection leak prevention
 * 6. Multi-tenant IP isolation & global spend cap protection
 * 7. Malformed cookie structures & non-numeric payload injections
 * 8. Server-authoritative time-window roll-overs
 */

describe("Adversarial Rate Limiting & Abuse Defenses", () => {
    beforeEach(() => {
        __resetBuckets()
    })

    describe("1. Rapid-fire burst attacks", () => {
        it("triggers burst protection after exceeding max within 20s window", () => {
            const ip = "192.168.1.100"
            const startTime = 1_000_000

            // Send up to burst max
            for (let i = 0; i < CHAT_LIMITS.burst.max; i++) {
                const decision = checkRateLimit(ip, undefined, startTime + i * 50)
                expect(decision.ok).toBe(true)
            }

            // Next immediate request (within 20s) must be rejected with 'burst'
            const blocked = checkRateLimit(ip, undefined, startTime + CHAT_LIMITS.burst.max * 50)
            expect(blocked.ok).toBe(false)
            if (!blocked.ok) {
                expect(blocked.reason).toBe("burst")
                expect(blocked.retryAfterSec).toBeGreaterThan(0)
                expect(blocked.retryAfterSec).toBeLessThanOrEqual(20)
            }
        })

        it("allows burst to reset once the burst window expires", () => {
            const ip = "192.168.1.101"
            const startTime = 2_000_000

            for (let i = 0; i < CHAT_LIMITS.burst.max; i++) {
                checkRateLimit(ip, undefined, startTime + i * 10)
            }
            expect(checkRateLimit(ip, undefined, startTime + 100).ok).toBe(false)

            // Step forward past the burst window (20s)
            const recovered = checkRateLimit(ip, undefined, startTime + CHAT_LIMITS.burst.windowMs + 500)
            expect(recovered.ok).toBe(true)
        })
    })

    describe("2. Cookie quota limits & signature tampering", () => {
        it("blocks requests once cookie quota reaches max limit", () => {
            const ip = "192.168.2.1"
            let cookie: string | undefined
            let now = 3_000_000

            for (let i = 0; i < CHAT_LIMITS.cookie.max; i++) {
                const res = checkRateLimit(ip, cookie, now)
                expect(res.ok).toBe(true)
                if (res.ok) {
                    cookie = res.cookie
                    expect(res.remaining).toBe(CHAT_LIMITS.cookie.max - (i + 1))
                }
                now += 25_000 // > 20s to evade burst limit
            }

            // Subsequent call with same cookie is blocked under cookie quota
            const blocked = checkRateLimit(ip, cookie, now)
            expect(blocked.ok).toBe(false)
            if (!blocked.ok) {
                expect(blocked.reason).toBe("cookie")
                expect(blocked.retryAfterSec).toBeGreaterThan(0)
            }
        })

        it("detects and nullifies HMAC signature tampering", () => {
            const legit = encodeCookie({ sid: "sess-abc", start: 1_700_000_000, count: 12 })
            const [sid, start, count, hmac] = legit.split(".")

            // Attacker modifies count to 0 while preserving original HMAC
            const tamperedCount = `${sid}.${start}.0.${hmac}`
            expect(decodeCookie(tamperedCount)).toBeNull()

            // Attacker modifies sid
            const tamperedSid = `attacker.${start}.${count}.${hmac}`
            expect(decodeCookie(tamperedSid)).toBeNull()

            // Attacker modifies timestamp
            const tamperedTime = `${sid}.${Number(start) + 10000}.${count}.${hmac}`
            expect(decodeCookie(tamperedTime)).toBeNull()
        })

        it("safely handles garbage, empty, and truncated cookie inputs", () => {
            expect(decodeCookie("")).toBeNull()
            expect(decodeCookie("null")).toBeNull()
            expect(decodeCookie("undefined")).toBeNull()
            expect(decodeCookie("a.b.c")).toBeNull()
            expect(decodeCookie("a.b.c.d.e")).toBeNull()
            expect(decodeCookie("sid.notanumber.5.mac")).toBeNull()
            expect(decodeCookie("sid.100000.notanumber.mac")).toBeNull()
            expect(decodeCookie("sid.100000.-5.mac")).toBeNull()
            expect(decodeCookie(".100000.5.mac")).toBeNull()
        })
    })

    describe("3. Cookie clearing & IP floor enforcement", () => {
        it("clearing cookies between requests falls back to IP ceiling", () => {
            const ip = "192.168.3.10"
            let now = 4_000_000

            // Attacker wipes cookies on every request
            for (let i = 0; i < CHAT_LIMITS.ip.max; i++) {
                const res = checkRateLimit(ip, undefined, now)
                expect(res.ok).toBe(true)
                now += 25_000 // avoid burst
            }

            // Exceeding IP limit without cookie blocks under 'ip'
            const blocked = checkRateLimit(ip, undefined, now)
            expect(blocked.ok).toBe(false)
            if (!blocked.ok) {
                expect(blocked.reason).toBe("ip")
                expect(blocked.retryAfterSec).toBeGreaterThan(0)
            }
        })

        it("verifies clearing cookies yields negligible headroom over cookie limit", () => {
            const difference = CHAT_LIMITS.ip.max - CHAT_LIMITS.cookie.max
            expect(difference).toBeGreaterThanOrEqual(0)
            expect(difference).toBeLessThanOrEqual(3)
        })
    })

    describe("4. Cookie replay attacks & state tracking", () => {
        it("rejects a replayed earlier cookie with lower count (rollback attack)", () => {
            const ip = "192.168.4.5"
            let now = 5_000_000

            // Request 1
            const r1 = checkRateLimit(ip, undefined, now)
            expect(r1.ok).toBe(true)
            const lowCountCookie = r1.ok ? r1.cookie : ""
            now += 25_000

            // Request 2
            const r2 = checkRateLimit(ip, lowCountCookie, now)
            expect(r2.ok).toBe(true)
            const advancedCookie = r2.ok ? r2.cookie : ""
            now += 25_000

            // Request 3: normal progression works
            const r3 = checkRateLimit(ip, advancedCookie, now)
            expect(r3.ok).toBe(true)
            now += 25_000

            // Attacker replays lowCountCookie (count 1) after server already witnessed count 3
            const replayed = checkRateLimit(ip, lowCountCookie, now)
            expect(replayed.ok).toBe(false)
            if (!replayed.ok) {
                expect(replayed.reason).toBe("replay")
                expect(replayed.retryAfterSec).toBeGreaterThan(0)
            }
        })

        it("does not falsely trigger replay on two distinct browser sessions behind the same IP", () => {
            const ip = "192.168.4.99" // Shared office/NAT IP
            let now = 6_000_000

            // Device A
            const devA_1 = checkRateLimit(ip, undefined, now)
            expect(devA_1.ok).toBe(true)
            now += 25_000

            // Device B starts its own session behind the same NAT
            const devB_1 = checkRateLimit(ip, undefined, now)
            expect(devB_1.ok).toBe(true)
            now += 25_000

            // Device A continues
            const devA_2 = checkRateLimit(ip, devA_1.ok ? devA_1.cookie : "", now)
            expect(devA_2.ok).toBe(true)
            now += 25_000

            // Device B continues — must not conflict with Device A's high water mark
            const devB_2 = checkRateLimit(ip, devB_1.ok ? devB_1.cookie : "", now)
            expect(devB_2.ok).toBe(true)
        })
    })

    describe("5. Concurrent SSE streams & slot leakage", () => {
        it("restricts concurrent open streams per IP to CHAT_LIMITS.concurrent", () => {
            const ip = "192.168.5.20"

            const releases: (() => void)[] = []
            for (let i = 0; i < CHAT_LIMITS.concurrent; i++) {
                const release = acquireSlot(ip)
                expect(release).not.toBeNull()
                if (release) releases.push(release)
            }

            // Next concurrent stream request is refused
            const rejected = acquireSlot(ip)
            expect(rejected).toBeNull()

            // Releasing one stream frees up a slot
            releases[0]()
            const accepted = acquireSlot(ip)
            expect(accepted).not.toBeNull()

            // Clean up
            if (accepted) accepted()
            releases[1]()
        })

        it("idempotently handles multiple release invocations without dropping below zero", () => {
            const ip = "192.168.5.30"
            const release = acquireSlot(ip)
            expect(release).not.toBeNull()

            if (release) {
                release()
                release() // Second call must be a no-op
                release()
            }

            // Should cleanly acquire up to max again
            const s1 = acquireSlot(ip)
            const s2 = acquireSlot(ip)
            expect(s1).not.toBeNull()
            expect(s2).not.toBeNull()
            if (s1) s1()
            if (s2) s2()
        })

        it("isolates concurrency slots across different client IPs", () => {
            const ip1 = "10.0.0.1"
            const ip2 = "10.0.0.2"

            const r1 = acquireSlot(ip1)
            const r2 = acquireSlot(ip1)
            expect(acquireSlot(ip1)).toBeNull()

            // ip2 should still have full slots available
            const r3 = acquireSlot(ip2)
            expect(r3).not.toBeNull()

            if (r1) r1()
            if (r2) r2()
            if (r3) r3()
        })
    })

    describe("6. Multi-tenant IP isolation & global spend cap", () => {
        it("blocks everything when global daily quota is reached", () => {
            let now = 7_000_000

            // Max out global ceiling across distinct synthetic IPs
            for (let i = 0; i < CHAT_LIMITS.global.max; i++) {
                const syntheticIp = `172.16.${(i >> 8) & 255}.${i & 255}`
                const res = checkRateLimit(syntheticIp, undefined, now)
                expect(res.ok).toBe(true)
                now += 100
            }

            // Exceeding global cap blocks any IP under 'global'
            const blocked = checkRateLimit("8.8.8.8", undefined, now)
            expect(blocked.ok).toBe(false)
            if (!blocked.ok) {
                expect(blocked.reason).toBe("global")
                expect(blocked.retryAfterSec).toBeGreaterThan(0)
            }
        })
    })

    describe("7. HTTP header extraction & cookie formatting", () => {
        it("prioritizes leftmost entry in x-forwarded-for header", () => {
            const headers = new Headers({
                "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178",
                "x-real-ip": "10.0.0.1",
            })
            expect(clientIp(headers)).toBe("203.0.113.195")
        })

        it("falls back to x-real-ip if x-forwarded-for is missing", () => {
            const headers = new Headers({
                "x-real-ip": "198.51.100.42",
            })
            expect(clientIp(headers)).toBe("198.51.100.42")
        })

        it("returns 'unknown' if no client IP headers exist", () => {
            const headers = new Headers()
            expect(clientIp(headers)).toBe("unknown")
        })

        it("builds an HttpOnly, SameSite=Lax cookie string", () => {
            const cookieStr = buildCookie("sample-cookie-value")
            expect(cookieStr).toContain(`${COOKIE_NAME}=sample-cookie-value`)
            expect(cookieStr).toContain("HttpOnly")
            expect(cookieStr).toContain("SameSite=Lax")
            expect(cookieStr).toContain("Path=/")
            expect(cookieStr).toContain("Max-Age=")
        })
    })
})
