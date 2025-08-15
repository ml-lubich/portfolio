"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"

type Direction = "up" | "down" | "left" | "right" | "scale"

interface UnifiedRevealProps {
  children: React.ReactNode
  direction?: Direction
  distance?: number
  scaleFrom?: number
  className?: string
  delay?: number
  duration?: number
  triggerOnce?: boolean
  threshold?: number
  rootMargin?: string
  bidirectional?: boolean
}

export function UnifiedReveal({
  children,
  direction = "up",
  distance = 60,
  scaleFrom = 0.95,
  className = "",
  delay = 0,
  duration = 800,
  triggerOnce = false,
  threshold = 0.15,
  rootMargin = "-10% 0px -10% 0px",
  bidirectional = true
}: UnifiedRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down")
  const lastScrollY = useRef(0)
  
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: false,
  })

  // Track scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection("down")
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection("up")
      }
      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (bidirectional) {
      // Bidirectional: fade in when scrolling into view, fade out when scrolling out of view
      if (inView) {
        const timer = setTimeout(() => {
          setIsVisible(true)
        }, delay)
        return () => clearTimeout(timer)
      } else {
        // Immediately hide when out of view (with animation)
        setIsVisible(false)
      }
    } else {
      // Original behavior: triggerOnce logic
      if (inView && !hasAnimated) {
        const timer = setTimeout(() => {
          setIsVisible(true)
          if (triggerOnce) {
            setHasAnimated(true)
          }
        }, delay)
        return () => clearTimeout(timer)
      } else if (!inView && !triggerOnce && !hasAnimated) {
        setIsVisible(false)
      }
    }
  }, [inView, delay, triggerOnce, hasAnimated, bidirectional])

  const getTransform = () => {
    if (isVisible) {
      return "translateX(0) translateY(0) scale(1)"
    }

    // When not visible, transform based on scroll direction for bidirectional mode
    if (bidirectional && scrollDirection === "up") {
      // When scrolling up and element is not in view, it should fade upward
      switch (direction) {
        case "up":
          return `translateY(-${distance}px) scale(${scaleFrom})`
        case "down":
          return `translateY(${distance}px) scale(${scaleFrom})`
        case "left":
          return `translateX(-${distance}px) scale(${scaleFrom})`
        case "right":
          return `translateX(${distance}px) scale(${scaleFrom})`
        case "scale":
          return `scale(${scaleFrom})`
        default:
          return `translateY(-${distance}px) scale(${scaleFrom})`
      }
    } else {
      // Default behavior: elements come from bottom/sides when scrolling down
      switch (direction) {
        case "up":
          return `translateY(${distance}px) scale(${scaleFrom})`
        case "down":
          return `translateY(-${distance}px) scale(${scaleFrom})`
        case "left":
          return `translateX(${distance}px) scale(${scaleFrom})`
        case "right":
          return `translateX(-${distance}px) scale(${scaleFrom})`
        case "scale":
          return `scale(${scaleFrom})`
        default:
          return `translateY(${distance}px) scale(${scaleFrom})`
      }
    }
  }

  return (
    <div
      ref={ref}
      className={`transition-all ease-out will-change-transform will-change-opacity ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      }}
    >
      {children}
    </div>
  )
}

// Preset configurations for common use cases
export function SectionReveal({ children, delay = 0, className = "" }: { 
  children: React.ReactNode
  delay?: number
  className?: string 
}) {
  return (
    <UnifiedReveal
      direction="up"
      distance={40}
      duration={800}
      delay={delay}
      threshold={0.1}
      triggerOnce={false}
      bidirectional={true}
      className={className}
    >
      {children}
    </UnifiedReveal>
  )
}

export function CardReveal({ 
  children, 
  direction = "up" as Direction, 
  delay = 0, 
  className = "" 
}: { 
  children: React.ReactNode
  direction?: Direction
  delay?: number
  className?: string 
}) {
  return (
    <UnifiedReveal
      direction={direction}
      distance={60}
      duration={700}
      delay={delay}
      threshold={0.2}
      triggerOnce={false}
      bidirectional={true}
      className={className}
    >
      {children}
    </UnifiedReveal>
  )
}

export function HeaderReveal({ children, className = "" }: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <UnifiedReveal
      direction="up"
      distance={30}
      duration={600}
      delay={100}
      threshold={0.1}
      triggerOnce={false}
      bidirectional={true}
      className={className}
    >
      {children}
    </UnifiedReveal>
  )
}