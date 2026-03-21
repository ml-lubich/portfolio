"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Home, BookOpen, ArrowLeft, Terminal } from "lucide-react"

/* ── Floating particle for the background ──────────────────────────── */
interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    size: number
    hue: number
    alpha: number
    life: number
    maxLife: number
}

function ParticleField() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let animId: number
        const particles: Particle[] = []
        const MAX = 60

        function resize() {
            canvas!.width = window.innerWidth
            canvas!.height = window.innerHeight
        }
        resize()
        window.addEventListener("resize", resize)

        function spawn() {
            if (particles.length >= MAX) return
            const maxLife = 200 + Math.random() * 300
            particles.push({
                x: Math.random() * canvas!.width,
                y: Math.random() * canvas!.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: 1 + Math.random() * 2,
                hue: Math.random() * 360,
                alpha: 0,
                life: 0,
                maxLife,
            })
        }

        function draw() {
            ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i]
                p.life++
                p.x += p.vx
                p.y += p.vy
                p.hue = (p.hue + 0.3) % 360

                // fade in then out
                const progress = p.life / p.maxLife
                p.alpha = progress < 0.1 ? progress / 0.1 : progress > 0.7 ? (1 - progress) / 0.3 : 1
                p.alpha *= 0.35

                if (p.life > p.maxLife) {
                    particles.splice(i, 1)
                    continue
                }

                ctx!.beginPath()
                ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx!.fillStyle = `hsla(${p.hue}, 70%, 60%, ${p.alpha})`
                ctx!.fill()
            }

            // spawn 1-2 particles per frame
            if (Math.random() < 0.4) spawn()
            if (Math.random() < 0.2) spawn()

            animId = requestAnimationFrame(draw)
        }

        // seed initial particles
        for (let i = 0; i < 30; i++) spawn()
        draw()

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener("resize", resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-0"
            aria-hidden="true"
        />
    )
}

/* ── Terminal-style typing animation ───────────────────────────────── */
function TerminalMessage() {
    const lines = [
        "$ curl -I mishalubich.com/this-page",
        "HTTP/2 404 Not Found",
        "x-error: page_not_found",
        "x-suggestion: try_going_home",
        "",
        "$ echo \"The page you're looking for has been lost in the neural network...\"",
    ]

    const [displayedLines, setDisplayedLines] = useState<string[]>([])
    const [currentLine, setCurrentLine] = useState(0)
    const [currentChar, setCurrentChar] = useState(0)
    const [showCursor, setShowCursor] = useState(true)

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor((prev) => !prev)
        }, 530)
        return () => clearInterval(cursorInterval)
    }, [])

    useEffect(() => {
        if (currentLine >= lines.length) return

        const line = lines[currentLine]
        if (currentChar < line.length) {
            const speed = line.startsWith("$") ? 40 : 15
            const timeout = setTimeout(() => {
                setCurrentChar((c) => c + 1)
            }, speed + Math.random() * 20)
            return () => clearTimeout(timeout)
        } else {
            const timeout = setTimeout(() => {
                setDisplayedLines((prev) => [...prev, line])
                setCurrentLine((l) => l + 1)
                setCurrentChar(0)
            }, line === "" ? 100 : 400)
            return () => clearTimeout(timeout)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLine, currentChar])

    return (
        <div className="mx-auto mt-8 w-full max-w-lg rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 font-mono text-xs sm:text-sm backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
                <span className="ml-2 text-[10px] text-white/30">zsh — 404</span>
            </div>
            <div className="space-y-1 text-white/60">
                {displayedLines.map((line, i) => (
                    <div key={i} className={line.startsWith("$") ? "text-green-400/80" : line.startsWith("HTTP") ? "text-red-400/80" : line.startsWith("x-") ? "text-yellow-400/70" : ""}>
                        {line || "\u00A0"}
                    </div>
                ))}
                {currentLine < lines.length && (
                    <div className={lines[currentLine].startsWith("$") ? "text-green-400/80" : lines[currentLine].startsWith("HTTP") ? "text-red-400/80" : lines[currentLine].startsWith("x-") ? "text-yellow-400/70" : ""}>
                        {lines[currentLine].slice(0, currentChar)}
                        <span className={`inline-block w-[7px] h-[14px] -mb-[2px] ml-[1px] ${showCursor ? "bg-white/70" : "bg-transparent"}`} />
                    </div>
                )}
                {currentLine >= lines.length && (
                    <div>
                        <span className="text-green-400/80">$ </span>
                        <span className={`inline-block w-[7px] h-[14px] -mb-[2px] ml-[1px] ${showCursor ? "bg-white/70" : "bg-transparent"}`} />
                    </div>
                )}
            </div>
        </div>
    )
}

/* ── Glitch 404 headline ───────────────────────────────────────────── */
function Glitch404() {
    const [glitchActive, setGlitchActive] = useState(false)

    useEffect(() => {
        const trigger = () => {
            setGlitchActive(true)
            setTimeout(() => setGlitchActive(false), 200)
        }
        // initial glitch
        const t1 = setTimeout(trigger, 600)
        // periodic glitches
        const interval = setInterval(() => {
            if (Math.random() < 0.3) trigger()
        }, 3000)
        return () => {
            clearTimeout(t1)
            clearInterval(interval)
        }
    }, [])

    return (
        <div className="relative select-none">
            <h1
                className="text-[8rem] sm:text-[12rem] md:text-[14rem] font-bold leading-none tracking-tighter"
                style={{
                    background: "linear-gradient(135deg, hsl(330 70% 60%), hsl(280 65% 58%), hsl(220 70% 55%), hsl(180 65% 48%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: glitchActive ? "none" : "none",
                }}
            >
                404
            </h1>

            {/* Glitch layers */}
            {glitchActive && (
                <>
                    <h1
                        className="absolute inset-0 text-[8rem] sm:text-[12rem] md:text-[14rem] font-bold leading-none tracking-tighter opacity-70"
                        style={{
                            background: "linear-gradient(135deg, hsl(0 80% 60%), hsl(330 70% 60%), hsl(280 65% 58%))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            transform: "translate(-4px, -2px)",
                            clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)",
                        }}
                        aria-hidden="true"
                    >
                        404
                    </h1>
                    <h1
                        className="absolute inset-0 text-[8rem] sm:text-[12rem] md:text-[14rem] font-bold leading-none tracking-tighter opacity-70"
                        style={{
                            background: "linear-gradient(135deg, hsl(180 65% 48%), hsl(220 70% 55%), hsl(140 60% 48%))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            transform: "translate(4px, 2px)",
                            clipPath: "polygon(0 55%, 100% 55%, 100% 100%, 0 100%)",
                        }}
                        aria-hidden="true"
                    >
                        404
                    </h1>
                </>
            )}
        </div>
    )
}

/* ── Main 404 content ──────────────────────────────────────────────── */
export function NotFoundContent() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center overflow-hidden">
            <ParticleField />

            <div
                className="relative z-10 flex flex-col items-center transition-all duration-1000"
                style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(20px)",
                }}
            >
                <Link
                    href="/"
                    className="group mb-8 flex flex-col items-center rounded-[11px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    aria-label="Misha Lubich — home"
                >
                    <div
                        className="logo-flip-hover relative flex h-16 w-16 items-center justify-center rounded-[9px] overflow-hidden"
                        onMouseEnter={(e) => {
                            const el = e.currentTarget
                            if (!el.classList.contains("is-flipping")) {
                                el.classList.add("is-flipping")
                            }
                        }}
                        onAnimationEnd={(e) => {
                            e.currentTarget.classList.remove("is-flipping")
                        }}
                    >
                        <Image
                            src="/logo.png"
                            alt=""
                            width={64}
                            height={64}
                            sizes="64px"
                            className="h-full w-full object-cover"
                            priority
                        />
                    </div>
                </Link>

                <Glitch404 />

                <h2
                    className="mt-4 text-xl sm:text-2xl font-medium text-white/80 transition-all duration-700 delay-200"
                    style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "translateY(0)" : "translateY(10px)",
                    }}
                >
                    Page not found
                </h2>

                <p
                    className="mt-3 max-w-md text-sm sm:text-base text-white/40 transition-all duration-700 delay-300"
                    style={{
                        opacity: mounted ? 1 : 0,
                    }}
                >
                    The page you&apos;re looking for doesn&apos;t exist, has been moved,
                    or got lost somewhere in the latent space.
                </p>

                <div
                    className="transition-all duration-700 delay-500"
                    style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "translateY(0)" : "translateY(10px)",
                    }}
                >
                    <TerminalMessage />
                </div>

                <div
                    className="mt-10 flex flex-wrap items-center justify-center gap-4 transition-all duration-700 delay-700"
                    style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "translateY(0)" : "translateY(10px)",
                    }}
                >
                    <Link
                        href="/"
                        className="group flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/[0.08] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/[0.10] hover:border-white/[0.15] hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Home className="h-4 w-4 text-white/50 transition-colors group-hover:text-white/80" />
                        Go home
                    </Link>

                    <Link
                        href="/blog"
                        className="group flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/[0.06] px-6 py-3 text-sm font-medium text-white/70 transition-all hover:bg-white/[0.06] hover:border-white/[0.10] hover:text-white hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <BookOpen className="h-4 w-4 text-white/40 transition-colors group-hover:text-white/70" />
                        Read the blog
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="group flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/[0.06] px-6 py-3 text-sm font-medium text-white/70 transition-all hover:bg-white/[0.06] hover:border-white/[0.10] hover:text-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4 text-white/40 transition-all group-hover:text-white/70 group-hover:-translate-x-0.5" />
                        Go back
                    </button>
                </div>
            </div>

            {/* Subtle radial glow behind the 404 */}
            <div
                className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]"
                aria-hidden="true"
                style={{
                    width: "min(800px, 90vw)",
                    height: "min(800px, 90vh)",
                    background: "radial-gradient(ellipse at center, hsla(280 60% 50% / 0.06) 0%, hsla(220 60% 50% / 0.03) 40%, transparent 70%)",
                }}
            />
        </main>
    )
}
