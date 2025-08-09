"use client"

import { useInView } from "react-intersection-observer"
import { animations } from "@/lib/animations"

interface LazyRevealProps {
  children: React.ReactNode
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "scale"
  duration?: number
  className?: string
  triggerOnce?: boolean
  threshold?: number
}

export function LazyReveal({
  children,
  delay = 0,
  direction = "up",
  duration = 600,
  className = "",
  triggerOnce = true,
  threshold = 0.1
}: LazyRevealProps) {
  const { ref, inView } = useInView({
    triggerOnce,
    threshold,
  })

  const getTransform = () => {
    if (inView) return "translate-x-0 translate-y-0 scale-100"
    
    switch (direction) {
      case "up":
        return "translate-y-8 scale-95"
      case "down":
        return "-translate-y-8 scale-95"
      case "left":
        return "translate-x-8 scale-95"
      case "right":
        return "-translate-x-8 scale-95"
      case "scale":
        return "scale-90"
      default:
        return "translate-y-8 scale-95"
    }
  }

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${inView ? "opacity-100" : "opacity-0"} ${getTransform()} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}
