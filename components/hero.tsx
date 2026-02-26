"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { ArrowDown, Github, Linkedin, Mail, Phone, Sparkles } from "lucide-react"

const Brain3D = dynamic(
  () => import("./brain-3d").then((mod) => mod.Brain3D),
  { ssr: false }
)

const stats = [
  { value: "100M+", label: "Users Impacted" },
  { value: "6", label: "Research Papers" },
  { value: "300%", label: "ML Performance Gains" },
  { value: "5+", label: "Years Experience" },
]

const roles = [
  "AI Engineer",
  "ML Specialist",
  "Software Architect",
  "Research Engineer",
  "Tech Lead",
  "Vibe Coder",
  "Vibe Cleanup Specialist",
]

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [roleIndex, setRoleIndex] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Role switcher — no typing, no layout shift. Just a clean fade/swap.
  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      setMousePosition({ x, y })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
    }> = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(217, 91%, 60%, ${p.opacity})`
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x
          const dy = particles[j].y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `hsla(217, 91%, 60%, ${0.06 * (1 - dist / 150)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })
      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pb-16 pt-24">
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      {/* Gradient orbs with parallax */}
      <div
        className="pointer-events-none absolute -left-40 top-20 h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-3xl animate-float"
        aria-hidden="true"
        style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-20 h-[32rem] w-[32rem] rounded-full bg-accent/10 blur-3xl animate-float"
        style={{ animationDelay: "3s", transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)` }}
        aria-hidden="true"
      />

      {/* 3D Brain — fixed centered background within hero */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden="true"
      >
        <Brain3D className="h-full w-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center sm:px-6">

        {/* Badge */}
        <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            Available for AI/ML consulting
          </span>
        </div>

        {/* Heading — fixed height role line so nothing shifts */}
        <h1
          className="animate-fade-in-up text-3xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ animationDelay: "0.2s", opacity: 0, lineHeight: 1.15 }}
        >
          <span className="block text-balance">Misha Lubich</span>
          {/* Fixed-height container — tall enough for descenders (g, y, p) and long roles */}
          <span className="relative mt-3 block h-[2.8rem] sm:h-[3.2rem] md:h-[4rem] lg:h-[5rem]">
            {roles.map((role, i) => (
              <span
                key={role}
                className="absolute inset-x-0 top-0 flex items-start justify-center transition-all duration-700"
                style={{
                  opacity: i === roleIndex ? 1 : 0,
                  transform: i === roleIndex ? "translateY(0)" : i < roleIndex ? "translateY(-40px)" : "translateY(40px)",
                }}
                aria-hidden={i !== roleIndex}
              >
                <span className="gradient-text whitespace-nowrap">{role}</span>
              </span>
            ))}
            {/* Screen-reader only — always readable */}
            <span className="sr-only">{roles[roleIndex]}</span>
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto mt-10 max-w-3xl animate-fade-in-up text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl"
          style={{ animationDelay: "0.4s", opacity: 0 }}
        >
          Architecting scalable{" "}
          <span className="font-semibold text-foreground">AI/ML systems</span> that power
          next-generation applications. From research to production, I build intelligent solutions at{" "}
          <span className="font-semibold text-foreground">Apple</span>,{" "}
          <span className="font-semibold text-foreground">Walmart</span>, and{" "}
          <span className="font-semibold text-foreground">Lawrence Berkeley Lab</span>.
        </p>

        {/* CTAs */}
        <div
          className="mt-10 flex animate-fade-in-up flex-wrap items-center justify-center gap-3 sm:gap-4"
          style={{ animationDelay: "0.6s", opacity: 0 }}
        >
          <a
            href="#contact"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30 sm:px-8 sm:py-3.5"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Get In Touch
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
          <a
            href="#ai-expertise"
            className="rounded-xl border border-border bg-secondary/50 px-6 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-secondary hover-lift sm:px-8 sm:py-3.5"
          >
            <Sparkles className="mr-2 inline-block h-4 w-4" />
            View AI Expertise
          </a>
          <a
            href="tel:+1234567890"
            className="rounded-xl border border-border bg-secondary/50 px-6 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-secondary hover-lift sm:px-8 sm:py-3.5"
          >
            <Phone className="mr-2 inline-block h-4 w-4" />
            Schedule Call
          </a>
        </div>

        {/* Social links */}
        <div
          className="mt-6 flex animate-fade-in-up items-center justify-center gap-3"
          style={{ animationDelay: "0.8s", opacity: 0 }}
        >
          <a
            href="https://github.com/mishalubich"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-lg border border-border bg-secondary/30 p-2.5 text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-secondary hover:text-foreground magnetic"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5 transition-transform group-hover:scale-110" />
          </a>
          <a
            href="https://linkedin.com/in/mishalubich"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-lg border border-border bg-secondary/30 p-2.5 text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-secondary hover:text-foreground magnetic"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5 transition-transform group-hover:scale-110" />
          </a>
        </div>

        {/* Stats — fully visible, not cut off */}
        <div
          className="mx-auto mt-14 grid w-full max-w-4xl animate-fade-in-up grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
          style={{ animationDelay: "1s", opacity: 0 }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-sm transition-all hover:border-primary/30 hover-lift spotlight"
            >
              <div className="relative z-10">
                <div className="text-2xl font-bold gradient-text sm:text-3xl lg:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-xs font-medium text-muted-foreground sm:text-sm">
                  {stat.label}
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-transform group-hover:scale-150" />
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-fade-in"
        style={{ animationDelay: "1.5s", opacity: 0 }}
      >
        <a
          href="#ai-expertise"
          className="group flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          aria-label="Scroll down"
        >
          <span className="font-mono text-xs">Explore</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </a>
      </div>
    </section>
  )
}
