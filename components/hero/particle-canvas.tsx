"use client"

import { useEffect, useRef } from "react"
import { particleFill, particleStroke } from "@/lib/theme"

const DESKTOP_PARTICLE_COUNT = 35
const MOBILE_PARTICLE_COUNT = 18
const MOBILE_BREAKPOINT = 768

/* ── Animated particle canvas background ────────────────────────────
 *  Fewer particles on mobile; pauses when tab is hidden to save CPU/battery.
 */

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let isVisible = true
    const particleCount =
      typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
        ? MOBILE_PARTICLE_COUNT
        : DESKTOP_PARTICLE_COUNT

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

    const visibilityHandler = () => {
      isVisible = document.visibilityState === "visible"
    }
    document.addEventListener("visibilitychange", visibilityHandler)

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      })
    }

    const animate = () => {
      if (!isVisible) {
        animationId = requestAnimationFrame(animate)
        return
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = particleFill(p.opacity)
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x
          const dy = particles[j].y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = particleStroke(0.06 * (1 - dist / 150))
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
      document.removeEventListener("visibilitychange", visibilityHandler)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
  )
}
