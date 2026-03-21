"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { particleFill, particleStroke } from "@/lib/theme"

const DESKTOP_PARTICLE_COUNT = 35
const MOBILE_PARTICLE_COUNT = 18
const MOBILE_BREAKPOINT = 768

/* ── Animated particle canvas background ────────────────────────────
 *  Fewer particles on mobile; pauses when tab is hidden to save CPU/battery.
 */

export function ParticleCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId = 0
    let tabVisible = true
    let heroOnScreen = true
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
      const section = canvas.closest("section")
      const w = section?.clientWidth ?? window.innerWidth
      const h = section?.clientHeight ?? window.innerHeight
      canvas.width = w
      canvas.height = h
    }
    resize()
    window.addEventListener("resize", resize)
    const section = canvas.closest("section")
    const ro =
      section &&
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => resize())
        : null
    if (section && ro) ro.observe(section)

    const visibilityHandler = () => {
      tabVisible = document.visibilityState === "visible"
      if (!tabVisible && animationId) {
        cancelAnimationFrame(animationId)
        animationId = 0
      } else if (tabVisible && heroOnScreen && !animationId) {
        animationId = requestAnimationFrame(animate)
      }
    }
    document.addEventListener("visibilitychange", visibilityHandler)

    const heroIo =
      section && typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([e]) => {
              heroOnScreen = e.isIntersecting
              if (!heroOnScreen && animationId) {
                cancelAnimationFrame(animationId)
                animationId = 0
              } else if (heroOnScreen && tabVisible && !animationId) {
                animationId = requestAnimationFrame(animate)
              }
            },
            { threshold: 0, rootMargin: "0px" },
          )
        : null
    if (section && heroIo) heroIo.observe(section)

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
      if (!tabVisible || !heroOnScreen) {
        animationId = 0
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
      ro?.disconnect()
      heroIo?.disconnect()
      document.removeEventListener("visibilitychange", visibilityHandler)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0", className)}
      aria-hidden="true"
    />
  )
}
